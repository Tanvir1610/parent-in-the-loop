import { NextResponse } from "next/server"
import { FALLBACK_ARTICLES } from "@/lib/data"
import { createSupabaseServerClient, hasSupabaseConfig } from "@/lib/supabase"

// Strip characters that could cause issues in ILIKE queries
function sanitizeQuery(q: string): string {
  return q.replace(/[%_\\]/g, "\\$&").slice(0, 100)
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const raw = (searchParams.get("q") || "").trim()

  if (!raw || raw.length < 2) {
    return NextResponse.json({ results: [] })
  }

  const q = sanitizeQuery(raw).toLowerCase()

  // --- Try Supabase ---
  if (hasSupabaseConfig()) {
    try {
      const supabase = await createSupabaseServerClient()
      const { data, error } = await supabase
        .from("articles")
        .select("id, title, slug, excerpt, category, substack_url, read_time")
        .or(`title.ilike.%${q}%,excerpt.ilike.%${q}%,category.ilike.%${q}%`)
        .order("published_date", { ascending: false })
        .limit(6)

      if (!error && data && data.length > 0) {
        return NextResponse.json({ results: data, source: "supabase" })
      }
    } catch (err) {
      console.error("[search] Supabase error:", err)
    }
  }

  // --- Static fallback ---
  const results = FALLBACK_ARTICLES
    .filter((a) =>
      a.title.toLowerCase().includes(q) ||
      a.excerpt.toLowerCase().includes(q) ||
      a.category.toLowerCase().includes(q) ||
      a.tags.some((t) => t.toLowerCase().includes(q))
    )
    .slice(0, 6)
    .map(({ id, title, slug, excerpt, category, substack_url, read_time }) => ({
      id, title, slug, excerpt, category, substack_url, read_time,
    }))

  return NextResponse.json({ results, source: "static" })
}
