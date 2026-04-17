"use client"

import { useEffect, useState } from "react"
import { useSearchParams } from "next/navigation"

export default function VerificationToast() {
  const searchParams = useSearchParams()
  const [show, setShow]     = useState(false)
  const [type, setType]     = useState<"success"|"already"|"invalid"|"error"|null>(null)

  useEffect(() => {
    const verified = searchParams.get("verified")
    if (!verified) return

    setType(verified as typeof type)
    setShow(true)

    // Auto-hide after 6 seconds
    const t = setTimeout(() => setShow(false), 6000)

    // Clean URL — remove ?verified= param
    const url = new URL(window.location.href)
    url.searchParams.delete("verified")
    window.history.replaceState({}, "", url.toString())

    return () => clearTimeout(t)
  }, [searchParams])

  if (!show || !type) return null

  const config = {
    success: {
      emoji:   "✅",
      title:   "Email confirmed!",
      message: "You're now subscribed to Parent in the Loop. Welcome! 🌱",
      color:   "#4d7a49",
      bg:      "rgba(166,182,161,0.15)",
      border:  "rgba(166,182,161,0.5)",
    },
    already: {
      emoji:   "✅",
      title:   "Already verified!",
      message: "Your email is confirmed — you're all set.",
      color:   "#7C63B8",
      bg:      "rgba(124,99,184,0.08)",
      border:  "rgba(124,99,184,0.3)",
    },
    invalid: {
      emoji:   "⚠️",
      title:   "Link expired or invalid",
      message: "Try subscribing again — we'll send a fresh verification email.",
      color:   "#c97a5a",
      bg:      "rgba(243,167,142,0.12)",
      border:  "rgba(243,167,142,0.4)",
    },
    error: {
      emoji:   "⚠️",
      title:   "Something went wrong",
      message: "Please try again or contact us if the problem continues.",
      color:   "#c97a5a",
      bg:      "rgba(243,167,142,0.12)",
      border:  "rgba(243,167,142,0.4)",
    },
  }

  const c = config[type]

  return (
    <div
      className="fixed top-4 left-1/2 -translate-x-1/2 z-[999] flex items-start gap-3 px-5 py-4 rounded-2xl shadow-xl animate-slide-down"
      style={{
        backgroundColor: c.bg,
        border: `1.5px solid ${c.border}`,
        maxWidth: "420px",
        width: "calc(100vw - 32px)",
        backdropFilter: "blur(8px)",
      }}
      role="alert"
      aria-live="assertive"
    >
      <span className="text-xl flex-shrink-0 mt-0.5">{c.emoji}</span>
      <div className="flex-1 min-w-0">
        <p className="font-bold text-sm" style={{ color: c.color, fontFamily: "var(--font-quicksand), Quicksand, sans-serif" }}>
          {c.title}
        </p>
        <p className="text-xs mt-0.5 leading-relaxed" style={{ color: c.color, fontFamily: "var(--font-nunito), Nunito, sans-serif", opacity: 0.85 }}>
          {c.message}
        </p>
      </div>
      <button
        onClick={() => setShow(false)}
        className="flex-shrink-0 text-sm font-bold hover:opacity-70 transition-opacity"
        style={{ color: c.color }}
        aria-label="Dismiss"
      >
        ✕
      </button>
    </div>
  )
}
