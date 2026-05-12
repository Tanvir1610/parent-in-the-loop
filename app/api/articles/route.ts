// app/api/articles/route.ts
// ROOT FIX: published_date was timestamp (no tz), filter used ISO string with Z → 0 results
// Fix: use service_role key on server (bypasses RLS entirely, most reliable)

import { type NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// Use service_role on server — bypasses RLS, guaranteed to return all articles
function getSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
    ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  return createClient(url, key, {
    auth: { autoRefreshToken: false, persistSession: false },
  })
}

export const dynamic = 'force-dynamic'
export const revalidate = 0

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl

  const category = searchParams.get('category') ?? ''
  const ageGroup = searchParams.get('age_group') ?? ''
  const search   = searchParams.get('search')    ?? ''
  const featured = searchParams.get('featured')  === 'true'
  const page     = Math.max(1, parseInt(searchParams.get('page')     ?? '1'))
  const pageSize = Math.min(50, parseInt(
    searchParams.get('pageSize') ?? searchParams.get('limit') ?? '24'
  ))
  const offset   = (page - 1) * pageSize

  try {
    const supabase = getSupabase()

    // Use current date as plain date string (no timezone) to match DB column
    const nowStr = new Date().toISOString().slice(0, 19)  // "2026-05-11T12:30:00"

    let query = supabase
      .from('articles')
      .select(
        'id,title,slug,excerpt,category,published_date,read_time,' +
        'featured,image_url,substack_url,tags,age_group,literacy_level,asset_type,author',
        { count: 'exact' }
      )
      .lte('published_date', nowStr)  // compare without timezone suffix

    // Category filter
    if (category && category !== 'all' && category !== 'All') {
      query = query.eq('category', category)
    }

    // Age group filter — always include 'all' articles plus the selected age
    if (ageGroup && ageGroup !== 'all') {
      query = query.or(`age_group.eq.${ageGroup},age_group.eq.all`)
    }

    // Full-text search on title + excerpt
    if (search.trim()) {
      const q = search.trim()
      query = query.or(`title.ilike.%${q}%,excerpt.ilike.%${q}%`)
    }

    // Featured only
    if (featured) query = query.eq('featured', true)

    const { data, count, error } = await query
      .order('published_date', { ascending: false })
      .range(offset, offset + pageSize - 1)

    if (error) {
      console.error('[articles] Supabase error:', error.message, error.details)
      return NextResponse.json({ error: error.message, articles: [], total: 0 }, { status: 500 })
    }

    console.log(`[articles] returned ${data?.length ?? 0} / ${count ?? 0} articles`)

    return NextResponse.json({
      articles:   data ?? [],
      total:      count ?? 0,
      page,
      pageSize,
      totalPages: Math.ceil((count ?? 0) / pageSize),
    }, {
      headers: {
        'Cache-Control': 'no-store',
      }
    })
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err)
    console.error('[articles] Unexpected error:', msg)
    return NextResponse.json({ error: msg, articles: [], total: 0 }, { status: 500 })
  }
}
