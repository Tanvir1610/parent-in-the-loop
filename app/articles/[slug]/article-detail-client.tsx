"use client"

import { useEffect, useState, useRef } from "react"
import Link from "next/link"
import type { ArticleData } from "@/lib/data"

const CATEGORY_COLORS: Record<string, { text: string; bg: string }> = {
  "AI Literacy":           { text: "#7C63B8", bg: "rgba(124,99,184,0.1)" },
  "Safety":                { text: "#3a6e8a", bg: "rgba(58,110,138,0.1)" },
  "Family Conversations":  { text: "#4d7a49", bg: "rgba(77,122,73,0.1)" },
  "Parenting":             { text: "#c97a5a", bg: "rgba(201,122,90,0.1)" },
}

function formatDate(d: string) {
  return new Date(d).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })
}

// Simple markdown-ish renderer: **bold**, newlines → paragraphs
function renderContent(text: string) {
  return text.split("\n\n").map((para, i) => {
    if (para.startsWith("**") && para.endsWith("**")) {
      return (
        <h3 key={i} className="text-lg font-bold mt-8 mb-3" style={{ color: "#222222", fontFamily: "var(--font-quicksand), Quicksand, sans-serif" }}>
          {para.slice(2, -2)}
        </h3>
      )
    }
    if (para.startsWith("- ")) {
      const items = para.split("\n").filter((l) => l.startsWith("- "))
      return (
        <ul key={i} className="my-4 space-y-2 pl-5">
          {items.map((item, j) => (
            <li key={j} className="text-base leading-relaxed list-disc" style={{ color: "#3E3E3E", fontFamily: "var(--font-nunito), Nunito, sans-serif" }}>
              {item.slice(2).replace(/\*\*(.*?)\*\*/g, "$1")}
            </li>
          ))}
        </ul>
      )
    }
    if (para.startsWith("*Sources:")) {
      return (
        <p key={i} className="mt-10 pt-6 text-sm border-t" style={{ color: "#B79D84", borderColor: "#EDE8E1", fontFamily: "var(--font-nunito), Nunito, sans-serif", fontStyle: "italic" }}>
          {para.replace(/\*(.*?)\*/g, "$1")}
        </p>
      )
    }
    // Inline bold
    const parts = para.split(/\*\*(.*?)\*\*/g)
    return (
      <p key={i} className="text-base leading-relaxed my-4" style={{ color: "#3E3E3E", fontFamily: "var(--font-nunito), Nunito, sans-serif" }}>
        {parts.map((part, j) =>
          j % 2 === 1 ? <strong key={j} style={{ color: "#222222", fontWeight: 700 }}>{part}</strong> : part
        )}
      </p>
    )
  })
}

interface Props {
  article: ArticleData
  related: ArticleData[]
}

