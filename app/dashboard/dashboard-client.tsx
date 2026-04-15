"use client"

import { useState, useEffect } from "react"
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

const F  = { fontFamily: "var(--font-nunito), Nunito, sans-serif" }
const FQ = { fontFamily: "var(--font-quicksand), Quicksand, sans-serif" }

function StreakCard({ userId }: { userId: string }) {
  const [streak, setStreak]   = useState(0)
  const [longest, setLongest] = useState(0)
  const [total, setTotal]     = useState(0)
  const [loaded, setLoaded]   = useState(false)
  const [justBroke, setJustBroke] = useState(false)

  useEffect(() => {
    // Record today's visit + fetch streak
    fetch("/api/streak", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId }),
    })
      .then(r => r.json())
      .then(d => {
        setStreak(d.streak ?? 0)
        setLongest(d.longest ?? 0)
        setJustBroke(!!d.broken)
      })
      .catch(() => {})
      .finally(() => setLoaded(true))
  }, [userId])

  const flame = streak >= 7 ? "🔥" : streak >= 3 ? "✨" : "⭐"
  const label = streak === 0 ? "Start your streak today!" :
                streak === 1 ? "First day! Keep it going tomorrow" :
                streak < 7   ? `${streak} days in a row — you're building a habit!` :
                               `${streak} day streak — you're on fire!`

  return (
    <div className="rounded-3xl p-6 mb-5 reveal"
      style={{ background: "linear-gradient(135deg, #F3A78E 0%, #F4D78B 100%)", boxShadow: "0 4px 20px rgba(243,167,142,0.25)" }}>
      <div className="flex items-center justify-between mb-4">
        <p className="text-xs font-bold uppercase tracking-widest" style={{ color: "rgba(255,255,255,0.75)", ...F }}>
          Daily Streak
        </p>
        {streak >= 7 && (
          <span className="text-xs font-bold px-2.5 py-1 rounded-full"
            style={{ backgroundColor: "rgba(255,255,255,0.25)", color: "#fff", ...F }}>
            🏆 Week champion
          </span>
        )}
      </div>

      <div className="flex items-end gap-3 mb-3">
        <span className="text-5xl font-bold text-white" style={FQ}>
          {loaded ? streak : "—"}
        </span>
        <span className="text-3xl mb-1">{flame}</span>
      </div>

      <p className="text-sm text-white mb-4" style={{ ...F, opacity: 0.9 }}>{label}</p>

      {justBroke && (
        <div className="text-xs px-3 py-2 rounded-xl mb-3"
          style={{ backgroundColor: "rgba(255,255,255,0.2)", color: "#fff", ...F }}>
          💔 Your streak reset — no worries! Every day is a fresh start.
        </div>
      )}

      <div className="flex gap-4">
        <div className="text-center">
          <p className="text-xl font-bold text-white" style={FQ}>{loaded ? longest : "—"}</p>
          <p className="text-xs" style={{ color: "rgba(255,255,255,0.7)", ...F }}>Best streak</p>
        </div>
        <div className="w-px" style={{ backgroundColor: "rgba(255,255,255,0.3)" }} />
        <div className="text-center">
          <p className="text-xl font-bold text-white" style={FQ}>{loaded ? total : "—"}</p>
          <p className="text-xs" style={{ color: "rgba(255,255,255,0.7)", ...F }}>Total days</p>
        </div>
      </div>

      {/* Streak dots — last 7 days visual */}
      <div className="flex gap-1.5 mt-4">
        {["M","T","W","T","F","S","S"].map((day, i) => {
          const active = i < Math.min(streak, 7)
          return (
            <div key={i} className="flex-1 flex flex-col items-center gap-1">
              <div className="w-full h-2 rounded-full"
                style={{ backgroundColor: active ? "rgba(255,255,255,0.9)" : "rgba(255,255,255,0.25)" }} />
              <span className="text-xs" style={{ color: "rgba(255,255,255,0.6)", fontSize: "9px" }}>{day}</span>
            </div>
          )
        })}
      </div>
    </div>
  )
}

