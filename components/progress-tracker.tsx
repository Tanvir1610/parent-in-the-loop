"use client"

import { useState, useEffect } from "react"

const AI_TOPICS = [
  { id: "what-is-ai",       label: "What is AI?",           emoji: "🤖", category: "Foundations" },
  { id: "algorithms",       label: "Algorithms",            emoji: "⚙️", category: "Foundations" },
  { id: "machine-learning", label: "Machine Learning",      emoji: "🧠", category: "Foundations" },
  { id: "data-privacy",     label: "Data & Privacy",        emoji: "🔒", category: "Safety" },
  { id: "ai-bias",          label: "AI Bias & Fairness",    emoji: "⚖️", category: "Ethics" },
  { id: "digital-footprint",label: "Digital Footprint",     emoji: "👣", category: "Safety" },
  { id: "ai-creativity",    label: "AI & Creativity",       emoji: "🎨", category: "Skills" },
  { id: "critical-thinking",label: "Critical Thinking",     emoji: "💡", category: "Skills" },
  { id: "ai-environment",   label: "AI & Environment",      emoji: "🌱", category: "Ethics" },
  { id: "screen-time",      label: "Healthy Screen Time",   emoji: "📱", category: "Safety" },
  { id: "ai-emotions",      label: "Does AI Feel?",         emoji: "❤️", category: "Ethics" },
  { id: "future-of-ai",     label: "Future of AI",          emoji: "🚀", category: "Foundations" },
]

const CATEGORY_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  Foundations: { bg: "rgba(124,99,184,0.1)",   text: "#7C63B8", border: "rgba(124,99,184,0.3)" },
  Safety:      { bg: "rgba(58,110,138,0.1)",   text: "#3a6e8a", border: "rgba(58,110,138,0.3)" },
  Ethics:      { bg: "rgba(77,122,73,0.1)",    text: "#4d7a49", border: "rgba(77,122,73,0.3)" },
  Skills:      { bg: "rgba(201,122,90,0.12)",  text: "#c97a5a", border: "rgba(201,122,90,0.3)" },
}

interface CompletedTopic {
  topic: string
  category: string
  completed_at: string
}

interface RecentRead {
  slug: string
  title: string
  category: string
  read_at: string
}

