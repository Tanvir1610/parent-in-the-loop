"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from "recharts"

const BRAND = {
  plum:    "#7C63B8",
  coral:   "#F3A78E",
  sage:    "#A6B6A1",
  gold:    "#F4D78B",
  lavender:"#B9A6E3",
  sky:     "#BFD6E1",
}

interface Stats {
  totals: {
    subscribers: number
    activeSubscribers: number
    articles: number
    messages: number
    quizAttempts: number
    avgQuizScore: number
  }
  growthData:   { week: string; count: number }[]
  categoryData: { name: string; count: number }[]
  topArticles:  { slug: string; views: number }[]
}

const KPI_CARD_CFG = [
  { key: "activeSubscribers", label: "Active Subscribers", emoji: "📬", color: BRAND.plum,    suffix: "" },
  { key: "articles",          label: "Articles Published", emoji: "📝", color: BRAND.sage,    suffix: "" },
  { key: "quizAttempts",      label: "Quiz Completions",   emoji: "🧠", color: BRAND.coral,   suffix: "" },
  { key: "avgQuizScore",      label: "Avg Quiz Score",     emoji: "⭐", color: BRAND.gold,    suffix: "%" },
  { key: "messages",          label: "Messages Received",  emoji: "💬", color: BRAND.sky,     suffix: "" },
  { key: "subscribers",       label: "Total Subscribers",  emoji: "👥", color: BRAND.lavender,suffix: "" },
]

const PIE_COLORS = [BRAND.plum, BRAND.coral, BRAND.sage, BRAND.gold]

function KpiCard({ label, value, emoji, color, suffix }: {
  label: string; value: number; emoji: string; color: string; suffix: string
}) {
  const [displayed, setDisplayed] = useState(0)
  useEffect(() => {
    const dur = 1200
    const start = performance.now()
    const tick = (now: number) => {
      const p = Math.min((now - start) / dur, 1)
      const eased = 1 - Math.pow(2, -10 * p)
      setDisplayed(Math.round(eased * value))
      if (p < 1) requestAnimationFrame(tick)
    }
    requestAnimationFrame(tick)
  }, [value])

  return (
    <div
      className="rounded-2xl p-5 flex flex-col gap-3 transition-all hover:scale-[1.02] hover:shadow-md"
      style={{ backgroundColor: "#fff", border: "1.5px solid #EDE8E1" }}
    >
      <div className="flex items-center justify-between">
        <span className="text-2xl" aria-hidden="true">{emoji}</span>
        <div
          className="w-2 h-8 rounded-full"
          style={{ backgroundColor: color, opacity: 0.6 }}
          aria-hidden="true"
        />
      </div>
      <div>
        <p
          className="text-3xl font-bold tabular-nums"
          style={{ color, fontFamily: "var(--font-quicksand), Quicksand, sans-serif" }}
        >
          {displayed.toLocaleString()}{suffix}
        </p>
        <p
          className="text-xs mt-0.5 font-semibold"
          style={{ color: "#B79D84", fontFamily: "var(--font-nunito), Nunito, sans-serif" }}
        >
          {label}
        </p>
      </div>
    </div>
  )
}