function QuickStatsCard({ userId }: { userId: string }) {
  const [ages, setAges]     = useState<string[]>([])
  const [topics, setTopics] = useState<string[]>([])

  useEffect(() => {
    try {
      const a = localStorage.getItem("pitl_ages")
      const t = localStorage.getItem("pitl_topics")
      if (a) setAges(JSON.parse(a))
      if (t) setTopics(JSON.parse(t))
    } catch {}
  }, [])

  const ageLabel = ages.length === 0 ? null :
    ages.includes("none") ? "No kids" :
    ages.map(a => a === "5-8" ? "5–8 yrs" : a === "9-12" ? "9–12 yrs" : "13+").join(", ")

  return (
    <div className="rounded-2xl p-5 mb-5 reveal"
      style={{ backgroundColor: "#fff", border: "1.5px solid #EDE8E1" }}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-bold" style={{ color: "#222222", ...FQ }}>Your Profile</h3>
        <Link href="/onboarding" className="text-xs font-semibold hover:underline" style={{ color: "#7C63B8", ...F }}>
          Edit preferences →
        </Link>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="p-3 rounded-xl" style={{ backgroundColor: "#FAF6F0" }}>
          <p className="text-xs mb-1" style={{ color: "#B79D84", ...F }}>Kids' ages</p>
          <p className="text-sm font-bold" style={{ color: "#222222", ...F }}>
            {ageLabel || "Not set"}
          </p>
        </div>
        <div className="p-3 rounded-xl" style={{ backgroundColor: "#FAF6F0" }}>
          <p className="text-xs mb-1" style={{ color: "#B79D84", ...F }}>Interests</p>
          <p className="text-sm font-bold" style={{ color: "#222222", ...F }}>
            {topics.length > 0 ? `${topics.length} topics` : "Not set"}
          </p>
        </div>
      </div>
      {(!ageLabel || topics.length === 0) && (
        <Link href="/onboarding"
          className="mt-3 flex items-center gap-2 text-xs font-semibold px-3 py-2 rounded-xl transition-all hover:scale-[1.01]"
          style={{ backgroundColor: "rgba(124,99,184,0.06)", color: "#7C63B8", border: "1px dashed rgba(124,99,184,0.3)", ...F }}>
          <span>✏️</span>
          <span>Personalise your content recommendations</span>
        </Link>
      )}
    </div>
  )
}

