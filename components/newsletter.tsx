"use client"

import { useState, useEffect, useRef } from "react"

type FormState = "idle" | "loading" | "success" | "duplicate" | "error"
type EmailValidity = "empty" | "typing" | "invalid" | "checking" | "valid"

const EMAIL_RE = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*\.[a-zA-Z]{2,}$/

function quickCheck(email: string): "empty" | "typing" | "format_invalid" | "maybe_valid" {
  if (!email) return "empty"
  if (!email.includes("@") || email.length < 5) return "typing"
  if (!EMAIL_RE.test(email)) return "format_invalid"
  return "maybe_valid"
}

export default function Newsletter() {
  const [email, setEmail]         = useState("")
  const [touched, setTouched]     = useState(false)
  const [validity, setValidity]   = useState<EmailValidity>("empty")
  const [hintMsg, setHintMsg]     = useState("")
  const [formState, setFormState] = useState<FormState>("idle")
  const [serverError, setServerError] = useState("")

  const debounceRef  = useRef<ReturnType<typeof setTimeout> | null>(null)
  const inputRef     = useRef<HTMLInputElement>(null)
  const abortRef     = useRef<AbortController | null>(null)

  // ── Real-time validation pipeline ────────────────────────────
  useEffect(() => {
    if (!touched) return
    if (debounceRef.current) clearTimeout(debounceRef.current)
    if (abortRef.current) abortRef.current.abort()

    const trimmed = email.trim()
    const quick = quickCheck(trimmed)

    if (quick === "empty") { setValidity("empty"); setHintMsg(""); return }
    if (quick === "typing") { setValidity("typing"); setHintMsg(""); return }
    if (quick === "format_invalid") {
      setValidity("invalid")
      setHintMsg("That doesn\u2019t look like a valid email address.")
      return
    }

    // Format looks OK — wait 600 ms then deep-check with MX lookup
    setValidity("typing")
    setHintMsg("")

    debounceRef.current = setTimeout(async () => {
      setValidity("checking")
      setHintMsg("Checking email\u2026")

      const controller = new AbortController()
      abortRef.current = controller

      try {
        const res = await fetch(
          `/api/validate-email?email=${encodeURIComponent(trimmed)}`,
          { signal: controller.signal }
        )
        const data = await res.json()
        if (data.valid) {
          setValidity("valid")
          setHintMsg("Looks good \u2014 hit subscribe to join!")
        } else {
          setValidity("invalid")
          setHintMsg(data.reason ?? "That email address isn\u2019t valid.")
        }
      } catch (err: unknown) {
        if ((err as Error).name === "AbortError") return
        // Network error — fall back to format-only pass
        setValidity("valid")
        setHintMsg("Looks good \u2014 hit subscribe to join!")
      }
    }, 600)

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current)
    }
  }, [email, touched])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value)
    setTouched(true)
    if (formState === "error") { setFormState("idle"); setServerError("") }
  }

  const handleBlur = () => {
    if (email.trim()) setTouched(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const trimmed = email.trim()

    // Block if not yet valid
    if (validity !== "valid") {
      if (!trimmed) setHintMsg("Please enter your email address.")
      else if (validity === "checking") setHintMsg("Still checking your email \u2014 please wait a moment.")
      else setHintMsg(hintMsg || "Please enter a valid email address.")
      setValidity("invalid")
      inputRef.current?.focus()
      return
    }

    setFormState("loading")
    setServerError("")

    try {
      const res = await fetch("/api/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: trimmed }),
      })
      const data = await res.json()

      if (res.status === 409 || data?.already_subscribed) {
        setFormState("duplicate")
      } else if (res.ok && data?.success) {
        setFormState("success")
        setEmail("")
        setTouched(false)
        setValidity("empty")
        setHintMsg("")
      } else {
        setServerError(data?.error || "Something went wrong \u2014 please try again.")
        setFormState("error")
      }
    } catch {
      setServerError("Network error. Please check your connection and try again.")
      setFormState("error")
    }
  }

  // ── Derived styles ────────────────────────────────────────────
  const isLoading  = formState === "loading"
  const canSubmit  = validity === "valid" && !isLoading

  const borderColor = validity === "valid"
    ? "#A6B6A1"
    : (validity === "invalid" || formState === "error")
      ? "#F3A78E"
      : "rgba(255,255,255,0.4)"

  const ringColor = validity === "valid"
    ? "rgba(166,182,161,0.35)"
    : (validity === "invalid" || formState === "error")
      ? "rgba(243,167,142,0.3)"
      : "transparent"

  return (
    <section
      className="py-20 px-4 sm:px-6 lg:px-8 relative overflow-hidden"
      id="newsletter"
      style={{ backgroundColor: "#A6B6A1" }}
      aria-label="Newsletter subscription"
    >
      {/* Blobs */}
      <div className="absolute top-0 right-0 w-64 h-64 rounded-full opacity-20 pointer-events-none"
        style={{ background: "radial-gradient(circle, #F4D78B, transparent)", transform: "translate(20%,-20%)" }}
        aria-hidden="true" />
      <div className="absolute bottom-0 left-0 w-48 h-48 rounded-full opacity-15 pointer-events-none"
        style={{ background: "radial-gradient(circle, #B9A6E3, transparent)", transform: "translate(-20%,20%)" }}
        aria-hidden="true" />

      <div className="max-w-2xl mx-auto text-center relative z-10">

        <div className="flex justify-center gap-2 text-2xl mb-4" aria-hidden="true">
          <span>💬</span><span>✨</span><span>🧠</span>
        </div>

        <h2 className="text-4xl font-bold text-white mb-3"
          style={{ fontFamily: "var(--font-quicksand), Quicksand, sans-serif" }}>
          Get Weekly AI Wisdom
        </h2>
        <p className="text-lg leading-relaxed mb-1"
          style={{ color: "rgba(255,255,255,0.9)", fontFamily: "var(--font-nunito), Nunito, sans-serif" }}>
          Join parents building AI curiosity and critical thinking in their kids.
        </p>
        <p className="text-sm mb-8"
          style={{ color: "rgba(255,255,255,0.7)", fontFamily: "var(--font-nunito), Nunito, sans-serif" }}>
          No jargon. No hype. Evidence-based guidance you can use tonight.
        </p>

        {/* ── SUCCESS ── */}
        {formState === "success" && (
          <div className="rounded-2xl p-8 text-center"
            style={{ backgroundColor: "rgba(255,255,255,0.2)", border: "1.5px solid rgba(255,255,255,0.35)" }}
            role="alert" aria-live="polite">
            <div className="text-5xl mb-3">🎉</div>
            <h3 className="text-xl font-bold text-white mb-2"
              style={{ fontFamily: "var(--font-quicksand), Quicksand, sans-serif" }}>
              You&apos;re in!
            </h3>
            <p style={{ color: "rgba(255,255,255,0.9)", fontFamily: "var(--font-nunito), Nunito, sans-serif" }}>
              Welcome to the Parent in the Loop community. 🌱<br />
              Your first weekly AI wisdom arrives next week — check your inbox!
            </p>
          </div>
        )}

        {/* ── ALREADY SUBSCRIBED ── */}
        {formState === "duplicate" && (
          <div className="rounded-2xl p-5"
            style={{ backgroundColor: "rgba(255,255,255,0.15)", border: "1.5px solid rgba(255,255,255,0.3)" }}
            role="alert" aria-live="polite">
            <p className="font-semibold text-white"
              style={{ fontFamily: "var(--font-nunito), Nunito, sans-serif" }}>
              💌 You&apos;re already subscribed! Check your inbox — we publish every week.
            </p>
            <button
              onClick={() => { setFormState("idle"); setEmail(""); setTouched(false); setValidity("empty"); setHintMsg("") }}
              className="mt-3 text-xs underline transition-opacity hover:opacity-70"
              style={{ color: "rgba(255,255,255,0.7)", fontFamily: "var(--font-nunito), Nunito, sans-serif" }}>
              Try a different email
            </button>
          </div>
        )}

        {/* ── FORM ── */}
        {formState !== "success" && formState !== "duplicate" && (
          <form onSubmit={handleSubmit} noValidate aria-label="Email subscription form" className="w-full">
            <div className="max-w-md mx-auto space-y-3">

              {/* Input */}
              <div className="relative">
                <label htmlFor="nl-email" className="sr-only">Your email address</label>
                <input
                  ref={inputRef}
                  id="nl-email"
                  type="email"
                  inputMode="email"
                  autoComplete="email"
                  value={email}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  placeholder="your@email.com"
                  required
                  disabled={isLoading}
                  aria-invalid={validity === "invalid" || formState === "error"}
                  aria-describedby="nl-hint"
                  className="w-full pl-4 pr-11 py-3.5 rounded-xl text-sm disabled:opacity-60"
                  style={{
                    backgroundColor: "rgba(255,255,255,0.95)",
                    color: "#222222",
                    fontFamily: "var(--font-nunito), Nunito, sans-serif",
                    border: `2px solid ${borderColor}`,
                    boxShadow: `0 0 0 3px ${ringColor}`,
                    outline: "none",
                    transition: "border-color 0.2s, box-shadow 0.2s",
                  }}
                />

                {/* Right-side icon */}
                <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none w-5 flex items-center justify-center" aria-hidden="true">
                  {validity === "checking" && (
                    <span className="block w-4 h-4 rounded-full border-2 border-t-transparent animate-spin"
                      style={{ borderColor: "#A6B6A1", borderTopColor: "transparent" }} />
                  )}
                  {validity === "valid" && !isLoading && (
                    <span className="text-base font-bold" style={{ color: "#4d7a49" }}>✓</span>
                  )}
                  {validity === "invalid" && !isLoading && (
                    <span className="text-base font-bold" style={{ color: "#c97a5a" }}>✗</span>
                  )}
                  {isLoading && (
                    <span className="block w-4 h-4 rounded-full border-2 border-t-transparent animate-spin"
                      style={{ borderColor: "#A6B6A1", borderTopColor: "transparent" }} />
                  )}
                </div>
              </div>

              {/* Hint / error line */}
              <div id="nl-hint" className="min-h-[1.1rem] text-left px-1" aria-live="polite">
                {(hintMsg || (formState === "error" && serverError)) && (
                  <p className="text-xs font-semibold flex items-center gap-1"
                    style={{
                      color: validity === "valid" ? "rgba(255,255,255,0.9)" : "rgba(255,255,255,0.95)",
                      fontFamily: "var(--font-nunito), Nunito, sans-serif",
                    }}
                    role={validity === "invalid" || formState === "error" ? "alert" : undefined}>
                    {validity === "invalid" || formState === "error"
                      ? <span aria-hidden="true">⚠️</span>
                      : validity === "valid"
                        ? <span aria-hidden="true">✓</span>
                        : null}
                    {formState === "error" && serverError ? serverError : hintMsg}
                  </p>
                )}
              </div>

              {/* Submit button */}
              <button
                type="submit"
                disabled={!canSubmit}
                className="w-full py-3.5 rounded-xl font-bold text-sm text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 disabled:cursor-not-allowed"
                style={{
                  backgroundColor: canSubmit ? "#F3A78E" : "rgba(243,167,142,0.45)",
                  fontFamily: "var(--font-nunito), Nunito, sans-serif",
                  boxShadow: canSubmit ? "0 4px 14px rgba(243,167,142,0.4)" : "none",
                  transition: "background-color 0.2s, box-shadow 0.2s",
                }}
                onMouseEnter={(e) => { if (canSubmit) (e.currentTarget as HTMLButtonElement).style.backgroundColor = "#E89175" }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.backgroundColor = canSubmit ? "#F3A78E" : "rgba(243,167,142,0.45)" }}
              >
                {isLoading ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin" aria-hidden="true" />
                    Subscribing…
                  </span>
                ) : canSubmit ? "Subscribe Free ✨" : "Enter your email to subscribe"}
              </button>

              {/* What you get box */}
              <div className="rounded-xl p-3 flex gap-3 items-start text-left"
                style={{ backgroundColor: "rgba(255,255,255,0.1)" }}>
                <span className="text-lg flex-shrink-0" aria-hidden="true">📬</span>
                <p className="text-xs leading-relaxed"
                  style={{ color: "rgba(255,255,255,0.8)", fontFamily: "var(--font-nunito), Nunito, sans-serif" }}>
                  <strong className="text-white">What you&apos;ll get:</strong> One email per week with a fresh AI literacy topic, a family conversation starter, and a hands-on activity — all in under 5 minutes.
                </p>
              </div>
            </div>
          </form>
        )}

        <p className="text-xs mt-8"
          style={{ color: "rgba(255,255,255,0.45)", fontFamily: "var(--font-nunito), Nunito, sans-serif" }}>
          Unsubscribe anytime. We never sell or share your email. Privacy-first. 🔒
        </p>
      </div>
    </section>
  )
}
