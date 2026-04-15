"use client"

import { useState, useEffect, Suspense } from "react"
import { useSignIn, useUser } from "@clerk/nextjs"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"

const F  = { fontFamily: "var(--font-nunito), Nunito, sans-serif" }
const FQ = { fontFamily: "var(--font-quicksand), Quicksand, sans-serif" }

const GoogleIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true" className="flex-shrink-0">
    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
  </svg>
)

function SignInForm() {
  const { isLoaded: signInLoaded, signIn, setActive } = useSignIn()
  const { isLoaded: userLoaded, isSignedIn } = useUser()
  const router = useRouter()
  const searchParams = useSearchParams()
  const redirectTo = searchParams.get("redirect_url") || "/"

  const [email, setEmail]     = useState("")
  const [password, setPassword] = useState("")
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading]   = useState(false)
  const [error, setError]       = useState("")
  const [focused, setFocused]   = useState<string | null>(null)

  // If already signed in, redirect immediately
  useEffect(() => {
    if (userLoaded && isSignedIn) {
      router.replace(redirectTo)
    }
  }, [userLoaded, isSignedIn, redirectTo, router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!signInLoaded || loading) return
    if (!email.trim()) { setError("Please enter your email address."); return }
    if (!password)     { setError("Please enter your password."); return }

    setLoading(true); setError("")
    try {
      const result = await signIn.create({
        identifier: email.trim().toLowerCase(),
        password,
      })

      if (result.status === "complete") {
        // Set the active session FIRST, then navigate
        await setActive({ session: result.createdSessionId })
        // Use replace so back button doesn't return to sign-in
        router.replace(redirectTo)
      } else {
        setError("Sign in could not be completed. Please try again.")
      }
    } catch (err: unknown) {
      const e = err as { errors?: { code?: string; message: string }[] }
      const code = e?.errors?.[0]?.code ?? ""
      if (code === "form_password_incorrect" || code === "form_identifier_not_found") {
        setError("Incorrect email or password. Please try again.")
      } else if (code === "too_many_requests") {
        setError("Too many attempts. Please wait a moment and try again.")
      } else {
        setError(e?.errors?.[0]?.message || "Something went wrong. Please try again.")
      }
    } finally {
      setLoading(false)
    }
  }

  const handleGoogle = async () => {
    if (!signInLoaded) return
    try {
      await signIn.authenticateWithRedirect({
        strategy: "oauth_google",
        redirectUrl: `${window.location.origin}/sso-callback`,
        redirectUrlComplete: redirectTo,
      })
    } catch {
      setError("Google sign in failed. Please try again.")
    }
  }

  const inputStyle = (field: string) => ({
    backgroundColor: "#FAF6F0",
    border: `1.5px solid ${focused === field ? "#7C63B8" : "#EDE8E1"}`,
    boxShadow: focused === field ? "0 0 0 3px rgba(124,99,184,0.1)" : "none",
    color: "#222222", outline: "none", ...F,
    transition: "border-color 0.15s, box-shadow 0.15s",
  })

  return (
    <div className="min-h-screen flex flex-col md:flex-row" style={{ backgroundColor: "#FAF6F0" }}>

      {/* ── Left brand panel (desktop) ── */}
      <div className="hidden md:flex md:w-5/12 lg:w-2/5 flex-col items-center justify-center px-10 lg:px-14 py-16 relative overflow-hidden"
        style={{ background: "linear-gradient(155deg, #7C63B8 0%, #9B8AC4 50%, #B9A6E3 100%)" }}>
        <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
          <div className="absolute top-0 right-0 w-72 h-72 rounded-full opacity-15"
            style={{ background: "radial-gradient(circle, #F4D78B, transparent)", transform: "translate(30%,-30%)" }} />
          <div className="absolute bottom-0 left-0 w-56 h-56 rounded-full opacity-10"
            style={{ background: "radial-gradient(circle, #F3A78E, transparent)", transform: "translate(-30%,30%)" }} />
        </div>
        <div className="relative z-10 text-center max-w-xs">
          <img src="/images/pitl-20logo1.png" alt="" className="w-20 h-20 object-contain mx-auto mb-6 rounded-2xl"
            style={{ backgroundColor: "rgba(255,255,255,0.15)", padding: "8px" }} />
          <h2 className="text-2xl font-bold text-white mb-3" style={FQ}>Parent in the Loop</h2>
          <p className="text-sm leading-relaxed mb-8" style={{ color: "rgba(255,255,255,0.82)", ...F }}>
            Helping families build AI literacy through honest conversations, fun activities, and weekly insights.
          </p>
          <div className="space-y-3 text-left">
            {[
              { icon: "🔓", text: "Unlock This Week's Family Tip" },
              { icon: "🧠", text: "Take the interactive AI quiz" },
              { icon: "📊", text: "Track your learning journey" },
              { icon: "🤖", text: "Chat with our AI assistant" },
            ].map(({ icon, text }) => (
              <div key={text} className="flex items-center gap-2.5 text-sm"
                style={{ color: "rgba(255,255,255,0.92)", ...F }}>
                <span className="text-base">{icon}</span>
                <span>{text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Right form panel ── */}
      <div className="flex-1 flex flex-col items-center justify-center px-4 sm:px-8 py-12">
        {/* Mobile logo */}
        <div className="md:hidden text-center mb-8">
          <Link href="/" className="inline-flex flex-col items-center gap-1">
            <img src="/images/pitl-20logo1.png" alt="Parent in the Loop" className="w-14 h-14 object-contain" />
            <span className="text-xs font-bold" style={{ color: "#B79D84", ...F }}>Parent in the Loop</span>
          </Link>
        </div>

        <div className="w-full max-w-sm">
          <Link href="/" className="inline-flex items-center gap-1.5 text-xs font-semibold mb-7 hover:underline"
            style={{ color: "#B79D84", ...F }}>
            ← Back to home
          </Link>

          <h1 className="text-2xl font-bold mb-1" style={{ color: "#222222", ...FQ }}>Welcome back 👋</h1>
          <p className="text-sm mb-7" style={{ color: "#B79D84", ...F }}>
            Sign in to unlock your weekly tips &amp; quiz
          </p>

          {/* Google */}
          <button onClick={handleGoogle} disabled={!signInLoaded || loading}
            className="w-full flex items-center justify-center gap-3 py-3.5 rounded-xl font-semibold text-sm mb-5 transition-all hover:shadow-md hover:scale-[1.01] active:scale-[0.99] disabled:opacity-60"
            style={{ backgroundColor: "#fff", border: "1.5px solid #EDE8E1", color: "#3E3E3E", boxShadow: "0 1px 4px rgba(0,0,0,0.06)", ...F }}>
            <GoogleIcon />
            Continue with Google
          </button>

          <div className="flex items-center gap-3 mb-5">
            <div className="flex-1 h-px" style={{ backgroundColor: "#EDE8E1" }} />
            <span className="text-xs" style={{ color: "#B79D84", ...F }}>or with email</span>
            <div className="flex-1 h-px" style={{ backgroundColor: "#EDE8E1" }} />
          </div>

          {error && (
            <div className="flex gap-2 items-start rounded-xl px-4 py-3 mb-5 text-sm" role="alert"
              style={{ backgroundColor: "rgba(243,167,142,0.12)", border: "1px solid rgba(243,167,142,0.5)", color: "#c97a5a", ...F }}>
              <span className="flex-shrink-0 mt-0.5">⚠️</span>
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate className="space-y-4">
            <div>
              <label htmlFor="si-email" className="block text-xs font-bold mb-1.5" style={{ color: "#3E3E3E", ...F }}>
                Email address
              </label>
              <input id="si-email" type="email" value={email} autoComplete="email"
                onChange={(e) => { setEmail(e.target.value); setError("") }}
                onFocus={() => setFocused("email")} onBlur={() => setFocused(null)}
                placeholder="you@email.com" disabled={loading}
                className="w-full px-4 py-3 rounded-xl text-sm disabled:opacity-60"
                style={inputStyle("email")}
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label htmlFor="si-pass" className="text-xs font-bold" style={{ color: "#3E3E3E", ...F }}>Password</label>
                <Link href="/forgot-password" className="text-xs font-semibold hover:underline" style={{ color: "#7C63B8" }}>
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <input id="si-pass" type={showPass ? "text" : "password"} value={password}
                  autoComplete="current-password"
                  onChange={(e) => { setPassword(e.target.value); setError("") }}
                  onFocus={() => setFocused("pass")} onBlur={() => setFocused(null)}
                  placeholder="••••••••" disabled={loading}
                  className="w-full px-4 py-3 pr-16 rounded-xl text-sm disabled:opacity-60"
                  style={inputStyle("pass")}
                />
                <button type="button" onClick={() => setShowPass(!showPass)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-semibold hover:underline px-1"
                  style={{ color: "#B79D84", ...F }}>
                  {showPass ? "Hide" : "Show"}
                </button>
              </div>
            </div>

            <button type="submit" disabled={loading || !signInLoaded || !email || !password}
              className="w-full py-3.5 rounded-xl font-bold text-sm text-white transition-all hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 mt-2"
              style={{ backgroundColor: "#7C63B8", boxShadow: "0 4px 14px rgba(124,99,184,0.3)", ...F }}>
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
                  Signing in…
                </span>
              ) : "Sign In →"}
            </button>
          </form>

          <p className="text-center text-sm mt-6" style={{ color: "#B79D84", ...F }}>
            New here?{" "}
            <Link href="/sign-up" className="font-bold hover:underline" style={{ color: "#7C63B8" }}>
              Create free account
            </Link>
          </p>
          <p className="text-center text-xs mt-3" style={{ color: "#B79D84", ...F }}>
            <Link href="/terms" className="hover:underline">Terms</Link>
            {" · "}
            <Link href="/privacy" className="hover:underline">Privacy</Link>
          </p>
        </div>
      </div>
    </div>
  )
}

export default function SignInPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: "#FAF6F0" }}>
        <div className="w-8 h-8 rounded-full border-2 border-t-transparent animate-spin"
          style={{ borderColor: "#7C63B8", borderTopColor: "transparent" }} />
      </div>
    }>
      <SignInForm />
    </Suspense>
  )
}
