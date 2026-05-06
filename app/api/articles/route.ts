// app/api/articles/route.ts
// Articles endpoint with age-group + category + search filtering

import { type NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl

  const category  = searchParams.get('category')  ?? 'all'
  const ageGroup  = searchParams.get('age_group')  ?? 'all'
  const search    = searchParams.get('search')     ?? ''
  const page      = parseInt(searchParams.get('page')     ?? '1')
  const pageSize  = parseInt(searchParams.get('pageSize') ?? '12')
  const featured  = searchParams.get('featured')  === 'true'
  const offset    = (page - 1) * pageSize

  const supabase = getSupabase()

  let query = supabase
    .from('articles')
    .select(
      'id, title, slug, excerpt, category, published_date, read_time, featured, view_count, age_group, literacy_level, asset_type',
      { count: 'exact' }
    )
    .lte('published_date', new Date().toISOString())

  // Category filter
  if (category && category !== 'all') {
    query = query.eq('category', category)
  }

  // Age group filter — 'all' articles always show regardless of selected age
  if (ageGroup && ageGroup !== 'all') {
    query = query.or(`age_group.eq.${ageGroup},age_group.eq.all`)
  }

  // Search
  if (search.trim()) {
    query = query.or(`title.ilike.%${search.trim()}%,excerpt.ilike.%${search.trim()}%`)
  }

  // Featured
  if (featured) {
    query = query.eq('featured', true)
  }

  const { data, count, error } = await query
    .order('published_date', { ascending: false })
    .range(offset, offset + pageSize - 1)

  if (error) {
    console.error('[articles] Query error:', error.message)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({
    articles:   data ?? [],
    total:      count ?? 0,
    page,
    pageSize,
    totalPages: Math.ceil((count ?? 0) / pageSize),
  })
}
