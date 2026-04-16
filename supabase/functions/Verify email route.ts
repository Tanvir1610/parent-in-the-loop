// app/api/verify-email/route.ts
// User lands here after clicking the link in their verification email

import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
import { welcomeEmailHtml, welcomeEmailText } from "@/lib/emails/welcome"

function getSupabaseClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  if (!url || !key) throw new Error("Missing Supabase env vars.")
  return createClient(url, key, { auth: { autoRefreshToken: false, persistSession: false } })
}

async function sendWelcomeEmail(toEmail: string): Promise<void> {
  const fromEmail = process.env.EMAIL_FROM      || "tanvir@supanovlabs.com"
  const fromName  = process.env.EMAIL_FROM_NAME || "Parent in the Loop"
  const replyTo   = process.env.EMAIL_REPLY_TO  || fromEmail
  const subject   = "You're in the Loop! Welcome to Parent in the Loop 🌱"

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
          HTMLPart: welcomeEmailHtml(toEmail),
          TextPart: welcomeEmailText(toEmail),
        }],
      }),
    })
    if (res.ok) { console.info("[email] ✉️ Welcome email sent via Mailjet →", toEmail); return }
    console.warn("[email] Mailjet failed:", res.status)
  }

  const smtp2goKey = process.env.SMTP2GO_API_KEY
  if (smtp2goKey) {
    const res = await fetch("https://api.smtp2go.com/v3/email/send", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        api_key:   smtp2goKey,
        to:        [toEmail],
        sender:    `${fromName} <${fromEmail}>`,
        subject,
        html_body: welcomeEmailHtml(toEmail),
        text_body: welcomeEmailText(toEmail),
      }),
    })
    if (res.ok) { console.info("[email] ✉️ Welcome email sent via SMTP2GO →", toEmail); return }
    console.warn("[email] SMTP2GO failed:", res.status)
  }

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
        From: `${fromName} <${fromEmail}>`,
        To: toEmail,
        ReplyTo: replyTo,
        Subject: subject,
        HtmlBody: welcomeEmailHtml(toEmail),
        TextBody: welcomeEmailText(toEmail),
        MessageStream: "outbound",
      }),
    })
    if (res.ok) { console.info("[email] ✉️ Welcome email sent via Postmark →", toEmail); return }
    console.warn("[email] Postmark failed:", res.status)
  }

  console.warn("[email] ⚠️ No email provider configured for welcome email.")
}

export async function GET(request: NextRequest) {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://parentintheloop.com"
  const token   = request.nextUrl.searchParams.get("token")

  if (!token) {
    return NextResponse.redirect(`${siteUrl}/?verified=invalid`)
  }

  let supabase
  try { supabase = getSupabaseClient() }
  catch {
    return NextResponse.redirect(`${siteUrl}/?verified=error`)
  }

  try {
    // Find subscriber by token
    const { data: subscriber, error: findErr } = await supabase
      .from("subscribers")
      .select("id, email, is_verified")
      .eq("verification_token", token)
      .single()

    if (findErr || !subscriber) {
      console.warn("[verify] Token not found:", token)
      return NextResponse.redirect(`${siteUrl}/?verified=invalid`)
    }

    if (subscriber.is_verified) {
      // Already verified — just redirect to success
      return NextResponse.redirect(`${siteUrl}/?verified=already`)
    }

    // Mark as verified and active
    const { error: updateErr } = await supabase
      .from("subscribers")
      .update({
        is_verified:  true,
        is_active:    true,
        verified_at:  new Date().toISOString(),
        // Rotate token so the link can't be reused
        verification_token: crypto.randomUUID(),
      })
      .eq("id", subscriber.id)

    if (updateErr) {
      console.error("[verify] Update error:", updateErr.message)
      return NextResponse.redirect(`${siteUrl}/?verified=error`)
    }

    // Send welcome email (non-blocking)
    sendWelcomeEmail(subscriber.email).catch(console.error)

    console.info("[verify] ✓ Verified:", subscriber.email)
    return NextResponse.redirect(`${siteUrl}/?verified=success`)

  } catch (err) {
    console.error("[verify] Unexpected error:", err)
    return NextResponse.redirect(`${siteUrl}/?verified=error`)
  }
}
