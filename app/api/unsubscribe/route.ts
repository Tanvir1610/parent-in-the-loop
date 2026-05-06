// app/api/unsubscribe/route.ts
// Handles unsubscribe link clicks from email footers
// TC-16: Unsubscribe link in email footer resolves correctly

import { type NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

function getSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY!
  return createClient(url, key, { auth: { autoRefreshToken: false, persistSession: false } })
}

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://parent-in-the-loop.vercel.app'

// GET /api/unsubscribe?token=xxx  — one-click unsubscribe from email link
export async function GET(req: NextRequest) {
  const token = req.nextUrl.searchParams.get('token')

  if (!token) {
    return NextResponse.redirect(`${SITE_URL}/unsubscribe?error=missing_token`)
  }

  const supabase = getSupabase()

  const { data: sub, error } = await supabase
    .from('subscribers')
    .select('id, email, is_active, unsubscribed_at')
    .eq('unsubscribe_token', token)
    .maybeSingle()

  if (error || !sub) {
    return NextResponse.redirect(`${SITE_URL}/unsubscribe?error=invalid_token`)
  }

  if (sub.unsubscribed_at) {
    // Already unsubscribed — redirect to confirmation page
    return NextResponse.redirect(`${SITE_URL}/unsubscribe?status=already`)
  }

  // Mark as unsubscribed
  await supabase
    .from('subscribers')
    .update({
      is_active:         false,
      unsubscribed_at:   new Date().toISOString(),
    })
    .eq('id', sub.id)

  return NextResponse.redirect(`${SITE_URL}/unsubscribe?status=success&email=${encodeURIComponent(sub.email)}`)
}

// POST /api/unsubscribe — from the unsubscribe page form (with reason)
export async function POST(req: NextRequest) {
  let body: { token?: string; reason?: string }
  try { body = await req.json() } catch { return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 }) }

  const { token, reason } = body

  if (!token) {
    return NextResponse.json({ error: 'Missing token' }, { status: 400 })
  }

  const supabase = getSupabase()

  const { data: sub } = await supabase
    .from('subscribers')
    .select('id, email, unsubscribed_at')
    .eq('unsubscribe_token', token)
    .maybeSingle()

  if (!sub) {
    return NextResponse.json({ error: 'Invalid token' }, { status: 404 })
  }

  if (sub.unsubscribed_at) {
    return NextResponse.json({ success: true, already: true, email: sub.email })
  }

  await supabase
    .from('subscribers')
    .update({
      is_active:            false,
      unsubscribed_at:      new Date().toISOString(),
      unsubscribe_reason:   reason ?? null,
    })
    .eq('id', sub.id)

  console.info('[unsubscribe] ✓', sub.email, reason ? `reason: ${reason}` : '')
  return NextResponse.json({ success: true, email: sub.email })
}
