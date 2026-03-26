"use client"

import { useState, useEffect } from "react"

export interface Article {
  id: number
  title: string
  excerpt: string
  category: "AI Literacy" | "Parenting" | "Family Conversations" | "Safety"
  image_url: string
  published_date: string
  featured: boolean
  slug: string
  substack_url: string
  // Extended fields (present in fallback data)
  read_time?: number
  tags?: string[]
  author?: string
}

export function useArticles(featured = true, limit = 3) {
  const [articles, setArticles] = useState<Article[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchArticles() {
      try {
        const params = new URLSearchParams()
        params.set("featured", featured.toString())
        params.set("limit", limit.toString())

        const response = await fetch(`/api/articles?${params}`)
        if (!response.ok) throw new Error("Failed to fetch articles")

        const data = await response.json()
        setArticles(data.articles)
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unknown error")
        console.error("[v0] Article fetch error:", err)
      } finally {
        setLoading(false)
      }
    }
    fetchArticles()
  }, [featured, limit])

  return { articles, loading, error }
}
