import { type NextRequest, NextResponse } from "next/server"
import { createSupabaseAdmin, hasSupabaseConfig } from "@/lib/supabase"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const slug = (body?.slug ?? "").replace(/[^a-z0-9-]/g, "").slice(0, 100)

    if (!slug) {
      return NextResponse.json({ error: "slug is required." }, { status: 400 })
    }

    if (hasSupabaseConfig()) {
      const supabase = createSupabaseAdmin()

      // Upsert into article_views — increment or create
      const { error } = await supabase.rpc("increment_article_views", { article_slug: slug })

      if (error) {
        // RPC might not exist yet — fallback to manual upsert
        await supabase.from("article_views").upsert(
          { slug, views: 1, last_viewed_at: new Date().toISOString() },
          { onConflict: "slug", ignoreDuplicates: false }
        )
      }
    }

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error("[article-view] Unexpected error:", err)
    // Non-fatal — view counting is best-effort
    return NextResponse.json({ success: true })
  }
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const slug = (searchParams.get("slug") ?? "").replace(/[^a-z0-9-]/g, "").slice(0, 100)
  if (!slug) return NextResponse.json({ views: 0 })
  if (!hasSupabaseConfig()) return NextResponse.json({ views: 0 })
  try {
    const supabase = createSupabaseAdmin()
    const { data } = await supabase
      .from("article_views")
      .select("views")
      .eq("slug", slug)
      .single()
    return NextResponse.json({ views: data?.views ?? 0 })
  } catch {
    return NextResponse.json({ views: 0 })
  }
}
