"use client"

import { useEffect, useState } from "react"
import { useUser } from "@clerk/nextjs"
import Link from "next/link"

interface Tip {
  id: number
  week: number
  tip: string
  category: string
  emoji: string
}

const CATEGORY_COLORS: Record<string, { bg: string; text: string }> = {
  "AI Literacy":          { bg: "rgba(124,99,184,0.12)", text: "#7C63B8" },
  Safety:                 { bg: "rgba(58,110,138,0.12)",  text: "#3a6e8a" },
  Parenting:              { bg: "rgba(243,167,142,0.15)", text: "#c97a5a" },
  "Family Conversations": { bg: "rgba(77,122,73,0.12)",   text: "#4d7a49" },
}

function LockedTip() {
  return (
    <section
      className="py-14 px-4 sm:px-6 lg:px-8"
      style={{ backgroundColor: "#fff" }}
      aria-label="Weekly tip — sign in required"
    >
      <div className="max-w-3xl mx-auto reveal">
        {/* Label */}
        <div className="flex items-center justify-center gap-2 mb-6">
          <span className="text-xl animate-sparkle" aria-hidden="true">✨</span>
          <p className="text-xs font-bold tracking-widest uppercase"
            style={{ color: "#B79D84", fontFamily: "var(--font-nunito), Nunito, sans-serif" }}>
            This Week&apos;s Family Tip
          </p>
          <span className="text-xl animate-sparkle" style={{ animationDelay: "0.5s" }} aria-hidden="true">✨</span>
        </div>

        {/* Locked card */}
        <div
          className="rounded-3xl p-8 relative overflow-hidden"
          style={{
            background: "linear-gradient(135deg, #FAF6F0 0%, rgba(185,166,227,0.12) 100%)",
            border: "2px solid rgba(124,99,184,0.15)",
          }}
        >
          {/* Decorative blob */}
          <div
            className="absolute top-0 right-0 w-40 h-40 rounded-full pointer-events-none opacity-20"
            style={{ background: "radial-gradient(circle, #F4D78B, transparent)", transform: "translate(20%,-20%)" }}
            aria-hidden="true"
          />

          <div className="relative z-10 flex flex-col sm:flex-row items-start gap-5">
            {/* Lock icon */}
            <div
              className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl flex-shrink-0"
              style={{ backgroundColor: "rgba(124,99,184,0.1)" }}
              aria-hidden="true"
            >
              🔒
            </div>

            <div className="flex-1">
              <p
                className="text-lg font-bold mb-2"
                style={{ color: "#222222", fontFamily: "var(--font-quicksand), Quicksand, sans-serif" }}
              >
                This week&apos;s family AI tip is waiting for you!
              </p>
              <p
                className="text-sm leading-relaxed mb-5"
                style={{ color: "#B79D84", fontFamily: "var(--font-nunito), Nunito, sans-serif" }}
              >
                Join thousands of parents getting weekly, evidence-based guidance on raising AI-literate kids.
                Sign in free to unlock this week&apos;s tip and all future ones.
              </p>

              {/* Blurred preview */}
              <div
                className="rounded-xl px-4 py-3 mb-5 select-none"
                style={{
                  backgroundColor: "rgba(124,99,184,0.06)",
                  border: "1px dashed rgba(124,99,184,0.2)",
                  filter: "blur(4px)",
                  userSelect: "none",
                  pointerEvents: "none",
                }}
                aria-hidden="true"
              >
                <p className="text-sm" style={{ color: "#3E3E3E", fontFamily: "var(--font-nunito), Nunito, sans-serif" }}>
                  Ask your child to name three things in your home that use AI. Then ask: how do you think it learned to do that? This simple question opens a rich conversation about training data, patterns...
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <Link href="/sign-in"
                    className="flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-bold text-sm text-white transition-all hover:scale-105 active:scale-95 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#7C63B8]"
                    style={{ backgroundColor: "#7C63B8", fontFamily: "var(--font-nunito), Nunito, sans-serif", boxShadow: "0 4px 14px rgba(124,99,184,0.3)" }}
                  >
                    🔓 Sign In to Unlock
                  </Link>
                <Link
                  href="/sign-up"
                  className="flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-bold text-sm border-2 transition-all hover:scale-105 active:scale-95"
                  style={{ borderColor: "#F3A78E", color: "#F3A78E", fontFamily: "var(--font-nunito), Nunito, sans-serif" }}
                >
                  Create Free Account ✨
                </Link>
              </div>
            </div>
          </div>
        </div>

        <p className="text-center text-xs mt-4" style={{ color: "#B79D84", fontFamily: "var(--font-nunito), Nunito, sans-serif" }}>
          Tips rotate weekly · Free forever · <span style={{ color: "#B9A6E3" }}>#ParentInTheLoop</span>
        </p>
      </div>
    </section>
  )
}

