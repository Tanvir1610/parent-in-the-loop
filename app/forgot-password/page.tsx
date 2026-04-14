"use client"

import { useState, Suspense } from "react"
import { useSignIn } from "@clerk/nextjs"
import Link from "next/link"

function ForgotPasswordForm() {
  const { isLoaded, signIn } = useSignIn()
  const [email, setEmail]   = useState("")
  const [sent, setSent]     = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError]   = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!isLoaded || !email.trim()) return
    setLoading(true); setError("")
    try {
      await signIn.create({
        strategy: "reset_password_email_code",
        identifier: email.trim().toLowerCase(),
      })
      setSent(true)
    } catch (err: unknown) {
      const msg = (err as { errors?: { message: string }[] })?.errors?.[0]?.message ?? "Could not send reset email."
      setError(msg)
    } finally {
      setLoading(false)
    }
  }

  const F  = { fontFamily: "var(--font-nunito), Nunito, sans-serif" }
  const FQ = { fontFamily: "var(--font-quicksand), Quicksand, sans-serif" }

  return (
    <main className="min-h-screen flex items-center justify-center px-4 py-16" style={{ backgroundColor: "#FAF6F0" }}>
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex flex-col items-center gap-2">
            <img src="/images/pitl-20logo1.png" alt="Parent in the Loop" className="w-14 h-14 object-contain" />
          </Link>
        </div>
        <div className="rounded-3xl p-8" style={{ backgroundColor: "#fff", boxShadow: "0 4px 32px rgba(0,0,0,0.08)", border: "1.5px solid #EDE8E1" }}>
          {sent ? (
            <div className="text-center">
              <div className="text-4xl mb-4">📬</div>
              <h1 className="text-xl font-bold mb-2" style={{ color: "#222222", ...FQ }}>Check your inbox</h1>
              <p className="text-sm mb-6" style={{ color: "#3E3E3E", ...F }}>
                We sent a password reset link to <strong>{email}</strong>. Check your spam folder if you don&apos;t see it.
              </p>
              <Link href="/sign-in" className="text-sm font-bold underline" style={{ color: "#7C63B8" }}>
                Back to Sign In
              </Link>
            </div>
          ) : (
            <>
              <h1 className="text-2xl font-bold mb-1" style={{ color: "#222222", ...FQ }}>Reset password</h1>
              <p className="text-sm mb-6" style={{ color: "#B79D84", ...F }}>Enter your email and we&apos;ll send a reset link</p>
              {error && (
                <div className="rounded-xl px-4 py-3 mb-4 text-sm" role="alert"
                  style={{ backgroundColor: "rgba(243,167,142,0.12)", border: "1px solid rgba(243,167,142,0.4)", color: "#c97a5a", ...F }}>
                  ⚠️ {error}
                </div>
              )}
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label htmlFor="fp-email" className="block text-xs font-bold mb-1.5" style={{ color: "#3E3E3E", ...F }}>Email address</label>
                  <input id="fp-email" type="email" value={email}
                    onChange={(e) => { setEmail(e.target.value); setError("") }}
                    placeholder="you@email.com" required disabled={loading}
                    className="w-full px-4 py-3 rounded-xl text-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-[#7C63B8]"
                    style={{ backgroundColor: "#FAF6F0", border: "1.5px solid #EDE8E1", color: "#222222", ...F }}
                    onFocus={(e) => (e.target.style.borderColor = "#7C63B8")}
                    onBlur={(e)  => (e.target.style.borderColor = "#EDE8E1")}
                  />
                </div>
                <button type="submit" disabled={loading || !email || !isLoaded}
                  className="w-full py-3.5 rounded-xl font-bold text-sm text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#7C63B8] disabled:opacity-50"
                  style={{ backgroundColor: "#7C63B8", ...F }}>
                  {loading ? "Sending…" : "Send Reset Link →"}
                </button>
              </form>
              <p className="text-center text-sm mt-5" style={{ color: "#B79D84", ...F }}>
                <Link href="/sign-in" className="font-bold hover:underline" style={{ color: "#7C63B8" }}>← Back to Sign In</Link>
              </p>
            </>
          )}
        </div>
      </div>
    </main>
  )
}

export default function ForgotPasswordPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: "#FAF6F0" }}><div className="w-8 h-8 rounded-full border-2 border-t-transparent animate-spin" style={{ borderColor: "#7C63B8", borderTopColor: "transparent" }} /></div>}>
      <ForgotPasswordForm />
    </Suspense>
  )
}
