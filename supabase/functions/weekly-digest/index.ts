// Supabase Edge Function: weekly-digest
// Triggered weekly via pg_cron scheduler — no external API key needed
// Fetches latest articles from DB and emails all active subscribers via Gmail SMTP
// Deploy: supabase functions deploy weekly-digest

import { serve } from "https://deno.land/std@0.177.0/http/server.ts"
import { SMTPClient } from "https://deno.land/x/denomailer@1.6.0/mod.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

// ─── HTML Email Template ──────────────────────────────────────────────────────

function weeklyDigestHtml(email: string, articles: Article[]): string {
  const articleRows = articles.map(a => `
    <div style="border:1px solid #EDE8E1;border-radius:12px;padding:18px 22px;margin-bottom:16px;">
      <div style="font-size:11px;font-weight:800;text-transform:uppercase;letter-spacing:1px;color:#B79D84;margin-bottom:6px;">
        ${a.category} &middot; ${a.read_time ?? 5} min read
      </div>
      <div style="font-size:17px;font-weight:700;color:#222;margin-bottom:8px;">${a.title}</div>
      <div style="font-size:14px;color:#555;line-height:1.6;margin-bottom:12px;">${a.excerpt}</div>
      <a href="https://parentintheloop.com/articles/${a.slug}"
         style="font-size:13px;font-weight:700;color:#7C63B8;text-decoration:none;">
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
</head>
<body style="font-family:'Segoe UI',Arial,sans-serif;background:#FAF6F0;color:#222;margin:0;padding:0;">
  <div style="max-width:580px;margin:0 auto;padding:32px 16px;">
    <div style="background:#fff;border-radius:20px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,.08);">

      <!-- Header -->
      <div style="background:linear-gradient(135deg,#A6B6A1,#7C63B8);padding:36px 40px;text-align:center;">
        <div style="font-size:40px;margin-bottom:12px;">🌱</div>
        <h1 style="font-size:22px;font-weight:800;color:#fff;margin:0 0 8px;">Your Weekly AI Wisdom</h1>
        <p style="font-size:14px;color:rgba(255,255,255,.85);margin:0;">Fresh insights for curious families</p>
      </div>

      <!-- Body -->
      <div style="padding:32px 40px;">
        <p style="font-size:15px;color:#3E3E3E;line-height:1.7;margin-bottom:24px;">
          Hi there 👋 Here are this week&rsquo;s articles to spark great AI conversations with your kids.
        </p>

        ${articleRows}

        <!-- CTA -->
        <div style="text-align:center;margin-top:28px;">
          <a href="https://parentintheloop.com"
             style="display:inline-block;background:#F3A78E;color:#fff;text-decoration:none;
                    font-size:15px;font-weight:800;padding:13px 34px;border-radius:50px;">
            Browse All Articles &rarr;
          </a>
        </div>

        <p style="font-size:13px;color:#B79D84;text-align:center;margin-top:20px;">
          Questions? Just reply &mdash; we read every message.
        </p>
      </div>

      <!-- Footer -->
      <div style="padding:20px 40px;background:#F5F0EA;border-top:1px solid #EDE8E1;text-align:center;">
        <p style="font-size:12px;color:#B79D84;line-height:1.6;">
          You&rsquo;re receiving this because <strong>${email}</strong> subscribed at
          <a href="https://parentintheloop.com" style="color:#7C63B8;">parentintheloop.com</a>.<br/>
          <a href="https://parentintheloop.substack.com" style="color:#7C63B8;">Unsubscribe anytime</a>
          &middot; We never sell your email &middot; Privacy-first 🔒
        </p>
        <div style="margin-top:8px;font-size:12px;color:#B9A6E3;">
          #ParentInTheLoop &nbsp;#FamilyAI &nbsp;#CuriousKids
        </div>
      </div>

    </div>
  </div>
</body>
</html>`
}

function weeklyDigestText(articles: Article[]): string {
  const lines = articles.map(a =>
    `📝 ${a.title}\n${a.excerpt}\nRead: https://parentintheloop.com/articles/${a.slug}`
  ).join("\n\n---\n\n")

  return `Your Weekly AI Wisdom from Parent in the Loop 🌱\n\n${lines}\n\nBrowse all articles: https://parentintheloop.com\n\nUnsubscribe: https://parentintheloop.substack.com`
}

// ─── Types ────────────────────────────────────────────────────────────────────

interface Article {
  title: string
  slug: string
  excerpt: string
  category: string
  read_time: number | null
}

interface Subscriber {
  email: string
}

// ─── Main Handler ─────────────────────────────────────────────────────────────

serve(async (req) => {
  // Only allow POST
  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), { status: 405 })
  }

  // Auth check — must be called with service role key
  const authHeader = req.headers.get("Authorization") ?? ""
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
  if (!serviceKey || authHeader !== `Bearer ${serviceKey}`) {
    console.error("[weekly-digest] Unauthorized request")
    return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 })
  }

  try {
    // ── Init Supabase client ──────────────────────────────────────────────────
    const supabaseUrl = Deno.env.get("SUPABASE_URL")
    if (!supabaseUrl) throw new Error("SUPABASE_URL not set in Edge Function secrets")

    const supabase = createClient(supabaseUrl, serviceKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    })

    // ── Fetch active subscribers ──────────────────────────────────────────────
    const { data: subscribers, error: subErr } = await supabase
      .from("subscribers")
      .select("email")
      .eq("is_active", true)

    if (subErr) throw new Error(`Subscriber fetch error: ${subErr.message}`)
    if (!subscribers || subscribers.length === 0) {
      console.info("[weekly-digest] No active subscribers found")
      return new Response(JSON.stringify({ success: true, sent: 0, message: "No active subscribers" }), { status: 200 })
    }

    console.info(`[weekly-digest] Sending to ${subscribers.length} subscribers`)

    // ── Fetch latest articles ─────────────────────────────────────────────────
    const { data: articles, error: artErr } = await supabase
      .from("articles")
      .select("title, slug, excerpt, category, read_time")
      .order("published_date", { ascending: false })
      .limit(3)

    if (artErr) throw new Error(`Articles fetch error: ${artErr.message}`)
    const articleList: Article[] = articles ?? []

    if (articleList.length === 0) {
      console.warn("[weekly-digest] No articles found in DB")
    }

    // ── Set up SMTP ───────────────────────────────────────────────────────────
    const smtpHost = Deno.env.get("SMTP_HOST")
    const smtpPort = Deno.env.get("SMTP_PORT")
    const smtpUser = Deno.env.get("SMTP_USER")
    const smtpPass = Deno.env.get("SMTP_PASS")
    const fromName = Deno.env.get("EMAIL_FROM_NAME") || "Parent in the Loop"

    if (!smtpHost || !smtpUser || !smtpPass) {
      throw new Error("SMTP not configured. Set SMTP_HOST, SMTP_USER, SMTP_PASS in Edge Function secrets.")
    }

    const client = new SMTPClient({
      connection: {
        hostname: smtpHost,
        port: Number(smtpPort) || 465,
        tls: true,
        auth: { username: smtpUser, password: smtpPass },
      },
    })

    // ── Send emails ───────────────────────────────────────────────────────────
    let sent = 0
    let failed = 0
    const errors: string[] = []

    for (const sub of subscribers as Subscriber[]) {
      try {
        await client.send({
          from: `${fromName} <${smtpUser}>`,
          to: sub.email,
          replyTo: smtpUser,
          subject: `📚 Your Weekly AI Wisdom — ${new Date().toLocaleDateString("en-US", { month: "long", day: "numeric" })}`,
          html: weeklyDigestHtml(sub.email, articleList),
          content: weeklyDigestText(articleList),
        })
        sent++
        console.info(`[weekly-digest] ✉️ Sent to ${sub.email}`)
      } catch (err) {
        failed++
        const msg = err instanceof Error ? err.message : String(err)
        errors.push(`${sub.email}: ${msg}`)
        console.error(`[weekly-digest] ❌ Failed for ${sub.email}:`, msg)
      }
    }

    await client.close()

    console.info(`[weekly-digest] Done — sent: ${sent}, failed: ${failed}`)
    return new Response(
      JSON.stringify({ success: true, sent, failed, errors: errors.length ? errors : undefined }),
      { status: 200 }
    )

  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err)
    console.error("[weekly-digest] Fatal error:", msg)
    return new Response(JSON.stringify({ error: msg }), { status: 500 })
  }
})