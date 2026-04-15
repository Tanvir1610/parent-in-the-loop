"use client"

import { useState } from "react"
import Link from "next/link"
import { createSupabaseBrowserClient } from "@/lib/supabase-browser"

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export default function SignupPage() {
  const supabase = createSupabaseBrowserClient()

  const [name, setName]           = useState("")
  const [email, setEmail]         = useState("")
  const [password, setPassword]   = useState("")
  const [confirm, setConfirm]     = useState("")
  const [loading, setLoading]     = useState(false)
  const [error, setError]         = useState("")
  const [success, setSuccess]     = useState(false)
  const [showPass, setShowPass]   = useState(false)

  const strength = (() => {
    if (!password) return 0
    let s = 0
    if (password.length >= 8)           s++
    if (/[A-Z]/.test(password))        s++
    if (/[0-9]/.test(password))        s++
    if (/[^A-Za-z0-9]/.test(password)) s++
    return s
  })()

  const strengthLabel = ["", "Weak", "Fair", "Good", "Strong"][strength]
  const strengthColor = ["", "#F3A78E", "#F4D78B", "#A6B6A1", "#4d7a49"][strength]

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (!name.trim())                   { setError("Please enter your name."); return }
    if (!EMAIL_RE.test(email.trim()))   { setError("Please enter a valid email address."); return }
    if (password.length < 8)            { setError("Password must be at least 8 characters."); return }
    if (password !== confirm)           { setError("Passwords don't match."); return }

    setLoading(true)
    const { error: authError } = await supabase.auth.signUp({
      email:    email.trim().toLowerCase(),
      password,
      options: {
        data: { full_name: name.trim(), source: "parent_in_the_loop" },
        emailRedirectTo: `${window.location.origin}/auth/callback?next=/dashboard`,
      },
    })
    setLoading(false)

    if (authError) {
      if (authError.message.includes("already registered")) {
        setError("This email is already registered. Try signing in instead.")
      } else {
        setError(authError.message)
      }
      return
    }

    setSuccess(true)
  }

  const handleGoogleSignup = async () => {
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/auth/callback?next=/dashboard` },
    })
  }

  if (success) {
    return (
      <main className="min-h-screen flex items-center justify-center px-4 py-16" style={{ backgroundColor: "#FAF6F0" }}>
        <div className="w-full max-w-md text-center">
          <div className="rounded-3xl p-10" style={{ backgroundColor: "#fff", boxShadow: "0 4px 32px rgba(0,0,0,0.08)", border: "1.5px solid #EDE8E1" }}>
            <div className="text-5xl mb-4">📬</div>
            <h1 className="text-2xl font-bold mb-3" style={{ color: "#222222", fontFamily: "var(--font-quicksand), Quicksand, sans-serif" }}>
              Check your inbox!
            </h1>
            <p className="text-sm leading-relaxed mb-6" style={{ color: "#3E3E3E", fontFamily: "var(--font-nunito), Nunito, sans-serif" }}>
              We&apos;ve sent a confirmation email to <strong>{email}</strong>.
              Click the link in the email to activate your account and join the Parent in the Loop community.
            </p>
            <div className="rounded-xl p-4 mb-6" style={{ backgroundColor: "rgba(166,182,161,0.15)", border: "1px solid rgba(166,182,161,0.3)" }}>
              <p className="text-xs" style={{ color: "#4d7a49", fontFamily: "var(--font-nunito), Nunito, sans-serif" }}>
                💡 Can&apos;t find the email? Check your spam folder. The link expires in 24 hours.
              </p>
            </div>
            <Link href="/login"
              className="inline-block px-6 py-3 rounded-xl font-bold text-sm text-white"
              style={{ backgroundColor: "#7C63B8", fontFamily: "var(--font-nunito), Nunito, sans-serif" }}>
              Go to Sign In →
            </Link>
          </div>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen flex items-center justify-center px-4 py-16 relative overflow-hidden"
      style={{ backgroundColor: "#FAF6F0" }}>

      <div className="absolute top-0 left-0 w-80 h-80 rounded-full opacity-15 pointer-events-none"
        style={{ background: "radial-gradient(circle, #F4D78B, transparent)", transform: "translate(-30%,-30%)" }} aria-hidden="true" />
      <div className="absolute bottom-0 right-0 w-64 h-64 rounded-full opacity-10 pointer-events-none"
        style={{ background: "radial-gradient(circle, #A6B6A1, transparent)", transform: "translate(30%,30%)" }} aria-hidden="true" />

      <div className="w-full max-w-md relative z-10">

        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex flex-col items-center gap-2">
            <img src="/images/pitl-20logo1.png" alt="Parent in the Loop" className="w-16 h-16 object-contain" />
            <span className="text-sm font-bold" style={{ color: "#B79D84", fontFamily: "var(--font-nunito), Nunito, sans-serif" }}>
              Parent in the Loop
            </span>
          </Link>
        </div>

        <div className="rounded-3xl p-8" style={{ backgroundColor: "#fff", boxShadow: "0 4px 32px rgba(0,0,0,0.08)", border: "1.5px solid #EDE8E1" }}>

          <h1 className="text-2xl font-bold mb-1" style={{ color: "#222222", fontFamily: "var(--font-quicksand), Quicksand, sans-serif" }}>
            Join the community 🌱
          </h1>
          <p className="text-sm mb-6" style={{ color: "#B79D84", fontFamily: "var(--font-nunito), Nunito, sans-serif" }}>
            Create your free account to subscribe and access all content
          </p>

          {/* Google */}
          <button
            onClick={handleGoogleSignup}
            className="w-full flex items-center justify-center gap-3 py-3 rounded-xl font-semibold text-sm mb-4 transition-all hover:scale-[1.01] active:scale-[0.99] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#7C63B8]"
            style={{ backgroundColor: "#fff", border: "1.5px solid #EDE8E1", color: "#3E3E3E", fontFamily: "var(--font-nunito), Nunito, sans-serif" }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Continue with Google
          </button>

          <div className="flex items-center gap-3 mb-4">
            <div className="flex-1 h-px" style={{ backgroundColor: "#EDE8E1" }} />
            <span className="text-xs" style={{ color: "#B79D84", fontFamily: "var(--font-nunito), Nunito, sans-serif" }}>or sign up with email</span>
            <div className="flex-1 h-px" style={{ backgroundColor: "#EDE8E1" }} />
          </div>

          {error && (
            <div className="rounded-xl px-4 py-3 mb-4 text-sm" role="alert"
              style={{ backgroundColor: "rgba(243,167,142,0.12)", border: "1px solid rgba(243,167,142,0.4)", color: "#c97a5a", fontFamily: "var(--font-nunito), Nunito, sans-serif" }}>
              ⚠️ {error}
            </div>
          )}

          <form onSubmit={handleSignup} noValidate className="space-y-4">

            {/* Name */}
            <div>
              <label htmlFor="su-name" className="block text-xs font-bold mb-1.5" style={{ color: "#3E3E3E", fontFamily: "var(--font-nunito), Nunito, sans-serif" }}>
                Your name
              </label>
              <input id="su-name" type="text" value={name}
                onChange={(e) => { setName(e.target.value); setError("") }}
                placeholder="Alex" required autoComplete="name" disabled={loading}
                className="w-full px-4 py-3 rounded-xl text-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-[#7C63B8] disabled:opacity-60"
                style={{ backgroundColor: "#FAF6F0", border: "1.5px solid #EDE8E1", color: "#222222", fontFamily: "var(--font-nunito), Nunito, sans-serif" }}
                onFocus={(e) => { (e.target as HTMLInputElement).style.borderColor = "#7C63B8" }}
                onBlur={(e)  => { (e.target as HTMLInputElement).style.borderColor = "#EDE8E1" }}
              />
            </div>

            {/* Email */}
            <div>
              <label htmlFor="su-email" className="block text-xs font-bold mb-1.5" style={{ color: "#3E3E3E", fontFamily: "var(--font-nunito), Nunito, sans-serif" }}>
                Email address
              </label>
              <input id="su-email" type="email" value={email}
                onChange={(e) => { setEmail(e.target.value); setError("") }}
                placeholder="you@email.com" required autoComplete="email" disabled={loading}
                className="w-full px-4 py-3 rounded-xl text-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-[#7C63B8] disabled:opacity-60"
                style={{ backgroundColor: "#FAF6F0", border: "1.5px solid #EDE8E1", color: "#222222", fontFamily: "var(--font-nunito), Nunito, sans-serif" }}
                onFocus={(e) => { (e.target as HTMLInputElement).style.borderColor = "#7C63B8" }}
                onBlur={(e)  => { (e.target as HTMLInputElement).style.borderColor = "#EDE8E1" }}
              />
            </div>

            {/* Password */}
            <div>
              <label htmlFor="su-password" className="block text-xs font-bold mb-1.5" style={{ color: "#3E3E3E", fontFamily: "var(--font-nunito), Nunito, sans-serif" }}>
                Password
              </label>
              <div className="relative">
                <input id="su-password" type={showPass ? "text" : "password"} value={password}
                  onChange={(e) => { setPassword(e.target.value); setError("") }}
                  placeholder="Min 8 characters" required autoComplete="new-password" disabled={loading}
                  className="w-full px-4 py-3 pr-11 rounded-xl text-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-[#7C63B8] disabled:opacity-60"
                  style={{ backgroundColor: "#FAF6F0", border: "1.5px solid #EDE8E1", color: "#222222", fontFamily: "var(--font-nunito), Nunito, sans-serif" }}
                  onFocus={(e) => { (e.target as HTMLInputElement).style.borderColor = "#7C63B8" }}
                  onBlur={(e)  => { (e.target as HTMLInputElement).style.borderColor = "#EDE8E1" }}
                />
                <button type="button" onClick={() => setShowPass(!showPass)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs focus:outline-none"
                  style={{ color: "#B79D84" }} aria-label={showPass ? "Hide" : "Show"}>
                  {showPass ? "🙈" : "👁️"}
                </button>
              </div>
              {/* Strength bar */}
              {password && (
                <div className="mt-2">
                  <div className="flex gap-1">
                    {[1,2,3,4].map((i) => (
                      <div key={i} className="h-1 flex-1 rounded-full transition-all duration-300"
                        style={{ backgroundColor: i <= strength ? strengthColor : "#EDE8E1" }} />
                    ))}
                  </div>
                  <p className="text-xs mt-1" style={{ color: strengthColor, fontFamily: "var(--font-nunito), Nunito, sans-serif" }}>
                    {strengthLabel}
                  </p>
                </div>
              )}
            </div>

            {/* Confirm password */}
            <div>
              <label htmlFor="su-confirm" className="block text-xs font-bold mb-1.5" style={{ color: "#3E3E3E", fontFamily: "var(--font-nunito), Nunito, sans-serif" }}>
                Confirm password
              </label>
              <input id="su-confirm" type={showPass ? "text" : "password"} value={confirm}
                onChange={(e) => { setConfirm(e.target.value); setError("") }}
                placeholder="Repeat password" required autoComplete="new-password" disabled={loading}
                className="w-full px-4 py-3 rounded-xl text-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-[#7C63B8] disabled:opacity-60"
                style={{
                  backgroundColor: "#FAF6F0",
                  border: `1.5px solid ${confirm && password !== confirm ? "#F3A78E" : confirm && password === confirm ? "#A6B6A1" : "#EDE8E1"}`,
                  color: "#222222",
                  fontFamily: "var(--font-nunito), Nunito, sans-serif"
                }}
                onFocus={(e) => { (e.target as HTMLInputElement).style.borderColor = "#7C63B8" }}
                onBlur={(e)  => {
                  const color = confirm && password !== confirm ? "#F3A78E" : confirm && password === confirm ? "#A6B6A1" : "#EDE8E1"
                  ;(e.target as HTMLInputElement).style.borderColor = color
                }}
              />
              {confirm && password !== confirm && (
                <p className="text-xs mt-1" style={{ color: "#c97a5a", fontFamily: "var(--font-nunito), Nunito, sans-serif" }}>Passwords don&apos;t match</p>
              )}
            </div>

            <button type="submit" disabled={loading || !name || !email || !password || !confirm}
              className="w-full py-3.5 rounded-xl font-bold text-sm text-white transition-all hover:scale-[1.01] active:scale-[0.99] focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#F3A78E] disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ backgroundColor: "#F3A78E", fontFamily: "var(--font-nunito), Nunito, sans-serif", boxShadow: "0 4px 14px rgba(243,167,142,0.35)" }}
              onMouseEnter={(e) => { if (!loading) (e.currentTarget as HTMLButtonElement).style.backgroundColor = "#E89175" }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.backgroundColor = "#F3A78E" }}
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin" aria-hidden="true" />
                  Creating account…
                </span>
              ) : "Create Free Account ✨"}
            </button>
          </form>

          <p className="text-center text-sm mt-5" style={{ color: "#B79D84", fontFamily: "var(--font-nunito), Nunito, sans-serif" }}>
            Already have an account?{" "}
            <Link href="/login" className="font-bold hover:underline" style={{ color: "#7C63B8" }}>Sign in</Link>
          </p>
        </div>

        <p className="text-center text-xs mt-6" style={{ color: "#B79D84", fontFamily: "var(--font-nunito), Nunito, sans-serif" }}>
          By signing up you agree to our{" "}
          <Link href="/terms" className="underline" style={{ color: "#7C63B8" }}>Terms</Link>
          {" & "}
          <Link href="/privacy" className="underline" style={{ color: "#7C63B8" }}>Privacy Policy</Link>
        </p>
      </div>
    </main>
  )
}
