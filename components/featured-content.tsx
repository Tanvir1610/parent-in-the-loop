"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import ArticleCard from "./article-card"
import AgeGroupFilter from "./AgeGroupFilter"
import type { Article } from "@/lib/use-articles"

const CATEGORIES = ["All", "AI Literacy", "Safety", "Family Conversations", "Parenting"]
const CATEGORY_EMOJI: Record<string, string> = {
  All: "✨", "AI Literacy": "🧠", Safety: "🔒", "Family Conversations": "💬", Parenting: "❤️",
}

function PersonalisedBanner() {
  const [ages, setAges] = useState<string[]>([])
  useEffect(() => {
    try { const a = localStorage.getItem("pitl_ages"); if (a) setAges(JSON.parse(a)) } catch {}
  }, [])
  if (ages.length === 0 || ages.includes("none")) return null
  const label = ages.map(a =>
    a === "5-8" ? "5–8 year olds" : a === "9-12" ? "9–12 year olds" : "teens"
  ).join(" & ")
  return (
    <div className="max-w-4xl mx-auto mb-6 px-4 reveal">
      <div className="flex items-center gap-3 px-4 py-3 rounded-2xl"
        style={{ backgroundColor: "rgba(124,99,184,0.06)", border: "1px solid rgba(124,99,184,0.15)" }}>
        <span>✨</span>
        <p className="text-sm" style={{ color: "#7C63B8", fontFamily: "var(--font-nunito), Nunito, sans-serif" }}>
          <strong>Personalised for you</strong> — showing content for {label}.{" "}
          <a href="/onboarding" className="underline" style={{ color: "#7C63B8" }}>Update preferences</a>
        </p>
      </div>
    </div>
  )
}

