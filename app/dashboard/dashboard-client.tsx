"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { createSupabaseBrowserClient } from "@/lib/supabase-browser"

interface Props {
  user:         { id: string; email: string; name: string }
  isSubscribed: boolean
  subscribedAt: string | null
}

export default function DashboardClient({ user, isSubscribed, subscribedAt }: Props) {
  const router   = useRouter()
  const supabase = createSupabaseBrowserClient()
  const [subscribing, setSubscribing]   = useState(false)
  const [subscribed, setSubscribed]     = useState(isSubscribed)
  const [subError, setSubError]         = useState("")
  const [signingOut, setSigningOut]     = useState(false)

  const displayName = user.name || user.email.split("@")[0]

  const handleSubscribe = async () => {
    setSubscribing(true)
    setSubError("")
    try {
      const res = await fetch("/api/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: user.email }),
      })
      const data = await res.json()
      if (res.ok || res.status === 409) {
        setSubscribed(true)
      } else {
        setSubError(data?.error || "Something went wrong. Please try again.")
      }
    } catch {
      setSubError("Network error. Please try again.")
    }
    setSubscribing(false)
  }

  const handleSignOut = async () => {
    setSigningOut(true)
    await supabase.auth.signOut()
    router.push("/")
    router.refresh()
  }

  return (
    <main className="min-h-screen px-4 sm:px-6 lg:px-8 py-12 relative" style={{ backgroundColor: "#FAF6F0" }}>

      {/* Background blob */}
      <div className="absolute top-0 right-0 w-96 h-96 rounded-full opacity-10 pointer-events-none"
        style={{ background: "radial-gradient(circle, #B9A6E3, transparent)", transform: "translate(30%,-30%)" }} aria-hidden="true" />

      <div className="max-w-2xl mx-auto relative z-10">

        {/* Header */}
        <div className="flex items-center justify-between mb-10">
          <Link href="/" className="flex items-center gap-2">
            <img src="/images/pitl-20logo1.png" alt="Parent in the Loop" className="w-9 h-9 object-contain" />
            <span className="font-bold text-sm hidden sm:block" style={{ color: "#222222", fontFamily: "var(--font-quicksand), Quicksand, sans-serif" }}>
              Parent in the Loop
            </span>
          </Link>
          <button onClick={handleSignOut} disabled={signingOut}
            className="text-sm font-semibold px-4 py-2 rounded-xl transition-all hover:scale-105 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#F3A78E]"
            style={{ color: "#B79D84", border: "1.5px solid #EDE8E1", backgroundColor: "#fff", fontFamily: "var(--font-nunito), Nunito, sans-serif" }}>
            {signingOut ? "Signing out…" : "Sign out"}
          </button>
        </div>

        {/* Welcome card */}
        <div className="rounded-3xl p-7 mb-6"
          style={{ background: "linear-gradient(135deg, #7C63B8 0%, #B9A6E3 100%)", boxShadow: "0 8px 32px rgba(124,99,184,0.25)" }}>
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl flex-shrink-0"
              style={{ backgroundColor: "rgba(255,255,255,0.2)" }}>
              👋
            </div>
            <div>
              <h1 className="text-xl font-bold text-white" style={{ fontFamily: "var(--font-quicksand), Quicksand, sans-serif" }}>
                Welcome, {displayName}!
              </h1>
              <p className="text-sm" style={{ color: "rgba(255,255,255,0.8)", fontFamily: "var(--font-nunito), Nunito, sans-serif" }}>
                {user.email}
              </p>
            </div>
          </div>
        </div>

        {/* Subscription status */}
        <div className="rounded-3xl p-7 mb-6" style={{ backgroundColor: "#fff", border: "1.5px solid #EDE8E1", boxShadow: "0 2px 16px rgba(0,0,0,0.06)" }}>
          <h2 className="text-lg font-bold mb-4" style={{ color: "#222222", fontFamily: "var(--font-quicksand), Quicksand, sans-serif" }}>
            Newsletter Subscription
          </h2>

          {subscribed ? (
            <div>
              <div className="flex items-center gap-3 p-4 rounded-2xl mb-4"
                style={{ backgroundColor: "rgba(166,182,161,0.15)", border: "1.5px solid rgba(166,182,161,0.4)" }}>
                <span className="text-2xl">✅</span>
                <div>
                  <p className="font-bold text-sm" style={{ color: "#4d7a49", fontFamily: "var(--font-nunito), Nunito, sans-serif" }}>
                    You&apos;re subscribed!
                  </p>
                  <p className="text-xs" style={{ color: "#6b7a68", fontFamily: "var(--font-nunito), Nunito, sans-serif" }}>
                    {subscribedAt
                      ? `Joined ${new Date(subscribedAt).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}`
                      : "You're part of the community"}
                  </p>
                </div>
              </div>
              <div className="rounded-xl p-4" style={{ backgroundColor: "#FAF6F0" }}>
                <p className="text-sm font-semibold mb-2" style={{ color: "#222222", fontFamily: "var(--font-nunito), Nunito, sans-serif" }}>
                  📬 What to expect every week:
                </p>
                <ul className="space-y-1.5">
                  {[
                    "📝 A fresh AI literacy topic",
                    "💬 A family conversation starter",
                    "🎯 A hands-on activity (under 10 min)",
                    "⏱️ Under 5 minutes to read",
                  ].map((item) => (
                    <li key={item} className="text-xs" style={{ color: "#3E3E3E", fontFamily: "var(--font-nunito), Nunito, sans-serif" }}>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ) : (
            <div>
              <p className="text-sm mb-5" style={{ color: "#3E3E3E", fontFamily: "var(--font-nunito), Nunito, sans-serif" }}>
                You&apos;re not subscribed yet. Join the Parent in the Loop community to receive weekly AI literacy
                insights, family activities, and conversation starters — directly to <strong>{user.email}</strong>.
              </p>

              {subError && (
                <div className="rounded-xl px-4 py-3 mb-4 text-sm" role="alert"
                  style={{ backgroundColor: "rgba(243,167,142,0.12)", border: "1px solid rgba(243,167,142,0.4)", color: "#c97a5a", fontFamily: "var(--font-nunito), Nunito, sans-serif" }}>
                  ⚠️ {subError}
                </div>
              )}

              <button onClick={handleSubscribe} disabled={subscribing}
                className="w-full py-3.5 rounded-xl font-bold text-sm text-white transition-all hover:scale-[1.01] active:scale-[0.99] focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#F3A78E] disabled:opacity-60"
                style={{ backgroundColor: "#F3A78E", fontFamily: "var(--font-nunito), Nunito, sans-serif", boxShadow: "0 4px 14px rgba(243,167,142,0.35)" }}>
                {subscribing ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin" aria-hidden="true" />
                    Subscribing…
                  </span>
                ) : "Subscribe to Parent in the Loop ✨"}
              </button>

              <p className="text-xs text-center mt-3" style={{ color: "#B79D84", fontFamily: "var(--font-nunito), Nunito, sans-serif" }}>
                Free forever · Unsubscribe anytime · We never share your email
              </p>
            </div>
          )}
        </div>

        {/* Quick links */}
        <div className="grid grid-cols-2 gap-4">
          {[
            { href: "/#articles", label: "Browse Articles", emoji: "📝" },
            { href: "/#quiz",     label: "Take the Quiz",   emoji: "🧠" },
            { href: "/contact",   label: "Contact Us",      emoji: "💬" },
            { href: "https://parentintheloop.substack.com", label: "Substack", emoji: "📮", external: true },
          ].map((link) => (
            <Link key={link.label} href={link.href}
              target={link.external ? "_blank" : "_self"}
              rel={link.external ? "noopener noreferrer" : ""}
              className="flex items-center gap-3 p-4 rounded-2xl transition-all hover:scale-[1.02] hover:shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-[#7C63B8]"
              style={{ backgroundColor: "#fff", border: "1.5px solid #EDE8E1" }}>
              <span className="text-xl">{link.emoji}</span>
              <span className="text-sm font-semibold" style={{ color: "#3E3E3E", fontFamily: "var(--font-nunito), Nunito, sans-serif" }}>
                {link.label}
              </span>
            </Link>
          ))}
        </div>
      </div>
    </main>
  )
}
