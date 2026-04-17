"use client"

import { useState, useEffect } from "react"
import ArticleCard from "./article-card"
import type { Article } from "@/lib/use-articles"

const CATEGORIES = ["All", "AI Literacy", "Safety", "Family Conversations", "Parenting"]
const AGE_FILTERS = ["All ages", "5–8 years", "9–12 years", "13+ years"]

const CATEGORY_EMOJI: Record<string, string> = {
  All: "✨",
  "AI Literacy": "🧠",
  Safety: "🔒",
  "Family Conversations": "💬",
  Parenting: "❤️",
}


function AgeRecommendation() {
  const [ages, setAges] = useState<string[]>([])

  useEffect(() => {
    try {
      const a = localStorage.getItem("pitl_ages")
      if (a) setAges(JSON.parse(a))
    } catch {}
  }, [])

  if (ages.length === 0 || ages.includes("none")) return null

  const ageLabel = ages.map(a =>
    a === "5-8" ? "5–8 year olds" : a === "9-12" ? "9–12 year olds" : "teens"
  ).join(" & ")

  return (
    <div className="max-w-4xl mx-auto mb-6 px-4 reveal">
      <div className="flex items-center gap-3 px-4 py-3 rounded-2xl"
        style={{ backgroundColor: "rgba(124,99,184,0.06)", border: "1px solid rgba(124,99,184,0.15)" }}>
        <span className="text-base">✨</span>
        <p className="text-sm" style={{ color: "#7C63B8", fontFamily: "var(--font-nunito), Nunito, sans-serif" }}>
          <strong>Personalised for you</strong> — showing content relevant for {ageLabel}.{" "}
          <a href="/onboarding" className="underline hover:no-underline" style={{ color: "#7C63B8" }}>
            Update preferences
          </a>
        </p>
      </div>
    </div>
  )
}

