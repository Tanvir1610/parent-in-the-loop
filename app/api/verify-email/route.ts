import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

function getSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) throw new Error("Missing Supabase env vars.")
  return createClient(url, key, { auth: { autoRefreshToken: false, persistSession: false } })
}

// ─── Send via Supabase Edge Function ─────────────────────────────────────────
async function sendViaEdgeFunction(
  type: "verification" | "welcome" | "weekly",
  payload: Record<string, unknown>
): Promise<void> {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceKey  = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!supabaseUrl || !serviceKey) return

  try {
    const res = await fetch(`${supabaseUrl}/functions/v1/send-email`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${serviceKey}`,
      },
      body: JSON.stringify({ type, ...payload }),
    })
    if (res.ok) {
      console.info(`[email] ✉️  ${type} sent →`, payload.to)
    } else {
      console.error(`[email] Edge error ${res.status}:`, await res.text())
    }
  } catch (err) {
    console.error("[email] Edge unreachable:", err)
  }
}

// ─── GET /api/verify-email?token=xxx ─────────────────────────────────────────
export async function GET(request: NextRequest) {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://parent-in-the-loop.vercel.app"
  const token   = request.nextUrl.searchParams.get("token")

  if (!token) {
    return NextResponse.redirect(`${siteUrl}/?verified=invalid`)
  }

  let supabase
  try { supabase = getSupabase() }
  catch { return NextResponse.redirect(`${siteUrl}/?verified=error`) }

  try {
    const { data: sub, error } = await supabase
      .from("subscribers")
      .select("id, email, is_verified, is_active")
      .eq("verification_token", token)
      .maybeSingle()

    if (error || !sub) {
      console.warn("[verify] Token not found:", token?.slice(0, 8))
      return NextResponse.redirect(`${siteUrl}/?verified=invalid`)
    }

    if (sub.is_verified && sub.is_active) {
      // Already verified — still redirect to success (clicked twice)
      return NextResponse.redirect(`${siteUrl}/?verified=already`)
    }

    // Mark verified + active, rotate token so link can't be reused
    const { error: updateErr } = await supabase
      .from("subscribers")
      .update({
        is_verified:        true,
        is_active:          true,
        verified_at:        new Date().toISOString(),
        verification_token: crypto.randomUUID(),
      })
      .eq("id", sub.id)

    if (updateErr) {
      console.error("[verify] Update failed:", updateErr.message)
      return NextResponse.redirect(`${siteUrl}/?verified=error`)
    }

    // Send welcome email via Edge Function (non-blocking)
    sendViaEdgeFunction("welcome", {
      to:      sub.email,
      siteUrl,
    }).catch(console.error)

    console.info("[verify] ✓ Email verified:", sub.email)
    return NextResponse.redirect(`${siteUrl}/?verified=success`)

  } catch (err) {
    console.error("[verify] Unexpected error:", err)
    return NextResponse.redirect(`${siteUrl}/?verified=error`)
  }
}
