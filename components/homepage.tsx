"use client"

import { useEffect } from "react"
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

export default function Home() {
  const searchParams = useSearchParams()

  useEffect(() => {
    const verified = searchParams.get("verified")
    if (!verified) return

    // Scroll to newsletter section so user sees the confirmation message
    setTimeout(() => {
      document.getElementById("newsletter")?.scrollIntoView({ behavior: "smooth", block: "center" })
    }, 300)

    // Clean the URL without reloading
    const url = new URL(window.location.href)
    url.searchParams.delete("verified")
    window.history.replaceState({}, "", url.toString())
  }, [searchParams])

  const verifiedParam = searchParams.get("verified")

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
