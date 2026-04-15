"use client"

import { useState } from "react"
import { useUser } from "@clerk/nextjs"
import { useRouter } from "next/navigation"
import Link from "next/link"

const F  = { fontFamily: "var(--font-nunito), Nunito, sans-serif" }
const FQ = { fontFamily: "var(--font-quicksand), Quicksand, sans-serif" }

const AGE_GROUPS = [
  { id: "5-8",  label: "5–8 years",  emoji: "🧒", desc: "Early learners" },
  { id: "9-12", label: "9–12 years", emoji: "👦", desc: "Middle childhood" },
  { id: "13+",  label: "13+ years",  emoji: "🧑", desc: "Teens & tweens" },
  { id: "none", label: "No kids yet",emoji: "🌱", desc: "Just exploring" },
]

const TOPICS = [
  { id: "ai-basics",      label: "AI Basics",            emoji: "🤖" },
  { id: "screen-time",    label: "Screen Time",           emoji: "📱" },
  { id: "privacy",        label: "Privacy & Safety",      emoji: "🔒" },
  { id: "creativity",     label: "AI & Creativity",       emoji: "🎨" },
  { id: "bias",           label: "Fairness & Bias",       emoji: "⚖️" },
  { id: "future-jobs",    label: "Future of Work",        emoji: "🚀" },
]

