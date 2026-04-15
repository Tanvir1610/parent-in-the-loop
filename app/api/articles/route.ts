import { NextResponse } from "next/server"
import { FALLBACK_ARTICLES } from "@/lib/data"
import { createSupabaseServerClient, hasSupabaseConfig } from "@/lib/supabase"

const VALID_CATEGORIES = ["AI Literacy", "Parenting", "Family Conversations", "Safety"]

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const featured = searchParams.get("featured") === "true"
  const limit = Math.min(Math.max(parseInt(searchParams.get("limit") || "6"), 1), 20)
  const category = searchParams.get("category") || ""
  const slug = searchParams.get("slug") || ""

  // Validate category to prevent injection
  if (category && !VALID_CATEGORIES.includes(category)) {
    return NextResponse.json({ error: "Invalid category" }, { status: 400 })
  }

  // --- Try Supabase ---
  if (hasSupabaseConfig()) {
    try {
      const supabase = await createSupabaseServerClient()

      let query = supabase
        .from("articles")
        .select(
          "id, title, slug, excerpt, category, image_url, published_date, featured, substack_url, read_time, tags, author"
        )
        .order("published_date", { ascending: false })
        .limit(limit)

      if (featured) query = query.eq("featured", true)
      if (category) query = query.eq("category", category)
      if (slug) query = query.eq("slug", slug)

      const { data, error } = await query

      if (error) {
        console.error("[articles] Supabase error:", error.message)
        // Fall through to static
      } else if (data && data.length > 0) {
        return NextResponse.json({ articles: data, source: "supabase" })
      }
    } catch (err) {
      console.error("[articles] Supabase connection failed:", err)
    }
  }

  // --- Static fallback ---
  let articles = [...FALLBACK_ARTICLES]
  if (featured) articles = articles.filter((a) => a.featured)
  if (category) articles = articles.filter((a) => a.category === category)
  if (slug) articles = articles.filter((a) => a.slug === slug)
  articles = articles.slice(0, limit)

  return NextResponse.json({ articles, source: "static" })
}
