import { type NextRequest, NextResponse } from "next/server"
import { createSupabaseAdmin, hasSupabaseConfig } from "@/lib/supabase"

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const email = (body?.email ?? "").trim().toLowerCase()

    // --- Validation ---
    if (!email || !EMAIL_RE.test(email)) {
      return NextResponse.json(
        { error: "Please provide a valid email address." },
        { status: 400 }
      )
    }
    if (email.length > 254) {
      return NextResponse.json(
        { error: "Email address is too long." },
        { status: 400 }
      )
    }

    // --- Persist to Supabase using service-role key (bypasses RLS for writes) ---
    if (hasSupabaseConfig()) {
      const supabase = createSupabaseAdmin()

      const { error } = await supabase
        .from("subscribers")
        .insert({ email, subscribed_at: new Date().toISOString(), source: "website" })

      if (error) {
        // Postgres unique-violation code
        if (error.code === "23505") {
          return NextResponse.json(
            { error: "Email already subscribed", already_subscribed: true },
            { status: 409 }
          )
        }
        console.error("[subscribe] Supabase error:", error.message, error.code)
        return NextResponse.json(
          { error: "Failed to save subscription. Please try again." },
          { status: 500 }
        )
      }
    }

    return NextResponse.json({ success: true, email })
  } catch (err) {
    console.error("[subscribe] Unexpected error:", err)
    return NextResponse.json(
      { error: "An unexpected error occurred. Please try again." },
      { status: 500 }
    )
  }
}

// Reject non-POST
export async function GET() {
  return NextResponse.json({ error: "Method not allowed" }, { status: 405 })
}
