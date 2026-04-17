import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

// Weekly digest — triggered by Vercel Cron (every Sunday 9 AM UTC, see vercel.json)
// Protected by CRON_SECRET env var.
// Zero external email API keys — all email goes through Supabase Edge Function.

function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )
}

interface Article {
  title:     string
  slug:      string
  excerpt:   string
  category:  string
  read_time: number | null
}

async function sendWeeklyEmail(
  to: string,
  articles: Article[],
  siteUrl: string
): Promise<void> {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceKey  = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!supabaseUrl || !serviceKey) return

  const res = await fetch(`${supabaseUrl}/functions/v1/send-email`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${serviceKey}`,
    },
    body: JSON.stringify({ type: "weekly", to, articles, siteUrl }),
  })

  if (!res.ok) {
    const err = await res.text()
    throw new Error(`Edge error ${res.status}: ${err}`)
  }
}

export async function POST(request: NextRequest) {
  // Verify cron secret
  const cronSecret = process.env.CRON_SECRET
  const authHeader = request.headers.get("authorization")

  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://parent-in-the-loop.vercel.app"

  try {
    const supabase = getSupabase()

    // Fetch all verified + active subscribers
    const { data: subscribers, error: subErr } = await supabase
      .from("subscribers")
      .select("email")
      .eq("is_active",   true)
      .eq("is_verified", true)

    if (subErr) throw new Error(`Subscriber fetch: ${subErr.message}`)
    if (!subscribers || subscribers.length === 0) {
      return NextResponse.json({ success: true, sent: 0, message: "No active verified subscribers." })
    }

    // Fetch latest 3 articles
    const { data: articles } = await supabase
      .from("articles")
      .select("title, slug, excerpt, category, read_time")
      .order("published_date", { ascending: false })
      .limit(3)

    const articleList: Article[] = articles ?? []

    let sent    = 0
    let failed  = 0
    const errors: string[] = []

    // Batch in groups of 10 to respect Edge Function concurrency
    const BATCH = 10
    for (let i = 0; i < subscribers.length; i += BATCH) {
      const batch = subscribers.slice(i, i + BATCH)

      await Promise.allSettled(
        batch.map(async (sub) => {
          try {
            await sendWeeklyEmail(sub.email, articleList, siteUrl)
            sent++
            // Track email count (best-effort)
            await supabase
              .from("subscribers")
              .update({ last_email_sent_at: new Date().toISOString() })
              .eq("email", sub.email)
              .catch(() => {})
          } catch (err) {
            failed++
            errors.push(`${sub.email}: ${err}`)
          }
        })
      )

      if (i + BATCH < subscribers.length) {
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