export default function DashboardClient({ user, isSubscribed, subscribedAt, isAdmin }: Props) {
  const router   = useRouter()
  const { signOut } = useClerk()
  const [subscribed, setSubscribed]   = useState(isSubscribed)
  const [subscribing, setSubscribing] = useState(false)
  const [subError, setSubError]       = useState("")
  const [signingOut, setSigningOut]   = useState(false)
  const [activeTab, setActiveTab]     = useState<"home"|"progress"|"account">("home")

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
    await signOut()
    router.push("/")
    router.refresh()
  }

  return (
    <main className="min-h-screen" style={{ backgroundColor: "#FAF6F0" }}>

      {/* Top nav */}
      <div className="sticky top-0 z-30 px-4 sm:px-6 py-3"
        style={{ backgroundColor: "rgba(250,246,240,0.95)", backdropFilter: "blur(12px)", borderBottom: "1px solid #EDE8E1" }}>
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <img src="/images/pitl-20logo1.png" alt="Parent in the Loop" className="w-8 h-8 object-contain" />
            <span className="font-bold text-sm hidden sm:block" style={{ color: "#222222", ...FQ }}>Parent in the Loop</span>
          </Link>
          <div className="flex items-center gap-2">
            {isAdmin && (
              <Link href="/admin" className="text-xs font-bold px-3 py-1.5 rounded-lg text-white"
                style={{ backgroundColor: "#7C63B8", ...F }}>⚡ Admin</Link>
            )}
            <button onClick={handleSignOut} disabled={signingOut}
              className="text-xs font-semibold px-3 py-1.5 rounded-lg transition-all hover:scale-105"
              style={{ color: "#B79D84", border: "1.5px solid #EDE8E1", backgroundColor: "#fff", ...F }}>
              {signingOut ? "…" : "Sign out"}
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8">

        {/* Welcome hero */}
        <div className="rounded-3xl p-7 mb-5 reveal"
          style={{ background: "linear-gradient(135deg, #7C63B8 0%, #B9A6E3 100%)", boxShadow: "0 8px 32px rgba(124,99,184,0.2)" }}>
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl flex-shrink-0"
              style={{ backgroundColor: "rgba(255,255,255,0.2)" }}>👋</div>
            <div className="flex-1 min-w-0">
              <h1 className="text-xl font-bold text-white truncate" style={FQ}>Hey, {displayName}!</h1>
              <p className="text-sm" style={{ color: "rgba(255,255,255,0.75)", ...F }}>{user.email}</p>
            </div>
          </div>
          {subscribed && (
            <div className="mt-4 flex items-center gap-2 px-3 py-2 rounded-xl"
              style={{ backgroundColor: "rgba(255,255,255,0.15)" }}>
              <span>✅</span>
              <p className="text-sm font-semibold text-white" style={F}>
                Community member {subscribedAt ? `since ${new Date(subscribedAt).toLocaleDateString("en-US",{month:"long",year:"numeric"})}` : ""}
              </p>
            </div>
          )}
        </div>

        {/* Tab nav */}
        <div className="flex gap-2 mb-6 p-1 rounded-2xl" style={{ backgroundColor: "#fff", border: "1.5px solid #EDE8E1" }}>
          {([
            { id: "home",     label: "Home",     emoji: "🏠" },
            { id: "progress", label: "Progress",  emoji: "📊" },
            { id: "account",  label: "Account",   emoji: "👤" },
          ] as const).map(tab => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)}
              className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs font-bold transition-all"
              style={{
                backgroundColor: activeTab === tab.id ? "#7C63B8" : "transparent",
                color: activeTab === tab.id ? "#fff" : "#B79D84",
                ...F,
              }}>
              <span>{tab.emoji}</span>
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* HOME TAB */}
        {activeTab === "home" && (
          <div>
            <StreakCard userId={user.id} />
            <QuickStatsCard userId={user.id} />

            {/* Quick actions */}
            <div className="grid grid-cols-2 gap-3 mb-5 reveal">
              {[
                { href: "/#articles",  label: "Read Articles",      emoji: "📝", color: "#7C63B8", bg: "rgba(124,99,184,0.08)" },
                { href: "/#quiz",      label: "Take the Quiz",      emoji: "🧠", color: "#F3A78E", bg: "rgba(243,167,142,0.1)" },
                { href: "/#tip",       label: "This Week's Tip",    emoji: "✨", color: "#F4D78B", bg: "rgba(244,215,139,0.15)" },
                { href: "/dashboard?tab=progress", label: "My Progress", emoji: "📊", color: "#A6B6A1", bg: "rgba(166,182,161,0.15)" },
              ].map(item => (
                <Link key={item.label} href={item.href}
                  className="flex items-center gap-3 p-4 rounded-2xl transition-all hover:scale-[1.02] hover:shadow-sm"
                  style={{ backgroundColor: item.bg, border: `1.5px solid ${item.color}22` }}>
                  <span className="text-xl">{item.emoji}</span>
                  <span className="text-sm font-bold" style={{ color: item.color, ...F }}>{item.label}</span>
                </Link>
              ))}
            </div>

            {/* Newsletter subscribe if not subscribed */}
            {!subscribed && (
              <div className="rounded-2xl p-5 mb-5 reveal"
                style={{ backgroundColor: "#fff", border: "1.5px solid #EDE8E1" }}>
                <h3 className="font-bold text-base mb-1" style={{ color: "#222222", ...FQ }}>📬 Join the newsletter</h3>
                <p className="text-sm mb-4" style={{ color: "#B79D84", ...F }}>
                  Get weekly AI literacy tips for families, sent to <strong>{user.email}</strong>
                </p>
                {subError && (
                  <div className="rounded-xl px-3 py-2 mb-3 text-xs" role="alert"
                    style={{ backgroundColor: "rgba(243,167,142,0.12)", color: "#c97a5a", ...F }}>
                    ⚠️ {subError}
                  </div>
                )}
                <button onClick={handleSubscribe} disabled={subscribing}
                  className="w-full py-3 rounded-xl font-bold text-sm text-white transition-all hover:scale-[1.01] disabled:opacity-60"
                  style={{ backgroundColor: "#F3A78E", boxShadow: "0 4px 14px rgba(243,167,142,0.35)", ...F }}>
                  {subscribing ? "Subscribing…" : "Subscribe Free ✨"}
                </button>
              </div>
            )}

            {/* Trusted resources */}
            <div className="rounded-2xl p-5 reveal" style={{ backgroundColor: "#fff", border: "1.5px solid #EDE8E1" }}>
              <h3 className="font-bold text-sm mb-3" style={{ color: "#222222", ...FQ }}>🔗 Trusted resources</h3>
              <div className="space-y-2">
                {[
                  { label: "Common Sense Media — Age ratings & reviews", href: "https://www.commonsensemedia.org", tag: "Trusted partner" },
                  { label: "MIT AI Literacy — Free activities for families", href: "https://raise.mit.edu/resources.html", tag: "MIT" },
                  { label: "Google's Guardian Guide to AI", href: "https://edu.google.com/intl/ALL_uk/for-parents/", tag: "Google" },
                ].map(r => (
                  <a key={r.label} href={r.href} target="_blank" rel="noopener noreferrer"
                    className="flex items-center justify-between p-3 rounded-xl transition-all hover:scale-[1.01]"
                    style={{ backgroundColor: "#FAF6F0", border: "1px solid #EDE8E1" }}>
                    <span className="text-xs font-semibold" style={{ color: "#3E3E3E", ...F }}>{r.label}</span>
                    <span className="text-xs px-2 py-0.5 rounded-full ml-2 flex-shrink-0"
                      style={{ backgroundColor: "rgba(124,99,184,0.1)", color: "#7C63B8", ...F }}>{r.tag}</span>
                  </a>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* PROGRESS TAB */}
        {activeTab === "progress" && (
          <div className="reveal">
            <ProgressTracker />
          </div>
        )}

        {/* ACCOUNT TAB */}
        {activeTab === "account" && (
          <div className="reveal space-y-4">
            {/* Profile card */}
            <div className="rounded-2xl p-5" style={{ backgroundColor: "#fff", border: "1.5px solid #EDE8E1" }}>
              <h3 className="font-bold text-base mb-4" style={{ color: "#222222", ...FQ }}>Your Account</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center py-2" style={{ borderBottom: "1px solid #EDE8E1" }}>
                  <span className="text-xs" style={{ color: "#B79D84", ...F }}>Name</span>
                  <span className="text-sm font-semibold" style={{ color: "#222222", ...F }}>{displayName}</span>
                </div>
                <div className="flex justify-between items-center py-2" style={{ borderBottom: "1px solid #EDE8E1" }}>
                  <span className="text-xs" style={{ color: "#B79D84", ...F }}>Email</span>
                  <span className="text-sm font-semibold" style={{ color: "#222222", ...F }}>{user.email}</span>
                </div>
                <div className="flex justify-between items-center py-2">
                  <span className="text-xs" style={{ color: "#B79D84", ...F }}>Newsletter</span>
                  <span className="text-sm font-semibold" style={{ color: subscribed ? "#4d7a49" : "#B79D84", ...F }}>
                    {subscribed ? "✅ Subscribed" : "Not subscribed"}
                  </span>
                </div>
              </div>
            </div>

            {/* Preferences */}
            <div className="rounded-2xl p-5" style={{ backgroundColor: "#fff", border: "1.5px solid #EDE8E1" }}>
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-bold text-base" style={{ color: "#222222", ...FQ }}>Preferences</h3>
                <Link href="/onboarding" className="text-xs font-semibold hover:underline" style={{ color: "#7C63B8", ...F }}>
                  Edit →
                </Link>
              </div>
              <p className="text-xs" style={{ color: "#B79D84", ...F }}>
                Set your kids' ages and topic preferences to get personalised recommendations.
              </p>
            </div>

            {/* Links */}
            <div className="rounded-2xl overflow-hidden" style={{ border: "1.5px solid #EDE8E1" }}>
              {[
                { href: "/privacy", label: "Privacy Policy",   emoji: "🔒" },
                { href: "/terms",   label: "Terms of Use",     emoji: "📄" },
                { href: "/coppa",   label: "COPPA Notice",     emoji: "👶" },
                { href: "/contact", label: "Contact Support",  emoji: "💬" },
              ].map((item, i, arr) => (
                <Link key={item.label} href={item.href}
                  className="flex items-center gap-3 px-5 py-3.5 transition-all hover:bg-[#FAF6F0]"
                  style={{ borderBottom: i < arr.length - 1 ? "1px solid #EDE8E1" : "none", backgroundColor: "#fff" }}>
                  <span>{item.emoji}</span>
                  <span className="text-sm font-semibold flex-1" style={{ color: "#3E3E3E", ...F }}>{item.label}</span>
                  <span style={{ color: "#B79D84" }}>›</span>
                </Link>
              ))}
            </div>

            {/* Sign out */}
            <button onClick={handleSignOut} disabled={signingOut}
              className="w-full py-3.5 rounded-2xl font-bold text-sm transition-all hover:scale-[1.01] disabled:opacity-60"
              style={{ backgroundColor: "rgba(243,167,142,0.1)", color: "#c97a5a", border: "1.5px solid rgba(243,167,142,0.3)", ...F }}>
              {signingOut ? "Signing out…" : "Sign Out"}
            </button>
          </div>
        )}

      </div>
    </main>
  )
}
