"use client"

import { useArticles } from "@/lib/use-articles"
import ArticleCard from "./article-card"

export default function FeaturedContent() {
  const { articles, loading } = useArticles(true, 3)

  const handleReadMore = () => {
    window.open("https://parentintheloop.substack.com", "_blank", "noopener,noreferrer")
  }

  return (
    <section
      className="py-20 px-4 sm:px-6 lg:px-8"
      id="articles"
      style={{ backgroundColor: "#FAF6F0" }}
      aria-label="Featured articles"
    >
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-14 gap-6">
          <div>
            <p
              className="text-xs font-bold tracking-widest uppercase mb-2"
              style={{ color: "#B79D84", fontFamily: "var(--font-nunito), Nunito, sans-serif" }}
            >
              ✨ Featured
            </p>
            <h2
              className="text-4xl font-bold"
              style={{ color: "#222222", fontFamily: "var(--font-quicksand), Quicksand, sans-serif" }}
            >
              Latest Articles
            </h2>
            <p
              className="mt-2 text-sm"
              style={{ color: "#B79D84", fontFamily: "var(--font-nunito), Nunito, sans-serif" }}
            >
              Evidence-based, family-friendly insights — new every week.
            </p>
          </div>
          <button
            onClick={handleReadMore}
            className="px-6 py-3 font-bold rounded-xl transition-all duration-200 hover:scale-105 active:scale-95 focus:outline-none focus:ring-2 focus:ring-offset-2 shadow-md hover:shadow-lg"
            style={{
              backgroundColor: "#7C63B8",
              color: "#fff",
              fontFamily: "var(--font-nunito), Nunito, sans-serif",
            }}
            onMouseEnter={(e) => ((e.currentTarget as HTMLButtonElement).style.backgroundColor = "#6B5599")}
            onMouseLeave={(e) => ((e.currentTarget as HTMLButtonElement).style.backgroundColor = "#7C63B8")}
            aria-label="Read more articles on Substack - opens in new tab"
          >
            Read More on Substack →
          </button>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {loading ? (
            // Loading skeletons using brand colors
            Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="rounded-2xl overflow-hidden animate-pulse" aria-hidden="true">
                <div className="h-48 rounded-xl mb-4" style={{ backgroundColor: "#E8E3DC" }} />
                <div className="space-y-3 p-1">
                  <div className="h-4 rounded-full w-1/3" style={{ backgroundColor: "#E8E3DC" }} />
                  <div className="h-5 rounded-full w-4/5" style={{ backgroundColor: "#E8E3DC" }} />
                  <div className="h-4 rounded-full w-full" style={{ backgroundColor: "#E8E3DC" }} />
                </div>
              </div>
            ))
          ) : articles.length > 0 ? (
            articles.map((article) => <ArticleCard key={article.id} article={article} />)
          ) : (
            <div className="col-span-3 text-center py-12">
              <p
                className="text-lg"
                style={{ color: "#B79D84", fontFamily: "var(--font-nunito), Nunito, sans-serif" }}
              >
                New articles coming soon! Subscribe to be the first to know. 💬
              </p>
            </div>
          )}
        </div>
      </div>
    </section>
  )
}
