export default function Footer() {
  return (
    <footer
      className="text-white px-4 sm:px-6 lg:px-8 py-14"
      style={{ backgroundColor: "#222222" }}
      aria-label="Site footer"
    >
      <div className="max-w-6xl mx-auto">
        <div className="grid md:grid-cols-4 gap-10 mb-12">
          {/* Brand column */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <img
                src="/images/pitl-20logo1.png"
                alt="Parent in the Loop logo"
                className="w-8 h-8 object-contain"
              />
              <h3
                className="font-bold text-lg"
                style={{ fontFamily: "var(--font-quicksand), Quicksand, sans-serif", color: "#FAF6F0" }}
              >
                Parent in the Loop
              </h3>
            </div>
            <p
              className="text-sm leading-relaxed"
              style={{ color: "#9ca3af", fontFamily: "var(--font-nunito), Nunito, sans-serif" }}
            >
              Helping families develop a joyful, empowered understanding of AI — through stories,
              experiments, and real conversations.
            </p>
            {/* Hashtags per brand guide */}
            <p className="text-xs mt-3" style={{ color: "#B9A6E3" }}>
              #ParentInTheLoop #FamilyAI #CuriousKids #AIandParenting
            </p>
          </div>

          {/* Resources */}
          <div>
            <h4
              className="font-bold mb-4"
              style={{ fontFamily: "var(--font-quicksand), Quicksand, sans-serif", color: "#FAF6F0" }}
            >
              Resources
            </h4>
            <ul className="space-y-2 text-sm" style={{ color: "#9ca3af", fontFamily: "var(--font-nunito), Nunito, sans-serif" }}>
              <li>
                <a
                  href="https://parentintheloop.substack.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-white transition focus:outline-none focus:ring-2 focus:ring-offset-2 rounded px-1"
                  style={{ focusRingColor: "#F3A78E" }}
                  aria-label="Read our blog on Substack - opens in new tab"
                >
                  Blog
                </a>
              </li>
              <li>
                <a
                  href="/guides"
                  className="hover:text-white transition focus:outline-none focus:ring-2 focus:ring-offset-2 rounded px-1"
                >
                  Family Guides
                </a>
              </li>
              <li>
                <a
                  href="/activities"
                  className="hover:text-white transition focus:outline-none focus:ring-2 focus:ring-offset-2 rounded px-1"
                >
                  Kid Activities
                </a>
              </li>
            </ul>
          </div>

          {/* Connect */}
          <div>
            <h4
              className="font-bold mb-4"
              style={{ fontFamily: "var(--font-quicksand), Quicksand, sans-serif", color: "#FAF6F0" }}
            >
              Connect
            </h4>
            <ul className="space-y-2 text-sm" style={{ color: "#9ca3af", fontFamily: "var(--font-nunito), Nunito, sans-serif" }}>
              <li>
                <a
                  href="https://instagram.com/parentintheloop"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-white transition focus:outline-none focus:ring-2 focus:ring-offset-2 rounded px-1"
                  aria-label="Follow us on Instagram - opens in new tab"
                >
                  Instagram 📸
                </a>
              </li>
              <li>
                <a
                  href="https://twitter.com/parentintheloop"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-white transition focus:outline-none focus:ring-2 focus:ring-offset-2 rounded px-1"
                  aria-label="Follow us on Twitter - opens in new tab"
                >
                  Twitter / X
                </a>
              </li>
              <li>
                <a
                  href="mailto:hello@parentintheloop.com"
                  className="hover:text-white transition focus:outline-none focus:ring-2 focus:ring-offset-2 rounded px-1"
                  aria-label="Email us"
                >
                  Email Us
                </a>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4
              className="font-bold mb-4"
              style={{ fontFamily: "var(--font-quicksand), Quicksand, sans-serif", color: "#FAF6F0" }}
            >
              Legal & Safety
            </h4>
            <ul className="space-y-2 text-sm" style={{ color: "#9ca3af", fontFamily: "var(--font-nunito), Nunito, sans-serif" }}>
              <li>
                <a href="/privacy" className="hover:text-white transition focus:outline-none focus:ring-2 focus:ring-offset-2 rounded px-1">
                  Privacy Policy
                </a>
              </li>
              <li>
                <a href="/terms" className="hover:text-white transition focus:outline-none focus:ring-2 focus:ring-offset-2 rounded px-1">
                  Terms of Use
                </a>
              </li>
              <li>
                <a href="/coppa" className="hover:text-white transition focus:outline-none focus:ring-2 focus:ring-offset-2 rounded px-1">
                  COPPA Notice
                </a>
              </li>
            </ul>
            {/* Safety compliance note */}
            <p className="text-xs mt-4 leading-relaxed" style={{ color: "#6b7280" }}>
              We never collect personal data from minors. Educational content only.
            </p>
          </div>
        </div>

        <div
          className="border-t pt-8 flex flex-col md:flex-row items-center justify-between gap-3 text-sm"
          style={{ borderColor: "#333", color: "#6b7280", fontFamily: "var(--font-nunito), Nunito, sans-serif" }}
        >
          <p>© 2025 Parent in the Loop. All rights reserved.</p>
          <p className="text-xs" style={{ color: "#4b5563" }}>
            Content is educational only. Always refer to qualified professionals for medical or therapeutic concerns.
          </p>
        </div>
      </div>
    </footer>
  )
}
