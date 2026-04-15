import { NextResponse, type NextRequest } from "next/server"
import { createSupabaseAdmin } from "@/lib/supabase"

const ADMIN_EMAILS = [
  "tanvir@supanovlabs.com", "ryan@supanovlabs.com",
  "vhoratanvir1610@gmail.com", "vhoratanvir1604@gmail.com",
]

async function verifyAdmin(request: NextRequest) {
  const authHeader = request.headers.get("x-admin-email") ?? ""
  return ADMIN_EMAILS.includes(authHeader)
}

// GET — list all articles for admin table
export async function GET(request: NextRequest) {
  if (!await verifyAdmin(request)) return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  try {
    const supabase = createSupabaseAdmin()
    const { data, error } = await supabase
      .from("articles")
      .select("id, title, slug, category, published_date, featured, read_time, tags, substack_url, excerpt")
      .order("published_date", { ascending: false })
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ articles: data ?? [] })
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}

// POST — create new article
export async function POST(request: NextRequest) {
  if (!await verifyAdmin(request)) return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  try {
    const body = await request.json()
    const supabase = createSupabaseAdmin()
    const { data, error } = await supabase
      .from("articles")
      .insert({
        title:          body.title,
        slug:           body.slug || body.title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, ""),
        excerpt:        body.excerpt,
        content:        body.content ?? "",
        category:       body.category,
        image_url:      body.image_url ?? "",
        author:         body.author ?? "Parent in the Loop",
        published_date: body.published_date ?? new Date().toISOString(),
        featured:       body.featured ?? false,
        substack_url:   body.substack_url ?? "",
        read_time:      body.read_time ?? 5,
        tags:           body.tags ?? [],
      })
      .select()
      .single()
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ article: data })
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}

// PATCH — update article
export async function PATCH(request: NextRequest) {
  if (!await verifyAdmin(request)) return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  try {
    const body = await request.json()
    const { id, ...updates } = body
    const supabase = createSupabaseAdmin()
    const { data, error } = await supabase
      .from("articles")
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq("id", id)
      .select()
      .single()
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ article: data })
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}

// DELETE — remove article
export async function DELETE(request: NextRequest) {
  if (!await verifyAdmin(request)) return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  try {
    const { id } = await request.json()
    const supabase = createSupabaseAdmin()
    const { error } = await supabase.from("articles").delete().eq("id", id)
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ success: true })
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}
