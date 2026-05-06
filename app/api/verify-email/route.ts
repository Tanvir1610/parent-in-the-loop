// app/api/verify-email/route.ts
// TC-05: Click verify link → is_verified=true, is_active=true, redirect success
// TC-06: Expired / reused token → redirect invalid

import { type NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://parent-in-the-loop.vercel.app'

function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )
}

export async function GET(request: NextRequest) {
  const token = request.nextUrl.searchParams.get('token')

  if (!token) {
    return NextResponse.redirect(`${SITE_URL}/?verified=invalid`)
  }

  let supabase
  try { supabase = getSupabase() }
  catch { return NextResponse.redirect(`${SITE_URL}/?verified=error`) }

  try {
    // Use the atomic DB function — verifies + rotates token in one transaction
    // This prevents double-verification and replay attacks (TC-06)
    const { data: result, error } = await supabase
      .rpc('verify_subscriber_token', { p_token: token })

    if (error || !result) {
      console.warn('[verify] RPC error:', error?.message)
      return NextResponse.redirect(`${SITE_URL}/?verified=error`)
    }

    if (!result.success) {
      // invalid_token = token not found or already rotated
      return NextResponse.redirect(`${SITE_URL}/?verified=invalid`)
    }

    if (result.reason === 'already_verified') {
      return NextResponse.redirect(`${SITE_URL}/?verified=already`)
    }

    // ✅ Successfully verified — on_subscriber_verified trigger fires welcome email
    console.info('[verify] ✓ Email verified:', result.email)
    return NextResponse.redirect(`${SITE_URL}/?verified=success&email=${encodeURIComponent(result.email)}`)

  } catch (err) {
    console.error('[verify] Unexpected error:', err)
    return NextResponse.redirect(`${SITE_URL}/?verified=error`)
  }
}
