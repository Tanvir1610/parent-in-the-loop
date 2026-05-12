// app/api/user-posts/route.ts
// Handles community Note / Article / Video submissions from the Create modal

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
  catch { return NextResponse.json({ error: 'Invalid JSON body.' }, { status: 400 }) }

  const { title, content, excerpt, video_url, category, age_group,
          tags, read_time, asset_type } = body

  // Validation
  if (!String(title ?? '').trim()) {
    return NextResponse.json({ error: 'Title is required.' }, { status: 400 })
  }
  if (!['note', 'article', 'video'].includes(String(asset_type))) {
    return NextResponse.json({ error: 'Invalid asset_type. Must be note | article | video' }, { status: 400 })
  }
  if (asset_type === 'video' && !String(video_url ?? '').trim()) {
    return NextResponse.json({ error: 'Video URL is required for video posts.' }, { status: 400 })
  }

  // Parse tags
  let parsedTags: string[] = []
  if (Array.isArray(tags)) parsedTags = (tags as string[]).map(t => t.trim()).filter(Boolean)

  try {
    const supabase = getSupabase()
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
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err)
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl
  const type   = searchParams.get('type')   ?? 'all'
  const status = searchParams.get('status') ?? 'approved'

  const supabase = getSupabase()
  let query = supabase
    .from('user_posts')
    .select('id,title,excerpt,video_url,category,age_group,tags,read_time,asset_type,author,created_at')
    .eq('status', status)
    .order('created_at', { ascending: false })
    .limit(50)

  if (type !== 'all') query = query.eq('asset_type', type)

  const { data, error } = await query
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ posts: data ?? [] })
}
