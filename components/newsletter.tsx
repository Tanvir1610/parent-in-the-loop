"use client"

import { useState } from "react"

type FormState = "idle" | "loading" | "success" | "duplicate" | "error"

export default function Newsletter() {
  const [email, setEmail] = useState("")
  const [formState, setFormState] = useState<FormState>("idle")
  const [errorMsg, setErrorMsg] = useState("")

  const isValidEmail = (e: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!isValidEmail(email)) {
      setErrorMsg("Please enter a valid email address.")
      setFormState("error")
      return
    }
    setFormState("loading")
    try {
      const res = await fetch("/api/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      })
      const data = await res.json()
      if (res.ok) {
        setFormState("success")
        setEmail("")
      } else if (data.error?.includes("already subscribed")) {
        setFormState("duplicate")
      } else {
        setErrorMsg(data.error || "Something went wrong. Please try again.")
        setFormState("error")
      }
    } catch {
      setErrorMsg("Network error. Please try again.")
      setFormState("error")
    }
  }

  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 relative overflow-hidden" id="newsletter" style={{ backgroundColor: "#A6B6A1" }} aria-label="Newsletter subscription">
      <div className="absolute top-0 right-0 w-64 h-64 rounded-full opacity-20 pointer-events-none" style={{ background: "radial-gradient(circle, #F4D78B, transparent)", transform: "translate(20%, -20%)" }} aria-hidden="true" />
      <div className="absolute bottom-0 left-0 w-48 h-48 rounded-full opacity-15 pointer-events-none" style={{ background: "radial-gradient(circle, #B9A6E3, transparent)", transform: "translate(-20%, 20%)" }} aria-hidden="true" />
      <div className="max-w-2xl mx-auto text-center relative z-10">
        <div className="flex justify-center gap-2 text-2xl mb-4" aria-hidden="true"><span>💬</span><span>✨</span><span>🧠</span></div>
        <h2 className="text-4xl font-bold text-white mb-3" style={{ fontFamily: "var(--font-quicksand), Quicksand, sans-serif" }}>Get Weekly AI Wisdom</h2>
        <p className="text-lg leading-relaxed mb-2" style={{ color: "rgba(255,255,255,0.9)", fontFamily: "var(--font-nunito), Nunito, sans-serif" }}>Join parents building AI curiosity and critical thinking in their kids. Weekly essays, conversation starters, and hands-on activities.</p>
        <p className="text-sm mb-8" style={{ color: "rgba(255,255,255,0.75)", fontFamily: "var(--font-nunito), Nunito, sans-serif" }}>No jargon. No hype. Just honest, evidence-based guidance you can use tonight.</p>

        {formState === "success" && (
          <div className="rounded-2xl p-8 mb-6" style={{ backgroundColor: "rgba(255,255,255,0.2)", border: "1px solid rgba(255,255,255,0.3)" }}>
            <div className="text-4xl mb-3">🎉</div>
            <h3 className="text-xl font-bold text-white mb-2" style={{ fontFamily: "var(--font-quicksand), Quicksand, sans-serif" }}>You&apos;re in!</h3>
            <p style={{ color: "rgba(255,255,255,0.9)", fontFamily: "var(--font-nunito), Nunito, sans-serif" }}>Welcome to the community. Your first weekly AI wisdom drops next week. ✨</p>
          </div>
        )}

        {formState === "duplicate" && (
          <div className="rounded-2xl p-6 mb-6" style={{ backgroundColor: "rgba(255,255,255,0.15)", border: "1px solid rgba(255,255,255,0.25)" }}>
            <p className="text-white font-semibold" style={{ fontFamily: "var(--font-nunito), Nunito, sans-serif" }}>💌 You&apos;re already subscribed! Check your inbox every week for new content.</p>
          </div>
        )}

        {formState !== "success" && formState !== "duplicate" && (
          <form onSubmit={handleSubmit} className="w-full" noValidate aria-label="Email subscription form">
            <div className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
              <div className="flex-1">
                <label htmlFor="newsletter-email" className="sr-only">Email address</label>
                <input
                  id="newsletter-email"
                  type="email"
                  value={email}
                  onChange={(e) => { setEmail(e.target.value); if (formState === "error") setFormState("idle") }}
                  placeholder="your@email.com"
                  required
                  disabled={formState === "loading"}
                  className="w-full px-4 py-3.5 rounded-xl text-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 disabled:opacity-60 transition-all"
                  style={{ backgroundColor: "rgba(255,255,255,0.95)", color: "#222222", fontFamily: "var(--font-nunito), Nunito, sans-serif" }}
                  aria-invalid={formState === "error"}
                />
              </div>
              <button
                type="submit"
                disabled={formState === "loading" || !email}
                className="px-6 py-3.5 rounded-xl font-bold text-sm text-white transition-all hover:scale-105 active:scale-95 focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:scale-100 whitespace-nowrap"
                style={{ backgroundColor: "#F3A78E", fontFamily: "var(--font-nunito), Nunito, sans-serif" }}
              >
                {formState === "loading" ? (
                  <span className="flex items-center gap-2">
                    <span className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
                    Subscribing…
                  </span>
                ) : "Subscribe Free ✨"}
              </button>
            </div>
            {formState === "error" && errorMsg && (
              <p className="mt-3 text-sm font-semibold" style={{ color: "rgba(255,255,255,0.95)", fontFamily: "var(--font-nunito), Nunito, sans-serif" }} role="alert">⚠️ {errorMsg}</p>
            )}
          </form>
        )}

        <div className="mt-8">
          <p className="text-xs mb-3" style={{ color: "rgba(255,255,255,0.6)", fontFamily: "var(--font-nunito), Nunito, sans-serif" }}>Or subscribe directly via Substack:</p>
          <iframe src="https://parentintheloop.substack.com/embed" width="100%" height="150" frameBorder="0" scrolling="no" className="rounded-2xl" title="Subscribe via Substack" />
        </div>
        <p className="text-xs mt-5" style={{ color: "rgba(255,255,255,0.6)", fontFamily: "var(--font-nunito), Nunito, sans-serif" }}>Unsubscribe anytime. We never share your email. 🔒</p>
      </div>
    </section>
  )
}