export default function AdminDashboard({ userEmail }: { userEmail: string }) {
  const [stats, setStats] = useState<Stats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    fetch("/api/admin/stats")
      .then((r) => r.json())
      .then((d) => {
        if (d.error) setError(d.error)
        else setStats(d)
      })
      .catch(() => setError("Failed to load stats"))
      .finally(() => setLoading(false))
  }, [])

  const F = { fontFamily: "var(--font-nunito), Nunito, sans-serif" }
  const FQ = { fontFamily: "var(--font-quicksand), Quicksand, sans-serif" }

  return (
    <main className="min-h-screen px-4 sm:px-6 lg:px-8 py-10" style={{ backgroundColor: "#FAF6F0" }}>
      <div className="max-w-6xl mx-auto">

        {/* Top bar */}
        <div className="flex items-center justify-between mb-8 reveal">
          <div className="flex items-center gap-3">
            <Link href="/" className="flex items-center gap-2">
              <img src="/images/pitl-20logo1.png" alt="" className="w-9 h-9 object-contain" aria-hidden="true" />
            </Link>
            <div>
              <h1 className="text-2xl font-bold" style={{ color: "#222222", ...FQ }}>
                Admin Dashboard
              </h1>
              <p className="text-xs" style={{ color: "#B79D84", ...F }}>{userEmail}</p>
            </div>
          </div>
          <div className="flex gap-3">
            <Link href="/dashboard"
              className="text-sm font-semibold px-4 py-2 rounded-xl transition-all hover:scale-105"
              style={{ backgroundColor: "#fff", border: "1.5px solid #EDE8E1", color: "#3E3E3E", ...F }}>
              My Account
            </Link>
            <Link href="/"
              className="text-sm font-semibold px-4 py-2 rounded-xl text-white transition-all hover:scale-105"
              style={{ backgroundColor: "#7C63B8", ...F }}>
              View Site →
            </Link>
          </div>
        </div>

        {loading && (
          <div className="flex flex-col items-center justify-center py-32 gap-4">
            <div className="w-12 h-12 rounded-full border-4 border-t-transparent animate-spin"
              style={{ borderColor: "#7C63B8", borderTopColor: "transparent" }} />
            <p style={{ color: "#B79D84", ...F }}>Loading analytics…</p>
          </div>
        )}

        {error && !loading && (
          <div className="rounded-2xl p-8 text-center" style={{ backgroundColor: "rgba(243,167,142,0.1)", border: "1.5px solid rgba(243,167,142,0.3)" }}>
            <p className="text-lg font-bold mb-2" style={{ color: "#c97a5a", ...FQ }}>⚠️ Could not load stats</p>
            <p className="text-sm mb-4" style={{ color: "#3E3E3E", ...F }}>{error}</p>
            <p className="text-xs" style={{ color: "#B79D84", ...F }}>
              Make sure you&apos;ve run <code>setup-database.sql</code> in Supabase and all env vars are set in Vercel.
            </p>
          </div>
        )}

        {stats && !loading && (
          <div className="space-y-8">

            {/* KPI grid */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 reveal">
              {KPI_CARD_CFG.map((cfg) => (
                <KpiCard
                  key={cfg.key}
                  label={cfg.label}
                  value={stats.totals[cfg.key as keyof typeof stats.totals]}
                  emoji={cfg.emoji}
                  color={cfg.color}
                  suffix={cfg.suffix}
                />
              ))}
            </div>

            {/* Subscriber growth chart */}
            <div className="rounded-2xl p-6 reveal" style={{ backgroundColor: "#fff", border: "1.5px solid #EDE8E1" }}>
              <h2 className="text-base font-bold mb-1" style={{ color: "#222222", ...FQ }}>
                📈 Subscriber Growth — Last 8 Weeks
              </h2>
              <p className="text-xs mb-5" style={{ color: "#B79D84", ...F }}>New subscribers per week</p>
              <ResponsiveContainer width="100%" height={220}>
                <AreaChart data={stats.growthData} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="subGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%"  stopColor={BRAND.plum}  stopOpacity={0.25} />
                      <stop offset="95%" stopColor={BRAND.plum}  stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#EDE8E1" />
                  <XAxis dataKey="week" tick={{ fontSize: 10, fill: "#B79D84", fontFamily: "Nunito" }} />
                  <YAxis tick={{ fontSize: 10, fill: "#B79D84", fontFamily: "Nunito" }} allowDecimals={false} />
                  <Tooltip
                    contentStyle={{ borderRadius: 12, border: "1px solid #EDE8E1", fontFamily: "Nunito", fontSize: 12 }}
                    labelStyle={{ color: "#222", fontWeight: 700 }}
                  />
                  <Area
                    type="monotone" dataKey="count" name="New Subscribers"
                    stroke={BRAND.plum} strokeWidth={2.5}
                    fill="url(#subGrad)" dot={{ fill: BRAND.plum, r: 4 }}
                    activeDot={{ r: 6, fill: BRAND.plum }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            {/* Category + Top Articles row */}
            <div className="grid md:grid-cols-2 gap-6 reveal">

              {/* Category pie */}
              <div className="rounded-2xl p-6" style={{ backgroundColor: "#fff", border: "1.5px solid #EDE8E1" }}>
                <h2 className="text-base font-bold mb-1" style={{ color: "#222222", ...FQ }}>📚 Articles by Category</h2>
                <p className="text-xs mb-4" style={{ color: "#B79D84", ...F }}>Content distribution</p>
                {stats.categoryData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={200}>
                    <PieChart>
                      <Pie
                        data={stats.categoryData} cx="50%" cy="50%"
                        innerRadius={55} outerRadius={85}
                        dataKey="count" nameKey="name"
                        paddingAngle={3}
                      >
                        {stats.categoryData.map((_, i) => (
                          <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid #EDE8E1", fontFamily: "Nunito", fontSize: 12 }} />
                      <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 11, fontFamily: "Nunito" }} />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-48 flex items-center justify-center">
                    <p style={{ color: "#B79D84", ...F, fontSize: 13 }}>No articles in database yet</p>
                  </div>
                )}
              </div>

              {/* Top articles bar */}
              <div className="rounded-2xl p-6" style={{ backgroundColor: "#fff", border: "1.5px solid #EDE8E1" }}>
                <h2 className="text-base font-bold mb-1" style={{ color: "#222222", ...FQ }}>🔥 Most Read Articles</h2>
                <p className="text-xs mb-4" style={{ color: "#B79D84", ...F }}>By total view count</p>
                {stats.topArticles.length > 0 ? (
                  <ResponsiveContainer width="100%" height={200}>
                    <BarChart data={stats.topArticles} layout="vertical" margin={{ top: 0, right: 4, left: 4, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#EDE8E1" horizontal={false} />
                      <XAxis type="number" tick={{ fontSize: 10, fill: "#B79D84", fontFamily: "Nunito" }} />
                      <YAxis type="category" dataKey="slug" width={100}
                        tick={{ fontSize: 9, fill: "#B79D84", fontFamily: "Nunito" }}
                        tickFormatter={(s) => s.replace(/-/g, " ").slice(0, 14) + "…"}
                      />
                      <Tooltip
                        contentStyle={{ borderRadius: 12, border: "1px solid #EDE8E1", fontFamily: "Nunito", fontSize: 12 }}
                        formatter={(v: number) => [`${v} views`, "Views"]}
                      />
                      <Bar dataKey="views" name="Views" radius={[0, 6, 6, 0]}>
                        {stats.topArticles.map((_, i) => (
                          <Cell key={i} fill={i === 0 ? BRAND.coral : i === 1 ? BRAND.plum : BRAND.sage} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-48 flex items-center justify-center">
                    <p style={{ color: "#B79D84", ...F, fontSize: 13 }}>No article views recorded yet</p>
                  </div>
                )}
              </div>
            </div>

            {/* System health */}
            <div className="rounded-2xl p-6 reveal" style={{ backgroundColor: "#fff", border: "1.5px solid #EDE8E1" }}>
              <h2 className="text-base font-bold mb-4" style={{ color: "#222222", ...FQ }}>🔧 Quick Actions</h2>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[
                  { label: "Health Check",  href: "/api/health",        emoji: "💚" },
                  { label: "All Articles",  href: "/api/articles",       emoji: "📝" },
                  { label: "Test Email",    href: "/api/test-email",     emoji: "📧" },
                  { label: "View Site",     href: "/",                   emoji: "🌐" },
                ].map((a) => (
                  <a key={a.label} href={a.href} target="_blank" rel="noopener noreferrer"
                    className="flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-semibold transition-all hover:scale-[1.02] hover:shadow-sm"
                    style={{ backgroundColor: "#FAF6F0", border: "1.5px solid #EDE8E1", color: "#3E3E3E", ...F }}>
                    <span>{a.emoji}</span> {a.label} ↗
                  </a>
                ))}
              </div>
            </div>

          </div>
        )}
      </div>
    </main>
  )
}
