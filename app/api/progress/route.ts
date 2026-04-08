import { NextResponse, type NextRequest } from "next/server"
import { createSupabaseServerClient } from "@/lib/supabase"

// GET — fetch user's progress and read history
export async function GET() {
  try {
    const supabase = await createSupabaseServerClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const [progressRes, historyRes] = await Promise.all([
      supabase
        .from("user_progress")
        .select("topic, category, completed_at")
        .eq("user_id", user.id)
        .order("completed_at", { ascending: false }),
      supabase
        .from("read_history")
        .select("slug, title, category, read_at")
        .eq("user_id", user.id)
        .order("read_at", { ascending: false })
        .limit(10),
    ])

    return NextResponse.json({
      progress: progressRes.data ?? [],
      history:  historyRes.data  ?? [],
    })
  } catch (err) {
    console.error("[progress] GET error:", err)
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}

// POST — mark a topic as completed or log a read
export async function POST(request: NextRequest) {
  try {
    const supabase = await createSupabaseServerClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const body = await request.json()
    const { type, topic, category, slug, title } = body

    if (type === "progress") {
      // Upsert topic completion
      const { error } = await supabase.from("user_progress").upsert(
        { user_id: user.id, topic, category, completed: true, completed_at: new Date().toISOString() },
        { onConflict: "user_id,topic" }
      )
      if (error) return NextResponse.json({ error: error.message }, { status: 500 })
      return NextResponse.json({ success: true })
    }

    if (type === "read") {
      // Upsert read history
      const { error } = await supabase.from("read_history").upsert(
        { user_id: user.id, slug, title, category, read_at: new Date().toISOString() },
        { onConflict: "user_id,slug" }
      )
      if (error) return NextResponse.json({ error: error.message }, { status: 500 })
      return NextResponse.json({ success: true })
    }

    return NextResponse.json({ error: "Invalid type" }, { status: 400 })
  } catch (err) {
    console.error("[progress] POST error:", err)
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}

// DELETE — unmark a topic
export async function DELETE(request: NextRequest) {
  try {
    const supabase = await createSupabaseServerClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const { topic } = await request.json()
    const { error } = await supabase
      .from("user_progress")
      .delete()
      .eq("user_id", user.id)
      .eq("topic", topic)

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ success: true })
  } catch (err) {
    console.error("[progress] DELETE error:", err)
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}
