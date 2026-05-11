// app/api/health/route.ts — system health + public stats for stats-bar

import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function GET() {
  const url  = process.env.NEXT_PUBLIC_SUPABASE_URL
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  const svcKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!url || !anon) {
    return NextResponse.json({ status: 'error', message: 'Missing Supabase env vars' }, { status: 503 })
  }

  let stats = null
  try {
    const supabase = createClient(url, svcKey ?? anon, { auth: { autoRefreshToken: false, persistSession: false } })
    const { data } = await supabase.from('platform_analytics').select('*').single()
    if (data) {
      stats = {
        verified_subscribers: Number(data.verified_subscribers) ?? 0,
        published_articles:   Number(data.published_articles)   ?? 0,
        emails_sent:          Number(data.emails_sent)          ?? 0,
        total_quiz_attempts:  Number(data.total_quiz_attempts)  ?? 0,
      }
    }
  } catch { /* non-critical */ }

  return NextResponse.json({
    status:      'ok',
    timestamp:   new Date().toISOString(),
    environment: process.env.NODE_ENV,
    supabase:    !!url,
    stats,
  })
}
