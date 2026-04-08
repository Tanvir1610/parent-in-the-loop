import { NextResponse } from "next/server"
import { createSupabaseAdmin, hasSupabaseConfig } from "@/lib/supabase"

export async function GET() {
  if (!hasSupabaseConfig()) {
    return NextResponse.json({ error: "No DB config" }, { status: 503 })
  }
  try {
    const supabase = createSupabaseAdmin()
    const [subRes, artRes, msgRes, quizRes, viewRes, subGrowthRes] = await Promise.all([
      supabase.from("subscribers").select("id, subscribed_at, is_active", { count: "exact" }),
      supabase.from("articles").select("id, category", { count: "exact" }),
      supabase.from("contact_messages").select("id, status", { count: "exact" }),
      supabase.from("quiz_results").select("score, total, percentage, taken_at"),
      supabase.from("article_views").select("slug, views").order("views", { ascending: false }).limit(6),
      supabase.from("subscribers").select("subscribed_at")
        .gte("subscribed_at", new Date(Date.now() - 56 * 24 * 60 * 60 * 1000).toISOString())
        .order("subscribed_at", { ascending: true }),
    ])

    // Weekly growth buckets
    const weeklyGrowth: Record<string, number> = {}
    for (let w = 7; w >= 0; w--) {
      const d = new Date(Date.now() - w * 7 * 24 * 60 * 60 * 1000)
      weeklyGrowth[d.toLocaleDateString("en-US", { month: "short", day: "numeric" })] = 0
    }
    ;(subGrowthRes.data ?? []).forEach((s) => {
      const d = new Date(s.subscribed_at)
      const key = d.toLocaleDateString("en-US", { month: "short", day: "numeric" })
      if (key in weeklyGrowth) weeklyGrowth[key]++
    })
    const growthData = Object.entries(weeklyGrowth).map(([week, count]) => ({ week, count }))

    const categories: Record<string, number> = {}
    ;(artRes.data ?? []).forEach((a) => { categories[a.category] = (categories[a.category] ?? 0) + 1 })
    const categoryData = Object.entries(categories).map(([name, count]) => ({ name, count }))

    const quizData = quizRes.data ?? []
    const avgScore = quizData.length
      ? Math.round(quizData.reduce((s, q) => s + q.percentage, 0) / quizData.length) : 0

    return NextResponse.json({
      totals: {
        subscribers:      subRes.count ?? 0,
        articles:         artRes.count ?? 0,
        messages:         msgRes.count ?? 0,
        quizAttempts:     quizData.length,
        avgQuizScore:     avgScore,
        activeSubscribers: (subRes.data ?? []).filter((s) => s.is_active).length,
      },
      growthData,
      categoryData,
      topArticles: viewRes.data ?? [],
    })
  } catch (err) {
    console.error("[admin/stats]", err)
    return NextResponse.json({ error: "Failed to fetch stats" }, { status: 500 })
  }
}
