import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
import { welcomeEmailHtml, welcomeEmailText } from "@/lib/emails/welcome"

const EMAIL_RE = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*\.[a-zA-Z]{2,}$/

// ── Supabase client (service-role preferred, anon fallback) ────
function getSupabaseClient() {
  const url     = process.env.NEXT_PUBLIC_SUPABASE_URL
  const service = process.env.SUPABASE_SERVICE_ROLE_KEY
  const anon    = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!url) throw new Error("NEXT_PUBLIC_SUPABASE_URL is not set")
  const key = service || anon
  if (!key) throw new Error("No Supabase key available")

  return createClient(url, key, {
    auth: { autoRefreshToken: false, persistSession: false },
  })
}

// ── Send welcome email via Resend ──────────────────────────────
async function sendWelcomeEmail(toEmail: string): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY
  if (!apiKey) {
    console.warn("[subscribe] RESEND_API_KEY not set — skipping welcome email")
    return
  }

  // Determine FROM address — prefer ryan@, fallback to tanvir@, fallback to onboarding@resend.dev
  const fromAddress =
    process.env.EMAIL_FROM ||
    "Parent in the Loop <ryan@supanovlabs.com>"

  const payload = {
    from: fromAddress,
    to: [toEmail],
    reply_to: "tanvir@supanovlabs.com",
    subject: "You're in the Loop! Welcome to Parent in the Loop 🌱",
    html: welcomeEmailHtml(toEmail),
    text: welcomeEmailText(toEmail),
    tags: [
      { name: "type",   value: "welcome" },
      { name: "source", value: "website" },
    ],
  }

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  })

  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    console.error("[subscribe] Resend error:", res.status, err)
    // Non-fatal — subscriber is saved, email just didn't send
  } else {
    const data = await res.json()
    console.info("[subscribe] Welcome email sent:", data.id, "→", toEmail)
  }
}

// ── POST /api/subscribe ────────────────────────────────────────
export async function POST(request: NextRequest) {
  // 1. Parse body
  let body: Record<string, unknown>
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 })
  }

  // 2. Validate email
  const raw   = typeof body?.email === "string" ? body.email : ""
  const email = raw.trim().toLowerCase()

  if (!email) {
    return NextResponse.json({ error: "Email address is required." }, { status: 400 })
  }
  if (!EMAIL_RE.test(email)) {
    return NextResponse.json({ error: "That email address is not valid." }, { status: 422 })
  }

  // 3. Save to Supabase
  try {
    const supabase = getSupabaseClient()

    const { error } = await supabase
      .from("subscribers")
      .insert({
        email,
        source: "website",
        subscribed_at: new Date().toISOString(),
        is_active: true,
      })

    if (error) {
      if (error.code === "23505") {
        return NextResponse.json(
          { error: "This email is already subscribed.", already_subscribed: true },
          { status: 409 }
        )
      }
      if (error.code === "42P01") {
        console.error("[subscribe] Table missing — run setup-database.sql")
        return NextResponse.json(
          { error: "Database not set up yet. Please run setup-database.sql in Supabase SQL Editor." },
          { status: 503 }
        )
      }
      if (error.code === "42703") {
        console.error("[subscribe] Column mismatch:", error.message)
        return NextResponse.json(
          { error: "Database schema outdated — re-run setup-database.sql." },
          { status: 503 }
        )
      }
      if (error.code === "42501") {
        console.error("[subscribe] RLS blocked — add SUPABASE_SERVICE_ROLE_KEY to Vercel env vars")
        return NextResponse.json(
          { error: "Permission error. Add SUPABASE_SERVICE_ROLE_KEY to Vercel environment variables and redeploy." },
          { status: 503 }
        )
      }
      console.error("[subscribe] DB error:", error.code, error.message)
      return NextResponse.json({ error: `Database error: ${error.message}` }, { status: 500 })
    }

    // 4. Send welcome email (non-blocking — don't fail subscribe if email fails)
    sendWelcomeEmail(email).catch((err) =>
      console.error("[subscribe] Welcome email exception:", err)
    )

    console.info("[subscribe] New subscriber saved:", email)
    return NextResponse.json({ success: true, email })

  } catch (err) {
    const msg = err instanceof Error ? err.message : "Unknown error"
    console.error("[subscribe] Fatal:", msg)

    if (msg.includes("SUPABASE_SERVICE_ROLE_KEY") || msg.includes("No Supabase key")) {
      return NextResponse.json(
        { error: "Server config error: Add NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY to Vercel environment variables, then redeploy." },
        { status: 503 }
      )
    }
    return NextResponse.json({ error: `Server error: ${msg}` }, { status: 500 })
  }
}

export async function GET() {
  return NextResponse.json({ error: "Method not allowed. Use POST." }, { status: 405 })
}
