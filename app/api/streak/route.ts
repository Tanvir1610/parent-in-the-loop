import { NextResponse, type NextRequest } from "next/server"
import { createClient } from "@supabase/supabase-js"

function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )
}

// GET — fetch streak data for a user
export async function GET(req: NextRequest) {
  const userId = req.nextUrl.searchParams.get("userId")
  if (!userId) return NextResponse.json({ streak: 0, longest: 0, lastVisit: null })

  try {
    const supabase = getSupabase()
    const { data } = await supabase
      .from("user_streaks")
      .select("*")
      .eq("user_id", userId)
      .single()

    return NextResponse.json({
      streak:    data?.current_streak ?? 0,
      longest:   data?.longest_streak ?? 0,
      lastVisit: data?.last_visit_date ?? null,
      totalDays: data?.total_days ?? 0,
    })
  } catch {
    return NextResponse.json({ streak: 0, longest: 0, lastVisit: null, totalDays: 0 })
  }
}

// POST — record a daily visit and update streak
export async function POST(req: NextRequest) {
  const { userId } = await req.json()
  if (!userId) return NextResponse.json({ error: "userId required" }, { status: 400 })

  try {
    const supabase = getSupabase()
    const today = new Date().toISOString().split("T")[0] // YYYY-MM-DD

    const { data: existing } = await supabase
      .from("user_streaks")
      .select("*")
      .eq("user_id", userId)
      .single()

    if (!existing) {
      // First visit ever
      await supabase.from("user_streaks").insert({
        user_id:        userId,
        current_streak: 1,
        longest_streak: 1,
        last_visit_date: today,
        total_days:     1,
      })
      return NextResponse.json({ streak: 1, longest: 1, isNew: true })
    }

    if (existing.last_visit_date === today) {
      // Already visited today
      return NextResponse.json({ streak: existing.current_streak, longest: existing.longest_streak, alreadyVisited: true })
    }

    const yesterday = new Date()
    yesterday.setDate(yesterday.getDate() - 1)
    const yesterdayStr = yesterday.toISOString().split("T")[0]

    const isConsecutive = existing.last_visit_date === yesterdayStr
    const newStreak = isConsecutive ? existing.current_streak + 1 : 1
    const newLongest = Math.max(newStreak, existing.longest_streak)

    await supabase.from("user_streaks").update({
      current_streak:  newStreak,
      longest_streak:  newLongest,
      last_visit_date: today,
      total_days:      (existing.total_days || 0) + 1,
    }).eq("user_id", userId)

    return NextResponse.json({ streak: newStreak, longest: newLongest, broken: !isConsecutive })
  } catch (err) {
    console.error("[streak]", err)
    return NextResponse.json({ streak: 0, longest: 0 })
  }
}