export default function FeaturedContent() {
  const [allArticles,    setAllArticles]    = useState<Article[]>([])
  const [filtered,       setFiltered]       = useState<Article[]>([])
  const [loading,        setLoading]        = useState(true)
  const [error,          setError]          = useState<string | null>(null)
  const [activeCategory, setActiveCategory] = useState("All")
  const [ageGroup,       setAgeGroup]       = useState("all")
  const [search,         setSearch]         = useState("")
  const [visibleCount,   setVisibleCount]   = useState(6)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // ── Fetch ALL articles once on mount ──────────────────────────────────
  const fetchAll = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res  = await fetch(`/api/articles?pageSize=50`)
      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        throw new Error(err.error ?? `HTTP ${res.status}`)
      }
      const data = await res.json()
      const articles: Article[] = data.articles ?? []
      setAllArticles(articles)
      setFiltered(articles)
      console.log(`[FeaturedContent] Loaded ${articles.length} articles`)
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e)
      console.error("[FeaturedContent] fetch error:", msg)
      setError(msg)
      setAllArticles([])
      setFiltered([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchAll() }, [fetchAll])

  // ── Client-side filtering (no re-fetch needed) ────────────────────────
  useEffect(() => {
    let result = [...allArticles]

    if (activeCategory !== "All") {
      result = result.filter(a => a.category === activeCategory)
    }

    if (ageGroup !== "all") {
      result = result.filter(a => !a.age_group || a.age_group === ageGroup || a.age_group === "all")
    }

    if (search.trim()) {
      const q = search.trim().toLowerCase()
      result = result.filter(a =>
        a.title?.toLowerCase().includes(q) || a.excerpt?.toLowerCase().includes(q)
      )
    }

    setFiltered(result)
    setVisibleCount(6)
  }, [activeCategory, ageGroup, search, allArticles])

  // ── Debounce search input ─────────────────────────────────────────────
  function handleSearch(val: string) {
    setSearch(val)
  }

  const visible = filtered.slice(0, visibleCount)
  const hasMore = filtered.length > visibleCount

  // Category counts from allArticles (before age/search filter for natural feel)
  function categoryCount(cat: string) {
    if (cat === "All") return allArticles.length
    return allArticles.filter(a => a.category === cat).length
  }

  return (
    <section
      className="py-20 px-4 sm:px-6 lg:px-8"
      id="articles"
      style={{ backgroundColor: "var(--background, #FAF6F0)" }}
      aria-label="Featured articles"
    >
      <div className="max-w-6xl mx-auto">

        {/* ── Section header ─────────────────────────────────────── */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8 gap-6 reveal">
          <div>
            <p className="text-xs font-bold tracking-widest uppercase mb-2"
              style={{ color: "#B79D84", fontFamily: "var(--font-nunito), Nunito, sans-serif" }}>
              <span style={{ color: "#F3A78E" }}>✦</span> FEATURED
            </p>
            <h2 className="text-4xl font-bold"
              style={{ color: "var(--foreground, #222222)", fontFamily: "var(--font-quicksand), Quicksand, sans-serif" }}>
              Latest Articles
            </h2>
            <p className="mt-2 text-sm" style={{ color: "#B79D84", fontFamily: "var(--font-nunito), Nunito, sans-serif" }}>
              Evidence-based, family-friendly insights — new every week.
            </p>
          </div>
          <a
            href="https://newsletter.parentintheloop.com"
            target="_blank" rel="noopener noreferrer"
            className="px-6 py-3 font-bold rounded-xl text-white transition-all hover:scale-105 active:scale-95 shadow-md whitespace-nowrap"
            style={{ backgroundColor: "#7C63B8", fontFamily: "var(--font-nunito), Nunito, sans-serif" }}
            onMouseEnter={e => { (e.currentTarget as HTMLAnchorElement).style.backgroundColor = "#6B5599" }}
            onMouseLeave={e => { (e.currentTarget as HTMLAnchorElement).style.backgroundColor = "#7C63B8" }}
          >
            All Articles on Substack →
          </a>
        </div>

        <PersonalisedBanner />

        {/* ── Search ─────────────────────────────────────────────── */}
        <div className="mb-5 reveal">
          <div className="relative max-w-md">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm pointer-events-none" aria-hidden="true">🔍</span>
            <input
              type="search"
              value={search}
              onChange={e => handleSearch(e.target.value)}
              placeholder="Search articles…"
              className="w-full pl-9 pr-4 py-2.5 rounded-xl text-sm border focus:outline-none focus-visible:ring-2 focus-visible:ring-[#7C63B8] transition-colors"
              style={{
                backgroundColor: "var(--card, #fff)",
                borderColor:     "var(--border, #EDE8E1)",
                color:           "var(--foreground, #222222)",
                fontFamily:      "var(--font-nunito), Nunito, sans-serif",
              }}
            />
          </div>
        </div>

        {/* ── Age group filter ────────────────────────────────────── */}
        <div className="mb-5 reveal delay-50">
          <AgeGroupFilter selected={ageGroup} onChange={age => setAgeGroup(age)} />
        </div>

        {/* ── Category pills ──────────────────────────────────────── */}
        <div className="flex flex-wrap gap-2 mb-10 reveal delay-100" role="group" aria-label="Filter by category">
          {CATEGORIES.map(cat => {
            const isActive = activeCategory === cat
            const count = categoryCount(cat)
            return (
              <button key={cat} onClick={() => setActiveCategory(cat)}
                className="flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-bold transition-all hover:scale-105 active:scale-95"
                style={{
                  backgroundColor: isActive ? "#7C63B8" : "var(--card, #fff)",
                  color:           isActive ? "#fff"    : "var(--foreground, #3E3E3E)",
                  border:          isActive ? "2px solid #7C63B8" : "2px solid var(--border, #EDE8E1)",
                  fontFamily: "var(--font-nunito), Nunito, sans-serif",
                }}
                aria-pressed={isActive}
              >
                <span aria-hidden="true">{CATEGORY_EMOJI[cat]}</span>
                <span>{cat}</span>
                {!loading && (
                  <span className="text-xs px-1.5 py-0.5 rounded-full"
                    style={{
                      backgroundColor: isActive ? "rgba(255,255,255,0.25)" : "rgba(124,99,184,0.1)",
                      color:           isActive ? "#fff" : "#7C63B8",
                    }}>
                    {count}
                  </span>
                )}
              </button>
            )
          })}
        </div>

        {/* ── Error state ─────────────────────────────────────────── */}
        {error && (
          <div className="mb-6 px-5 py-4 rounded-2xl flex items-start gap-3"
            style={{ backgroundColor: "rgba(243,167,142,0.1)", border: "1.5px solid rgba(243,167,142,0.3)" }}>
            <span className="text-xl mt-0.5">⚠️</span>
            <div>
              <p className="font-bold text-sm mb-1" style={{ color: "#c0392b" }}>Could not load articles</p>
              <p className="text-xs" style={{ color: "#888" }}>{error}</p>
              <button onClick={fetchAll} className="mt-2 text-xs font-bold underline" style={{ color: "#7C63B8" }}>
                Try again →
              </button>
            </div>
          </div>
        )}

        {/* ── Article grid ────────────────────────────────────────── */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {/* Loading skeletons */}
          {loading && Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="rounded-2xl overflow-hidden animate-pulse"
              style={{ backgroundColor: "var(--card, #fff)", border: "1.5px solid var(--border, #EDE8E1)", height: 320 }}
              aria-hidden="true">
              <div className="h-48" style={{ backgroundColor: "var(--muted, #EDE8E1)" }} />
              <div className="p-5 space-y-3">
                <div className="h-3 rounded-full w-1/3" style={{ backgroundColor: "var(--muted, #EDE8E1)" }} />
                <div className="h-5 rounded-full w-4/5" style={{ backgroundColor: "var(--muted, #EDE8E1)" }} />
                <div className="h-4 rounded-full w-full" style={{ backgroundColor: "var(--muted, #EDE8E1)" }} />
              </div>
            </div>
          ))}

          {/* Articles */}
          {!loading && visible.map(article => (
            <ArticleCard key={article.id} article={article} />
          ))}

          {/* Empty state */}
          {!loading && filtered.length === 0 && !error && (
            <div className="col-span-1 md:col-span-2 lg:col-span-3 text-center py-16">
              <p className="text-4xl mb-3">{CATEGORY_EMOJI[activeCategory] ?? "📚"}</p>
              <p className="text-lg font-semibold mb-2"
                style={{ color: "var(--foreground, #222222)", fontFamily: "var(--font-quicksand), Quicksand, sans-serif" }}>
                No articles found
              </p>
              <p className="text-sm mb-6" style={{ color: "#B79D84", fontFamily: "var(--font-nunito), Nunito, sans-serif" }}>
                {search ? `No results for "${search}"` : "Try a different filter or search term."}
              </p>
              <button
                onClick={() => { setActiveCategory("All"); setAgeGroup("all"); setSearch("") }}
                className="px-6 py-3 rounded-xl font-bold text-sm text-white transition-all hover:scale-105"
                style={{ backgroundColor: "#F3A78E", fontFamily: "var(--font-nunito), Nunito, sans-serif" }}>
                Show all articles
              </button>
            </div>
          )}
        </div>

        {/* ── Load more ───────────────────────────────────────────── */}
        {!loading && hasMore && (
          <div className="mt-10 text-center">
            <button
              onClick={() => setVisibleCount(v => v + 6)}
              className="px-8 py-3 rounded-xl font-bold border-2 text-sm transition-all hover:scale-105 active:scale-95"
              style={{
                borderColor:     "#7C63B8",
                color:           "#7C63B8",
                backgroundColor: "transparent",
                fontFamily:      "var(--font-nunito), Nunito, sans-serif",
              }}
              onMouseEnter={e => { const b = e.currentTarget as HTMLButtonElement; b.style.backgroundColor = "#7C63B8"; b.style.color = "#fff" }}
              onMouseLeave={e => { const b = e.currentTarget as HTMLButtonElement; b.style.backgroundColor = "transparent"; b.style.color = "#7C63B8" }}
            >
              Load More ({filtered.length - visibleCount} more) ↓
            </button>
          </div>
        )}

        {/* ── All shown state ─────────────────────────────────────── */}
        {!loading && !hasMore && visible.length > 0 && (
          <div className="mt-10 text-center">
            <p className="text-sm mb-3"
              style={{ color: "#B79D84", fontFamily: "var(--font-nunito), Nunito, sans-serif" }}>
              Showing all {filtered.length} article{filtered.length !== 1 ? "s" : ""}. New articles every week on Substack. ✨
            </p>
            <a href="https://newsletter.parentintheloop.com"
              target="_blank" rel="noopener noreferrer"
              className="px-8 py-3 font-bold rounded-xl border-2 text-sm inline-block transition-all hover:scale-105"
              style={{ borderColor: "#7C63B8", color: "#7C63B8", backgroundColor: "transparent", fontFamily: "var(--font-nunito), Nunito, sans-serif" }}
              onMouseEnter={e => { const a = e.currentTarget as HTMLAnchorElement; a.style.backgroundColor = "#7C63B8"; a.style.color = "#fff" }}
              onMouseLeave={e => { const a = e.currentTarget as HTMLAnchorElement; a.style.backgroundColor = "transparent"; a.style.color = "#7C63B8" }}>
              Read all articles on Substack ✨
            </a>
          </div>
        )}
      </div>
    </section>
  )
}
