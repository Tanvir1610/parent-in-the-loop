"use client"

import Link from "next/link"
import { useState, useEffect, useRef } from "react"
import { Search, X, Menu } from "lucide-react"
import DarkModeToggle from "@/components/dark-mode-toggle"
import { useUser, UserButton } from "@clerk/nextjs"

interface SearchResult {
  id: number
  title: string
  category: string
  slug: string
  substack_url: string
  excerpt: string
}

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const [query, setQuery] = useState("")
  const [results, setResults] = useState<SearchResult[]>([])
  const [searching, setSearching] = useState(false)
  const searchRef = useRef<HTMLInputElement>(null)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener("scroll", onScroll, { passive: true })
    return () => window.removeEventListener("scroll", onScroll)
  }, [])

  useEffect(() => {
    if (searchOpen) {
      setTimeout(() => searchRef.current?.focus(), 100)
    } else {
      setQuery("")
      setResults([])
    }
  }, [searchOpen])

  useEffect(() => {
    if (!query.trim()) {
      setResults([])
      return
    }
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(async () => {
      setSearching(true)
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(query)}`)
        const data = await res.json()
        setResults(data.results || [])
      } catch {
        setResults([])
      } finally {
        setSearching(false)
      }
    }, 300)
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current)
    }
  }, [query])

  const scrollTo = (id: string) => {
    setMenuOpen(false)
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" })
  }

  const NAV_LINKS = [
    { label: "Articles", id: "articles" },
    { label: "Quiz", id: "quiz" },
    { label: "Community", id: "testimonials" },
    { label: "Subscribe", id: "newsletter" },
  ]

  const CATEGORY_COLORS: Record<string, string> = {
    "AI Literacy": "#7C63B8",
    "Safety": "#3a6e8a",
    "Family Conversations": "#4d7a49",
    "Parenting": "#c97a5a",
  }

  return (
    <>
      <header
        className="fixed top-0 left-0 right-0 z-50 transition-all duration-300"
        style={{
          backgroundColor: scrolled ? "rgba(250,246,240,0.95)" : "rgba(250,246,240,0.8)",
          backdropFilter: "blur(12px)",
          borderBottom: scrolled ? "1px solid rgba(183,157,132,0.2)" : "1px solid transparent",
          boxShadow: scrolled ? "0 2px 20px rgba(0,0,0,0.06)" : "none",
        }}
      >
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <button
              onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
              className="flex items-center gap-2.5 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#7C63B8] rounded-lg"
              aria-label="Go to top"
            >
              <img
                src="/images/pitl-20logo1.png"
                alt="Parent in the Loop"
                className="w-8 h-8 object-contain"
              />
              <span
                className="font-bold text-base hidden sm:block"
                style={{
                  fontFamily: "var(--font-quicksand), Quicksand, sans-serif",
                  color: "#222222",
                }}
              >
                Parent in the Loop
              </span>
            </button>

            {/* Desktop nav */}
            <nav className="hidden md:flex items-center gap-1" aria-label="Main navigation">
              {NAV_LINKS.map((link) => (
                <button
                  key={link.id}
                  onClick={() => scrollTo(link.id)}
                  className="px-4 py-2 rounded-lg text-sm font-semibold transition-all hover:bg-[#7C63B8]/8"
                  style={{
                    color: "#3E3E3E",
                    fontFamily: "var(--font-nunito), Nunito, sans-serif",
                  }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLButtonElement).style.color = "#7C63B8"
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLButtonElement).style.color = "#3E3E3E"
                  }}
                >
                  {link.label}
                </button>
              ))}
            </nav>

            {/* Right actions */}
            <div className="flex items-center gap-2">
              {/* Search toggle */}
              <button
                onClick={() => setSearchOpen(!searchOpen)}
                className="p-2 rounded-lg transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#7C63B8]"
                style={{ color: "#B79D84" }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLButtonElement).style.color = "#7C63B8"
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLButtonElement).style.color = "#B79D84"
                }}
                aria-label={searchOpen ? "Close search" : "Open search"}
              >
                {searchOpen ? <X size={20} /> : <Search size={20} />}
              </button>

              {/* Auth + Subscribe CTAs */}
              <DarkModeToggle />
              <NavAuthButtons scrollTo={scrollTo} />

              {/* Mobile menu */}
              <button
                onClick={() => setMenuOpen(!menuOpen)}
                className="md:hidden p-2 rounded-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-[#7C63B8]"
                style={{ color: "#B79D84" }}
                aria-label={menuOpen ? "Close menu" : "Open menu"}
                aria-expanded={menuOpen}
              >
                {menuOpen ? <X size={20} /> : <Menu size={20} />}
              </button>
            </div>
          </div>

          {/* Search bar — slides down */}
          {searchOpen && (
            <div className="pb-3 relative">
              <div className="relative">
                <Search
                  size={16}
                  className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
                  style={{ color: "#B79D84" }}
                  aria-hidden="true"
                />
                <input
                  ref={searchRef}
                  type="search"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search articles… e.g. 'AI bias', 'privacy', 'algorithm'"
                  className="w-full pl-9 pr-4 py-2.5 rounded-xl text-sm border focus:outline-none focus-visible:ring-2 focus-visible:ring-[#7C63B8]"
                  style={{
                    backgroundColor: "#fff",
                    borderColor: "#EDE8E1",
                    color: "#222222",
                    fontFamily: "var(--font-nunito), Nunito, sans-serif",
                  }}
                  aria-label="Search articles"
                />
                {searching && (
                  <div
                    className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 rounded-full border-2 border-t-transparent animate-spin"
                    style={{ borderColor: "#7C63B8", borderTopColor: "transparent" }}
                    aria-hidden="true"
                  />
                )}
              </div>

              {/* Results dropdown */}
              {results.length > 0 && (
                <div
                  className="absolute left-0 right-0 top-full mt-1 rounded-xl overflow-hidden shadow-xl z-50"
                  style={{ backgroundColor: "#fff", border: "1px solid #EDE8E1" }}
                  role="listbox"
                  aria-label="Search results"
                >
                  {results.map((r) => (
                    <a
                      key={r.id}
                      href={r.substack_url || `/articles/${r.slug}`}
                      target={r.substack_url ? "_blank" : "_self"}
                      rel={r.substack_url ? "noopener noreferrer" : ""}
                      className="flex items-start gap-3 px-4 py-3 hover:bg-[#FAF6F0] transition-colors focus:outline-none focus-visible:bg-[#FAF6F0]"
                      onClick={() => setSearchOpen(false)}
                      role="option"
                    >
                      <span
                        className="mt-0.5 px-2 py-0.5 rounded-full text-xs font-bold flex-shrink-0"
                        style={{
                          color: CATEGORY_COLORS[r.category] ?? "#7C63B8",
                          backgroundColor: `${CATEGORY_COLORS[r.category] ?? "#7C63B8"}18`,
                          fontFamily: "var(--font-nunito), Nunito, sans-serif",
                        }}
                      >
                        {r.category}
                      </span>
                      <div>
                        <p
                          className="text-sm font-bold line-clamp-1"
                          style={{ color: "#222222", fontFamily: "var(--font-quicksand), Quicksand, sans-serif" }}
                        >
                          {r.title}
                        </p>
                        <p
                          className="text-xs line-clamp-1 mt-0.5"
                          style={{ color: "#B79D84", fontFamily: "var(--font-nunito), Nunito, sans-serif" }}
                        >
                          {r.excerpt}
                        </p>
                      </div>
                    </a>
                  ))}
                </div>
              )}

              {query.trim() && !searching && results.length === 0 && (
                <div
                  className="absolute left-0 right-0 top-full mt-1 rounded-xl px-4 py-3 text-sm shadow-xl z-50"
                  style={{
                    backgroundColor: "#fff",
                    border: "1px solid #EDE8E1",
                    color: "#B79D84",
                    fontFamily: "var(--font-nunito), Nunito, sans-serif",
                  }}
                >
                  No articles found for &quot;{query}&quot;
                </div>
              )}
            </div>
          )}
        </div>

        {/* Mobile menu dropdown */}
        {menuOpen && (
          <div
            className="md:hidden border-t px-4 py-4 space-y-1"
            style={{ backgroundColor: "#FAF6F0", borderColor: "rgba(183,157,132,0.2)" }}
          >
            {NAV_LINKS.map((link) => (
              <button
                key={link.id}
                onClick={() => scrollTo(link.id)}
                className="block w-full text-left px-4 py-3 rounded-xl font-semibold text-sm transition-colors hover:bg-[#7C63B8]/8"
                style={{
                  color: "#3E3E3E",
                  fontFamily: "var(--font-nunito), Nunito, sans-serif",
                }}
              >
                {link.label}
              </button>
            ))}
            <MobileAuthButton setMenuOpen={setMenuOpen} />
            <button
              onClick={() => scrollTo("newsletter")}
              className="w-full mt-1 py-3 rounded-xl text-sm font-bold text-white"
              style={{ backgroundColor: "#F3A78E", fontFamily: "var(--font-nunito), Nunito, sans-serif" }}
            >
              Subscribe Free ✨
            </button>
          </div>
        )}
      </header>

      {/* Spacer so content isn't hidden behind fixed nav */}
      <div className="h-16" aria-hidden="true" />
    </>
  )
}

// ── Clerk auth state in desktop nav ────────────────────────────
function NavAuthButtons({ scrollTo }: { scrollTo: (id: string) => void }) {
  const { isSignedIn, user } = useUser()
  return (
    <>
      {isSignedIn ? (
        <div className="hidden md:flex items-center gap-3">
          <Link
            href="/dashboard"
            className="px-4 py-2 rounded-xl text-sm font-semibold transition-all hover:scale-105"
            style={{ color: "#7C63B8", border: "1.5px solid rgba(124,99,184,0.3)", fontFamily: "var(--font-nunito), Nunito, sans-serif" }}
          >
            My Dashboard
          </Link>
          <UserButton
            appearance={{
              elements: {
                avatarBox: "w-9 h-9 rounded-xl border-2",
                userButtonPopoverCard: "rounded-2xl shadow-xl border border-[#EDE8E1]",
              },
            }}
            afterSignOutUrl="/"
          />
        </div>
      ) : (
        <div className="hidden md:flex items-center gap-2">
          <Link
            href="/sign-in"
            className="px-4 py-2 rounded-xl text-sm font-semibold transition-all hover:scale-105 active:scale-95 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#7C63B8]"
            style={{ color: "#7C63B8", border: "1.5px solid rgba(124,99,184,0.3)", backgroundColor: "transparent", fontFamily: "var(--font-nunito), Nunito, sans-serif" }}
          >
            Sign In
          </Link>
          <Link
            href="/sign-up"
            className="px-4 py-2 rounded-xl text-sm font-bold text-white transition-all hover:scale-105 active:scale-95 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#F3A78E]"
            style={{ backgroundColor: "#F3A78E", fontFamily: "var(--font-nunito), Nunito, sans-serif", boxShadow: "0 2px 8px rgba(243,167,142,0.4)" }}
          >
            Join Free ✨
          </Link>
        </div>
      )}
    </>
  )
}

// ── Clerk auth state in mobile menu ────────────────────────────
function MobileAuthButton({ setMenuOpen }: { setMenuOpen: (v: boolean) => void }) {
  const { isSignedIn } = useUser()
  return isSignedIn ? (
    <Link
      href="/dashboard"
      onClick={() => setMenuOpen(false)}
      className="block w-full text-center px-4 py-3 rounded-xl font-semibold text-sm border-2 transition-colors"
      style={{ color: "#7C63B8", borderColor: "rgba(124,99,184,0.3)", fontFamily: "var(--font-nunito), Nunito, sans-serif" }}
    >
      My Dashboard
    </Link>
  ) : (
    <div className="space-y-2">
      <Link
        href="/sign-in"
        onClick={() => setMenuOpen(false)}
        className="block w-full text-center px-4 py-3 rounded-xl font-semibold text-sm border-2 transition-colors hover:bg-[#7C63B8]/5"
        style={{ color: "#7C63B8", borderColor: "rgba(124,99,184,0.3)", fontFamily: "var(--font-nunito), Nunito, sans-serif" }}
      >
        Sign In
      </Link>
      <Link
        href="/sign-up"
        onClick={() => setMenuOpen(false)}
        className="block w-full text-center px-4 py-3 rounded-xl font-bold text-sm text-white transition-colors"
        style={{ backgroundColor: "#F3A78E", fontFamily: "var(--font-nunito), Nunito, sans-serif" }}
      >
        Join Free ✨
      </Link>
    </div>
  )
}
