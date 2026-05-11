"use client"

import { useState, useRef, useEffect } from "react"

type Stage = "idle" | "loading" | "pending_verification" | "already_subscribed" | "error"

const TIPS = [
  "💡 Try: 'Can you name 3 things at home that use AI?'",
  "🎯 Activity: Play 'AI or not AI?' with household devices",
  "💬 Ask: 'If AI makes a mistake, whose fault is it?'",
  "🌱 Tip: Start with curiosity, not rules",
  "📚 Read one article together this weekend",
]

export default function Newsletter() {
  const [email,   setEmail]   = useState("")
  const [stage,   setStage]   = useState<Stage>("idle")
  const [message, setMessage] = useState("")
  const [tipIdx,  setTipIdx]  = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    const t = setInterval(() => setTipIdx(i => (i + 1) % TIPS.length), 4000)
    return () => clearInterval(t)
  }, [])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!email.trim() || stage === "loading") return
    setStage("loading")
    setMessage("")

    try {
      const res  = await fetch("/api/subscribe", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ email: email.trim().toLowerCase() }),
      })
      const data = await res.json()

      if (res.status === 409) {
        setStage("already_subscribed")
        setMessage(data.error || "You're already subscribed! ✅")
        return
      }

      if (!res.ok) {
        setStage("error")
        setMessage(data.error || "Something went wrong. Please try again.")
        return
      }

      setStage("pending_verification")
      setMessage(
        data.resent
          ? "Verification email resent! Check your inbox (and spam folder)."
          : "Check your inbox for a verification link! 📬"
      )
      setEmail("")
    } catch {
      setStage("error")
      setMessage("Network error. Please check your connection and try again.")
    }
  }

  return (
    <section
      id="newsletter"
      className="py-20 px-4 sm:px-6 lg:px-8"
      style={{ backgroundColor: "var(--background, #FAF6F0)" }}
      aria-label="Email newsletter signup"
    >
      <div className="max-w-2xl mx-auto text-center">
        {/* Header */}
        <div className="reveal mb-8">
          <div className="text-5xl mb-4">📬</div>
          <h2 className="text-3xl sm:text-4xl font-bold mb-4"
            style={{ fontFamily: "var(--font-quicksand), Quicksand, sans-serif", color: "var(--foreground, #222222)" }}>
            Join the Loop
          </h2>
          <p className="text-base leading-relaxed"
            style={{ color: "var(--muted-foreground, #6B6B6B)", fontFamily: "var(--font-nunito), Nunito, sans-serif" }}>
            One email per week. Evidence-based AI literacy tips, family conversation starters,
            and hands-on activities. Under 5 minutes to read. Always free.
          </p>
        </div>

        {/* Rotating tip */}
        <div className="mb-6 reveal delay-100 h-10 flex items-center justify-center">
          <p className="text-sm italic transition-opacity duration-500"
            style={{ color: "#B79D84", fontFamily: "var(--font-nunito), Nunito, sans-serif" }}>
            {TIPS[tipIdx]}
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="reveal delay-200" aria-label="Subscribe form" noValidate>
          <div className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
            <label htmlFor="newsletter-email" className="sr-only">Email address</label>
            <input
              id="newsletter-email"
              ref={inputRef}
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="your@email.com"
              required
              autoComplete="email"
              disabled={stage === "loading" || stage === "pending_verification"}
              className="flex-1 px-5 py-3.5 rounded-2xl text-sm border transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-[#7C63B8]"
              style={{
                backgroundColor: "var(--card, #fff)",
                borderColor:     "var(--border, #EDE8E1)",
                color:           "var(--foreground, #222222)",
                fontFamily:      "var(--font-nunito), Nunito, sans-serif",
              }}
              aria-describedby="newsletter-status"
            />
            <button
              type="submit"
              disabled={stage === "loading" || stage === "pending_verification" || !email.trim()}
              className="px-7 py-3.5 rounded-2xl text-sm font-bold text-white transition-all hover:scale-105 active:scale-95 disabled:opacity-60 disabled:scale-100 disabled:cursor-not-allowed focus:outline-none focus-visible:ring-2 focus-visible:ring-[#F3A78E]"
              style={{
                backgroundColor: "#F3A78E",
                fontFamily: "var(--font-nunito), Nunito, sans-serif",
                boxShadow: "0 2px 12px rgba(243,167,142,0.4)",
              }}
              onMouseEnter={e => { if (!e.currentTarget.disabled) (e.currentTarget as HTMLButtonElement).style.backgroundColor = "#E8926A" }}
              onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.backgroundColor = "#F3A78E" }}
            >
              {stage === "loading" ? "Subscribing…" : "Subscribe ✨"}
            </button>
          </div>

          {/* Status message */}
          {message && (
            <div
              id="newsletter-status"
              role="status"
              aria-live="polite"
              className="mt-4 px-5 py-3 rounded-2xl text-sm font-medium"
              style={{
                backgroundColor: stage === "pending_verification" ? "rgba(166,182,161,0.15)"
                  : stage === "already_subscribed"                ? "rgba(124,99,184,0.08)"
                  : "rgba(243,167,142,0.12)",
                border: `1px solid ${
                  stage === "pending_verification" ? "rgba(166,182,161,0.4)"
                  : stage === "already_subscribed" ? "rgba(124,99,184,0.25)"
                  : "rgba(243,167,142,0.35)"}`,
                color: stage === "pending_verification" ? "#4d7a49"
                  : stage === "already_subscribed"      ? "#7C63B8"
                  : "#c0392b",
                fontFamily: "var(--font-nunito), Nunito, sans-serif",
              }}
            >
              {stage === "pending_verification" && "📬 "}
              {stage === "already_subscribed"   && "✅ "}
              {stage === "error"                && "⚠️ "}
              {message}
            </div>
          )}

          {/* Email flow hint */}
          {stage === "pending_verification" && (
            <div className="mt-4 px-4 py-3 rounded-2xl text-xs text-left"
              style={{
                backgroundColor: "var(--card, #fff)",
                border: "1px solid var(--border, #EDE8E1)",
                color: "var(--muted-foreground, #B79D84)",
                fontFamily: "var(--font-nunito), Nunito, sans-serif",
              }}>
              <strong style={{ color: "var(--foreground, #222222)" }}>What happens next:</strong>
              <ol className="mt-2 space-y-1 list-none">
                {["1. ✉️ Check your inbox for a verification email",
                  "2. ✅ Click the confirmation link",
                  "3. 🌱 Receive your welcome email + first weekly article"].map(s => (
                  <li key={s}>{s}</li>
                ))}
              </ol>
              <p className="mt-2 text-xs opacity-70">Can't find it? Check your spam folder.</p>
            </div>
          )}
        </form>

        {/* Trust signals */}
        <div className="mt-8 flex flex-wrap gap-4 justify-center reveal delay-300">
          {["🔒 No spam, ever", "✨ Unsubscribe anytime", "👧 COPPA compliant", "📧 One email/week"].map(t => (
            <span key={t} className="text-xs font-semibold"
              style={{ color: "var(--muted-foreground, #B79D84)", fontFamily: "var(--font-nunito), Nunito, sans-serif" }}>
              {t}
            </span>
          ))}
        </div>
      </div>
    </section>
  )
}
