import { type NextRequest, NextResponse } from "next/server"
import { createSupabaseAdmin, hasSupabaseConfig } from "@/lib/supabase"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const score      = Number(body?.score ?? 0)
    const total      = Number(body?.total ?? 5)
    const answers    = Array.isArray(body?.answers) ? body.answers : []
    const session_id = (body?.session_id ?? "").slice(0, 64)

    if (isNaN(score) || isNaN(total) || total < 1 || score < 0 || score > total) {
      return NextResponse.json({ error: "Invalid score data." }, { status: 400 })
    }

    if (hasSupabaseConfig()) {
      const supabase = createSupabaseAdmin()
      const { error } = await supabase.from("quiz_results").insert({
        score,
        total,
        percentage: Math.round((score / total) * 100),
        answers: JSON.stringify(answers),
        session_id: session_id || null,
        taken_at: new Date().toISOString(),
      })
      if (error) {
        console.error("[quiz-result] Supabase error:", error.message)
        // Non-fatal — quiz result saving is best-effort
      }
    }

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error("[quiz-result] Unexpected error:", err)
    return NextResponse.json({ error: "An unexpected error occurred." }, { status: 500 })
  }
}