export default function ProgressTracker() {
  const [completed, setCompleted] = useState<Set<string>>(new Set())
  const [recentReads, setRecentReads] = useState<RecentRead[]>([])
  const [loading, setLoading] = useState(true)
  const [toggling, setToggling] = useState<string | null>(null)

  useEffect(() => {
    fetch("/api/progress")
      .then((r) => r.json())
      .then((d) => {
        if (d.progress) {
          setCompleted(new Set((d.progress as CompletedTopic[]).map((p) => p.topic)))
        }
        if (d.history) setRecentReads(d.history)
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const toggle = async (topicId: string, category: string) => {
    setToggling(topicId)
    const isDone = completed.has(topicId)

    // Optimistic update
    setCompleted((prev) => {
      const next = new Set(prev)
      isDone ? next.delete(topicId) : next.add(topicId)
      return next
    })

    try {
      if (isDone) {
        await fetch("/api/progress", {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ topic: topicId }),
        })
      } else {
        await fetch("/api/progress", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ type: "progress", topic: topicId, category }),
        })
      }
    } catch {
      // Revert on error
      setCompleted((prev) => {
        const next = new Set(prev)
        isDone ? next.add(topicId) : next.delete(topicId)
        return next
      })
    } finally {
      setToggling(null)
    }
  }

  const pct = Math.round((completed.size / AI_TOPICS.length) * 100)
  const grouped = AI_TOPICS.reduce<Record<string, typeof AI_TOPICS>>((acc, t) => {
    if (!acc[t.category]) acc[t.category] = []
    acc[t.category].push(t)
    return acc
  }, {})

  const circumference = 2 * Math.PI * 36
  const dashOffset = circumference - (pct / 100) * circumference

  return (
    <div className="rounded-3xl p-7 mb-6" style={{ backgroundColor: "#fff", border: "1.5px solid #EDE8E1", boxShadow: "0 2px 16px rgba(0,0,0,0.06)" }}>
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h2 className="text-lg font-bold" style={{ color: "#222222", fontFamily: "var(--font-quicksand), Quicksand, sans-serif" }}>
            🗺️ Learning Journey
          </h2>
          <p className="text-xs mt-0.5" style={{ color: "#B79D84", fontFamily: "var(--font-nunito), Nunito, sans-serif" }}>
            Track which AI concepts you&apos;ve explored with your kids
          </p>
        </div>

        {/* Circular progress ring */}
        <div className="flex flex-col items-center gap-1 flex-shrink-0">
          <svg width="88" height="88" viewBox="0 0 88 88" aria-label={`${pct}% complete`}>
            {/* Track */}
            <circle cx="44" cy="44" r="36" fill="none" stroke="#EDE8E1" strokeWidth="8" />
            {/* Progress */}
            <circle
              cx="44" cy="44" r="36"
              fill="none"
              stroke="url(#prog-grad)"
              strokeWidth="8"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={loading ? circumference : dashOffset}
              transform="rotate(-90 44 44)"
              style={{ transition: "stroke-dashoffset 1s cubic-bezier(0.22,1,0.36,1)" }}
            />
            <defs>
              <linearGradient id="prog-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#7C63B8" />
                <stop offset="100%" stopColor="#F3A78E" />
              </linearGradient>
            </defs>
            {/* Text */}
            <text x="44" y="40" textAnchor="middle" fontSize="16" fontWeight="800" fill="#222222" fontFamily="Quicksand, sans-serif">
              {pct}%
            </text>
            <text x="44" y="54" textAnchor="middle" fontSize="9" fill="#B79D84" fontFamily="Nunito, sans-serif">
              {completed.size}/{AI_TOPICS.length}
            </text>
          </svg>
        </div>
      </div>

      {/* Progress bar */}
      <div className="mb-6">
        <div className="h-2 rounded-full overflow-hidden" style={{ backgroundColor: "#EDE8E1" }}>
          <div
            className="h-full rounded-full"
            style={{
              width: `${pct}%`,
              background: "linear-gradient(90deg, #7C63B8, #F3A78E)",
              transition: "width 1s cubic-bezier(0.22,1,0.36,1)",
            }}
            role="progressbar"
            aria-valuenow={pct}
            aria-valuemin={0}
            aria-valuemax={100}
          />
        </div>
        <p className="text-xs mt-1.5 text-right" style={{ color: "#B79D84", fontFamily: "var(--font-nunito), Nunito, sans-serif" }}>
          {pct === 100 ? "🏆 All topics explored!" : `${AI_TOPICS.length - completed.size} topics left to explore`}
        </p>
      </div>

      {/* Topics grouped by category */}
      <div className="space-y-5">
        {Object.entries(grouped).map(([cat, topics]) => {
          const cc = CATEGORY_COLORS[cat] ?? CATEGORY_COLORS.Foundations
          const catDone = topics.filter((t) => completed.has(t.id)).length
          return (
            <div key={cat}>
              <div className="flex items-center justify-between mb-2.5">
                <span
                  className="text-xs font-bold px-2.5 py-1 rounded-full"
                  style={{ backgroundColor: cc.bg, color: cc.text, fontFamily: "var(--font-nunito), Nunito, sans-serif" }}
                >
                  {cat}
                </span>
                <span className="text-xs" style={{ color: "#B79D84", fontFamily: "var(--font-nunito), Nunito, sans-serif" }}>
                  {catDone}/{topics.length}
                </span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {topics.map((topic) => {
                  const done = completed.has(topic.id)
                  const busy = toggling === topic.id
                  return (
                    <button
                      key={topic.id}
                      onClick={() => toggle(topic.id, topic.category)}
                      disabled={busy}
                      className="flex items-center gap-2 px-3 py-2.5 rounded-xl text-left transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#7C63B8] hover:scale-[1.02] active:scale-[0.98] disabled:opacity-60"
                      style={{
                        backgroundColor: done ? cc.bg : "#FAF6F0",
                        border: `1.5px solid ${done ? cc.border : "#EDE8E1"}`,
                      }}
                      aria-pressed={done}
                      title={done ? `Mark "${topic.label}" as not explored` : `Mark "${topic.label}" as explored`}
                    >
                      <span className="text-base flex-shrink-0" aria-hidden="true">
                        {busy ? "⟳" : done ? "✅" : topic.emoji}
                      </span>
                      <span
                        className="text-xs font-semibold leading-tight"
                        style={{
                          color: done ? cc.text : "#3E3E3E",
                          fontFamily: "var(--font-nunito), Nunito, sans-serif",
                          textDecoration: done ? "none" : "none",
                        }}
                      >
                        {topic.label}
                      </span>
                    </button>
                  )
                })}
              </div>
            </div>
          )
        })}
      </div>

      {/* Recent reads */}
      {recentReads.length > 0 && (
        <div className="mt-6 pt-5" style={{ borderTop: "1px solid #EDE8E1" }}>
          <h3 className="text-sm font-bold mb-3" style={{ color: "#222222", fontFamily: "var(--font-quicksand), Quicksand, sans-serif" }}>
            📚 Recently Read
          </h3>
          <div className="space-y-2">
            {recentReads.slice(0, 4).map((r) => (
              <div key={r.slug} className="flex items-center gap-3 py-1.5">
                <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ backgroundColor: "#7C63B8" }} aria-hidden="true" />
                <p className="text-xs font-semibold flex-1 line-clamp-1" style={{ color: "#3E3E3E", fontFamily: "var(--font-nunito), Nunito, sans-serif" }}>
                  {r.title}
                </p>
                <span className="text-xs flex-shrink-0" style={{ color: "#B79D84", fontFamily: "var(--font-nunito), Nunito, sans-serif" }}>
                  {new Date(r.read_at).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
