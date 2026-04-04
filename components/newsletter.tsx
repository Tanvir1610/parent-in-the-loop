"use client"

import { useState, useEffect, useRef } from "react"

type FormState = "idle" | "validating" | "loading" | "success" | "duplicate" | "error"
type EmailValidity = "empty" | "typing" | "invalid" | "valid"

// RFC-5321 compliant email regex
const EMAIL_RE = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*\.[a-zA-Z]{2,}$/

function checkEmail(email: string): EmailValidity {
  if (!email) return "empty"
  if (email.length < 3) return "typing"
  if (!email.includes("@")) return "typing"
  return EMAIL_RE.test(email) ? "valid" : "invalid"
}

export default function Newsletter() {
  const [email, setEmail]           = useState("")
  const [touched, setTouched]       = useState(false)
  const [formState, setFormState]   = useState<FormState>("idle")
  const [errorMsg, setErrorMsg]     = useState("")
  const [validity, setValidity]     = useState<EmailValidity>("empty")
  const debounceRef                 = useRef<ReturnType<typeof setTimeout> | null>(null)
  const inputRef                    = useRef<HTMLInputElement>(null)

  // Real-time validation with 400ms debounce after typing stops
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current)
    if (!touched) return

    const trimmed = email.trim()
    if (!trimmed) {
      setValidity("empty")
      return
    }
    // Show "typing" immediately while user is mid-word
    setValidity("typing")

    debounceRef.current = setTimeout(() => {
      setValidity(checkEmail(trimmed))
    }, 400)

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current)
    }
  }, [email, touched])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value)
    setTouched(true)
    // Clear server error when user edits
    if (formState === "error") {
      setFormState("idle")
      setErrorMsg("")
    }
  }

  const handleBlur = () => {
    if (email.trim()) {
      setTouched(true)
      setValidity(checkEmail(email.trim()))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const trimmed = email.trim()

    // Final client-side guard before hitting network
    const v = checkEmail(trimmed)
    setValidity(v)
    setTouched(true)
    if (v !== "valid") {
      setErrorMsg(
        !trimmed
          ? "Please enter your email address."
          : "That email address doesn\'t look right. Please double-check it."
      )
      setFormState("error")
      inputRef.current?.focus()
      return
    }

    setFormState("loading")
    setErrorMsg("")

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
      } else {
        setErrorMsg(data?.error || "Something went wrong — please try again.")
        setFormState("error")
      }
    } catch {
      setErrorMsg("Network error. Please check your connection and try again.")
      setFormState("error")
    }
  }

  // Derive border + indicator colours from validity
  const isLoading   = formState === "loading"
  const canSubmit   = validity === "valid" && !isLoading

  const inputBorderColor = (() => {
    if (formState === "error" || validity === "invalid") return "#F3A78E"   // coral — error
    if (validity === "valid")                             return "#A6B6A1"   // sage — valid
    return "rgba(255,255,255,0.4)"                                           // neutral
  })()

  const inputShadow = (() => {
    if (formState === "error" || validity === "invalid") return "0 0 0 3px rgba(243,167,142,0.3)"
    if (validity === "valid")                            return "0 0 0 3px rgba(166,182,161,0.35)"
    return "none"
  })()

  return (
    <section
      className="py-20 px-4 sm:px-6 lg:px-8 relative overflow-hidden"
      id="newsletter"
      style={{ backgroundColor: "#A6B6A1" }}
      aria-label="Newsletter subscription"
    >
      {/* Background blobs */}
      <div className="absolute top-0 right-0 w-64 h-64 rounded-full opacity-20 pointer-events-none"
        style={{ background: "radial-gradient(circle, #F4D78B, transparent)", transform: "translate(20%,-20%)" }}
        aria-hidden="true" />
      <div className="absolute bottom-0 left-0 w-48 h-48 rounded-full opacity-15 pointer-events-none"
        style={{ background: "radial-gradient(circle, #B9A6E3, transparent)", transform: "translate(-20%,20%)" }}
        aria-hidden="true" />

      <div className="max-w-2xl mx-auto text-center relative z-10">

        {/* Icon row */}
        <div className="flex justify-center gap-2 text-2xl mb-4" aria-hidden="true">
          <span>💬</span><span>✨</span><span>🧠</span>
        </div>

        <h2
          className="text-4xl font-bold text-white mb-3"
          style={{ fontFamily: "var(--font-quicksand), Quicksand, sans-serif" }}
        >
          Get Weekly AI Wisdom
        </h2>
        <p
          className="text-lg leading-relaxed mb-1"
          style={{ color: "rgba(255,255,255,0.9)", fontFamily: "var(--font-nunito), Nunito, sans-serif" }}
        >
          Join parents building AI curiosity and critical thinking in their kids.
        </p>
        <p
          className="text-sm mb-8"
          style={{ color: "rgba(255,255,255,0.7)", fontFamily: "var(--font-nunito), Nunito, sans-serif" }}
        >
          No jargon. No hype. Evidence-based guidance you can use tonight.
        </p>

        {/* ── SUCCESS ── */}
        {formState === "success" && (
          <div
            className="rounded-2xl p-8 mb-6 text-center"
            style={{ backgroundColor: "rgba(255,255,255,0.2)", border: "1.5px solid rgba(255,255,255,0.35)" }}
            role="alert"
            aria-live="polite"
          >
            <div className="text-5xl mb-3">🎉</div>
            <h3
              className="text-xl font-bold text-white mb-2"
              style={{ fontFamily: "var(--font-quicksand), Quicksand, sans-serif" }}
            >
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
          <div
            className="rounded-2xl p-5 mb-6"
            style={{ backgroundColor: "rgba(255,255,255,0.15)", border: "1.5px solid rgba(255,255,255,0.3)" }}
            role="alert"
            aria-live="polite"
          >
            <p
              className="font-semibold text-white"
              style={{ fontFamily: "var(--font-nunito), Nunito, sans-serif" }}
            >
              💌 You&apos;re already subscribed! Check your inbox — we publish new content every week.
            </p>
            <button
              onClick={() => { setFormState("idle"); setEmail(""); setTouched(false); setValidity("empty") }}
              className="mt-3 text-xs underline transition-opacity hover:opacity-70"
              style={{ color: "rgba(255,255,255,0.7)", fontFamily: "var(--font-nunito), Nunito, sans-serif" }}
            >
              Try a different email
            </button>
          </div>
        )}

        {/* ── FORM ── */}
        {formState !== "success" && formState !== "duplicate" && (
          <form
            onSubmit={handleSubmit}
            noValidate
            aria-label="Email subscription form"
            className="w-full"
          >
            <div className="max-w-md mx-auto space-y-3">

              {/* Input + inline indicator */}
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
                  aria-describedby="nl-hint nl-error"
                  className="w-full pl-4 pr-10 py-3.5 rounded-xl text-sm disabled:opacity-60 transition-all duration-200"
                  style={{
                    backgroundColor: "rgba(255,255,255,0.95)",
                    color: "#222222",
                    fontFamily: "var(--font-nunito), Nunito, sans-serif",
                    border: `2px solid ${inputBorderColor}`,
                    boxShadow: inputShadow,
                    outline: "none",
                  }}
                />

                {/* Validity icon — right side of input */}
                <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" aria-hidden="true">
                  {validity === "valid" && !isLoading && (
                    <span className="text-base" style={{ color: "#4d7a49" }}>✓</span>
                  )}
                  {(validity === "invalid" || formState === "error") && !isLoading && (
                    <span className="text-base" style={{ color: "#c97a5a" }}>✗</span>
                  )}
                  {validity === "typing" && !isLoading && (
                    <span className="text-xs" style={{ color: "#B79D84" }}>…</span>
                  )}
                  {isLoading && (
                    <span
                      className="block w-4 h-4 rounded-full border-2 border-t-transparent animate-spin"
                      style={{ borderColor: "#A6B6A1", borderTopColor: "transparent" }}
                    />
                  )}
                </div>
              </div>

              {/* Inline hint / error message — always reserves space */}
              <div className="min-h-[1.25rem] text-left px-1" id="nl-hint" aria-live="polite">
                {validity === "invalid" && touched && (
                  <p
                    id="nl-error"
                    className="text-xs font-semibold flex items-center gap-1"
                    style={{ color: "rgba(255,255,255,0.95)", fontFamily: "var(--font-nunito), Nunito, sans-serif" }}
                    role="alert"
                  >
                    <span aria-hidden="true">⚠️</span>
                    That doesn&apos;t look like a valid email. Please check and try again.
                  </p>
                )}
                {validity === "valid" && touched && (
                  <p
                    className="text-xs font-semibold flex items-center gap-1"
                    style={{ color: "rgba(255,255,255,0.9)", fontFamily: "var(--font-nunito), Nunito, sans-serif" }}
                  >
                    <span aria-hidden="true">✓</span>
                    Looks good! Hit subscribe to join.
                  </p>
                )}
                {formState === "error" && errorMsg && validity !== "invalid" && (
                  <p
                    id="nl-error"
                    className="text-xs font-semibold flex items-center gap-1"
                    style={{ color: "rgba(255,255,255,0.95)", fontFamily: "var(--font-nunito), Nunito, sans-serif" }}
                    role="alert"
                  >
                    <span aria-hidden="true">⚠️</span>
                    {errorMsg}
                  </p>
                )}
              </div>

              {/* Submit button */}
              <button
                type="submit"
                disabled={!canSubmit}
                className="w-full py-3.5 rounded-xl font-bold text-sm text-white transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 disabled:cursor-not-allowed"
                style={{
                  backgroundColor: canSubmit ? "#F3A78E" : "rgba(243,167,142,0.45)",
                  transform: canSubmit ? undefined : "none",
                  fontFamily: "var(--font-nunito), Nunito, sans-serif",
                  boxShadow: canSubmit ? "0 4px 14px rgba(243,167,142,0.4)" : "none",
                  transition: "background-color 0.2s, box-shadow 0.2s, transform 0.1s",
                }}
                onMouseEnter={(e) => {
                  if (canSubmit) (e.currentTarget as HTMLButtonElement).style.backgroundColor = "#E89175"
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLButtonElement).style.backgroundColor = canSubmit ? "#F3A78E" : "rgba(243,167,142,0.45)"
                }}
                aria-disabled={!canSubmit}
              >
                {isLoading ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin" aria-hidden="true" />
                    Subscribing…
                  </span>
                ) : (
                  <span className="flex items-center justify-center gap-2">
                    {validity === "valid" ? "Subscribe Free ✨" : "Enter your email to subscribe"}
                  </span>
                )}
              </button>

              {/* What to expect */}
              <div
                className="rounded-xl p-3 text-left flex gap-3 items-start mt-1"
                style={{ backgroundColor: "rgba(255,255,255,0.1)" }}
              >
                <span className="text-lg flex-shrink-0" aria-hidden="true">📬</span>
                <p
                  className="text-xs leading-relaxed"
                  style={{ color: "rgba(255,255,255,0.8)", fontFamily: "var(--font-nunito), Nunito, sans-serif" }}
                >
                  <strong className="text-white">What you&apos;ll get:</strong> One email per week with a fresh AI literacy topic, a family conversation starter, and a hands-on activity — all in under 5 minutes.
                </p>
              </div>
            </div>
          </form>
        )}

        {/* Divider + Substack embed */}
        <div className="mt-8 pt-8" style={{ borderTop: "1px solid rgba(255,255,255,0.2)" }}>
          <p
            className="text-xs mb-3"
            style={{ color: "rgba(255,255,255,0.55)", fontFamily: "var(--font-nunito), Nunito, sans-serif" }}
          >
            Or subscribe directly on Substack:
          </p>
          <iframe
            src="https://parentintheloop.substack.com/embed"
            width="100%"
            height="150"
            frameBorder="0"
            scrolling="no"
            className="rounded-2xl"
            title="Subscribe via Substack"
          />
        </div>

        <p
          className="text-xs mt-5"
          style={{ color: "rgba(255,255,255,0.45)", fontFamily: "var(--font-nunito), Nunito, sans-serif" }}
        >
          Unsubscribe anytime. We never sell or share your email. Privacy-first. 🔒
        </p>
      </div>
    </section>
  )
}
