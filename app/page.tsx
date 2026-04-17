"use client"

import { useEffect, Suspense } from "react"
import { useSearchParams } from "next/navigation"
import Navbar from "@/components/navbar"
import Hero from "@/components/hero"
import StatsBar from "@/components/stats-bar"
import WeeklyTip from "@/components/weekly-tip"
import FeaturedContent from "@/components/featured-content"
import AIQuiz from "@/components/ai-quiz"
import Testimonials from "@/components/testimonials"
import Newsletter from "@/components/newsletter"
import Footer from "@/components/footer"

function HomeInner() {
  const searchParams = useSearchParams()
  const verifiedParam = searchParams.get("verified")

  useEffect(() => {
    if (!verifiedParam) return
    setTimeout(() => {
      document.getElementById("newsletter")?.scrollIntoView({ behavior: "smooth", block: "center" })
    }, 400)
    const url = new URL(window.location.href)
    url.searchParams.delete("verified")
    window.history.replaceState({}, "", url.toString())
  }, [verifiedParam])

  return (
    <main className="min-h-screen" style={{ backgroundColor: "#FAF6F0" }}>
      <Navbar />
      <Hero />
      <StatsBar />
      <WeeklyTip />
      <FeaturedContent />
      <AIQuiz />
      <Testimonials />
      <Newsletter verifiedParam={verifiedParam} />
      <Footer />
    </main>
  )
}

export default function Home() {
  return (
    <Suspense fallback={null}>
      <HomeInner />
    </Suspense>
  )
}
