// supabase/functions/send-email/index.ts
// ─────────────────────────────────────────────────────────────────────────────
// Unified email sender — handles verification, welcome, and weekly digest.
// Uses Supabase's built-in SMTP (no external API key required).
// Deploy: supabase functions deploy send-email
// ─────────────────────────────────────────────────────────────────────────────

import { serve } from "https://deno.land/std@0.177.0/http/server.ts"
import { SmtpClient } from "https://deno.land/x/smtp@v0.7.0/mod.ts"

const CORS = {
  "Access-Control-Allow-Origin":  "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
}

// ─── Email templates ──────────────────────────────────────────────────────────

function verificationHtml(verifyUrl: string, to: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1"/>
<title>Confirm your subscription</title>
<style>
*{box-sizing:border-box;margin:0;padding:0}
body{font-family:'Segoe UI',Arial,sans-serif;background:#FAF6F0}
.wrap{max-width:560px;margin:0 auto;padding:32px 16px}
.card{background:#fff;border-radius:20px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,.08)}
.hdr{background:linear-gradient(135deg,#7C63B8,#B9A6E3);padding:36px 40px;text-align:center}
.hdr h1{font-size:24px;font-weight:800;color:#fff;margin-bottom:6px}
.hdr p{font-size:14px;color:rgba(255,255,255,.85)}
.body{padding:32px 40px}
p{font-size:15px;color:#3E3E3E;line-height:1.7;margin-bottom:14px}
.btn-wrap{text-align:center;margin:28px 0}
.btn{display:inline-block;background:#F3A78E;color:#fff!important;text-decoration:none;
     font-size:16px;font-weight:800;padding:15px 42px;border-radius:50px}
.url-box{background:#FAF6F0;border-radius:10px;padding:14px 18px;margin:20px 0;
         font-size:12px;color:#999;word-break:break-all;border:1px solid #EDE8E1;line-height:1.7}
.url-box a{color:#7C63B8}
.ftr{padding:20px 40px;background:#F5F0EA;border-top:1px solid #EDE8E1;text-align:center}
.ftr p{font-size:12px;color:#B79D84;line-height:1.6}
.ftr a{color:#7C63B8;text-decoration:none}
</style>
</head>
<body>
<div class="wrap"><div class="card">
<div class="hdr">
  <div style="font-size:40px;margin-bottom:12px">📬</div>
  <h1>One click to confirm!</h1>
  <p>Verify your email to join Parent in the Loop</p>
</div>
<div class="body">
  <p><strong>Hey there! 👋</strong></p>
  <p>Thanks for signing up for <strong>Parent in the Loop</strong> — your weekly guide to raising AI-literate kids.</p>
  <p>Click the button below to confirm your email and activate your subscription:</p>
  <div class="btn-wrap">
    <a href="${verifyUrl}" class="btn">✅ Confirm My Subscription</a>
  </div>
  <p style="font-size:13px;color:#B79D84;text-align:center">This link expires in <strong>48 hours</strong>.</p>
  <div class="url-box">
    Button not working? Copy and paste this into your browser:<br/>
    <a href="${verifyUrl}">${verifyUrl}</a>
  </div>
  <p style="font-size:13px;color:#B79D84;text-align:center">Didn't sign up? You can safely ignore this email.</p>
</div>
<div class="ftr">
  <p>
    Sent because <strong>${to}</strong> subscribed at parentintheloop.com<br/>
    We never sell or share your email. Privacy-first 🔒
  </p>
</div>
</div></div>
</body>
</html>`
}

function welcomeHtml(to: string, siteUrl: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1"/>
<title>Welcome to Parent in the Loop 🌱</title>
<style>
*{box-sizing:border-box;margin:0;padding:0}
body{font-family:'Segoe UI',Arial,sans-serif;background:#FAF6F0}
.wrap{max-width:580px;margin:0 auto;padding:32px 16px}
.card{background:#fff;border-radius:20px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,.08)}
.hdr{background:linear-gradient(135deg,#A6B6A1 0%,#7C63B8 100%);padding:40px;text-align:center}
.hdr h1{font-size:26px;font-weight:800;color:#fff;margin-bottom:8px}
.hdr p{font-size:15px;color:rgba(255,255,255,.85)}
.body{padding:36px 40px}
p{font-size:15px;color:#3E3E3E;line-height:1.7;margin-bottom:14px}
.box{background:#FAF6F0;border-radius:14px;border-left:4px solid #F3A78E;padding:20px 24px;margin:24px 0}
.box h3{font-size:11px;font-weight:800;text-transform:uppercase;letter-spacing:.8px;color:#B79D84;margin-bottom:12px}
.item{display:flex;gap:10px;margin-bottom:10px;font-size:14px;color:#3E3E3E;line-height:1.5}
.item:last-child{margin-bottom:0}
.tip{background:rgba(185,166,227,.1);border:1.5px solid rgba(124,99,184,.2);border-radius:14px;padding:20px 24px;margin:24px 0}
.tip-lbl{font-size:11px;font-weight:800;text-transform:uppercase;letter-spacing:1px;color:#B79D84;margin-bottom:8px}
.tip-txt{font-size:15px;color:#222;font-weight:600;line-height:1.6}
.cta{text-align:center;margin:32px 0 24px}
.btn{display:inline-block;background:#F3A78E;color:#fff!important;text-decoration:none;
     font-size:15px;font-weight:800;padding:14px 36px;border-radius:50px}
.ftr{padding:24px 40px;background:#F5F0EA;border-top:1px solid #EDE8E1;text-align:center}
.ftr p{font-size:12px;color:#B79D84;line-height:1.6}
.ftr a{color:#7C63B8;text-decoration:none}
</style>
</head>
<body>
<div class="wrap"><div class="card">
<div class="hdr">
  <div style="font-size:40px;margin-bottom:14px">🌱</div>
  <h1>You&rsquo;re in the Loop!</h1>
  <p>Welcome to the Parent in the Loop community</p>
</div>
<div class="body">
  <p><strong>Hey there, welcome! 👋</strong></p>
  <p>
    You&rsquo;ve joined a growing community of parents helping their kids develop a
    <strong>joyful, empowered understanding of AI</strong> &mdash; through honest conversations,
    fun activities, and evidence-based guidance.
  </p>
  <p>Your first weekly AI wisdom email arrives <strong>next Sunday</strong>. Watch your inbox!</p>
  <div class="box">
    <h3>What you&rsquo;ll get every week</h3>
    <div class="item"><span>📝</span><div><strong>A fresh AI literacy topic</strong> &mdash; explained simply, without the hype</div></div>
    <div class="item"><span>💬</span><div><strong>A family conversation starter</strong> &mdash; words you can use at dinner tonight</div></div>
    <div class="item"><span>🎯</span><div><strong>A hands-on activity</strong> &mdash; playful, screen-optional, under 10 minutes</div></div>
    <div class="item"><span>⏱️</span><div><strong>Under 5 minutes to read</strong> &mdash; we respect your time</div></div>
  </div>
  <div class="tip">
    <div class="tip-lbl">✨ Your first family tip</div>
    <div class="tip-txt">
      Ask your child: &ldquo;Can you name 3 things in our home that use AI?&rdquo;
      You might be surprised what they already know! 🏠
    </div>
  </div>
  <p>While you wait for Sunday, explore our AI literacy articles for families:</p>
  <div class="cta">
    <a href="${siteUrl}" class="btn">Browse Articles &rarr;</a>
  </div>
  <p style="font-size:14px;color:#B79D84;text-align:center">
    Questions? Just reply to this email &mdash; we read every message.
  </p>
</div>
<div class="ftr">
  <p>
    You&rsquo;re receiving this because <strong>${to}</strong> subscribed at
    <a href="${siteUrl}">parentintheloop.com</a>.<br/>
    <a href="${siteUrl}">Unsubscribe anytime</a>
    &middot; We never sell your email &middot; Privacy-first 🔒
  </p>
  <div style="margin-top:8px;font-size:12px;color:#B9A6E3">
    #ParentInTheLoop &nbsp;#FamilyAI &nbsp;#CuriousKids
  </div>
</div>
</div></div>
</body>
</html>`
}

interface WeeklyArticle {
  title:     string
  slug:      string
  excerpt:   string
  category:  string
  read_time: number | null
}

function weeklyHtml(to: string, articles: WeeklyArticle[], siteUrl: string): string {
  const dateLabel = new Date().toLocaleDateString("en-US", {
    weekday: "long", month: "long", day: "numeric",
  })

  const cards = articles.map(a => `
    <div style="border:1.5px solid #EDE8E1;border-radius:14px;padding:20px 24px;margin-bottom:16px;background:#fff;">
      <div style="font-size:11px;font-weight:800;text-transform:uppercase;letter-spacing:1px;color:#B79D84;margin-bottom:6px;">
        ${a.category}${a.read_time ? ` · ${a.read_time} min read` : ""}
      </div>
      <div style="font-size:18px;font-weight:700;color:#222;margin-bottom:8px;line-height:1.4;">${a.title}</div>
      <div style="font-size:14px;color:#555;line-height:1.65;margin-bottom:14px;">${a.excerpt}</div>
      <a href="${siteUrl}/articles/${a.slug}"
         style="display:inline-block;font-size:13px;font-weight:700;color:#7C63B8;text-decoration:none;
                border:1.5px solid rgba(124,99,184,0.3);border-radius:20px;padding:6px 16px;">
        Read article &rarr;
      </a>
    </div>
  `).join("")

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1"/>
<title>Your Weekly AI Wisdom 🌱</title>
<style>
*{box-sizing:border-box;margin:0;padding:0}
body{font-family:'Segoe UI',Arial,sans-serif;background:#FAF6F0}
.wrap{max-width:580px;margin:0 auto;padding:32px 16px}
.hdr{background:linear-gradient(135deg,#7C63B8 0%,#B9A6E3 100%);padding:36px 40px;text-align:center;border-radius:16px 16px 0 0}
.hdr h1{font-size:22px;font-weight:800;color:#fff;margin-bottom:6px}
.hdr p{font-size:14px;color:rgba(255,255,255,.82)}
.date{font-size:12px;font-weight:600;text-transform:uppercase;letter-spacing:.8px;color:rgba(255,255,255,.65);margin-bottom:10px}
.body{background:#FAF6F0;padding:28px 24px}
.intro{background:#fff;border-radius:14px;padding:20px 24px;margin-bottom:20px;font-size:15px;color:#3E3E3E;line-height:1.7}
.section-lbl{font-size:11px;font-weight:800;text-transform:uppercase;letter-spacing:1px;color:#B79D84;margin-bottom:12px}
.cta-block{text-align:center;margin:24px 0}
.cta{display:inline-block;background:#F3A78E;color:#fff!important;text-decoration:none;
     font-size:15px;font-weight:800;padding:14px 36px;border-radius:50px}
.ftr{padding:24px;background:#fff;border-radius:0 0 16px 16px;border-top:1px solid #EDE8E1;text-align:center}
.ftr p{font-size:12px;color:#B79D84;line-height:1.6}
.ftr a{color:#7C63B8;text-decoration:none}
</style>
</head>
<body>
<div class="wrap">
<div class="hdr">
  <div class="date">${dateLabel}</div>
  <div style="font-size:36px;margin-bottom:10px">🌱</div>
  <h1>Your Weekly AI Wisdom</h1>
  <p>Fresh insights for curious families &mdash; under 5 minutes to read</p>
</div>
<div class="body">
  <div class="intro">
    Hi there! 👋 Here are this week&rsquo;s articles to spark great AI conversations with your kids.
    Each one comes with a family activity you can try tonight.
  </div>
  <div class="section-lbl">📚 This week&rsquo;s articles</div>
  ${cards || `<div style="background:#fff;border-radius:14px;padding:20px 24px;text-align:center;color:#B79D84;font-size:14px;">New articles are being added — check the site!</div>`}
  <div class="cta-block">
    <a href="${siteUrl}" class="cta">Browse All Articles &rarr;</a>
  </div>
  <div style="background:rgba(185,166,227,.12);border:1.5px solid rgba(124,99,184,.2);border-radius:14px;padding:20px 24px;margin-top:8px;">
    <div style="font-size:11px;font-weight:800;text-transform:uppercase;letter-spacing:1px;color:#B79D84;margin-bottom:8px;">💬 This week&rsquo;s conversation starter</div>
    <div style="font-size:15px;color:#222;font-weight:600;line-height:1.6;">
      Ask your child: &ldquo;If you were designing an AI assistant for kids your age, what rules would you give it?&rdquo;
    </div>
  </div>
</div>
<div class="ftr">
  <p>
    You&rsquo;re receiving this because <strong>${to}</strong> subscribed at
    <a href="${siteUrl}">parentintheloop.com</a>.<br/>
    <a href="${siteUrl}/unsubscribe?email=${encodeURIComponent(to)}">Unsubscribe</a>
    &middot; We never sell your email &middot; Privacy-first 🔒
  </p>
  <div style="margin-top:8px;font-size:12px;color:#B9A6E3">
    #ParentInTheLoop &nbsp;#FamilyAI &nbsp;#CuriousKids
  </div>
</div>
</div>
</body>
</html>`
}

// ─── SMTP helpers — reads secrets from Supabase project secrets ───────────────
async function getSMTPConfig() {
  return {
    host:     Deno.env.get("SMTP_HOST")     ?? "smtp.gmail.com",
    port:     Number(Deno.env.get("SMTP_PORT") ?? "465"),
    tls:      (Deno.env.get("SMTP_TLS")     ?? "true") === "true",
    username: Deno.env.get("SMTP_USER")     ?? "",
    password: Deno.env.get("SMTP_PASS")     ?? "",
    fromEmail: Deno.env.get("EMAIL_FROM")   ?? "noreply@parentintheloop.com",
    fromName:  Deno.env.get("EMAIL_FROM_NAME") ?? "Parent in the Loop",
    replyTo:   Deno.env.get("EMAIL_REPLY_TO")  ?? "",
  }
}

async function sendEmail(to: string, subject: string, html: string): Promise<void> {
  const cfg = await getSMTPConfig()

  if (!cfg.username || !cfg.password) {
    throw new Error("SMTP_USER and SMTP_PASS must be set in Supabase project secrets.")
  }

  const client = new SmtpClient()

  await client.connectTLS({
    hostname: cfg.host,
    port:     cfg.port,
    username: cfg.username,
    password: cfg.password,
  })

  await client.send({
    from:    `${cfg.fromName} <${cfg.fromEmail}>`,
    to,
    subject,
    content: "Please use an HTML-capable email client.",
    html,
    ...(cfg.replyTo ? { replyTo: cfg.replyTo } : {}),
  })

  await client.close()
}

// ─── Main handler ─────────────────────────────────────────────────────────────
serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: CORS })
  }

  try {
    const body = await req.json()
    const { type, to } = body as { type: string; to: string }

    if (!type || !to) {
      return new Response(
        JSON.stringify({ error: "Missing required fields: type, to" }),
        { status: 400, headers: { ...CORS, "Content-Type": "application/json" } }
      )
    }

    if (type === "verification") {
      const { verifyUrl } = body as { verifyUrl: string }
      if (!verifyUrl) throw new Error("Missing verifyUrl for verification email")
      await sendEmail(
        to,
        "Confirm your subscription — Parent in the Loop 📬",
        verificationHtml(verifyUrl, to)
      )

    } else if (type === "welcome") {
      const siteUrl = (body as { siteUrl?: string }).siteUrl ?? "https://parent-in-the-loop.vercel.app"
      await sendEmail(
        to,
        "You're in the Loop! Welcome to Parent in the Loop 🌱",
        welcomeHtml(to, siteUrl)
      )

    } else if (type === "weekly") {
      const { articles, siteUrl } = body as {
        articles: WeeklyArticle[]
        siteUrl:  string
      }
      const dateStr = new Date().toLocaleDateString("en-US", { month: "long", day: "numeric" })
      await sendEmail(
        to,
        `📚 Your Weekly AI Wisdom — ${dateStr}`,
        weeklyHtml(to, articles ?? [], siteUrl ?? "https://parent-in-the-loop.vercel.app")
      )

    } else {
      throw new Error(`Unknown email type: ${type}`)
    }

    return new Response(
      JSON.stringify({ success: true, type, to }),
      { status: 200, headers: { ...CORS, "Content-Type": "application/json" } }
    )

  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err)
    console.error("[send-email]", msg)
    return new Response(
      JSON.stringify({ error: msg }),
      { status: 500, headers: { ...CORS, "Content-Type": "application/json" } }
    )
  }
})
