// app/api/admin/stats/route.ts
// Returns platform analytics for admin dashboard
// Protected: only service_role or authenticated admin users

import { type NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )
}

export async function GET(req: NextRequest) {
  // Simple token guard — add proper auth middleware in production
  const auth = req.headers.get('authorization')
  if (process.env.ADMIN_SECRET && auth !== `Bearer ${process.env.ADMIN_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const supabase = getSupabase()

  // Fetch the analytics view
  const { data: analytics } = await supabase
    .from('platform_analytics')
    .select('*')
    .single()

  // Subscriber growth per week (last 12 weeks)
  const { data: growth } = await supabase
    .from('weekly_subscriber_growth')
    .select('*')
    .limit(12)

  // Recent email queue activity
  const { data: recentEmails } = await supabase
    .from('email_queue')
    .select('id, email_type, recipient, status, created_at, sent_at, last_error')
    .order('created_at', { ascending: false })
    .limit(20)

  // Email queue summary
  const { data: queueSummary } = await supabase
    .from('email_queue')
    .select('status, email_type')

  const emailsByStatus = queueSummary?.reduce((acc: Record<string, number>, row) => {
    acc[row.status] = (acc[row.status] ?? 0) + 1
    return acc
  }, {}) ?? {}

  const emailsByType = queueSummary?.reduce((acc: Record<string, number>, row) => {
    acc[row.email_type] = (acc[row.email_type] ?? 0) + 1
    return acc
  }, {}) ?? {}

  // Content deliverables summary
  const { data: deliverables } = await supabase
    .from('content_deliverables')
    .select('week_number, topic, status, mentor_approved, sources_count, assets_produced')
    .order('week_number', { ascending: true })

  // Most viewed articles
  const { data: topArticles } = await supabase
    .from('articles')
    .select('id, title, category, view_count, published_date, age_group')
    .order('view_count', { ascending: false })
    .limit(10)

  return NextResponse.json({
    analytics,
    subscriberGrowth:   growth ?? [],
    recentEmails:       recentEmails ?? [],
    emailsByStatus,
    emailsByType,
    deliverables:       deliverables ?? [],
    topArticles:        topArticles ?? [],
    generatedAt:        new Date().toISOString(),
  })
}
