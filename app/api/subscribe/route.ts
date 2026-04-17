import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

const EMAIL_RE = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*\.[a-zA-Z]{2,}$/

function getSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) throw new Error("Missing Supabase env vars.")
  return createClient(url, key, { auth: { autoRefreshToken: false, persistSession: false } })
}

// ─── Send via Supabase Edge Function (zero external API keys) ───────────────
async function sendViaEdgeFunction(
  type: "verification" | "welcome" | "weekly",
  payload: Record<string, unknown>
): Promise<void> {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceKey  = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !serviceKey) {
    console.warn("[email] Missing Supabase env — skipping email")
    return
  }

  const edgeUrl = `${supabaseUrl}/functions/v1/send-email`

  try {
    const res = await fetch(edgeUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${serviceKey}`,
      },
      body: JSON.stringify({ type, ...payload }),
    })

    if (res.ok) {
      console.info(`[email] ✉️  ${type} email sent →`, payload.to)
    } else {
      const err = await res.text()
      console.error(`[email] Edge function error (${res.status}):`, err)
    }
  } catch (err) {
    console.error("[email] Edge function unreachable:", err)
  }
}

// ─── POST /api/subscribe ─────────────────────────────────────────────────────
export async function POST(request: NextRequest) {
  let body: Record<string, unknown>
  try { body = await request.json() }
  catch { return NextResponse.json({ error: "Invalid request body." }, { status: 400 }) }

  const raw   = typeof body?.email === "string" ? body.email : ""
  const email = raw.trim().toLowerCase()

  if (!email)                return NextResponse.json({ error: "Email address is required." }, { status: 400 })
  if (!EMAIL_RE.test(email)) return NextResponse.json({ error: "That email address is not valid." }, { status: 422 })

  let supabase
  try { supabase = getSupabase() }
  catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : "Configuration error." }, { status: 503 })
  }

  try {
    // Check if already exists
    const { data: existing } = await supabase
      .from("subscribers")
      .select("id, is_verified, is_active, verification_token")
      .eq("email", email)
      .maybeSingle()

    if (existing) {
      if (existing.is_verified && existing.is_active) {
        return NextResponse.json({
          error: "This email is already subscribed! ✅",
          already_subscribed: true,
        }, { status: 409 })
      }

      // Not yet verified — resend verification email
      if (existing.verification_token) {
        const siteUrl    = process.env.NEXT_PUBLIC_SITE_URL || "https://parent-in-the-loop.vercel.app"
        const verifyUrl  = `${siteUrl}/api/verify-email?token=${existing.verification_token}`
        await sendViaEdgeFunction("verification", { to: email, verifyUrl })
      }

      return NextResponse.json({
        success: true,
        pending_verification: true,
        resent: true,
        email,
        message: "Verification email resent! Check your inbox (and spam folder).",
      })
    }

    // Insert new subscriber (unverified — is_active stays false until verified)
    const { data: inserted, error: insertErr } = await supabase
      .from("subscribers")
      .insert({
        email,
        source:        "website",
        subscribed_at: new Date().toISOString(),
        is_verified:   false,
        is_active:     false,
      })
      .select("id, verification_token")
      .single()

    if (insertErr) {
      if (insertErr.code === "23505") {
        return NextResponse.json({ error: "This email is already subscribed! ✅", already_subscribed: true }, { status: 409 })
      }
      if (insertErr.code === "42703") {
        return NextResponse.json({
          error: "Database needs updating. Please run setup-subscribers-with-verification.sql in Supabase.",
        }, { status: 503 })
      }
      console.error("[subscribe] Insert error:", insertErr)
      return NextResponse.json({ error: `Database error: ${insertErr.message}` }, { status: 500 })
    }

    // Fire verification email via Edge Function (no external API key)
    if (inserted?.verification_token) {
      const siteUrl   = process.env.NEXT_PUBLIC_SITE_URL || "https://parent-in-the-loop.vercel.app"
      const verifyUrl = `${siteUrl}/api/verify-email?token=${inserted.verification_token}`
      await sendViaEdgeFunction("verification", { to: email, verifyUrl })
    }

    console.info("[subscribe] ✓ New subscriber (pending verification):", email)
    return NextResponse.json({
      success: true,
      pending_verification: true,
      email,
      message: "Check your inbox for a verification email!",
    })

  } catch (err) {
    console.error("[subscribe] Unexpected error:", err)
    return NextResponse.json({
      error: `Server error: ${err instanceof Error ? err.message : String(err)}`,
    }, { status: 500 })
  }
}

export async function GET() {
  return NextResponse.json({ error: "Method not allowed. Use POST." }, { status: 405 })
}
