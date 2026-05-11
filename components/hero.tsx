"use client"

import { useTheme } from "next-themes"
import { useEffect, useState } from "react"

export default function Hero() {
  const { resolvedTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])

  const isDark = mounted && resolvedTheme === "dark"

  return (
    <section
      className="min-h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8 relative overflow-hidden"
      style={{ backgroundColor: "var(--background, #FAF6F0)" }}
      aria-label="Hero section"
    >
      {/* Decorative blobs */}
      <div className="absolute top-0 right-0 w-96 h-96 rounded-full opacity-20 pointer-events-none"
        style={{ background: "radial-gradient(circle, #B9A6E3 0%, transparent 70%)", transform: "translate(30%, -30%)" }} aria-hidden="true" />
      <div className="absolute bottom-0 left-0 w-80 h-80 rounded-full opacity-15 pointer-events-none"
        style={{ background: "radial-gradient(circle, #F3A78E 0%, transparent 70%)", transform: "translate(-30%, 30%)" }} aria-hidden="true" />
      <div className="absolute top-1/2 left-1/4 w-64 h-64 rounded-full opacity-10 pointer-events-none"
        style={{ background: "radial-gradient(circle, #F4D78B 0%, transparent 70%)" }} aria-hidden="true" />

      <div className="max-w-2xl mx-auto text-center space-y-8 relative z-10">
        {/* Logo */}
        <div className="flex flex-col items-center gap-4 reveal">
          <div className="animate-float">
            <img src="/images/pitl-20logo1.png" alt="Parent in the Loop logo" className="w-24 h-24 object-contain drop-shadow-md" />
          </div>
          <div className="flex items-center gap-2 flex-wrap justify-center">
            {["🧠 AI Literacy", "❤️ Family First", "🔒 COPPA Safe"].map(tag => (
              <span key={tag}
                className="px-3 py-1 rounded-full text-xs font-bold"
                style={{
                  backgroundColor: isDark ? "rgba(185,166,227,0.15)" : "rgba(124,99,184,0.08)",
                  color: "#7C63B8",
                  border: "1px solid rgba(124,99,184,0.2)",
                  fontFamily: "var(--font-nunito), Nunito, sans-serif",
                }}>
                {tag}
              </span>
            ))}
          </div>
        </div>

        {/* Headline */}
        <div className="space-y-4 reveal delay-100">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight"
            style={{ fontFamily: "var(--font-quicksand), Quicksand, sans-serif", color: "var(--foreground, #222222)" }}>
            Help your kids thrive{" "}
            <span style={{
              background: "linear-gradient(135deg, #7C63B8, #F3A78E)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}>
              in the age of AI
            </span>
          </h1>
          <p className="text-lg sm:text-xl leading-relaxed max-w-xl mx-auto"
            style={{ color: "var(--muted-foreground, #6B6B6B)", fontFamily: "var(--font-nunito), Nunito, sans-serif" }}>
            Weekly articles, family conversations, and playful activities to help your children
            develop a joyful, critical understanding of artificial intelligence.
          </p>
        </div>

        {/* CTAs */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center reveal delay-200">
          <a href="#newsletter"
            className="w-full sm:w-auto px-8 py-4 rounded-2xl font-bold text-white text-lg transition-all hover:scale-105 active:scale-95 shadow-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-[#F3A78E] focus-visible:ring-offset-2"
            style={{ backgroundColor: "#F3A78E", fontFamily: "var(--font-nunito), Nunito, sans-serif", boxShadow: "0 4px 20px rgba(243,167,142,0.4)" }}
            onMouseEnter={e => { (e.currentTarget as HTMLAnchorElement).style.backgroundColor = "#E8926A" }}
            onMouseLeave={e => { (e.currentTarget as HTMLAnchorElement).style.backgroundColor = "#F3A78E" }}>
            Subscribe Free ✨
          </a>
          <a href="#articles"
            className="w-full sm:w-auto px-8 py-4 rounded-2xl font-bold text-lg transition-all hover:scale-105 active:scale-95 border-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#7C63B8] focus-visible:ring-offset-2"
            style={{ color: "#7C63B8", borderColor: "rgba(124,99,184,0.35)", backgroundColor: "transparent", fontFamily: "var(--font-nunito), Nunito, sans-serif" }}
            onMouseEnter={e => { const a = e.currentTarget as HTMLAnchorElement; a.style.backgroundColor = "#7C63B8"; a.style.color = "#fff" }}
            onMouseLeave={e => { const a = e.currentTarget as HTMLAnchorElement; a.style.backgroundColor = "transparent"; a.style.color = "#7C63B8" }}>
            Browse Articles →
          </a>
        </div>

        {/* Social proof */}
        <div className="reveal delay-300">
          <p className="text-sm" style={{ color: "var(--muted-foreground, #B79D84)", fontFamily: "var(--font-nunito), Nunito, sans-serif" }}>
            🌱 Join <strong style={{ color: "#7C63B8" }}>30+ families</strong> already in the loop
          </p>
        </div>
      </div>
    </section>
  )
}
