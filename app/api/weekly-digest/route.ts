import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

// This route sends the weekly digest to all active verified subscribers.
// Call it from a Vercel Cron Job (see vercel.json) or manually from admin.
// Protected by CRON_SECRET env var.

function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )
}

interface Article {
  title: string
  slug: string
  excerpt: string
  category: string
  read_time: number | null
}

function buildWeeklyEmail(to: string, articles: Article[], siteUrl: string): string {
  const dateLabel = new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })

  const articleCards = articles.map(a => `
    <div style="border:1.5px solid #EDE8E1;border-radius:14px;padding:20px 24px;margin-bottom:16px;background:#fff;">
      <div style="font-size:11px;font-weight:800;text-transform:uppercase;letter-spacing:1px;color:#B79D84;margin-bottom:6px;">
        ${a.category}${a.read_time ? ` &middot; ${a.read_time} min read` : ""}
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
.card{background:#FAF6F0;border-radius:20px;overflow:hidden}
.hdr{background:linear-gradient(135deg,#7C63B8 0%,#B9A6E3 100%);padding:36px 40px;text-align:center}
.hdr h1{font-size:22px;font-weight:800;color:#fff;margin-bottom:6px}
.hdr p{font-size:14px;color:rgba(255,255,255,.82)}
.date{font-size:12px;font-weight:600;text-transform:uppercase;letter-spacing:.8px;color:rgba(255,255,255,.65);margin-bottom:10px}
.body{padding:28px 0}
.intro{background:#fff;border-radius:14px;padding:20px 24px;margin-bottom:20px;font-size:15px;color:#3E3E3E;line-height:1.7}
.section-lbl{font-size:11px;font-weight:800;text-transform:uppercase;letter-spacing:1px;color:#B79D84;margin-bottom:12px}
.cta-block{text-align:center;margin:24px 0}
.cta{display:inline-block;background:#F3A78E;color:#fff!important;text-decoration:none;font-size:15px;font-weight:800;padding:14px 36px;border-radius:50px}
.ftr{padding:24px;background:#fff;border-radius:14px;text-align:center;margin-top:20px}
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
  ${articleCards || `
    <div style="background:#fff;border-radius:14px;padding:20px 24px;text-align:center;color:#B79D84;font-size:14px;">
      New articles are being added — check the site for the latest content!
    </div>
  `}

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

export async function POST(request: NextRequest) {
  // Verify cron secret
  const cronSecret = process.env.CRON_SECRET
  const authHeader = request.headers.get("authorization")

  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const resendKey = process.env.RESEND_API_KEY
  if (!resendKey) {
    return NextResponse.json({ error: "RESEND_API_KEY not configured." }, { status: 503 })
  }

  const siteUrl   = process.env.NEXT_PUBLIC_SITE_URL || "https://parent-in-the-loop.vercel.app"
  const fromEmail = process.env.EMAIL_FROM || "noreply@parentintheloop.com"

  try {
    const supabase = getSupabase()

    // Fetch all active + verified subscribers
    const { data: subscribers, error: subErr } = await supabase
      .from("subscribers")
      .select("email")
      .eq("is_active", true)
      .eq("is_verified", true)

    if (subErr) throw new Error(`Subscriber fetch: ${subErr.message}`)
    if (!subscribers || subscribers.length === 0) {
      return NextResponse.json({ success: true, sent: 0, message: "No active subscribers." })
    }

    // Fetch latest 3 articles
    const { data: articles } = await supabase
      .from("articles")
      .select("title, slug, excerpt, category, read_time")
      .order("published_date", { ascending: false })
      .limit(3)

    const articleList: Article[] = articles ?? []
    const dateStr = new Date().toLocaleDateString("en-US", { month: "long", day: "numeric" })

    let sent = 0
    let failed = 0
    const errors: string[] = []

    // Send in batches of 10 to avoid rate limits
    const BATCH_SIZE = 10
    for (let i = 0; i < subscribers.length; i += BATCH_SIZE) {
      const batch = subscribers.slice(i, i + BATCH_SIZE)

      await Promise.allSettled(
        batch.map(async (sub) => {
          try {
            const res = await fetch("https://api.resend.com/emails", {
              method: "POST",
              headers: {
                "Authorization": `Bearer ${resendKey}`,
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                from:     `Parent in the Loop <${fromEmail}>`,
                to:       [sub.email],
                subject:  `📚 Your Weekly AI Wisdom — ${dateStr}`,
                html:     buildWeeklyEmail(sub.email, articleList, siteUrl),
                reply_to: process.env.EMAIL_REPLY_TO || fromEmail,
              }),
            })

            if (res.ok) {
              sent++
              // Update last_email_sent_at
              await supabase
                .from("subscribers")
                .update({ last_email_sent_at: new Date().toISOString(), email_count: supabase.rpc("increment", { x: 1 }) as unknown as number })
                .eq("email", sub.email)
                .catch(() => {}) // non-critical
            } else {
              const err = await res.json().catch(() => ({}))
              failed++
              errors.push(`${sub.email}: ${JSON.stringify(err)}`)
            }
          } catch (err) {
            failed++
            errors.push(`${sub.email}: ${err}`)
          }
        })
      )

      // Small delay between batches
      if (i + BATCH_SIZE < subscribers.length) {
        await new Promise(r => setTimeout(r, 500))
      }
    }

    console.info(`[weekly-digest] Done — sent: ${sent}, failed: ${failed}`)
    return NextResponse.json({
      success: true,
      sent,
      failed,
      total: subscribers.length,
      errors: errors.length > 0 ? errors : undefined,
    })

  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err)
    console.error("[weekly-digest] Fatal:", msg)
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}

// Allow GET for manual trigger from admin panel
export async function GET(request: NextRequest) {
  return POST(request)
}
