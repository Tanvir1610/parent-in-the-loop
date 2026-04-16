import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
import { verificationEmailHtml, verificationEmailText } from "@/lib/emails/verification"

const EMAIL_RE = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*\.[a-zA-Z]{2,}$/

function getSupabaseClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  if (!url || !key) throw new Error("Missing Supabase env vars.")
  return createClient(url, key, { auth: { autoRefreshToken: false, persistSession: false } })
}

async function sendVerificationEmail(toEmail: string, token: string): Promise<void> {
  const siteUrl   = process.env.NEXT_PUBLIC_SITE_URL || "https://parentintheloop.com"
  const verifyUrl = `${siteUrl}/api/verify-email?token=${token}`
  const fromEmail = process.env.EMAIL_FROM      || "tanvir@supanovlabs.com"
  const fromName  = process.env.EMAIL_FROM_NAME || "Parent in the Loop"
  const replyTo   = process.env.EMAIL_REPLY_TO  || fromEmail
  const subject   = "Confirm your subscription — Parent in the Loop 🌱"

  // ── Mailjet ────────────────────────────────────────────────
  const mjPublic  = process.env.MAILJET_API_KEY
  const mjPrivate = process.env.MAILJET_SECRET_KEY
  if (mjPublic && mjPrivate) {
    const credentials = Buffer.from(`${mjPublic}:${mjPrivate}`).toString("base64")
    const res = await fetch("https://api.mailjet.com/v3.1/send", {
      method: "POST",
      headers: { "Authorization": `Basic ${credentials}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        Messages: [{
          From:     { Email: fromEmail, Name: fromName },
          To:       [{ Email: toEmail }],
          ReplyTo:  { Email: replyTo },
          Subject:  subject,
          HTMLPart: verificationEmailHtml(toEmail, verifyUrl),
          TextPart: verificationEmailText(toEmail, verifyUrl),
        }],
      }),
    })
    if (res.ok) {
      console.info("[email] ✉️ Verification email sent via Mailjet →", toEmail)
      return
    }
    console.warn("[email] Mailjet failed:", res.status, await res.text())
  }

  // ── SMTP2GO ────────────────────────────────────────────────
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
        html_body: verificationEmailHtml(toEmail, verifyUrl),
        text_body: verificationEmailText(toEmail, verifyUrl),
      }),
    })
    if (res.ok) {
      console.info("[email] ✉️ Verification email sent via SMTP2GO →", toEmail)
      return
    }
    console.warn("[email] SMTP2GO failed:", res.status, await res.text())
  }

  // ── Postmark ───────────────────────────────────────────────
  const postmarkKey = process.env.POSTMARK_SERVER_TOKEN
  if (postmarkKey) {
    const res = await fetch("https://api.postmarkapp.com/email", {
      method: "POST",
      headers: {
        "Accept": "application/json",
        "Content-Type": "application/json",
        "X-Postmark-Server-Token": postmarkKey,
      },
      body: JSON.stringify({
        From:     `${fromName} <${fromEmail}>`,
        To:       toEmail,
        ReplyTo:  replyTo,
        Subject:  subject,
        HtmlBody: verificationEmailHtml(toEmail, verifyUrl),
        TextBody: verificationEmailText(toEmail, verifyUrl),
        MessageStream: "outbound",
      }),
    })
    if (res.ok) {
      console.info("[email] ✉️ Verification email sent via Postmark →", toEmail)
      return
    }
    console.warn("[email] Postmark failed:", res.status, await res.text())
  }

  console.warn("[email] ⚠️ No email provider configured. Set MAILJET_API_KEY+SECRET, SMTP2GO_API_KEY, or POSTMARK_SERVER_TOKEN in Vercel env vars.")
}

export async function POST(request: NextRequest) {
  let body: Record<string, unknown>
  try { body = await request.json() }
  catch { return NextResponse.json({ error: "Invalid request." }, { status: 400 }) }

  const raw   = typeof body?.email === "string" ? body.email : ""
  const email = raw.trim().toLowerCase()

  if (!email)              return NextResponse.json({ error: "Email address is required." }, { status: 400 })
  if (!EMAIL_RE.test(email)) return NextResponse.json({ error: "That email address is not valid." }, { status: 422 })

  let supabase
  try { supabase = getSupabaseClient() }
  catch (err) { return NextResponse.json({ error: err instanceof Error ? err.message : "Config error" }, { status: 503 }) }

  try {
    // Check if already exists
    const { data: existing } = await supabase
      .from("subscribers")
      .select("id, is_verified, verification_token")
      .eq("email", email)
      .single()

    if (existing) {
      if (existing.is_verified) {
        return NextResponse.json({ error: "This email is already subscribed.", already_subscribed: true }, { status: 409 })
      }
      // Not verified yet — resend verification
      sendVerificationEmail(email, existing.verification_token).catch(console.error)
      return NextResponse.json({ success: true, resent: true, email })
    }

    // New subscriber — insert as unverified
    const { data: inserted, error } = await supabase
      .from("subscribers")
      .insert({ email, source: "website", subscribed_at: new Date().toISOString(), is_verified: false, is_active: false })
      .select("verification_token")
      .single()

    if (error) {
      if (error.code === "23505") {
        return NextResponse.json({ error: "This email is already subscribed.", already_subscribed: true }, { status: 409 })
      }
      return NextResponse.json({ error: `Database error: ${error.message}` }, { status: 500 })
    }

    // Send verification email (non-blocking)
    sendVerificationEmail(email, inserted.verification_token).catch(console.error)

    console.info("[subscribe] ✓ New pending subscriber:", email)
    return NextResponse.json({ success: true, email, pending_verification: true })

  } catch (err) {
    return NextResponse.json({ error: `Server error: ${err instanceof Error ? err.message : err}` }, { status: 500 })
  }
}

export async function GET() {
  return NextResponse.json({ error: "Method not allowed. Use POST." }, { status: 405 })
}
