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
  return (
    <main className="min-h-screen" style={{ backgroundColor: "#FAF6F0" }}>
      <Navbar />
      <Hero />
      <StatsBar />
      <WeeklyTip />
      <FeaturedContent />
      <AIQuiz />
      <Testimonials />
      <Newsletter />
      <Footer />
    </main>
  )
}
