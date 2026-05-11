"use client"

import { useEffect, useRef, useState } from "react"

interface Stat { numeric: number; suffix: string; label: string; emoji: string; display?: string }

// Stats are now fetched live from platform_analytics if possible, else fallback
const FALLBACK: Stat[] = [
  { numeric: 30,  suffix: "+", label: "Families Subscribed", emoji: "👨‍👩‍👧" },
  { numeric: 9,   suffix: "",  label: "Articles Published",  emoji: "📝" },
  { numeric: 100, suffix: "%", label: "Evidence-Based",      emoji: "✨" },
  { numeric: 0,   suffix: "",  label: "Always Free",         emoji: "🎉", display: "Free" },
]

function AnimatedNumber({ stat, active }: { stat: Stat; active: boolean }) {
  const [value, setValue] = useState(0)
  const rafRef  = useRef<number>(0)
  const started = useRef(false)

  useEffect(() => {
    if (!active || started.current || stat.display) return
    started.current = true
    const duration = 1600, start = performance.now()
    const tick = (now: number) => {
      const p = Math.min((now - start) / duration, 1)
      setValue(Math.round((1 - Math.pow(2, -10 * p)) * stat.numeric))
      if (p < 1) rafRef.current = requestAnimationFrame(tick)
    }
    rafRef.current = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(rafRef.current)
  }, [active, stat])

  if (stat.display) return <>{stat.display}</>
  return <>{value.toLocaleString()}{stat.suffix}</>
}

export default function StatsBar() {
  const ref    = useRef<HTMLDivElement>(null)
  const [active, setActive] = useState(false)
  const [stats,  setStats]  = useState<Stat[]>(FALLBACK)

  // Try fetching real counts from analytics view
  useEffect(() => {
    fetch("/api/health")
      .then(r => r.json())
      .then(d => {
        if (d?.stats) {
          setStats([
            { numeric: d.stats.verified_subscribers ?? 30,  suffix: "+",  label: "Families Subscribed",  emoji: "👨‍👩‍👧" },
            { numeric: d.stats.published_articles    ?? 9,  suffix: "",   label: "Articles Published",   emoji: "📝" },
            { numeric: 100,                                  suffix: "%",  label: "Evidence-Based",       emoji: "✨" },
            { numeric: 0,                                    suffix: "",   label: "Always Free",          emoji: "🎉", display: "Free" },
          ])
        }
      })
      .catch(() => {}) // silently keep fallback
  }, [])

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const io = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setActive(true); io.disconnect() } },
      { threshold: 0.3 }
    )
    io.observe(el)
    return () => io.disconnect()
  }, [])

  return (
    <div ref={ref} className="py-10 px-4 sm:px-6 lg:px-8"
      style={{ backgroundColor: "var(--card, #fff)", borderBottom: "1px solid var(--border, #EDE8E1)" }}
      aria-label="Programme stats">
      <div className="max-w-4xl mx-auto grid grid-cols-2 sm:grid-cols-4 gap-8">
        {stats.map((stat, i) => (
          <div key={stat.label} className="text-center reveal" style={{ transitionDelay: `${i * 100}ms` }}>
            <div className="text-3xl mb-2" aria-hidden="true">{stat.emoji}</div>
            <div className="text-3xl font-bold tabular-nums"
              style={{ color: "#7C63B8", fontFamily: "var(--font-quicksand), Quicksand, sans-serif" }}
              aria-label={`${stat.numeric}${stat.suffix} ${stat.label}`}>
              <AnimatedNumber stat={stat} active={active} />
            </div>
            <div className="text-xs mt-1 font-semibold tracking-wide uppercase"
              style={{ color: "#B79D84", fontFamily: "var(--font-nunito), Nunito, sans-serif", letterSpacing: "0.06em" }}>
              {stat.label}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
