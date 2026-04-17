// app/api/subscribe/route.ts
import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

const EMAIL_RE = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*\.[a-zA-Z]{2,}$/

function getSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  if (!url || !key) throw new Error("Missing Supabase env vars.")
  return createClient(url, key, { auth: { autoRefreshToken: false, persistSession: false } })
}

async function sendVerificationEmail(to: string, token: string) {
  const resendKey = process.env.RESEND_API_KEY
  if (!resendKey) { console.warn("[email] RESEND_API_KEY not set"); return }

  const siteUrl   = process.env.NEXT_PUBLIC_SITE_URL || "https://parentintheloop.com"
  const verifyUrl = `${siteUrl}/api/verify-email?token=${token}`
  const fromEmail = process.env.EMAIL_FROM || "onboarding@resend.dev"

  const html = `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"/>
<style>*{box-sizing:border-box;margin:0;padding:0}body{font-family:'Segoe UI',Arial,sans-serif;background:#FAF6F0;color:#222}.wrap{max-width:560px;margin:0 auto;padding:32px 16px}.card{background:#fff;border-radius:20px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,.08)}.hdr{background:linear-gradient(135deg,#A6B6A1,#7C63B8);padding:36px 40px;text-align:center}.hdr h1{font-size:24px;font-weight:800;color:#fff;margin-bottom:8px}.hdr p{font-size:14px;color:rgba(255,255,255,.85);margin:0}.body{padding:32px 40px}p{font-size:15px;color:#3E3E3E;line-height:1.7;margin-bottom:14px}.btn-wrap{text-align:center;margin:28px 0}.btn{display:inline-block;background:#F3A78E;color:#fff!important;text-decoration:none;font-size:16px;font-weight:800;padding:15px 42px;border-radius:50px}.url-box{background:#FAF6F0;border-radius:10px;padding:14px 18px;margin:20px 0;font-size:12px;color:#999;word-break:break-all;border:1px solid #EDE8E1;line-height:1.7}.url-box a{color:#7C63B8}.ftr{padding:20px 40px;background:#F5F0EA;border-top:1px solid #EDE8E1;text-align:center}.ftr p{font-size:12px;color:#B79D84;line-height:1.6}.ftr a{color:#7C63B8;text-decoration:none}</style>
</head><body><div class="wrap"><div class="card">
<div class="hdr"><div style="font-size:40px;margin-bottom:12px">📬</div><h1>One click to confirm!</h1><p>Verify your email to join Parent in the Loop</p></div>
<div class="body">
<p><strong>Hey there! 👋</strong></p>
<p>Thanks for signing up! Click the button below to confirm your email and start receiving your weekly AI wisdom for families.</p>
<div class="btn-wrap"><a href="${verifyUrl}" class="btn">✅ Confirm My Subscription</a></div>
<p style="font-size:13px;color:#B79D84;text-align:center">This link expires in <strong>48 hours</strong>.</p>
<div class="url-box">Button not working? Copy and paste this into your browser:<br/><a href="${verifyUrl}">${verifyUrl}</a></div>
<p style="font-size:13px;color:#B79D84;text-align:center">Didn't sign up? You can safely ignore this email.</p>
</div>
<div class="ftr"><p>Sent because <strong>${to}</strong> subscribed at <a href="https://parentintheloop.com">parentintheloop.com</a><br/>We never sell or share your email. Privacy-first 🔒</p></div>
</div></div></body></html>`

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { "Authorization": `Bearer ${resendKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({ from: `Parent in the Loop <${fromEmail}>`, to: [to], subject: "Confirm your subscription — Parent in the Loop 🌱", html }),
  })

  if (res.ok) {
    console.info("[email] ✉️ Verification sent →", to)
  } else {
    const err = await res.json().catch(() => ({}))
    console.error("[email] Resend failed:", res.status, JSON.stringify(err))
  }
}

export async function POST(request: NextRequest) {
  let body: Record<string, unknown>
  try { body = await request.json() }
  catch { return NextResponse.json({ error: "Invalid request." }, { status: 400 }) }

  const raw   = typeof body?.email === "string" ? body.email : ""
  const email = raw.trim().toLowerCase()

  if (!email)                return NextResponse.json({ error: "Email address is required." }, { status: 400 })
  if (!EMAIL_RE.test(email)) return NextResponse.json({ error: "That email address is not valid." }, { status: 422 })

  let supabase
  try { supabase = getSupabase() }
  catch (err) { return NextResponse.json({ error: err instanceof Error ? err.message : "Config error" }, { status: 503 }) }

  try {
    const { data: existing } = await supabase
      .from("subscribers").select("id, is_verified, verification_token").eq("email", email).maybeSingle()

    if (existing) {
      if (existing.is_verified) return NextResponse.json({ error: "This email is already subscribed.", already_subscribed: true }, { status: 409 })
      sendVerificationEmail(email, existing.verification_token).catch(console.error)
      return NextResponse.json({ success: true, pending_verification: true, resent: true, email })
    }

    const { data: inserted, error } = await supabase
      .from("subscribers")
      .insert({ email, source: "website", subscribed_at: new Date().toISOString(), is_verified: false, is_active: false })
      .select("verification_token").single()

    if (error) {
      if (error.code === "23505") return NextResponse.json({ error: "This email is already subscribed.", already_subscribed: true }, { status: 409 })
      if (error.code === "42703") return NextResponse.json({ error: "Run setup-subscribers-with-verification.sql in Supabase SQL Editor first." }, { status: 503 })
      if (error.code === "42P01") return NextResponse.json({ error: "Subscribers table missing. Run setup-subscribers-with-verification.sql." }, { status: 503 })
      return NextResponse.json({ error: `Database error: ${error.message}` }, { status: 500 })
    }

    sendVerificationEmail(email, inserted.verification_token).catch(console.error)
    console.info("[subscribe] ✓ New subscriber (pending):", email)
    return NextResponse.json({ success: true, pending_verification: true, email })

  } catch (err) {
    return NextResponse.json({ error: `Server error: ${err instanceof Error ? err.message : err}` }, { status: 500 })
  }
}

export async function GET() {
  return NextResponse.json({ error: "Method not allowed. Use POST." }, { status: 405 })
}