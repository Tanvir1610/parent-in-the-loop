// app/api/user-posts/route.ts
// Handles community-submitted notes, articles, videos

import { type NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )
}

export async function POST(req: NextRequest) {
  let body: Record<string, unknown>
  try { body = await req.json() }
  catch { return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 }) }

  const { title, content, excerpt, video_url, category, age_group, tags, read_time, asset_type, tagsRaw } = body

  if (!title || !String(title).trim()) {
    return NextResponse.json({ error: 'Title is required.' }, { status: 400 })
  }

  const validTypes = ['note', 'article', 'video']
  if (!validTypes.includes(String(asset_type))) {
    return NextResponse.json({ error: 'Invalid asset_type.' }, { status: 400 })
  }

  const supabase = getSupabase()

  let parsedTags: string[] = []
  if (Array.isArray(tags))             parsedTags = tags.map(String).filter(Boolean)
  else if (typeof tagsRaw === 'string') parsedTags = tagsRaw.split(',').map((t: string) => t.trim()).filter(Boolean)

  const { data, error } = await supabase
    .from('user_posts')
    .insert({
      title:      String(title).trim(),
      content:    content   ? String(content).trim()   : null,
      excerpt:    excerpt   ? String(excerpt).trim()   : null,
      video_url:  video_url ? String(video_url).trim() : null,
      category:   category  ? String(category)         : null,
      age_group:  age_group ? String(age_group)        : 'all',
      tags:       parsedTags.length ? parsedTags       : null,
      read_time:  read_time ? Number(read_time)        : null,
      asset_type: String(asset_type),
      status:     'pending_review',
      created_at: new Date().toISOString(),
    })
    .select('id, title, asset_type, status')
    .single()

  if (error) {
    console.error('[user-posts] Insert error:', error.message)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ success: true, post: data })
}

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl
  const type   = searchParams.get('type')   ?? 'all'
  const status = searchParams.get('status') ?? 'approved'

  const supabase = getSupabase()

  let query = supabase
    .from('user_posts')
    .select('id,title,excerpt,content,video_url,category,age_group,tags,read_time,asset_type,author,created_at,published_date')
    .eq('status', status)
    .order('created_at', { ascending: false })

  if (type !== 'all') query = query.eq('asset_type', type)

  const { data, error } = await query.limit(50)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ posts: data ?? [] })
}
