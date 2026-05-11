"use client"

// components/VerificationBanner.tsx
// Shows toast banner after email verification redirect (?verified=success|invalid|error|already)

import { useEffect, useState } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { X } from "lucide-react"

type State = "success" | "already" | "invalid" | "error" | null

const CONFIG: Record<NonNullable<State>, { icon: string; title: string; body: string; colorVar: string; bgVar: string }> = {
  success: {
    icon: "🎉", title: "Email confirmed!",
    body:  "You're now subscribed to Parent in the Loop. Your welcome email is on its way!",
    colorVar: "#276227", bgVar: "rgba(166,182,161,0.2)",
  },
  already: {
    icon: "ℹ️", title: "Already verified",
    body:  "This email is already confirmed and active — you're good to go!",
    colorVar: "#1a5276", bgVar: "rgba(173,216,230,0.2)",
  },
  invalid: {
    icon: "⚠️", title: "Invalid link",
    body:  "This verification link is invalid or has expired. Try subscribing again.",
    colorVar: "#7D6608", bgVar: "rgba(255,243,205,0.8)",
  },
  error: {
    icon: "❌", title: "Something went wrong",
    body:  "We could not verify your email. Please try subscribing again.",
    colorVar: "#922B21", bgVar: "rgba(253,237,236,0.9)",
  },
}

export default function VerificationBanner() {
  const searchParams = useSearchParams()
  const router       = useRouter()
  const [state,   setState]   = useState<State>(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const v = searchParams.get("verified") as State
    if (v && CONFIG[v]) {
      setState(v)
      setVisible(true)
      if (v === "success" || v === "already") {
        const t = setTimeout(() => dismiss(), 8000)
        return () => clearTimeout(t)
      }
    }
  }, [searchParams])

  function dismiss() {
    setVisible(false)
    const url = new URL(window.location.href)
    url.searchParams.delete("verified")
    url.searchParams.delete("email")
    router.replace(url.pathname + (url.search || ""), { scroll: false })
  }

  if (!state || !visible) return null

  const cfg = CONFIG[state]

  return (
    <div
      role="alert"
      aria-live="assertive"
      style={{
        position:     "fixed",
        top:          "5rem",
        left:         "50%",
        transform:    "translateX(-50%)",
        zIndex:       9999,
        width:        "calc(100% - 2rem)",
        maxWidth:     "520px",
        backgroundColor: cfg.bgVar,
        border:       `1.5px solid ${cfg.colorVar}33`,
        borderRadius: "16px",
        padding:      "14px 18px",
        boxShadow:    "0 8px 32px rgba(0,0,0,0.12)",
        display:      "flex",
        alignItems:   "flex-start",
        gap:          "12px",
        fontFamily:   "var(--font-nunito), Nunito, sans-serif",
        animation:    "slideDown 0.3s ease",
        backdropFilter: "blur(8px)",
      }}
    >
      <span style={{ fontSize: "1.5rem", flexShrink: 0, marginTop: "1px" }} aria-hidden="true">{cfg.icon}</span>
      <div style={{ flex: 1 }}>
        <p style={{ fontWeight: 700, color: cfg.colorVar, margin: "0 0 2px", fontSize: "0.95rem" }}>
          {cfg.title}
        </p>
        <p style={{ color: cfg.colorVar, margin: 0, fontSize: "0.83rem", lineHeight: 1.55, opacity: 0.85 }}>
          {cfg.body}
        </p>
      </div>
      <button
        onClick={dismiss}
        aria-label="Dismiss notification"
        style={{ background: "none", border: "none", cursor: "pointer", color: cfg.colorVar,
          opacity: 0.65, padding: 0, flexShrink: 0, lineHeight: 1, marginTop: 2 }}
      >
        <X size={16} />
      </button>

      <style>{`
        @keyframes slideDown {
          from { opacity: 0; transform: translateX(-50%) translateY(-14px); }
          to   { opacity: 1; transform: translateX(-50%) translateY(0); }
        }
      `}</style>
    </div>
  )
}
