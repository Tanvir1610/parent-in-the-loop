import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
import { welcomeEmailHtml, welcomeEmailText } from "@/lib/emails/welcome"

const EMAIL_RE = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*\.[a-zA-Z]{2,}$/

function getSupabaseClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  if (!url || !key) throw new Error("Missing Supabase env vars. Add to Vercel environment variables.")
  return createClient(url, key, { auth: { autoRefreshToken: false, persistSession: false } })
}

// ─────────────────────────────────────────────────────────────
// sendWelcomeEmail — tries each method in order until one works
// Method 1: Mailjet    (free 200/day — just API key, no domain setup)
// Method 2: SMTP2GO    (free 1000/month — just API key)
// Method 3: Postmark   (free 100/month — just API key)
// All send FROM tanvir@supanovlabs.com once domain verified
// ─────────────────────────────────────────────────────────────
async function sendWelcomeEmail(toEmail: string): Promise<void> {
  const fromEmail = process.env.EMAIL_FROM      || "tanvir@supanovlabs.com"
  const fromName  = process.env.EMAIL_FROM_NAME || "Parent in the Loop"
  const replyTo   = process.env.EMAIL_REPLY_TO  || "tanvir@supanovlabs.com"
  const subject   = "You're in the Loop! Welcome to Parent in the Loop 🌱"

  // ── Method 1: Mailjet ─────────────────────────────────────
  const mjPublic  = process.env.MAILJET_API_KEY
  const mjPrivate = process.env.MAILJET_SECRET_KEY
  if (mjPublic && mjPrivate) {
    const credentials = Buffer.from(`${mjPublic}:${mjPrivate}`).toString("base64")
    const res = await fetch("https://api.mailjet.com/v3.1/send", {
      method: "POST",
      headers: {
        "Authorization": `Basic ${credentials}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        Messages: [{
          From:     { Email: fromEmail, Name: fromName },
          To:       [{ Email: toEmail }],
          ReplyTo:  { Email: replyTo },
          Subject:  subject,
          HTMLPart: welcomeEmailHtml(toEmail),
          TextPart: welcomeEmailText(toEmail),
        }],
      }),
    })
    if (res.ok) {
      const d = await res.json()
      console.info("[email] ✉️ Sent via Mailjet:", d?.Messages?.[0]?.Status, "→", toEmail)
      return
    }
    const e = await res.json().catch(() => ({}))
    console.warn("[email] Mailjet failed:", res.status, JSON.stringify(e))
  }

  // ── Method 2: SMTP2GO ─────────────────────────────────────
  const smtp2goKey = process.env.SMTP2GO_API_KEY
  if (smtp2goKey) {
    const res = await fetch("https://api.smtp2go.com/v3/email/send", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        api_key:   smtp2goKey,
        to:        [toEmail],
        sender:    `${fromName} <${fromEmail}>`,
        subject:   subject,
        html_body: welcomeEmailHtml(toEmail),
        text_body: welcomeEmailText(toEmail),
      }),
    })
    if (res.ok) {
      const d = await res.json()
      console.info("[email] ✉️ Sent via SMTP2GO:", d?.data?.succeeded, "→", toEmail)
      return
    }
    const e = await res.json().catch(() => ({}))
    console.warn("[email] SMTP2GO failed:", res.status, JSON.stringify(e))
  }

  // ── Method 3: Postmark ────────────────────────────────────
  const postmarkKey = process.env.POSTMARK_SERVER_TOKEN
  if (postmarkKey) {
    const res = await fetch("https://api.postmarkapp.com/email", {
      method: "POST",
      headers: {
        "Accept":                  "application/json",
        "Content-Type":            "application/json",
        "X-Postmark-Server-Token": postmarkKey,
      },
      body: JSON.stringify({
        From:     `${fromName} <${fromEmail}>`,
        To:       toEmail,
        ReplyTo:  replyTo,
        Subject:  subject,
        HtmlBody: welcomeEmailHtml(toEmail),
        TextBody: welcomeEmailText(toEmail),
        MessageStream: "outbound",
      }),
    })
    if (res.ok) {
      const d = await res.json()
      console.info("[email] ✉️ Sent via Postmark:", d?.MessageID, "→", toEmail)
      return
    }
    const e = await res.json().catch(() => ({}))
    console.warn("[email] Postmark failed:", res.status, JSON.stringify(e))
  }

  // No email provider configured
  console.warn("[email] No email provider configured. Add MAILJET_API_KEY + MAILJET_SECRET_KEY, SMTP2GO_API_KEY, or POSTMARK_SERVER_TOKEN to Vercel env vars.")
}

export async function POST(request: NextRequest) {
  let body: Record<string, unknown>
  try { body = await request.json() }
  catch { return NextResponse.json({ error: "Invalid request." }, { status: 400 }) }

  const raw   = typeof body?.email === "string" ? body.email : ""
  const email = raw.trim().toLowerCase()

  if (!email) return NextResponse.json({ error: "Email address is required." }, { status: 400 })
  if (!EMAIL_RE.test(email)) return NextResponse.json({ error: "That email address is not valid." }, { status: 422 })

  let supabase
  try { supabase = getSupabaseClient() }
  catch (err) { return NextResponse.json({ error: err instanceof Error ? err.message : "Config error" }, { status: 503 }) }

  try {
    const { error } = await supabase
      .from("subscribers")
      .insert({ email, source: "website", subscribed_at: new Date().toISOString(), is_active: true })

    if (error) {
      if (error.code === "23505") return NextResponse.json({ error: "This email is already subscribed.", already_subscribed: true }, { status: 409 })
      if (error.code === "42P01") return NextResponse.json({ error: "Database table missing. Run setup-database.sql in Supabase." }, { status: 503 })
      if (error.code === "42703") return NextResponse.json({ error: "Database schema outdated. Re-run setup-database.sql." }, { status: 503 })
      if (error.code === "42501") return NextResponse.json({ error: "Permission denied. Check SUPABASE_SERVICE_ROLE_KEY in Vercel." }, { status: 503 })
      if (error.message?.toLowerCase().includes("invalid api key") || error.message?.toLowerCase().includes("jwt")) {
        return NextResponse.json({ error: "Invalid Supabase API key. Copy service_role key from Supabase → Project Settings → API." }, { status: 503 })
      }
      return NextResponse.json({ error: `Database error: ${error.message}` }, { status: 500 })
    }

    // Send email non-blocking — subscription always succeeds
    sendWelcomeEmail(email).catch((err) =>
      console.error("[subscribe] Email error:", err instanceof Error ? err.message : err)
    )

    console.info("[subscribe] ✓ New subscriber:", email)
    return NextResponse.json({ success: true, email })

  } catch (err) {
    return NextResponse.json({ error: `Server error: ${err instanceof Error ? err.message : err}` }, { status: 500 })
  }
}

export async function GET() {
  return NextResponse.json({ error: "Method not allowed. Use POST." }, { status: 405 })
}
