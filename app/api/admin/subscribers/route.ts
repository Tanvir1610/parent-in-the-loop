// app/api/admin/subscribers/route.ts
// Manage subscribers — list, export, delete

import { type NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )
}

function checkAuth(req: NextRequest) {
  const auth = req.headers.get('authorization')
  return !process.env.ADMIN_SECRET || auth === `Bearer ${process.env.ADMIN_SECRET}`
}

// GET — list subscribers with filters
export async function GET(req: NextRequest) {
  if (!checkAuth(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = req.nextUrl
  const filter   = searchParams.get('filter') ?? 'all' // all | verified | pending | unsubscribed
  const page     = parseInt(searchParams.get('page') ?? '1')
  const pageSize = parseInt(searchParams.get('pageSize') ?? '50')
  const offset   = (page - 1) * pageSize

  const supabase = getSupabase()

  let query = supabase
    .from('subscribers')
    .select('id, email, is_verified, is_active, subscribed_at, verified_at, email_count, last_email_sent_at, unsubscribed_at, source', { count: 'exact' })

  if (filter === 'verified')     query = query.eq('is_verified', true).eq('is_active', true)
  if (filter === 'pending')      query = query.eq('is_verified', false)
  if (filter === 'unsubscribed') query = query.not('unsubscribed_at', 'is', null)

  const { data, count, error } = await query
    .order('subscribed_at', { ascending: false })
    .range(offset, offset + pageSize - 1)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({
    subscribers: data,
    total:       count,
    page,
    pageSize,
    totalPages:  Math.ceil((count ?? 0) / pageSize),
  })
}

// DELETE — hard delete a subscriber by id
export async function DELETE(req: NextRequest) {
  if (!checkAuth(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await req.json()
  if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 })

  const supabase = getSupabase()
  const { error } = await supabase.from('subscribers').delete().eq('id', id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ success: true })
}
