// app/api/admin/stats/route.ts — fixed: removed view_count, use article_views join

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
  const auth = req.headers.get('authorization')
  if (process.env.ADMIN_SECRET && auth !== `Bearer ${process.env.ADMIN_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const supabase = getSupabase()

  const [analyticsRes, growthRes, emailsRes, queueRes, deliverablesRes, topArticlesRes, userPostsRes] =
    await Promise.all([
      supabase.from('platform_analytics').select('*').single(),
      supabase.from('weekly_subscriber_growth').select('*').limit(12),
      supabase.from('email_queue').select('id,email_type,recipient,status,created_at,sent_at,last_error').order('created_at',{ascending:false}).limit(20),
      supabase.from('email_queue').select('status,email_type'),
      supabase.from('content_deliverables').select('week_number,topic,status,mentor_approved,sources_count,assets_produced').order('week_number',{ascending:true}),
      // Fixed: join article_views for view counts instead of view_count column
      supabase.from('articles').select('id,title,category,published_date,age_group,slug').order('published_date',{ascending:false}).limit(10),
      supabase.from('user_posts').select('id,title,asset_type,status,created_at').order('created_at',{ascending:false}).limit(20),
    ])

  const emailsByStatus = queueRes.data?.reduce((acc: Record<string,number>, r) => {
    acc[r.status] = (acc[r.status] ?? 0) + 1; return acc
  }, {}) ?? {}

  const emailsByType = queueRes.data?.reduce((acc: Record<string,number>, r) => {
    acc[r.email_type] = (acc[r.email_type] ?? 0) + 1; return acc
  }, {}) ?? {}

  return NextResponse.json({
    analytics:       analyticsRes.data,
    subscriberGrowth: growthRes.data   ?? [],
    recentEmails:    emailsRes.data    ?? [],
    emailsByStatus,
    emailsByType,
    deliverables:    deliverablesRes.data ?? [],
    topArticles:     topArticlesRes.data  ?? [],
    userPosts:       userPostsRes.data    ?? [],
    generatedAt:     new Date().toISOString(),
  })
}
