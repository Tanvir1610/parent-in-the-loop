"use client"

import Link from "next/link"
import type { Article } from "@/lib/use-articles"

const CATEGORY_STYLES: Record<string, { color: string; bg: string }> = {
  "AI Literacy":           { color: "#7C63B8", bg: "rgba(124,99,184,0.1)" },
  "Parenting":             { color: "#c97a5a", bg: "rgba(243,167,142,0.15)" },
  "Family Conversations":  { color: "#4d7a49", bg: "rgba(166,182,161,0.2)" },
  "Safety":                { color: "#3a6e8a", bg: "rgba(191,214,225,0.3)" },
}

function formatDate(dateStr: string) {
  try {
    return new Date(dateStr).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })
  } catch { return dateStr }
}

export default function ArticleCard({ article }: { article: Article }) {
  const cs = CATEGORY_STYLES[article.category] ?? { color: "#7C63B8", bg: "rgba(124,99,184,0.1)" }

  // If has Substack URL → open externally; otherwise use internal article page
  const href = article.substack_url || `/articles/${article.slug}`
  const isExternal = !!article.substack_url

  return (
    <article
      className="group h-full flex flex-col rounded-2xl overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-1"
      style={{ backgroundColor: "#fff", border: "1.5px solid #EDE8E1" }}
    >
      {/* Image */}
      <Link
        href={href}
        target={isExternal ? "_blank" : "_self"}
        rel={isExternal ? "noopener noreferrer" : ""}
        className="block overflow-hidden flex-shrink-0 focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#7C63B8]"
        tabIndex={-1}
        aria-hidden="true"
      >
        <div className="relative h-48 overflow-hidden" style={{ backgroundColor: "#EDE8E1" }}>
          <img
            src={article.image_url || "/placeholder.jpg"}
            alt=""
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            loading="lazy"
            onError={(e) => { (e.currentTarget as HTMLImageElement).src = "/placeholder.jpg" }}
          />
          <div className="absolute bottom-0 left-0 right-0 h-12 pointer-events-none" style={{ background: "linear-gradient(to top, rgba(0,0,0,0.1), transparent)" }} />
        </div>
      </Link>

      {/* Content */}
      <div className="p-5 flex flex-col flex-1 gap-3">
        {/* Category + date + read time */}
        <div className="flex items-center gap-2 flex-wrap">
          <span
            className="px-3 py-1 rounded-full text-xs font-bold"
            style={{ color: cs.color, backgroundColor: cs.bg, fontFamily: "var(--font-nunito), Nunito, sans-serif" }}
          >
            {article.category}
          </span>
          <span style={{ color: "#B79D84" }} aria-hidden="true">·</span>
          <time dateTime={article.published_date} className="text-xs" style={{ color: "#B79D84", fontFamily: "var(--font-nunito), Nunito, sans-serif" }}>
            {formatDate(article.published_date)}
          </time>
          {article.read_time && (
            <>
              <span style={{ color: "#B79D84" }} aria-hidden="true">·</span>
              <span className="text-xs" style={{ color: "#B79D84", fontFamily: "var(--font-nunito), Nunito, sans-serif" }}>{article.read_time} min</span>
            </>
          )}
        </div>

        {/* Title */}
        <h3 className="text-lg font-bold leading-snug" style={{ fontFamily: "var(--font-quicksand), Quicksand, sans-serif" }}>
          <Link
            href={href}
            target={isExternal ? "_blank" : "_self"}
            rel={isExternal ? "noopener noreferrer" : ""}
            className="transition-colors focus:outline-none focus-visible:underline"
            style={{ color: "#222222" }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLAnchorElement).style.color = "#7C63B8" }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLAnchorElement).style.color = "#222222" }}
            aria-label={`Read "${article.title}"${isExternal ? " on Substack" : ""}`}
          >
            {article.title}
          </Link>
        </h3>

        {/* Excerpt */}
        <p className="text-sm leading-relaxed flex-1 line-clamp-3" style={{ color: "#6B6B6B", fontFamily: "var(--font-nunito), Nunito, sans-serif" }}>
          {article.excerpt}
        </p>

        {/* Tags (if present) */}
        {article.tags && article.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {article.tags.slice(0, 3).map((tag) => (
              <span key={tag} className="text-xs px-2 py-0.5 rounded-full" style={{ backgroundColor: "#EDE8E1", color: "#B79D84", fontFamily: "var(--font-nunito), Nunito, sans-serif" }}>
                #{tag}
              </span>
            ))}
          </div>
        )}

        {/* CTA */}
        <div className="pt-1 mt-auto">
          <Link
            href={href}
            target={isExternal ? "_blank" : "_self"}
            rel={isExternal ? "noopener noreferrer" : ""}
            className="inline-flex items-center gap-1 text-sm font-bold transition-colors focus:outline-none focus-visible:underline"
            style={{ color: "#7C63B8", fontFamily: "var(--font-nunito), Nunito, sans-serif" }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLAnchorElement).style.color = "#F3A78E" }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLAnchorElement).style.color = "#7C63B8" }}
          >
            {isExternal ? "Read on Substack" : "Read article"} <span aria-hidden="true">→</span>
          </Link>
        </div>
      </div>
    </article>
  )
}
