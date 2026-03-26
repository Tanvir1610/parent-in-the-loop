import { NextResponse } from "next/server"
import { FALLBACK_ARTICLES } from "@/lib/data"
import { createSupabaseServerClient } from "@/lib/supabase"

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const featured = searchParams.get("featured") === "true"
  const limit = Number.parseInt(searchParams.get("limit") || "6")
  const category = searchParams.get("category") || ""

  // Try Supabase first
  try {
    const supabase = await createSupabaseServerClient()
    let query = supabase
      .from("articles")
      .select("id, title, slug, excerpt, category, image_url, published_date, featured, substack_url")
      .order("published_date", { ascending: false })
      .limit(limit)

    if (featured) query = query.eq("featured", true)
    if (category) query = query.eq("category", category)

    const { data, error } = await query
    if (!error && data && data.length > 0) {
      return NextResponse.json({ articles: data })
    }
  } catch {
    // fall through
  }

  // Static fallback
  let articles = FALLBACK_ARTICLES as typeof FALLBACK_ARTICLES
  if (featured) articles = articles.filter((a) => a.featured)
  if (category) articles = articles.filter((a) => a.category === category)
  articles = articles.slice(0, limit)

  return NextResponse.json({ articles })
}
