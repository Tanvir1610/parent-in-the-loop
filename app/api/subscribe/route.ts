import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
import { welcomeEmailHtml, welcomeEmailText } from "@/lib/emails/welcome"

const EMAIL_RE = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*\.[a-zA-Z]{2,}$/

// Read env at REQUEST time (not module load time) so Vercel env vars are always fresh
function getSupabaseClient() {
  const url     = process.env.NEXT_PUBLIC_SUPABASE_URL
  // Prefer service-role key (bypasses RLS). Fall back to anon key.
  const key     = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!url || !key) {
    const missing = !url ? "NEXT_PUBLIC_SUPABASE_URL" : "SUPABASE_SERVICE_ROLE_KEY or NEXT_PUBLIC_SUPABASE_ANON_KEY"
    throw new Error(`Missing env var: ${missing}. Add it to Vercel → Settings → Environment Variables and redeploy.`)
  }

  return createClient(url, key, {
    auth: { autoRefreshToken: false, persistSession: false },
  })
}

async function sendWelcomeEmail(toEmail: string): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY
  if (!apiKey || apiKey === "re_your_api_key_here") {
    console.warn("[subscribe] RESEND_API_KEY not configured — skipping welcome email")
    return
  }

  const fromAddress = process.env.EMAIL_FROM || "Parent in the Loop <ryan@supanovlabs.com>"

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: fromAddress,
      to: [toEmail],
      reply_to: "tanvir@supanovlabs.com",
      subject: "You're in the Loop! Welcome to Parent in the Loop 🌱",
      html: welcomeEmailHtml(toEmail),
      text: welcomeEmailText(toEmail),
    }),
  })

  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    console.error("[subscribe] Resend error:", res.status, err)
  } else {
    const data = await res.json()
    console.info("[subscribe] Welcome email sent:", data.id, "→", toEmail)
  }
}

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
  let supabase
  try {
    supabase = getSupabaseClient()
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Config error"
    console.error("[subscribe] Config error:", msg)
    return NextResponse.json({ error: msg }, { status: 503 })
  }

  try {
    const { error } = await supabase
      .from("subscribers")
      .insert({
        email,
        source: "website",
        subscribed_at: new Date().toISOString(),
        is_active: true,
      })

    if (error) {
      // Already subscribed
      if (error.code === "23505") {
        return NextResponse.json(
          { error: "This email is already subscribed.", already_subscribed: true },
          { status: 409 }
        )
      }
      // Table doesn't exist — guide developer
      if (error.code === "42P01") {
        console.error("[subscribe] subscribers table missing — run setup-database.sql")
        return NextResponse.json(
          { error: "Database table missing. Run setup-database.sql in Supabase SQL Editor." },
          { status: 503 }
        )
      }
      // Column mismatch
      if (error.code === "42703") {
        console.error("[subscribe] Column error:", error.message)
        return NextResponse.json(
          { error: "Database schema outdated. Re-run setup-database.sql in Supabase SQL Editor." },
          { status: 503 }
        )
      }
      // RLS blocked — anon key without INSERT policy
      if (error.code === "42501") {
        console.error("[subscribe] RLS blocked — SUPABASE_SERVICE_ROLE_KEY missing or wrong in Vercel")
        return NextResponse.json(
          { error: "Permission denied. Check that SUPABASE_SERVICE_ROLE_KEY is correct in Vercel environment variables." },
          { status: 503 }
        )
      }
      // Invalid API key
      if (error.code === "PGRST301" || error.message?.toLowerCase().includes("invalid api key") || error.message?.toLowerCase().includes("jwt")) {
        console.error("[subscribe] Invalid API key:", error.message)
        return NextResponse.json(
          { error: "Invalid Supabase API key. Copy the exact Service Role key from Supabase → Project Settings → API → service_role (secret) and paste it into Vercel → Environment Variables as SUPABASE_SERVICE_ROLE_KEY, then redeploy." },
          { status: 503 }
        )
      }

      console.error("[subscribe] DB error:", error.code, error.message)
      return NextResponse.json({ error: `Database error (${error.code}): ${error.message}` }, { status: 500 })
    }

    // 4. Send welcome email (non-blocking)
    sendWelcomeEmail(email).catch((err) =>
      console.error("[subscribe] Email error:", err)
    )

    console.info("[subscribe] ✓ New subscriber:", email)
    return NextResponse.json({ success: true, email })

  } catch (err) {
    const msg = err instanceof Error ? err.message : "Unknown error"
    console.error("[subscribe] Unexpected:", msg)
    return NextResponse.json({ error: `Unexpected error: ${msg}` }, { status: 500 })
  }
}

export async function GET() {
  return NextResponse.json({ error: "Method not allowed. Use POST." }, { status: 405 })
}
