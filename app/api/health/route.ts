import { NextResponse } from "next/server"
import { hasSupabaseConfig } from "@/lib/supabase"

export async function GET() {
  const checks: Record<string, string> = {
    status: "ok",
    timestamp: new Date().toISOString(),
    supabase_configured: hasSupabaseConfig() ? "yes" : "no",
    service_role_configured: Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY) ? "yes" : "no",
  }

  // Optionally ping Supabase
  if (hasSupabaseConfig()) {
    try {
      const { createSupabaseServerClient } = await import("@/lib/supabase")
      const supabase = await createSupabaseServerClient()
      const { error } = await supabase.from("articles").select("id").limit(1)
      checks.supabase_articles_table = error ? `error: ${error.message}` : "reachable"
    } catch (e) {
      checks.supabase_articles_table = `unreachable: ${e}`
    }

    try {
      const { createSupabaseAdmin } = await import("@/lib/supabase")
      const admin = createSupabaseAdmin()
      const { error } = await admin.from("subscribers").select("id").limit(1)
      checks.supabase_subscribers_table = error ? `error: ${error.message}` : "reachable"
    } catch (e) {
      checks.supabase_subscribers_table = `unreachable: ${e}`
    }
  }

  const allOk = !Object.values(checks).some((v) => v.startsWith("error") || v.startsWith("unreachable"))

  return NextResponse.json(checks, { status: allOk ? 200 : 503 })
}