export default function ArticleDetailClient({ article, related }: Props) {
  const [readProgress, setReadProgress] = useState(0)
  const [copied, setCopied] = useState(false)
  const contentRef = useRef<HTMLDivElement>(null)
  const viewTracked = useRef(false)

  // Track article view once per mount (best-effort, non-blocking)
  useEffect(() => {
    if (viewTracked.current) return
    viewTracked.current = true
    fetch("/api/article-view", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ slug: article.slug }),
    }).catch(() => {})
  }, [article.slug])
  const cc = CATEGORY_COLORS[article.category] ?? { text: "#7C63B8", bg: "rgba(124,99,184,0.1)" }

  useEffect(() => {
    const onScroll = () => {
      const el = contentRef.current
      if (!el) return
      const { top, height } = el.getBoundingClientRect()
      const windowH = window.innerHeight
      const progress = Math.min(100, Math.max(0, ((windowH - top) / (height + windowH)) * 100))
      setReadProgress(progress)
    }
    window.addEventListener("scroll", onScroll, { passive: true })
    return () => window.removeEventListener("scroll", onScroll)
  }, [])

  const handleShare = async () => {
    const text = `"${article.title}" — ${article.excerpt} Read more: ${article.substack_url} #ParentInTheLoop`
    if (navigator.share) {
      try { await navigator.share({ title: article.title, text, url: article.substack_url }) } catch {}
    } else {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  return (
    <>
      {/* Reading progress bar */}
      <div className="fixed top-0 left-0 right-0 z-[60] h-1" style={{ backgroundColor: "#EDE8E1" }} aria-hidden="true">
        <div
          className="h-full transition-all duration-100"
          style={{
            width: `${readProgress}%`,
            background: "linear-gradient(90deg, #7C63B8, #F3A78E)",
          }}
        />
      </div>

      <div className="min-h-screen" style={{ backgroundColor: "#FAF6F0" }}>
        {/* Back nav */}
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-4">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm font-semibold transition-colors hover:text-[#7C63B8] focus:outline-none focus-visible:underline"
            style={{ color: "#B79D84", fontFamily: "var(--font-nunito), Nunito, sans-serif" }}
          >
            ← Back to Home
          </Link>
        </div>

        <article className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 pb-20" ref={contentRef}>
          {/* Category + meta */}
          <header className="mb-8">
            <div className="flex flex-wrap items-center gap-3 mb-5">
              <span
                className="px-3 py-1 rounded-full text-xs font-bold"
                style={{ color: cc.text, backgroundColor: cc.bg, fontFamily: "var(--font-nunito), Nunito, sans-serif" }}
              >
                {article.category}
              </span>
              {"read_time" in article && (
                <span className="text-xs" style={{ color: "#B79D84", fontFamily: "var(--font-nunito), Nunito, sans-serif" }}>
                  {(article as ArticleData).read_time} min read
                </span>
              )}
              <time
                dateTime={article.published_date}
                className="text-xs"
                style={{ color: "#B79D84", fontFamily: "var(--font-nunito), Nunito, sans-serif" }}
              >
                {formatDate(article.published_date)}
              </time>
            </div>

            <h1
              className="text-3xl sm:text-4xl font-bold leading-tight mb-4"
              style={{ color: "#222222", fontFamily: "var(--font-quicksand), Quicksand, sans-serif" }}
            >
              {article.title}
            </h1>

            <p
              className="text-lg leading-relaxed"
              style={{ color: "#6B6B6B", fontFamily: "var(--font-nunito), Nunito, sans-serif" }}
            >
              {article.excerpt}
            </p>

            {/* Tags */}
            {"tags" in article && (article as ArticleData).tags?.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-4">
                {(article as ArticleData).tags.map((tag) => (
                  <span
                    key={tag}
                    className="text-xs px-2.5 py-1 rounded-full"
                    style={{ backgroundColor: "#EDE8E1", color: "#B79D84", fontFamily: "var(--font-nunito), Nunito, sans-serif" }}
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            )}
          </header>

          {/* Hero image */}
          {article.image_url && (
            <div className="rounded-2xl overflow-hidden mb-10 h-72 sm:h-96" style={{ backgroundColor: "#EDE8E1" }}>
              <img
                src={article.image_url}
                alt={`Cover image for "${article.title}"`}
                className="w-full h-full object-cover"
                onError={(e) => { (e.currentTarget as HTMLImageElement).src = "/placeholder.jpg" }}
              />
            </div>
          )}

          {/* Article body */}
          <div className="prose-container">
            {"content" in article && article.content
              ? renderContent(article.content)
              : <p style={{ color: "#3E3E3E", fontFamily: "var(--font-nunito), Nunito, sans-serif" }}>{article.excerpt}</p>
            }
          </div>

          {/* Share + read on Substack */}
          <div
            className="mt-12 p-6 rounded-2xl flex flex-col sm:flex-row items-center gap-4"
            style={{ backgroundColor: "#fff", border: "1.5px solid #EDE8E1" }}
          >
            <div className="flex-1 text-left">
              <p className="font-bold text-sm mb-1" style={{ color: "#222222", fontFamily: "var(--font-quicksand), Quicksand, sans-serif" }}>
                Found this helpful?
              </p>
              <p className="text-xs" style={{ color: "#B79D84", fontFamily: "var(--font-nunito), Nunito, sans-serif" }}>
                Share it with another parent or read the full version on Substack.
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={handleShare}
                className="px-4 py-2.5 rounded-xl text-sm font-bold transition-all hover:scale-105 active:scale-95 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#F3A78E]"
                style={{ backgroundColor: copied ? "#F3A78E" : "rgba(243,167,142,0.15)", color: copied ? "#fff" : "#c97a5a", fontFamily: "var(--font-nunito), Nunito, sans-serif" }}
              >
                {copied ? "✓ Copied!" : "↗ Share"}
              </button>
              {article.substack_url && (
                <a
                  href={article.substack_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2.5 rounded-xl text-sm font-bold text-white transition-all hover:scale-105 active:scale-95 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#7C63B8]"
                  style={{ backgroundColor: "#7C63B8", fontFamily: "var(--font-nunito), Nunito, sans-serif" }}
                >
                  Full article on Substack →
                </a>
              )}
            </div>
          </div>

          {/* Related articles */}
          {related.length > 0 && (
            <div className="mt-14">
              <h2
                className="text-2xl font-bold mb-6"
                style={{ color: "#222222", fontFamily: "var(--font-quicksand), Quicksand, sans-serif" }}
              >
                More in {article.category}
              </h2>
              <div className="grid sm:grid-cols-2 gap-6">
                {related.map((rel) => (
                  <Link
                    key={rel.slug}
                    href={rel.substack_url || `/articles/${rel.slug}`}
                    target={rel.substack_url ? "_blank" : "_self"}
                    rel={rel.substack_url ? "noopener noreferrer" : ""}
                    className="group rounded-2xl overflow-hidden transition-all hover:shadow-lg hover:-translate-y-0.5 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#7C63B8]"
                    style={{ backgroundColor: "#fff", border: "1.5px solid #EDE8E1" }}
                  >
                    <div className="h-36 overflow-hidden" style={{ backgroundColor: "#EDE8E1" }}>
                      <img
                        src={rel.image_url || "/placeholder.jpg"}
                        alt=""
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        onError={(e) => { (e.currentTarget as HTMLImageElement).src = "/placeholder.jpg" }}
                      />
                    </div>
                    <div className="p-4">
                      <p
                        className="text-sm font-bold line-clamp-2 group-hover:text-[#7C63B8] transition-colors"
                        style={{ color: "#222222", fontFamily: "var(--font-quicksand), Quicksand, sans-serif" }}
                      >
                        {rel.title}
                      </p>
                      <p
                        className="text-xs mt-1"
                        style={{ color: "#7C63B8", fontFamily: "var(--font-nunito), Nunito, sans-serif" }}
                      >
                        Read more →
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Back to home CTA */}
          <div className="mt-12 text-center">
            <Link
              href="/"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-sm border-2 transition-all hover:scale-105 active:scale-95"
              style={{ borderColor: "#7C63B8", color: "#7C63B8", fontFamily: "var(--font-nunito), Nunito, sans-serif" }}
            >
              ← Back to all articles
            </Link>
          </div>
        </article>
      </div>
    </>
  )
}
