"use client"

import { useEffect, useState } from "react"

const STATS = [
  { value: "2,400+", label: "Families Learning", emoji: "👨‍👩‍👧" },
  { value: "52",     label: "Articles Published", emoji: "📝" },
  { value: "Weekly", label: "New Content",        emoji: "✨" },
  { value: "Free",   label: "Always",             emoji: "🎉" },
]

export default function StatsBar() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => setVisible(true), 100)
    return () => clearTimeout(timer)
  }, [])

  return (
    <div
      className="py-8 px-4 sm:px-6 lg:px-8"
      style={{ backgroundColor: "#fff", borderBottom: "1px solid #EDE8E1" }}
      aria-label="Programme stats"
    >
      <div className="max-w-4xl mx-auto grid grid-cols-2 sm:grid-cols-4 gap-6">
        {STATS.map((stat, i) => (
          <div
            key={stat.label}
            className="text-center transition-all duration-700"
            style={{
              opacity: visible ? 1 : 0,
              transform: visible ? "translateY(0)" : "translateY(12px)",
              transitionDelay: `${i * 80}ms`,
            }}
          >
            <div className="text-2xl mb-1" aria-hidden="true">{stat.emoji}</div>
            <div
              className="text-2xl font-bold"
              style={{ color: "#7C63B8", fontFamily: "var(--font-quicksand), Quicksand, sans-serif" }}
            >
              {stat.value}
            </div>
            <div
              className="text-xs mt-0.5"
              style={{ color: "#B79D84", fontFamily: "var(--font-nunito), Nunito, sans-serif" }}
            >
              {stat.label}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
