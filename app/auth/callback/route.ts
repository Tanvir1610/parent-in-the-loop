import { type NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url)
  const code  = searchParams.get("code")
  const next  = searchParams.get("next") ?? "/dashboard"
  const error = searchParams.get("error")
  const errorDesc = searchParams.get("error_description")

  // Handle OAuth errors (e.g. email link expired)
  if (error) {
    console.error("[auth/callback] error:", error, errorDesc)
    return NextResponse.redirect(
      `${origin}/login?error=${encodeURIComponent(errorDesc ?? error)}`
    )
  }

  if (code) {
    const cookieStore = await cookies()
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll()        { return cookieStore.getAll() },
          setAll(list)    { list.forEach(({ name, value, options }) => cookieStore.set(name, value, options)) },
        },
      }
    )
    const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code)
    if (!exchangeError) {
      return NextResponse.redirect(`${origin}${next}`)
    }
    console.error("[auth/callback] exchange error:", exchangeError.message)
  }

  return NextResponse.redirect(`${origin}/login?error=Could+not+confirm+your+email.+Try+again.`)
}