export default function OnboardingPage() {
  const { user, isLoaded } = useUser()
  const router = useRouter()

  const [step, setStep]       = useState(1)
  const [ages, setAges]       = useState<string[]>([])
  const [topics, setTopics]   = useState<string[]>([])
  const [saving, setSaving]   = useState(false)

  const firstName = user?.firstName || "there"

  const toggleAge = (id: string) => {
    if (id === "none") { setAges(["none"]); return }
    setAges(prev => {
      const without = prev.filter(a => a !== "none")
      return without.includes(id) ? without.filter(a => a !== id) : [...without, id]
    })
  }

  const toggleTopic = (id: string) => {
    setTopics(prev => prev.includes(id) ? prev.filter(t => t !== id) : [...prev, id])
  }

  const handleFinish = async () => {
    setSaving(true)
    try {
      // Save preferences to localStorage for now
      localStorage.setItem("pitl_ages",   JSON.stringify(ages))
      localStorage.setItem("pitl_topics", JSON.stringify(topics))
      localStorage.setItem("pitl_onboarded", "true")
    } catch {}
    router.push("/")
  }

  if (!isLoaded) return (
    <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: "#FAF6F0" }}>
      <div className="w-8 h-8 rounded-full border-2 border-t-transparent animate-spin"
        style={{ borderColor: "#7C63B8", borderTopColor: "transparent" }} />
    </div>
  )

  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-4 py-12 relative"
      style={{ backgroundColor: "#FAF6F0" }}>

      {/* Background blobs */}
      <div className="absolute top-0 right-0 w-72 h-72 rounded-full opacity-10 pointer-events-none"
        style={{ background: "radial-gradient(circle, #B9A6E3, transparent)", transform: "translate(30%,-30%)" }} />
      <div className="absolute bottom-0 left-0 w-56 h-56 rounded-full opacity-8 pointer-events-none"
        style={{ background: "radial-gradient(circle, #F3A78E, transparent)", transform: "translate(-30%,30%)" }} />

      <div className="w-full max-w-lg relative z-10">

        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/">
            <img src="/images/pitl-20logo1.png" alt="Parent in the Loop" className="w-14 h-14 object-contain mx-auto mb-2" />
          </Link>
          {/* Step indicators */}
          <div className="flex items-center justify-center gap-2 mt-4">
            {[1, 2, 3].map(s => (
              <div key={s} className="h-2 rounded-full transition-all duration-300"
                style={{
                  width: step === s ? "24px" : "8px",
                  backgroundColor: step >= s ? "#7C63B8" : "#EDE8E1",
                }} />
            ))}
          </div>
        </div>

        <div className="rounded-3xl p-8" style={{ backgroundColor: "#fff", border: "1.5px solid #EDE8E1", boxShadow: "0 4px 32px rgba(0,0,0,0.08)" }}>

          {/* Step 1 — Welcome */}
          {step === 1 && (
            <div className="text-center">
              <div className="text-5xl mb-4">🎉</div>
              <h1 className="text-2xl font-bold mb-2" style={{ color: "#222222", ...FQ }}>
                Welcome, {firstName}!
              </h1>
              <p className="text-sm leading-relaxed mb-8" style={{ color: "#B79D84", ...F }}>
                You&apos;re now part of the Parent in the Loop community. Let&apos;s personalise your experience in 2 quick steps.
              </p>
              <div className="grid grid-cols-1 gap-3 text-left mb-8">
                {[
                  { icon: "🔓", title: "Weekly Family Tip — unlocked", desc: "Get evidence-based AI tips every week" },
                  { icon: "🧠", title: "AI Quiz — unlocked", desc: "Test and grow your family's AI literacy" },
                  { icon: "📊", title: "Progress Tracker — unlocked", desc: "See your learning journey grow" },
                ].map(item => (
                  <div key={item.title} className="flex items-start gap-3 p-3.5 rounded-xl"
                    style={{ backgroundColor: "#FAF6F0", border: "1px solid #EDE8E1" }}>
                    <span className="text-xl flex-shrink-0 mt-0.5">{item.icon}</span>
                    <div>
                      <p className="text-sm font-bold" style={{ color: "#222222", ...F }}>{item.title}</p>
                      <p className="text-xs" style={{ color: "#B79D84", ...F }}>{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
              <button onClick={() => setStep(2)}
                className="w-full py-3.5 rounded-xl font-bold text-sm text-white transition-all hover:scale-[1.01]"
                style={{ backgroundColor: "#7C63B8", boxShadow: "0 4px 14px rgba(124,99,184,0.3)", ...F }}>
                Let&apos;s personalise your experience →
              </button>
            </div>
          )}

          {/* Step 2 — Ages */}
          {step === 2 && (
            <div>
              <h2 className="text-xl font-bold mb-1" style={{ color: "#222222", ...FQ }}>
                How old are your kids?
              </h2>
              <p className="text-sm mb-6" style={{ color: "#B79D84", ...F }}>
                We&apos;ll tailor our articles and tips to the right age group. Select all that apply.
              </p>
              <div className="grid grid-cols-2 gap-3 mb-6">
                {AGE_GROUPS.map(ag => (
                  <button key={ag.id} onClick={() => toggleAge(ag.id)}
                    className="flex flex-col items-center gap-1 p-4 rounded-2xl text-center transition-all hover:scale-[1.02] focus:outline-none"
                    style={{
                      backgroundColor: ages.includes(ag.id) ? "rgba(124,99,184,0.08)" : "#FAF6F0",
                      border: `2px solid ${ages.includes(ag.id) ? "#7C63B8" : "#EDE8E1"}`,
                    }}>
                    <span className="text-2xl">{ag.emoji}</span>
                    <span className="text-sm font-bold" style={{ color: "#222222", ...F }}>{ag.label}</span>
                    <span className="text-xs" style={{ color: "#B79D84", ...F }}>{ag.desc}</span>
                  </button>
                ))}
              </div>
              <button onClick={() => setStep(3)} disabled={ages.length === 0}
                className="w-full py-3.5 rounded-xl font-bold text-sm text-white transition-all hover:scale-[1.01] disabled:opacity-40 disabled:cursor-not-allowed"
                style={{ backgroundColor: "#7C63B8", boxShadow: "0 4px 14px rgba(124,99,184,0.3)", ...F }}>
                Next →
              </button>
              <button onClick={() => setStep(3)} className="w-full text-center text-xs mt-3 hover:underline"
                style={{ color: "#B79D84", ...F }}>Skip for now</button>
            </div>
          )}

          {/* Step 3 — Topics */}
          {step === 3 && (
            <div>
              <h2 className="text-xl font-bold mb-1" style={{ color: "#222222", ...FQ }}>
                What topics interest you most?
              </h2>
              <p className="text-sm mb-6" style={{ color: "#B79D84", ...F }}>
                Pick any that feel relevant — we&apos;ll surface the right articles for you.
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-6">
                {TOPICS.map(t => (
                  <button key={t.id} onClick={() => toggleTopic(t.id)}
                    className="flex flex-col items-center gap-1.5 p-4 rounded-2xl text-center transition-all hover:scale-[1.02] focus:outline-none"
                    style={{
                      backgroundColor: topics.includes(t.id) ? "rgba(243,167,142,0.1)" : "#FAF6F0",
                      border: `2px solid ${topics.includes(t.id) ? "#F3A78E" : "#EDE8E1"}`,
                    }}>
                    <span className="text-xl">{t.emoji}</span>
                    <span className="text-xs font-bold" style={{ color: "#222222", ...F }}>{t.label}</span>
                  </button>
                ))}
              </div>
              <button onClick={handleFinish} disabled={saving}
                className="w-full py-3.5 rounded-xl font-bold text-sm text-white transition-all hover:scale-[1.01] disabled:opacity-60"
                style={{ backgroundColor: "#F3A78E", boxShadow: "0 4px 14px rgba(243,167,142,0.35)", ...F }}>
                {saving ? "Saving…" : "Go to Parent in the Loop 🌱"}
              </button>
              <button onClick={handleFinish} className="w-full text-center text-xs mt-3 hover:underline"
                style={{ color: "#B79D84", ...F }}>Skip for now</button>
            </div>
          )}

        </div>
      </div>
    </main>
  )
}
