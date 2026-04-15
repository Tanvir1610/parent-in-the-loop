import { notFound } from "next/navigation"
import type { Metadata } from "next"
import { FALLBACK_ARTICLES } from "@/lib/data"
import ArticleDetailClient from "./article-detail-client"

interface Props {
  params: Promise<{ slug: string }>
}

async function getArticle(slug: string) {
  // Try Supabase first (server-side)
  try {
    const { createSupabaseServerClient } = await import("@/lib/supabase")
    const supabase = await createSupabaseServerClient()
    const { data, error } = await supabase
      .from("articles")
      .select("*")
      .eq("slug", slug)
      .single()
    if (!error && data) return data
  } catch {
    // fall through
  }
  // Fallback to static data
  return FALLBACK_ARTICLES.find((a) => a.slug === slug) ?? null
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const article = await getArticle(slug)
  if (!article) return { title: "Article not found" }
  return {
    title: `${article.title} — Parent in the Loop`,
    description: article.excerpt,
    openGraph: {
      title: article.title,
      description: article.excerpt,
      images: article.image_url ? [article.image_url] : [],
    },
  }
}

export async function generateStaticParams() {
  return FALLBACK_ARTICLES.map((a) => ({ slug: a.slug }))
}

export default async function ArticlePage({ params }: Props) {
  const { slug } = await params
  const article = await getArticle(slug)
  if (!article) notFound()

  const related = FALLBACK_ARTICLES.filter(
    (a) => a.slug !== slug && a.category === article.category
  ).slice(0, 2)

  return <ArticleDetailClient article={article} related={related} />
}
