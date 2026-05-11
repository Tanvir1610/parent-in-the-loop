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
  read_time?: number
  tags?: string[]
  author?: string
  age_group?: string
  literacy_level?: number
  asset_type?: string
}

export function useArticles(featured = true, limit = 6) {
  const [articles, setArticles] = useState<Article[]>([])
  const [loading,  setLoading]  = useState(true)
  const [error,    setError]    = useState<string | null>(null)

  useEffect(() => {
    async function fetchArticles() {
      try {
        const params = new URLSearchParams()
        if (featured) params.set("featured", "true")
        params.set("pageSize", limit.toString())

        const response = await fetch(`/api/articles?${params}`)
        if (!response.ok) throw new Error(`HTTP ${response.status}`)

        const data = await response.json()
        setArticles(data.articles ?? [])
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unknown error")
        console.error("[use-articles] fetch error:", err)
      } finally {
        setLoading(false)
      }
    }
    fetchArticles()
  }, [featured, limit])

  return { articles, loading, error }
}
