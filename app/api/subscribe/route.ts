import { type NextRequest, NextResponse } from "next/server"
import { createSupabaseAdmin, hasSupabaseConfig } from "@/lib/supabase"

// RFC-5321 compliant — same regex as client so server always agrees
const EMAIL_RE = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*\.[a-zA-Z]{2,}$/

export async function POST(request: NextRequest) {
  // ── 1. Parse body safely ──────────────────────────────────────
  let body: Record<string, unknown>
  try {
    body = await request.json()
  } catch {
    return NextResponse.json(
      { error: "Invalid request body — expected JSON." },
      { status: 400 }
    )
  }

  // ── 2. Sanitise & validate email ─────────────────────────────
  const raw   = typeof body?.email === "string" ? body.email : ""
  const email = raw.trim().toLowerCase()

  if (!email) {
    return NextResponse.json(
      { error: "Email address is required." },
      { status: 400 }
    )
  }
  if (email.length > 254) {
    return NextResponse.json(
      { error: "Email address is too long (max 254 characters)." },
      { status: 400 }
    )
  }
  if (!EMAIL_RE.test(email)) {
    return NextResponse.json(
      { error: "That email address is not valid. Please check and try again." },
      { status: 422 }   // 422 Unprocessable — client sent bad data, not a server error
    )
  }

  // ── 3. Persist to Supabase ────────────────────────────────────
  if (!hasSupabaseConfig()) {
    // No database configured — log and return success anyway so the
    // site isn't broken in preview/dev without a database.
    console.warn("[subscribe] No Supabase config — skipping DB write for:", email)
    return NextResponse.json({ success: true, email, stored: false })
  }

  try {
    const supabase = createSupabaseAdmin()

    const { data, error } = await supabase
      .from("subscribers")
      .insert({
        email,
        source: "website",
        subscribed_at: new Date().toISOString(),
        is_active: true,
      })
      .select("id, email, subscribed_at")
      .single()

    if (error) {
      // Postgres unique-violation — email already in table
      if (error.code === "23505") {
        return NextResponse.json(
          { error: "This email is already subscribed.", already_subscribed: true },
          { status: 409 }
        )
      }
      // Table doesn't exist yet
      if (error.code === "42P01") {
        console.error("[subscribe] Table 'subscribers' does not exist. Run setup-database.sql.")
        return NextResponse.json(
          { error: "Subscription database not ready. Please try again later." },
          { status: 503 }
        )
      }
      // Any other DB error
      console.error("[subscribe] Supabase insert error:", {
        code: error.code,
        message: error.message,
        hint: error.hint,
      })
      return NextResponse.json(
        { error: "Could not save your subscription. Please try again." },
        { status: 500 }
      )
    }

    console.info("[subscribe] New subscriber:", data?.email)
    return NextResponse.json({
      success: true,
      email: data?.email ?? email,
      subscribed_at: data?.subscribed_at,
      stored: true,
    })

  } catch (err) {
    console.error("[subscribe] Unexpected error:", err)
    return NextResponse.json(
      { error: "An unexpected error occurred. Please try again." },
      { status: 500 }
    )
  }
}

export async function GET() {
  return NextResponse.json({ error: "Method not allowed. Use POST." }, { status: 405 })
}
