"use client"

import Link from "next/link"
import { categoryColors } from "@/lib/content"
import type { Article } from "@/lib/use-articles"

export default function ArticleCard({ article }: { article: Article }) {
  return (
    <article
      className="group h-full flex flex-col rounded-2xl overflow-hidden transition-all duration-300 hover:shadow-xl focus-within:shadow-xl"
      style={{ backgroundColor: "#fff", border: "1.5px solid #F0EDE8" }}
    >
      <Link
        href={article.substack_url || `/articles/${article.slug}`}
        target={article.substack_url ? "_blank" : "_self"}
        rel={article.substack_url ? "noopener noreferrer" : ""}
        className="block overflow-hidden h-48 flex-shrink-0 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#7C63B8]"
        aria-label={`Read "${article.title}" on Substack — category: ${article.category}`}
      >
        <img
          src={article.image_url || "/placeholder.svg?height=192&width=384"}
          alt={`Cover image for "${article.title}"`}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />
      </Link>

      <div className="p-5 space-y-3 flex-1 flex flex-col">
        {/* Category + date row */}
        <div className="flex items-center gap-2 text-sm flex-wrap">
          <span
            className={`px-3 py-1 rounded-full font-bold text-xs ${categoryColors[article.category]}`}
            style={{ fontFamily: "var(--font-nunito), Nunito, sans-serif" }}
          >
            {article.category}
          </span>
          <span style={{ color: "#B79D84" }} aria-hidden="true">·</span>
          <time
            dateTime={article.published_date}
            className="text-xs"
            style={{ color: "#B79D84", fontFamily: "var(--font-nunito), Nunito, sans-serif" }}
          >
            {new Date(article.published_date).toLocaleDateString("en-US", {
              year: "numeric",
              month: "short",
              day: "numeric",
            })}
          </time>
        </div>

        {/* Title */}
        <h3
          className="text-lg font-bold leading-snug line-clamp-2 group-hover:text-[#7C63B8] transition-colors"
          style={{
            color: "#222222",
            fontFamily: "var(--font-quicksand), Quicksand, sans-serif",
          }}
        >
          {article.title}
        </h3>

        {/* Excerpt */}
        <p
          className="text-sm leading-relaxed flex-1 line-clamp-3"
          style={{ color: "#6B6B6B", fontFamily: "var(--font-nunito), Nunito, sans-serif" }}
        >
          {article.excerpt}
        </p>

        {/* CTA */}
        <div className="pt-2">
          <span
            className="inline-block text-sm font-bold group-hover:text-[#F3A78E] transition-colors"
            style={{ color: "#7C63B8", fontFamily: "var(--font-nunito), Nunito, sans-serif" }}
          >
            Read on Substack →
          </span>
        </div>
      </div>
    </article>
  )
}