export default function FeaturedContent() {
  const [articles, setArticles] = useState<Article[]>([])
  const [loading, setLoading] = useState(true)
  const [activeCategory, setActiveCategory] = useState("All")
  const [visibleCount, setVisibleCount] = useState(3)

  useEffect(() => {
    async function fetchArticles() {
      try {
        const res = await fetch("/api/articles?limit=6")
        const data = await res.json()
        setArticles(data.articles || [])
      } catch {
        setArticles([])
      } finally {
        setLoading(false)
      }
    }
    fetchArticles()
  }, [])

  const filtered =
    activeCategory === "All"
      ? articles
      : articles.filter((a) => a.category === activeCategory)

  const visible = filtered.slice(0, visibleCount)
  const hasMore = filtered.length > visibleCount

  const handleReadMore = () => {
    window.open("https://parentintheloop.substack.com", "_blank", "noopener,noreferrer")
  }

  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8" id="articles" style={{ backgroundColor: "#FAF6F0" }} aria-label="Featured articles">
      <div className="max-w-6xl mx-auto">

        {/* Header */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-10 gap-6 reveal">
          <div>
            <p className="text-xs font-bold tracking-widest uppercase mb-2" style={{ color: "#B79D84", fontFamily: "var(--font-nunito), Nunito, sans-serif" }}>
              <span style={{ color: "#F3A78E" }}>✦</span> FEATURED
            </p>
            <h2 className="text-4xl font-bold" style={{ color: "#222222", fontFamily: "var(--font-quicksand), Quicksand, sans-serif" }}>Latest Articles</h2>
            <p className="mt-2 text-sm" style={{ color: "#B79D84", fontFamily: "var(--font-nunito), Nunito, sans-serif" }}>Evidence-based, family-friendly insights — new every week.</p>
          </div>
          <button onClick={handleReadMore} className="px-6 py-3 font-bold rounded-xl text-white transition-all duration-200 hover:scale-105 active:scale-95 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#7C63B8] shadow-md whitespace-nowrap" style={{ backgroundColor: "#7C63B8", fontFamily: "var(--font-nunito), Nunito, sans-serif" }} onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.backgroundColor = "#6B5599" }} onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.backgroundColor = "#7C63B8" }}>
            All Articles on Substack →
          </button>
        </div>

        {/* Category filter pills */}
        <div className="flex flex-wrap gap-2 mb-10 reveal delay-100" role="group" aria-label="Filter by category">
          {CATEGORIES.map((cat) => {
            const isActive = activeCategory === cat
            return (
              <button
                key={cat}
                onClick={() => { setActiveCategory(cat); setVisibleCount(3) }}
                className="flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-bold transition-all duration-200 hover:scale-105 active:scale-95 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-1 focus-visible:ring-[#7C63B8]"
                style={{
                  backgroundColor: isActive ? "#7C63B8" : "#fff",
                  color: isActive ? "#fff" : "#3E3E3E",
                  border: isActive ? "2px solid #7C63B8" : "2px solid #EDE8E1",
                  fontFamily: "var(--font-nunito), Nunito, sans-serif",
                  boxShadow: isActive ? "0 2px 8px rgba(124,99,184,0.25)" : "none",
                }}
                aria-pressed={isActive}
              >
                <span>{CATEGORY_EMOJI[cat]}</span>
                <span>{cat}</span>
                {!loading && (
                  <span className="ml-0.5 text-xs px-1.5 py-0.5 rounded-full" style={{ backgroundColor: isActive ? "rgba(255,255,255,0.25)" : "rgba(124,99,184,0.1)", color: isActive ? "#fff" : "#7C63B8" }}>
                    {cat === "All" ? articles.length : articles.filter((a) => a.category === cat).length}
                  </span>
                )}
              </button>
            )
          })}
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {loading ? (
            Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="rounded-2xl overflow-hidden animate-pulse" style={{ backgroundColor: "#fff", border: "1.5px solid #EDE8E1" }} aria-hidden="true">
                <div className="h-48" style={{ backgroundColor: "#EDE8E1" }} />
                <div className="p-5 space-y-3">
                  <div className="h-3 rounded-full w-1/3" style={{ backgroundColor: "#EDE8E1" }} />
                  <div className="h-5 rounded-full w-4/5" style={{ backgroundColor: "#EDE8E1" }} />
                  <div className="h-4 rounded-full w-full" style={{ backgroundColor: "#EDE8E1" }} />
                </div>
              </div>
            ))
          ) : visible.length > 0 ? (
            visible.map((article) => <ArticleCard key={article.id} article={article} />)
          ) : (
            <div className="col-span-3 text-center py-16">
              <p className="text-4xl mb-3">{CATEGORY_EMOJI[activeCategory] ?? "📚"}</p>
              <p className="text-lg font-semibold mb-2" style={{ color: "#222222", fontFamily: "var(--font-quicksand), Quicksand, sans-serif" }}>No {activeCategory} articles yet</p>
              <p className="text-sm mb-6" style={{ color: "#B79D84", fontFamily: "var(--font-nunito), Nunito, sans-serif" }}>Check back soon — we publish new content every week!</p>
              <button onClick={() => setActiveCategory("All")} className="px-5 py-2.5 rounded-xl font-bold text-sm text-white" style={{ backgroundColor: "#F3A78E", fontFamily: "var(--font-nunito), Nunito, sans-serif" }}>Show all articles</button>
            </div>
          )}
        </div>

        {/* Load more */}
        {!loading && hasMore && (
          <div className="mt-10 text-center">
            <button onClick={() => setVisibleCount((v) => v + 3)} className="px-8 py-3 rounded-xl font-bold border-2 text-sm transition-all hover:scale-105 active:scale-95 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#7C63B8]" style={{ borderColor: "#7C63B8", color: "#7C63B8", backgroundColor: "transparent", fontFamily: "var(--font-nunito), Nunito, sans-serif" }} onMouseEnter={(e) => { const b = e.currentTarget as HTMLButtonElement; b.style.backgroundColor = "#7C63B8"; b.style.color = "#fff" }} onMouseLeave={(e) => { const b = e.currentTarget as HTMLButtonElement; b.style.backgroundColor = "transparent"; b.style.color = "#7C63B8" }}>
              Load More Articles ↓
            </button>
          </div>
        )}

        {!loading && !hasMore && visible.length > 0 && (
          <div className="mt-10 text-center">
            <p className="text-sm mb-3" style={{ color: "#B79D84", fontFamily: "var(--font-nunito), Nunito, sans-serif" }}>Want more? New articles every week on Substack.</p>
            <button onClick={handleReadMore} className="px-8 py-3 font-bold rounded-xl border-2 text-sm transition-all hover:scale-105 active:scale-95" style={{ borderColor: "#7C63B8", color: "#7C63B8", backgroundColor: "transparent", fontFamily: "var(--font-nunito), Nunito, sans-serif" }} onMouseEnter={(e) => { const b = e.currentTarget as HTMLButtonElement; b.style.backgroundColor = "#7C63B8"; b.style.color = "#fff" }} onMouseLeave={(e) => { const b = e.currentTarget as HTMLButtonElement; b.style.backgroundColor = "transparent"; b.style.color = "#7C63B8" }}>
              Read all articles on Substack ✨
            </button>
          </div>
        )}

      </div>
    </section>
  )
}
