import type { Metadata } from "next"
import Navbar from "@/components/navbar"
import ContactForm from "@/components/contact-form"
import Footer from "@/components/footer"

export const metadata: Metadata = {
  title: "Contact Us — Parent in the Loop",
  description: "Get in touch with the Parent in the Loop team. Questions, ideas, partnerships — we read every message.",
}

export default function ContactPage() {
  return (
    <main className="min-h-screen" style={{ backgroundColor: "#FAF6F0" }}>
      <Navbar />
      <ContactForm />
      <Footer />
    </main>
  )
}