function UnlockedTip() {
  const [tip, setTip]     = useState<Tip | null>(null)
  const [saved, setSaved]   = useState(false)
  const [shared, setShared] = useState(false)

  useEffect(() => {
    fetch("/api/weekly-tip")
      .then((r) => r.json())
      .then((d) => setTip(d.tip))
      .catch(() => {})
  }, [])

  const handleSave = () => {
    if (!tip) return
    setSaved(true)
    const savedList = JSON.parse(localStorage.getItem("saved-tips") || "[]")
    if (!savedList.includes(tip.id)) {
      localStorage.setItem("saved-tips", JSON.stringify([...savedList, tip.id]))
    }
    setTimeout(() => setSaved(false), 2000)
  }

  const handleShare = async () => {
    if (!tip) return
    const text = `This week's family AI tip: ${tip.tip} via @parentintheloop #ParentInTheLoop #FamilyAI`
    if (navigator.share) {
      try { await navigator.share({ text }) } catch {}
    } else {
      await navigator.clipboard.writeText(text)
      setShared(true)
      setTimeout(() => setShared(false), 2000)
    }
  }

  if (!tip) return (
    <section className="py-14 px-4 sm:px-6 lg:px-8" style={{ backgroundColor: "#fff" }}>
      <div className="max-w-3xl mx-auto animate-pulse">
        <div className="h-6 w-48 rounded-full mx-auto mb-6" style={{ backgroundColor: "#EDE8E1" }} />
        <div className="rounded-3xl h-40" style={{ backgroundColor: "#EDE8E1" }} />
      </div>
    </section>
  )

  const cc = CATEGORY_COLORS[tip.category] ?? { bg: "rgba(124,99,184,0.12)", text: "#7C63B8" }

  return (
    <section
      className="py-14 px-4 sm:px-6 lg:px-8"
      style={{ backgroundColor: "#fff" }}
      aria-label="Weekly tip for families"
    >
      <div className="max-w-3xl mx-auto reveal">
        <div className="flex items-center justify-center gap-2 mb-6">
          <span className="text-xl animate-sparkle" aria-hidden="true">✨</span>
          <p className="text-xs font-bold tracking-widest uppercase"
            style={{ color: "#B79D84", fontFamily: "var(--font-nunito), Nunito, sans-serif" }}>
            This Week&apos;s Family Tip
          </p>
          <span className="text-xl animate-sparkle" style={{ animationDelay: "0.5s" }} aria-hidden="true">✨</span>
        </div>

        {/* Unlocked badge */}
        <div className="flex justify-center mb-4">
          <span
            className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold"
            style={{ backgroundColor: "rgba(77,122,73,0.12)", color: "#4d7a49", fontFamily: "var(--font-nunito), Nunito, sans-serif" }}
          >
            ✅ Unlocked for members
          </span>
        </div>

        <div
          className="rounded-3xl p-8 relative overflow-hidden"
          style={{
            background: "linear-gradient(135deg, #FAF6F0 0%, rgba(185,166,227,0.12) 100%)",
            border: "2px solid rgba(124,99,184,0.15)",
          }}
        >
          <div
            className="absolute top-0 right-0 w-40 h-40 rounded-full pointer-events-none opacity-20"
            style={{ background: "radial-gradient(circle, #F4D78B, transparent)", transform: "translate(20%,-20%)" }}
            aria-hidden="true"
          />
          <div className="relative z-10 flex flex-col sm:flex-row items-start gap-5">
            <div
              className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl flex-shrink-0 animate-float"
              style={{ backgroundColor: cc.bg }}
              aria-hidden="true"
            >
              {tip.emoji}
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-xs font-bold px-2.5 py-1 rounded-full"
                  style={{ backgroundColor: cc.bg, color: cc.text, fontFamily: "var(--font-nunito), Nunito, sans-serif" }}>
                  {tip.category}
                </span>
              </div>
              <p className="text-lg leading-relaxed"
                style={{ color: "#222222", fontFamily: "var(--font-nunito), Nunito, sans-serif", fontWeight: 600 }}>
                {tip.tip}
              </p>
              <div className="flex items-center gap-3 mt-5">
                <button onClick={handleSave}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-bold transition-all hover:scale-105 active:scale-95 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#F4D78B]"
                  style={{ backgroundColor: saved ? "#F4D78B" : "rgba(244,215,139,0.2)", color: saved ? "#222" : "#B79D84", fontFamily: "var(--font-nunito), Nunito, sans-serif" }}
                  aria-label="Save this tip">
                  {saved ? "⭐ Saved!" : "☆ Save tip"}
                </button>
                <button onClick={handleShare}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-bold transition-all hover:scale-105 active:scale-95 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#F3A78E]"
                  style={{ backgroundColor: shared ? "#F3A78E" : "rgba(243,167,142,0.15)", color: shared ? "#fff" : "#c97a5a", fontFamily: "var(--font-nunito), Nunito, sans-serif" }}
                  aria-label="Share this tip">
                  {shared ? "✓ Copied!" : "↗ Share"}
                </button>
              </div>
            </div>
          </div>
        </div>

        <p className="text-center text-xs mt-4" style={{ color: "#B79D84", fontFamily: "var(--font-nunito), Nunito, sans-serif" }}>
          Tips rotate weekly · <span style={{ color: "#B9A6E3" }}>#ParentInTheLoop</span>
        </p>
      </div>
    </section>
  )
}

export default function WeeklyTip() {
  const { isSignedIn, isLoaded } = useUser()

  // Show skeleton while Clerk loads
  if (!isLoaded) return (
    <section className="py-14 px-4 sm:px-6 lg:px-8" style={{ backgroundColor: "#fff" }}>
      <div className="max-w-3xl mx-auto animate-pulse">
        <div className="h-6 w-48 rounded-full mx-auto mb-6" style={{ backgroundColor: "#EDE8E1" }} />
        <div className="rounded-3xl h-48" style={{ backgroundColor: "#EDE8E1" }} />
      </div>
    </section>
  )

  return isSignedIn ? <UnlockedTip /> : <LockedTip />
}
