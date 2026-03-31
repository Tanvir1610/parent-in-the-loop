"use client"

import Link from "next/link"

export default function Footer() {
  const scrollTo = (id: string) => {
    const el = document.getElementById(id)
    if (el) el.scrollIntoView({ behavior: "smooth" })
  }

  return (
    <footer
      className="text-white px-4 sm:px-6 lg:px-8 py-14"
      style={{ backgroundColor: "#222222" }}
      aria-label="Site footer"
    >
      <div className="max-w-6xl mx-auto">
        <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-10 mb-12">

          {/* Brand */}
          <div className="sm:col-span-2 md:col-span-1">
            <div className="flex items-center gap-2 mb-3">
              <img src="/images/pitl-20logo1.png" alt="Parent in the Loop logo" className="w-8 h-8 object-contain" />
              <span className="font-bold text-lg" style={{ fontFamily: "var(--font-quicksand), Quicksand, sans-serif", color: "#FAF6F0" }}>
                Parent in the Loop
              </span>
            </div>
            <p className="text-sm leading-relaxed" style={{ color: "#9ca3af", fontFamily: "var(--font-nunito), Nunito, sans-serif" }}>
              Helping families develop a joyful, empowered understanding of AI — through stories, experiments, and real conversations.
            </p>
            <p className="text-xs mt-3" style={{ color: "#B9A6E3" }}>
              #ParentInTheLoop #FamilyAI #CuriousKids #AIandParenting
            </p>
          </div>

          {/* Explore */}
          <div>
            <h4 className="font-bold mb-4 text-sm" style={{ fontFamily: "var(--font-quicksand), Quicksand, sans-serif", color: "#FAF6F0" }}>
              Explore
            </h4>
            <ul className="space-y-2.5 text-sm" style={{ color: "#9ca3af", fontFamily: "var(--font-nunito), Nunito, sans-serif" }}>
              <li>
                <button onClick={() => scrollTo("articles")} className="hover:text-white transition focus:outline-none focus-visible:underline text-left">
                  Articles
                </button>
              </li>
              <li>
                <button onClick={() => scrollTo("quiz")} className="hover:text-white transition focus:outline-none focus-visible:underline text-left">
                  AI Quiz 🧠
                </button>
              </li>
              <li>
                <button onClick={() => scrollTo("newsletter")} className="hover:text-white transition focus:outline-none focus-visible:underline text-left">
                  Subscribe ✨
                </button>
              </li>
              <li>
                <a
                  href="https://parentintheloop.substack.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-white transition focus:outline-none focus-visible:underline"
                >
                  Full Archive ↗
                </a>
              </li>
            </ul>
          </div>

          {/* Connect */}
          <div>
            <h4 className="font-bold mb-4 text-sm" style={{ fontFamily: "var(--font-quicksand), Quicksand, sans-serif", color: "#FAF6F0" }}>
              Connect
            </h4>
            <ul className="space-y-2.5 text-sm" style={{ color: "#9ca3af", fontFamily: "var(--font-nunito), Nunito, sans-serif" }}>
              <li>
                <a href="https://instagram.com/parentintheloop" target="_blank" rel="noopener noreferrer" className="hover:text-white transition focus:outline-none focus-visible:underline" aria-label="Follow on Instagram">
                  Instagram 📸
                </a>
              </li>
              <li>
                <a href="https://twitter.com/parentintheloop" target="_blank" rel="noopener noreferrer" className="hover:text-white transition focus:outline-none focus-visible:underline" aria-label="Follow on Twitter">
                  Twitter / X
                </a>
              </li>
              <li>
                <Link href="/contact" className="hover:text-white transition focus:outline-none focus-visible:underline">
                  Contact Us 💬
                </Link>
              </li>
              <li>
                <a href="mailto:hello@parentintheloop.com" className="hover:text-white transition focus:outline-none focus-visible:underline">
                  hello@parentintheloop.com
                </a>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="font-bold mb-4 text-sm" style={{ fontFamily: "var(--font-quicksand), Quicksand, sans-serif", color: "#FAF6F0" }}>
              Legal &amp; Safety
            </h4>
            <ul className="space-y-2.5 text-sm" style={{ color: "#9ca3af", fontFamily: "var(--font-nunito), Nunito, sans-serif" }}>
              <li><Link href="/privacy" className="hover:text-white transition focus:outline-none focus-visible:underline">Privacy Policy</Link></li>
              <li><Link href="/terms" className="hover:text-white transition focus:outline-none focus-visible:underline">Terms of Use</Link></li>
              <li><Link href="/coppa" className="hover:text-white transition focus:outline-none focus-visible:underline">COPPA Notice</Link></li>
              <li>
                <a
                  href="/api/health"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-white transition focus:outline-none focus-visible:underline text-xs"
                  style={{ color: "#6b7280" }}
                >
                  System Status
                </a>
              </li>
            </ul>
            <p className="text-xs mt-4 leading-relaxed" style={{ color: "#6b7280" }}>
              We never collect personal data from minors. Educational content only.
            </p>
          </div>
        </div>

        {/* Bottom bar */}
        <div
          className="border-t pt-8 flex flex-col md:flex-row items-center justify-between gap-3 text-sm"
          style={{ borderColor: "#333", color: "#6b7280", fontFamily: "var(--font-nunito), Nunito, sans-serif" }}
        >
          <p>© 2025 Parent in the Loop. All rights reserved.</p>
          <p className="text-xs text-center" style={{ color: "#4b5563" }}>
            Educational content only. Always consult qualified professionals for medical or therapeutic concerns.
          </p>
        </div>
      </div>
    </footer>
  )
}
