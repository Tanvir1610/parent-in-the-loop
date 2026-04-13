"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useClerk } from "@clerk/nextjs"
import ProgressTracker from "@/components/progress-tracker"

interface Props {
  user:         { id: string; email: string; name: string }
  isSubscribed: boolean
  subscribedAt: string | null
  isAdmin:      boolean
}

export default function DashboardClient({ user, isSubscribed, subscribedAt, isAdmin }: Props) {
  const router   = useRouter()
  const { signOut } = useClerk()
  const [subscribed, setSubscribed]   = useState(isSubscribed)
  const [subscribing, setSubscribing] = useState(false)
  const [subError, setSubError]       = useState("")
  const [signingOut, setSigningOut]   = useState(false)

  const displayName = user.name || user.email.split("@")[0]

  const handleSubscribe = async () => {
    setSubscribing(true); setSubError("")
    try {
      const res  = await fetch("/api/subscribe", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: user.email }),
      })
      const data = await res.json()
      if (res.ok || res.status === 409) setSubscribed(true)
      else setSubError(data?.error || "Something went wrong.")
    } catch { setSubError("Network error. Please try again.") }
    setSubscribing(false)
  }

  const handleSignOut = async () => {
    setSigningOut(true)
    await signOut({ redirectUrl: "/" })
  }

  const F  = { fontFamily: "var(--font-nunito), Nunito, sans-serif" }
  const FQ = { fontFamily: "var(--font-quicksand), Quicksand, sans-serif" }

  return (
    <main className="min-h-screen px-4 sm:px-6 lg:px-8 py-10 relative" style={{ backgroundColor: "#FAF6F0" }}>
      {/* Blob */}
      <div className="absolute top-0 right-0 w-96 h-96 rounded-full opacity-10 pointer-events-none"
        style={{ background: "radial-gradient(circle, #B9A6E3, transparent)", transform: "translate(30%,-30%)" }} aria-hidden="true" />

      <div className="max-w-3xl mx-auto relative z-10">

        {/* Header */}
        <div className="flex items-center justify-between mb-8 reveal">
          <Link href="/" className="flex items-center gap-2">
            <img src="/images/pitl-20logo1.png" alt="Parent in the Loop" className="w-9 h-9 object-contain" />
            <span className="font-bold text-sm hidden sm:block" style={{ color: "#222222", ...FQ }}>
              Parent in the Loop
            </span>
          </Link>
          <div className="flex items-center gap-2">
            {isAdmin && (
              <Link href="/admin"
                className="text-xs font-bold px-3 py-2 rounded-xl text-white transition-all hover:scale-105"
                style={{ backgroundColor: "#7C63B8", ...F }}>
                ⚡ Admin
              </Link>
            )}
            <button onClick={handleSignOut} disabled={signingOut}
              className="text-sm font-semibold px-4 py-2 rounded-xl transition-all hover:scale-105"
              style={{ color: "#B79D84", border: "1.5px solid #EDE8E1", backgroundColor: "#fff", ...F }}>
              {signingOut ? "Signing out…" : "Sign out"}
            </button>
          </div>
        </div>

        {/* Welcome hero card */}
        <div className="rounded-3xl p-7 mb-6 reveal"
          style={{ background: "linear-gradient(135deg, #7C63B8 0%, #B9A6E3 100%)", boxShadow: "0 8px 32px rgba(124,99,184,0.25)" }}>
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl flex-shrink-0"
              style={{ backgroundColor: "rgba(255,255,255,0.2)" }}>
              👋
            </div>
            <div>
              <h1 className="text-xl font-bold text-white" style={FQ}>Welcome back, {displayName}!</h1>
              <p className="text-sm" style={{ color: "rgba(255,255,255,0.75)", ...F }}>{user.email}</p>
            </div>
          </div>
          {subscribed && (
            <div className="mt-4 flex items-center gap-2 px-3 py-2 rounded-xl"
              style={{ backgroundColor: "rgba(255,255,255,0.15)" }}>
              <span>✅</span>
              <p className="text-sm font-semibold text-white" style={F}>
                Community member {subscribedAt ? `since ${new Date(subscribedAt).toLocaleDateString("en-US", { month: "long", year: "numeric" })}` : ""}
              </p>
            </div>
          )}
        </div>

        {/* Progress Tracker — Feature 2 */}
        <div className="reveal delay-100">
          <ProgressTracker />
        </div>

        {/* Subscription card */}
        <div className="rounded-3xl p-7 mb-6 reveal delay-200"
          style={{ backgroundColor: "#fff", border: "1.5px solid #EDE8E1", boxShadow: "0 2px 16px rgba(0,0,0,0.06)" }}>
          <h2 className="text-lg font-bold mb-4" style={{ color: "#222222", ...FQ }}>
            Newsletter Subscription
          </h2>
          {subscribed ? (
            <div>
              <div className="flex items-center gap-3 p-4 rounded-2xl mb-4"
                style={{ backgroundColor: "rgba(166,182,161,0.15)", border: "1.5px solid rgba(166,182,161,0.4)" }}>
                <span className="text-2xl">✅</span>
                <div>
                  <p className="font-bold text-sm" style={{ color: "#4d7a49", ...F }}>You&apos;re subscribed!</p>
                  <p className="text-xs" style={{ color: "#6b7a68", ...F }}>
                    {subscribedAt
                      ? `Joined ${new Date(subscribedAt).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}`
                      : "You're part of the community"}
                  </p>
                </div>
              </div>
              <div className="rounded-xl p-4" style={{ backgroundColor: "#FAF6F0" }}>
                <p className="text-sm font-semibold mb-2" style={{ color: "#222222", ...F }}>📬 What to expect every week:</p>
                <ul className="space-y-1.5">
                  {["📝 A fresh AI literacy topic", "💬 A family conversation starter", "🎯 A hands-on activity (under 10 min)", "⏱️ Under 5 minutes to read"].map((item) => (
                    <li key={item} className="text-xs" style={{ color: "#3E3E3E", ...F }}>{item}</li>
                  ))}
                </ul>
              </div>
            </div>
          ) : (
            <div>
              <p className="text-sm mb-5" style={{ color: "#3E3E3E", ...F }}>
                You&apos;re not subscribed yet. Join the community to receive weekly AI literacy insights directly to <strong>{user.email}</strong>.
              </p>
              {subError && (
                <div className="rounded-xl px-4 py-3 mb-4 text-sm" role="alert"
                  style={{ backgroundColor: "rgba(243,167,142,0.12)", border: "1px solid rgba(243,167,142,0.4)", color: "#c97a5a", ...F }}>
                  ⚠️ {subError}
                </div>
              )}
              <button onClick={handleSubscribe} disabled={subscribing}
                className="w-full py-3.5 rounded-xl font-bold text-sm text-white transition-all hover:scale-[1.01] active:scale-[0.99] disabled:opacity-60"
                style={{ backgroundColor: "#F3A78E", ...F, boxShadow: "0 4px 14px rgba(243,167,142,0.35)" }}>
                {subscribing ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
                    Subscribing…
                  </span>
                ) : "Subscribe to Parent in the Loop ✨"}
              </button>
              <p className="text-xs text-center mt-3" style={{ color: "#B79D84", ...F }}>
                Free forever · Unsubscribe anytime · We never share your email
              </p>
            </div>
          )}
        </div>

        {/* Quick links */}
        <div className="grid grid-cols-2 gap-4 reveal delay-300">
          {[
            { href: "/#articles", label: "Browse Articles", emoji: "📝" },
            { href: "/#quiz",     label: "Take the Quiz",   emoji: "🧠" },
            { href: "/contact",   label: "Contact Us",      emoji: "💬" },
            { href: "https://parentintheloop.substack.com", label: "Substack", emoji: "📮", external: true },
          ].map((link) => (
            <Link key={link.label} href={link.href}
              target={"external" in link ? "_blank" : "_self"}
              rel={"external" in link ? "noopener noreferrer" : ""}
              className="flex items-center gap-3 p-4 rounded-2xl transition-all hover:scale-[1.02] hover:shadow-md"
              style={{ backgroundColor: "#fff", border: "1.5px solid #EDE8E1" }}>
              <span className="text-xl">{link.emoji}</span>
              <span className="text-sm font-semibold" style={{ color: "#3E3E3E", ...F }}>{link.label}</span>
            </Link>
          ))}
        </div>

      </div>
    </main>
  )
}
