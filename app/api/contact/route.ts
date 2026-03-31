import { type NextRequest, NextResponse } from "next/server"
import { createSupabaseAdmin, hasSupabaseConfig } from "@/lib/supabase"

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const name    = (body?.name    ?? "").trim().slice(0, 100)
    const email   = (body?.email   ?? "").trim().toLowerCase().slice(0, 254)
    const subject = (body?.subject ?? "").trim().slice(0, 200)
    const message = (body?.message ?? "").trim().slice(0, 2000)

    // Validation
    if (!name)                   return NextResponse.json({ error: "Name is required." },              { status: 400 })
    if (!email || !EMAIL_RE.test(email)) return NextResponse.json({ error: "Valid email is required." }, { status: 400 })
    if (!message || message.length < 10) return NextResponse.json({ error: "Message must be at least 10 characters." }, { status: 400 })

    if (hasSupabaseConfig()) {
      const supabase = createSupabaseAdmin()
      const { error } = await supabase.from("contact_messages").insert({
        name,
        email,
        subject: subject || "General enquiry",
        message,
        sent_at: new Date().toISOString(),
        status: "new",
      })

      if (error) {
        console.error("[contact] Supabase error:", error.message)
        return NextResponse.json(
          { error: "Failed to send message. Please try again." },
          { status: 500 }
        )
      }
    }

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error("[contact] Unexpected error:", err)
    return NextResponse.json({ error: "An unexpected error occurred." }, { status: 500 })
  }
}

export async function GET() {
  return NextResponse.json({ error: "Method not allowed" }, { status: 405 })
}
