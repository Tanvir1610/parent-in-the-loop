import Hero from "@/components/hero"
import FeaturedContent from "@/components/featured-content"
import Testimonials from "@/components/testimonials"
import Newsletter from "@/components/newsletter"
import Footer from "@/components/footer"

export default function Home() {
  return (
    <main className="min-h-screen bg-background">
      <Hero />
      <FeaturedContent />
      <Testimonials />
      <Newsletter />
      <Footer />
    </main>
  )
}
