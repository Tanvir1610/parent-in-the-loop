// app/api/subscribe/route.ts
// TC-01: Valid email → subscription created
// TC-02: Duplicate email → 409
// TC-03: Invalid format → 422
// TC-15: Rate limiting — max 3 attempts per IP per hour

import { type NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const EMAIL_RE = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*\.[a-zA-Z]{2,}$/
const RATE_LIMIT_MAX  = 3
const RATE_LIMIT_WINDOW_MS = 60 * 60 * 1000 // 1 hour

function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )
}

function getClientIP(req: NextRequest): string {
  return (
    req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ??
    req.headers.get('x-real-ip') ??
    '0.0.0.0'
  )
}

async function checkRateLimit(supabase: ReturnType<typeof getSupabase>, ip: string): Promise<boolean> {
  try {
    const { data } = await supabase
      .from('subscription_rate_limits')
      .select('attempt_count, first_attempt')
      .eq('ip_address', ip)
      .maybeSingle()

    if (!data) {
      // First attempt from this IP
      await supabase.from('subscription_rate_limits').insert({
        ip_address:     ip,
        attempt_count:  1,
        first_attempt:  new Date().toISOString(),
        last_attempt:   new Date().toISOString(),
      })
      return true // allowed
    }

    const windowStart  = new Date(data.first_attempt).getTime()
    const now          = Date.now()
    const withinWindow = (now - windowStart) < RATE_LIMIT_WINDOW_MS

    if (!withinWindow) {
      // Window expired — reset
      await supabase
        .from('subscription_rate_limits')
        .update({ attempt_count: 1, first_attempt: new Date().toISOString(), last_attempt: new Date().toISOString() })
        .eq('ip_address', ip)
      return true
    }

    if (data.attempt_count >= RATE_LIMIT_MAX) {
      return false // blocked
    }

    // Increment
    await supabase
      .from('subscription_rate_limits')
      .update({ attempt_count: data.attempt_count + 1, last_attempt: new Date().toISOString() })
      .eq('ip_address', ip)

    return true
  } catch {
    // If rate limit table fails, allow the request (fail open)
    return true
  }
}

export async function POST(req: NextRequest) {
  let body: Record<string, unknown>
  try { body = await req.json() }
  catch { return NextResponse.json({ error: 'Invalid request body.' }, { status: 400 }) }

  const raw   = typeof body?.email === 'string' ? body.email : ''
  const email = raw.trim().toLowerCase()

  if (!email)
    return NextResponse.json({ error: 'Email address is required.' }, { status: 400 })
  if (!EMAIL_RE.test(email))
    return NextResponse.json({ error: 'That email address is not valid.' }, { status: 422 })

  const supabase = getSupabase()
  const ip       = getClientIP(req)

  // ── Rate limit check ─────────────────────────────────────────────
  const allowed = await checkRateLimit(supabase, ip)
  if (!allowed) {
    return NextResponse.json(
      { error: 'Too many subscription attempts. Please try again in an hour.' },
      { status: 429 }
    )
  }

  try {
    // ── Check existing subscriber ────────────────────────────────
    const { data: existing } = await supabase
      .from('subscribers')
      .select('id, is_verified, is_active, verification_token')
      .eq('email', email)
      .maybeSingle()

    if (existing) {
      if (existing.is_verified && existing.is_active) {
        return NextResponse.json(
          { error: 'This email is already subscribed! ✅', already_subscribed: true },
          { status: 409 }
        )
      }

      // Unverified — resend via DB function
      const { data: resendResult } = await supabase
        .rpc('resend_verification', { p_email: email })

      return NextResponse.json({
        success:              true,
        pending_verification: true,
        resent:               true,
        email,
        message:              'Verification email resent! Check your inbox (and spam folder).',
      })
    }

    // ── Insert new subscriber ────────────────────────────────────
    const { data: inserted, error: insertErr } = await supabase
      .from('subscribers')
      .insert({
        email,
        source:        'website',
        subscribed_at: new Date().toISOString(),
        is_verified:   false,
        is_active:     false,
        subscribe_ip:  ip,
      })
      .select('id, verification_token')
      .single()

    if (insertErr) {
      if (insertErr.code === '23505') {
        return NextResponse.json(
          { error: 'This email is already subscribed! ✅', already_subscribed: true },
          { status: 409 }
        )
      }
      console.error('[subscribe] Insert error:', insertErr)
      return NextResponse.json({ error: `Database error: ${insertErr.message}` }, { status: 500 })
    }

    // Trigger fires automatically (on_subscriber_insert) → verification email via pg_net
    console.info('[subscribe] ✓ New subscriber (pending verification):', email)
    return NextResponse.json({
      success:              true,
      pending_verification: true,
      email,
      message:              'Check your inbox for a verification email!',
    })

  } catch (err) {
    console.error('[subscribe] Unexpected error:', err)
    return NextResponse.json(
      { error: `Server error: ${err instanceof Error ? err.message : String(err)}` },
      { status: 500 }
    )
  }
}

export async function GET() {
  return NextResponse.json({ error: 'Method not allowed. Use POST.' }, { status: 405 })
}
