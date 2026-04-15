"use client"

import { useState, useEffect, Suspense } from "react"
import { useSignUp, useUser } from "@clerk/nextjs"
import { useRouter } from "next/navigation"
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

function SignUpForm() {
  const { isLoaded: signUpLoaded, signUp, setActive } = useSignUp()
  const { isLoaded: userLoaded, isSignedIn } = useUser()
  const router = useRouter()

  const [step, setStep]         = useState<"form" | "verify" | "done">("form")
  const [name, setName]         = useState("")
  const [email, setEmail]       = useState("")
  const [password, setPassword] = useState("")
  const [confirm, setConfirm]   = useState("")
  const [code, setCode]         = useState("")
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading]   = useState(false)
  const [error, setError]       = useState("")
  const [codeResent, setCodeResent] = useState(false)
  const [focused, setFocused]   = useState<string | null>(null)

  // If already signed in, go home
  useEffect(() => {
    if (userLoaded && isSignedIn) {
      router.replace("/")
    }
  }, [userLoaded, isSignedIn, router])

  const strength = (() => {
    if (!password) return 0
    let s = 0
    if (password.length >= 8)          s++
    if (/[A-Z]/.test(password))        s++
    if (/[0-9]/.test(password))        s++
    if (/[^A-Za-z0-9]/.test(password)) s++
    return s
  })()

  const strengthColor = ["#EDE8E1","#F3A78E","#F4D78B","#A6B6A1","#4d7a49"][strength]
  const strengthLabel = ["","Weak","Fair","Good","Strong ✓"][strength]

  const inputStyle = (field: string) => ({
    backgroundColor: "#FAF6F0",
    border: `1.5px solid ${focused === field ? "#7C63B8" : "#EDE8E1"}`,
    boxShadow: focused === field ? "0 0 0 3px rgba(124,99,184,0.1)" : "none",
    color: "#222222", outline: "none", ...F,
    transition: "border-color 0.15s, box-shadow 0.15s",
  })

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!signUpLoaded || loading) return
    if (!name.trim())         { setError("Please enter your name."); return }
    if (!email.trim())        { setError("Please enter your email."); return }
    if (password.length < 8)  { setError("Password must be at least 8 characters."); return }
    if (password !== confirm) { setError("Passwords don't match."); return }

    setLoading(true); setError("")
    try {
      await signUp.create({
        firstName:    name.trim().split(" ")[0],
        lastName:     name.trim().split(" ").slice(1).join(" ") || undefined,
        emailAddress: email.trim().toLowerCase(),
        password,
      })
      await signUp.prepareEmailAddressVerification({ strategy: "email_code" })
      setStep("verify")
    } catch (err: unknown) {
      const e = err as { errors?: { code?: string; message: string }[] }
      const code = e?.errors?.[0]?.code ?? ""
      const msg  = e?.errors?.[0]?.message ?? ""
      if (code === "form_identifier_exists") {
        setError("An account with this email already exists. Sign in instead.")
      } else if (code === "form_password_pwned") {
        setError("This password appeared in a data breach. Please choose a stronger one.")
      } else {
        setError(msg || "Sign up failed. Please try again.")
      }
    } finally {
      setLoading(false)
    }
  }

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!signUpLoaded || loading || code.length < 6) return
    setLoading(true); setError("")
    try {
      const result = await signUp.attemptEmailAddressVerification({ code })
      if (result.status === "complete") {
        // Set session FIRST
        await setActive({ session: result.createdSessionId })
        setStep("done")
        // Then navigate - use replace so back button doesn't return to sign-up
        router.replace("/")
      } else {
        setError("Verification could not be completed. Please try again.")
      }
    } catch (err: unknown) {
      const msg = (err as { errors?: { message: string }[] })?.errors?.[0]?.message ?? "Invalid code. Please try again."
      setError(msg)
    } finally {
      setLoading(false)
    }
  }

  const resendCode = async () => {
    if (!signUpLoaded) return
    try {
      await signUp.prepareEmailAddressVerification({ strategy: "email_code" })
      setCodeResent(true)
      setTimeout(() => setCodeResent(false), 4000)
    } catch { setError("Could not resend code. Please try again.") }
  }

  const handleGoogle = async () => {
    if (!signUpLoaded) return
    try {
      await signUp.authenticateWithRedirect({
        strategy: "oauth_google",
        redirectUrl: `${window.location.origin}/sso-callback`,
        redirectUrlComplete: "/",
      })
    } catch { setError("Google sign up failed. Please try again.") }
  }

  return (
    <div className="min-h-screen flex flex-col md:flex-row" style={{ backgroundColor: "#FAF6F0" }}>

      {/* ── Left brand panel ── */}
      <div className="hidden md:flex md:w-5/12 lg:w-2/5 flex-col items-center justify-center px-10 lg:px-14 py-16 relative overflow-hidden"
        style={{ background: "linear-gradient(155deg, #F3A78E 0%, #E89175 40%, #B9A6E3 100%)" }}>
        <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
          <div className="absolute top-0 left-0 w-64 h-64 rounded-full opacity-15"
            style={{ background: "radial-gradient(circle, #F4D78B, transparent)", transform: "translate(-30%,-30%)" }} />
          <div className="absolute bottom-0 right-0 w-56 h-56 rounded-full opacity-10"
            style={{ background: "radial-gradient(circle, #7C63B8, transparent)", transform: "translate(30%,30%)" }} />
        </div>
        <div className="relative z-10 text-center max-w-xs">
          <img src="/images/pitl-20logo1.png" alt="" className="w-20 h-20 object-contain mx-auto mb-6 rounded-2xl"
            style={{ backgroundColor: "rgba(255,255,255,0.2)", padding: "8px" }} />
          <h2 className="text-2xl font-bold text-white mb-3" style={FQ}>Join the community 🌱</h2>
          <p className="text-sm leading-relaxed mb-6" style={{ color: "rgba(255,255,255,0.88)", ...F }}>
            Free forever. Join thousands of parents building AI literacy with their kids.
          </p>
          <div className="rounded-2xl p-5 text-left" style={{ backgroundColor: "rgba(255,255,255,0.18)" }}>
            <p className="text-xs font-bold text-white mb-3 uppercase tracking-wider" style={F}>What you unlock:</p>
            <div className="space-y-2.5">
              {["✨ Weekly AI wisdom emails","🔓 This Week's Family Tip","🧠 Interactive AI Quiz","📊 Learning progress tracker","🤖 AI Parenting Assistant"].map(item => (
                <p key={item} className="text-sm" style={{ color: "rgba(255,255,255,0.92)", ...F }}>{item}</p>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── Right form panel ── */}
      <div className="flex-1 flex flex-col items-center justify-center px-4 sm:px-8 py-12">

        {/* Mobile logo */}
        <div className="md:hidden text-center mb-8">
          <Link href="/" className="inline-flex flex-col items-center gap-1">
            <img src="/images/pitl-20logo1.png" alt="" className="w-14 h-14 object-contain" />
            <span className="text-xs font-bold" style={{ color: "#B79D84", ...F }}>Parent in the Loop</span>
          </Link>
        </div>

        <div className="w-full max-w-sm">

          {/* ── DONE ── */}
          {step === "done" && (
            <div className="text-center py-12">
              <div className="text-6xl mb-5 animate-bounce">🎉</div>
              <h1 className="text-2xl font-bold mb-2" style={{ color: "#222222", ...FQ }}>You&apos;re in the Loop!</h1>
              <p className="text-sm mb-6" style={{ color: "#B79D84", ...F }}>
                Welcome to Parent in the Loop. Taking you to the homepage…
              </p>
              <div className="flex justify-center">
                <div className="w-6 h-6 rounded-full border-2 border-t-transparent animate-spin"
                  style={{ borderColor: "#7C63B8", borderTopColor: "transparent" }} />
              </div>
            </div>
          )}

          {/* ── VERIFY ── */}
          {step === "verify" && (
            <div>
              <button onClick={() => { setStep("form"); setCode(""); setError("") }}
                className="inline-flex items-center gap-1.5 text-xs font-semibold mb-7 hover:underline"
                style={{ color: "#B79D84", ...F }}>← Back</button>

              <div className="text-center mb-7">
                <div className="text-5xl mb-4">📬</div>
                <h1 className="text-2xl font-bold mb-2" style={{ color: "#222222", ...FQ }}>Check your inbox</h1>
                <p className="text-sm" style={{ color: "#B79D84", ...F }}>
                  We sent a 6-digit code to{" "}
                  <strong style={{ color: "#3E3E3E" }}>{email}</strong>
                </p>
              </div>

              {error && (
                <div className="flex gap-2 items-start rounded-xl px-4 py-3 mb-4 text-sm" role="alert"
                  style={{ backgroundColor: "rgba(243,167,142,0.12)", border: "1px solid rgba(243,167,142,0.5)", color: "#c97a5a", ...F }}>
                  <span className="flex-shrink-0">⚠️</span><span>{error}</span>
                </div>
              )}
              {codeResent && (
                <div className="rounded-xl px-4 py-3 mb-4 text-sm text-center"
                  style={{ backgroundColor: "rgba(166,182,161,0.15)", color: "#4d7a49", ...F }}>
                  ✓ New code sent!
                </div>
              )}

              <form onSubmit={handleVerify} className="space-y-4">
                <div>
                  <label htmlFor="ver-code" className="block text-xs font-bold mb-2" style={{ color: "#3E3E3E", ...F }}>
                    6-digit verification code
                  </label>
                  <input id="ver-code" type="text" inputMode="numeric" value={code}
                    onChange={(e) => { setCode(e.target.value.replace(/\D/g,"").slice(0,6)); setError("") }}
                    onFocus={() => setFocused("code")} onBlur={() => setFocused(null)}
                    placeholder="1 2 3 4 5 6" maxLength={6} disabled={loading} autoFocus
                    className="w-full px-4 py-4 rounded-xl text-center tracking-[0.6em] font-bold text-2xl"
                    style={{
                      backgroundColor: "#FAF6F0",
                      border: `2px solid ${code.length === 6 ? "#A6B6A1" : focused === "code" ? "#7C63B8" : "#EDE8E1"}`,
                      boxShadow: focused === "code" ? "0 0 0 3px rgba(124,99,184,0.1)" : "none",
                      color: "#222222", outline: "none", ...F,
                    }}
                  />
                  <div className="flex justify-between items-center mt-2.5">
                    <p className="text-xs" style={{ color: "#B79D84", ...F }}>Check spam if not received</p>
                    <button type="button" onClick={resendCode}
                      className="text-xs font-semibold hover:underline" style={{ color: "#7C63B8", ...F }}>
                      Resend code
                    </button>
                  </div>
                </div>

                <button type="submit" disabled={loading || code.length < 6}
                  className="w-full py-3.5 rounded-xl font-bold text-sm text-white transition-all hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{ backgroundColor: "#F3A78E", boxShadow: "0 4px 14px rgba(243,167,142,0.35)", ...F }}>
                  {loading ? (
                    <span className="flex items-center justify-center gap-2">
                      <span className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
                      Verifying…
                    </span>
                  ) : "Verify & Join the Community 🌱"}
                </button>
              </form>
            </div>
          )}

          {/* ── SIGN UP FORM ── */}
          {step === "form" && (
            <div>
              <Link href="/" className="inline-flex items-center gap-1.5 text-xs font-semibold mb-7 hover:underline"
                style={{ color: "#B79D84", ...F }}>← Back to home</Link>

              <h1 className="text-2xl font-bold mb-1" style={{ color: "#222222", ...FQ }}>Join the community 🌱</h1>
              <p className="text-sm mb-7" style={{ color: "#B79D84", ...F }}>
                Free account — unlock tips, quiz &amp; weekly wisdom
              </p>

              <button onClick={handleGoogle} disabled={!signUpLoaded || loading}
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

              <form onSubmit={handleSignUp} noValidate className="space-y-4">
                {/* Name */}
                <div>
                  <label htmlFor="su-name" className="block text-xs font-bold mb-1.5" style={{ color: "#3E3E3E", ...F }}>Your name</label>
                  <input id="su-name" type="text" value={name} autoComplete="name"
                    onChange={(e) => { setName(e.target.value); setError("") }}
                    onFocus={() => setFocused("name")} onBlur={() => setFocused(null)}
                    placeholder="Alex Smith" disabled={loading}
                    className="w-full px-4 py-3 rounded-xl text-sm disabled:opacity-60"
                    style={inputStyle("name")}
                  />
                </div>

                {/* Email */}
                <div>
                  <label htmlFor="su-email" className="block text-xs font-bold mb-1.5" style={{ color: "#3E3E3E", ...F }}>Email address</label>
                  <input id="su-email" type="email" value={email} autoComplete="email"
                    onChange={(e) => { setEmail(e.target.value); setError("") }}
                    onFocus={() => setFocused("email")} onBlur={() => setFocused(null)}
                    placeholder="you@email.com" disabled={loading}
                    className="w-full px-4 py-3 rounded-xl text-sm disabled:opacity-60"
                    style={inputStyle("email")}
                  />
                </div>

                {/* Password */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label htmlFor="su-pass" className="text-xs font-bold" style={{ color: "#3E3E3E", ...F }}>Password</label>
                    <button type="button" onClick={() => setShowPass(!showPass)}
                      className="text-xs hover:underline" style={{ color: "#B79D84", ...F }}>
                      {showPass ? "Hide" : "Show"}
                    </button>
                  </div>
                  <input id="su-pass" type={showPass ? "text" : "password"} value={password}
                    autoComplete="new-password"
                    onChange={(e) => { setPassword(e.target.value); setError("") }}
                    onFocus={() => setFocused("pass")} onBlur={() => setFocused(null)}
                    placeholder="Min 8 characters" disabled={loading}
                    className="w-full px-4 py-3 rounded-xl text-sm disabled:opacity-60"
                    style={inputStyle("pass")}
                  />
                  {password && (
                    <div className="mt-2">
                      <div className="flex gap-1.5">
                        {[1,2,3,4].map(i => (
                          <div key={i} className="h-1.5 flex-1 rounded-full transition-all duration-300"
                            style={{ backgroundColor: i <= strength ? strengthColor : "#EDE8E1" }} />
                        ))}
                      </div>
                      <p className="text-xs mt-1 font-medium" style={{ color: strengthColor, ...F }}>{strengthLabel}</p>
                    </div>
                  )}
                </div>

                {/* Confirm */}
                <div>
                  <label htmlFor="su-confirm" className="block text-xs font-bold mb-1.5" style={{ color: "#3E3E3E", ...F }}>Confirm password</label>
                  <input id="su-confirm" type={showPass ? "text" : "password"} value={confirm}
                    autoComplete="new-password"
                    onChange={(e) => { setConfirm(e.target.value); setError("") }}
                    onFocus={() => setFocused("confirm")} onBlur={() => setFocused(null)}
                    placeholder="Repeat password" disabled={loading}
                    className="w-full px-4 py-3 rounded-xl text-sm disabled:opacity-60"
                    style={{
                      ...inputStyle("confirm"),
                      border: `1.5px solid ${
                        confirm && password !== confirm ? "#F3A78E" :
                        confirm && password === confirm ? "#A6B6A1" :
                        focused === "confirm" ? "#7C63B8" : "#EDE8E1"
                      }`,
                    }}
                  />
                  {confirm && password !== confirm && (
                    <p className="text-xs mt-1.5 font-semibold" style={{ color: "#c97a5a", ...F }}>Passwords don&apos;t match</p>
                  )}
                  {confirm && password === confirm && confirm.length > 0 && (
                    <p className="text-xs mt-1.5 font-semibold" style={{ color: "#4d7a49", ...F }}>✓ Passwords match</p>
                  )}
                </div>

                <button type="submit"
                  disabled={loading || !signUpLoaded || !name || !email || !password || !confirm || password !== confirm || strength < 1}
                  className="w-full py-3.5 rounded-xl font-bold text-sm text-white transition-all hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed mt-1"
                  style={{ backgroundColor: "#F3A78E", boxShadow: "0 4px 14px rgba(243,167,142,0.35)", ...F }}>
                  {loading ? (
                    <span className="flex items-center justify-center gap-2">
                      <span className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
                      Creating account…
                    </span>
                  ) : "Create Free Account ✨"}
                </button>
              </form>

              <p className="text-center text-sm mt-6" style={{ color: "#B79D84", ...F }}>
                Already have an account?{" "}
                <Link href="/sign-in" className="font-bold hover:underline" style={{ color: "#7C63B8" }}>Sign in</Link>
              </p>
              <p className="text-center text-xs mt-3" style={{ color: "#B79D84", ...F }}>
                <Link href="/terms" className="hover:underline">Terms</Link>
                {" · "}
                <Link href="/privacy" className="hover:underline">Privacy</Link>
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default function SignUpPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: "#FAF6F0" }}>
        <div className="w-8 h-8 rounded-full border-2 border-t-transparent animate-spin"
          style={{ borderColor: "#F3A78E", borderTopColor: "transparent" }} />
      </div>
    }>
      <SignUpForm />
    </Suspense>
  )
}
