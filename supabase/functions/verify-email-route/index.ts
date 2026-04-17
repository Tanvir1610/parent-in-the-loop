// app/api/verify-email/route.ts
import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

function getSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  if (!url || !key) throw new Error("Missing Supabase env vars.")
  return createClient(url, key, { auth: { autoRefreshToken: false, persistSession: false } })
}

async function sendWelcomeEmail(to: string) {
  const resendKey = process.env.RESEND_API_KEY
  if (!resendKey) { console.warn("[email] RESEND_API_KEY not set"); return }

  const fromEmail = process.env.EMAIL_FROM || "onboarding@resend.dev"

  const html = `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"/>
<style>*{box-sizing:border-box;margin:0;padding:0}body{font-family:'Segoe UI',Arial,sans-serif;background:#FAF6F0;color:#222}.wrap{max-width:580px;margin:0 auto;padding:32px 16px}.card{background:#fff;border-radius:20px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,.08)}.hdr{background:linear-gradient(135deg,#A6B6A1,#7C63B8);padding:36px 40px;text-align:center}.hdr h1{font-size:26px;font-weight:800;color:#fff;margin-bottom:8px}.hdr p{font-size:15px;color:rgba(255,255,255,.85);margin:0}.body{padding:32px 40px}p{font-size:15px;color:#3E3E3E;line-height:1.7;margin-bottom:14px}.box{background:#FAF6F0;border-radius:14px;border-left:4px solid #F3A78E;padding:18px 22px;margin:20px 0}.box h3{font-size:11px;font-weight:800;text-transform:uppercase;letter-spacing:.8px;color:#B79D84;margin-bottom:10px}.item{display:flex;gap:10px;margin-bottom:9px;font-size:14px;color:#3E3E3E;line-height:1.5}.tip{background:rgba(185,166,227,.1);border:1.5px solid rgba(124,99,184,.2);border-radius:14px;padding:18px 22px;margin:20px 0}.tip-lbl{font-size:11px;font-weight:800;text-transform:uppercase;letter-spacing:1px;color:#B79D84;margin-bottom:7px}.tip-txt{font-size:15px;color:#222;font-weight:600;line-height:1.6}.cta{text-align:center;margin:28px 0 20px}.btn{display:inline-block;background:#F3A78E;color:#fff!important;text-decoration:none;font-size:15px;font-weight:800;padding:13px 34px;border-radius:50px}.ftr{padding:20px 40px;background:#F5F0EA;border-top:1px solid #EDE8E1;text-align:center}.ftr p{font-size:12px;color:#B79D84;line-height:1.6}.ftr a{color:#7C63B8;text-decoration:none}</style>
</head><body><div class="wrap"><div class="card">
<div class="hdr"><div style="font-size:40px;margin-bottom:12px">🌱</div><h1>You&rsquo;re in the Loop!</h1><p>Welcome to the Parent in the Loop community</p></div>
<div class="body">
<p><strong>Hey there, welcome! 👋</strong></p>
<p>You&rsquo;ve joined a growing community of parents helping their kids develop a <strong>joyful, empowered understanding of AI</strong> &mdash; through honest conversations, fun activities, and evidence-based guidance.</p>
<p>Your first weekly AI wisdom email arrives <strong>next Sunday</strong> &mdash; watch your inbox!</p>
<div class="box">
<h3>What you&rsquo;ll get every week</h3>
<div class="item"><span>📝</span><div><strong>A fresh AI literacy topic</strong> &mdash; explained simply, without the hype</div></div>
<div class="item"><span>💬</span><div><strong>A family conversation starter</strong> &mdash; words you can use at dinner tonight</div></div>
<div class="item"><span>🎯</span><div><strong>A hands-on activity</strong> &mdash; playful, screen-optional, under 10 minutes</div></div>
<div class="item"><span>⏱️</span><div><strong>Under 5 minutes to read</strong> &mdash; we respect your time</div></div>
</div>
<div class="tip"><div class="tip-lbl">✨ This week&rsquo;s family tip</div><div class="tip-txt">Ask your child: &ldquo;Can you name 3 things in our home that use AI?&rdquo; You might be surprised what they already know! 🏠</div></div>
<p>While you wait, explore our latest AI literacy articles for families.</p>
<div class="cta"><a href="https://parentintheloop.com" class="btn">Browse Articles &rarr;</a></div>
<p style="font-size:14px;color:#B79D84;text-align:center">Questions? Just reply to this email &mdash; we read every message.</p>
</div>
<div class="ftr"><p>You&rsquo;re receiving this because <strong>${to}</strong> subscribed at <a href="https://parentintheloop.com">parentintheloop.com</a>.<br/><a href="https://parentintheloop.substack.com">Unsubscribe anytime</a> &middot; We never sell your email &middot; Privacy-first 🔒</p></div>
</div></div></body></html>`

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { "Authorization": `Bearer ${resendKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({ from: `Parent in the Loop <${fromEmail}>`, to: [to], subject: "You're in the Loop! Welcome to Parent in the Loop 🌱", html }),
  })

  if (res.ok) {
    console.info("[email] ✉️ Welcome email sent →", to)
  } else {
    const err = await res.json().catch(() => ({}))
    console.error("[email] Welcome email failed:", res.status, JSON.stringify(err))
  }
}

export async function GET(request: NextRequest) {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://parentintheloop.com"
  const token   = request.nextUrl.searchParams.get("token")

  if (!token) return NextResponse.redirect(`${siteUrl}/?verified=invalid`)

  let supabase
  try { supabase = getSupabase() }
  catch { return NextResponse.redirect(`${siteUrl}/?verified=error`) }

  try {
    const { data: sub, error } = await supabase
      .from("subscribers").select("id, email, is_verified").eq("verification_token", token).maybeSingle()

    if (error || !sub) {
      console.warn("[verify] Token not found:", token)
      return NextResponse.redirect(`${siteUrl}/?verified=invalid`)
    }

    if (sub.is_verified) {
      return NextResponse.redirect(`${siteUrl}/?verified=already`)
    }

    const { error: updateErr } = await supabase
      .from("subscribers")
      .update({ is_verified: true, is_active: true, verified_at: new Date().toISOString(), verification_token: crypto.randomUUID() })
      .eq("id", sub.id)

    if (updateErr) {
      console.error("[verify] Update failed:", updateErr.message)
      return NextResponse.redirect(`${siteUrl}/?verified=error`)
    }

    sendWelcomeEmail(sub.email).catch(console.error)
    console.info("[verify] ✓ Verified:", sub.email)
    return NextResponse.redirect(`${siteUrl}/?verified=success`)

  } catch (err) {
    console.error("[verify] Unexpected:", err)
    return NextResponse.redirect(`${siteUrl}/?verified=error`)
  }
}