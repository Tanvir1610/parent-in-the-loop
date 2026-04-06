// Supabase Edge Function: welcome-email
// Triggered via Database Webhook on subscribers INSERT
// Uses Deno SMTP to send directly from tanvir@supanovlabs.com
// Deploy: supabase functions deploy welcome-email

import { serve } from "https://deno.land/std@0.177.0/http/server.ts"
import { SMTPClient } from "https://deno.land/x/denomailer@1.6.0/mod.ts"

const WELCOME_HTML = (email: string) => `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1"/>
<title>Welcome to Parent in the Loop 🌱</title>
<style>
*{box-sizing:border-box;margin:0;padding:0}
body{font-family:'Segoe UI',Arial,sans-serif;background:#FAF6F0;color:#222}
.wrap{max-width:580px;margin:0 auto;padding:32px 16px}
.card{background:#fff;border-radius:20px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,.08)}
.hdr{background:linear-gradient(135deg,#A6B6A1,#7C63B8);padding:36px 40px;text-align:center}
.hdr h1{font-size:26px;font-weight:800;color:#fff;margin-bottom:8px}
.hdr p{font-size:15px;color:rgba(255,255,255,.85)}
.body{padding:32px 40px}
p{font-size:15px;color:#3E3E3E;line-height:1.7;margin-bottom:14px}
.box{background:#FAF6F0;border-radius:14px;border-left:4px solid #F3A78E;padding:18px 22px;margin:20px 0}
.box h3{font-size:11px;font-weight:800;text-transform:uppercase;letter-spacing:.8px;color:#B79D84;margin-bottom:10px}
.item{display:flex;gap:10px;margin-bottom:9px;font-size:14px;color:#3E3E3E;line-height:1.5}
.tip{background:rgba(185,166,227,.1);border:1.5px solid rgba(124,99,184,.2);border-radius:14px;padding:18px 22px;margin:20px 0}
.tip-lbl{font-size:11px;font-weight:800;text-transform:uppercase;letter-spacing:1px;color:#B79D84;margin-bottom:7px}
.tip-txt{font-size:15px;color:#222;font-weight:600;line-height:1.6}
.cta{text-align:center;margin:28px 0 20px}
.btn{display:inline-block;background:#F3A78E;color:#fff!important;text-decoration:none;font-size:15px;font-weight:800;padding:13px 34px;border-radius:50px}
.ftr{padding:20px 40px;background:#F5F0EA;border-top:1px solid #EDE8E1;text-align:center}
.ftr p{font-size:12px;color:#B79D84;line-height:1.6}
.ftr a{color:#7C63B8;text-decoration:none}
.tags{margin-top:9px;font-size:12px;color:#B9A6E3}
</style>
</head>
<body>
<div class="wrap"><div class="card">
<div class="hdr">
  <div style="font-size:40px;margin-bottom:12px">🌱</div>
  <h1>You&rsquo;re in the Loop!</h1>
  <p>Welcome to the Parent in the Loop community</p>
</div>
<div class="body">
  <p><strong>Hey there, welcome! 👋</strong></p>
  <p>You&rsquo;ve joined a growing community of parents helping their kids develop a <strong>joyful, empowered understanding of AI</strong> &mdash; through honest conversations, fun activities, and evidence-based guidance.</p>
  <p>Your first weekly AI wisdom email arrives <strong>next week</strong> &mdash; check your inbox!</p>
  <div class="box">
    <h3>What you&rsquo;ll get every week</h3>
    <div class="item"><span>📝</span><div><strong>A fresh AI literacy topic</strong> &mdash; explained simply, without the hype</div></div>
    <div class="item"><span>💬</span><div><strong>A family conversation starter</strong> &mdash; words you can use at dinner tonight</div></div>
    <div class="item"><span>🎯</span><div><strong>A hands-on activity</strong> &mdash; playful, screen-optional, under 10 minutes</div></div>
    <div class="item"><span>⏱️</span><div><strong>Under 5 minutes to read</strong> &mdash; we respect your time</div></div>
  </div>
  <div class="tip">
    <div class="tip-lbl">✨ This week&rsquo;s family tip</div>
    <div class="tip-txt">Ask your child: &ldquo;Can you name 3 things in our home that use AI?&rdquo; You might be surprised what they already know! 🏠</div>
  </div>
  <p>While you wait, explore our latest AI literacy articles for families.</p>
  <div class="cta"><a href="https://parentintheloop.com" class="btn">Browse Articles &rarr;</a></div>
  <p style="font-size:14px;color:#B79D84;text-align:center">Questions? Just reply to this email &mdash; we read every message.</p>
</div>
<div class="ftr">
  <p>You&rsquo;re receiving this because <strong>${email}</strong> subscribed at
  <a href="https://parentintheloop.com">parentintheloop.com</a>.<br/>
  <a href="https://parentintheloop.substack.com">Unsubscribe anytime</a>
  &middot; We never sell your email &middot; Privacy-first 🔒</p>
  <div class="tags">#ParentInTheLoop &nbsp;#FamilyAI &nbsp;#CuriousKids</div>
</div>
</div></div>
</body></html>`

serve(async (req) => {
  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), { status: 405 })
  }

  try {
    const body = await req.json()

    // DB webhook payload: { type: "INSERT", record: { email, ... } }
    const subscriberEmail = body?.record?.email
    if (!subscriberEmail) {
      console.error("No email in webhook payload:", JSON.stringify(body))
      return new Response(JSON.stringify({ error: "No email in record" }), { status: 400 })
    }

    // Read SMTP config from Supabase Edge Function secrets
    const smtpHost = Deno.env.get("SMTP_HOST")     // e.g. smtp.gmail.com
    const smtpPort = Deno.env.get("SMTP_PORT")     // e.g. 465
    const smtpUser = Deno.env.get("SMTP_USER")     // e.g. tanvir@supanovlabs.com
    const smtpPass = Deno.env.get("SMTP_PASS")     // App Password or email password
    const fromName = Deno.env.get("EMAIL_FROM_NAME") || "Parent in the Loop"

    if (!smtpHost || !smtpUser || !smtpPass) {
      console.error("SMTP not configured. Set SMTP_HOST, SMTP_USER, SMTP_PASS in Edge Function secrets.")
      return new Response(
        JSON.stringify({ error: "SMTP not configured", hint: "Set SMTP_HOST, SMTP_USER, SMTP_PASS in Supabase Edge Function secrets" }),
        { status: 503 }
      )
    }

    const client = new SMTPClient({
      connection: {
        hostname: smtpHost,
        port: Number(smtpPort) || 465,
        tls: true,
        auth: {
          username: smtpUser,
          password: smtpPass,
        },
      },
    })

    await client.send({
      from: `${fromName} <${smtpUser}>`,
      to: subscriberEmail,
      replyTo: smtpUser,
      subject: "You're in the Loop! Welcome to Parent in the Loop 🌱",
      html: WELCOME_HTML(subscriberEmail),
      content: `Welcome to Parent in the Loop! 🌱\n\nYou've joined a community of parents helping their kids develop a joyful understanding of AI.\n\nYour first weekly AI wisdom arrives next week.\n\nBrowse articles: https://parentintheloop.com`,
    })

    await client.close()

    console.info(`✉️ Welcome email sent to ${subscriberEmail}`)
    return new Response(JSON.stringify({ success: true, sent_to: subscriberEmail }), { status: 200 })

  } catch (err) {
    console.error("Edge function error:", err)
    return new Response(
      JSON.stringify({ error: err instanceof Error ? err.message : String(err) }),
      { status: 500 }
    )
  }
})
