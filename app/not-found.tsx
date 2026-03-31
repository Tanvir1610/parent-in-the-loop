import Link from "next/link"

export default function NotFound() {
  return (
    <main
      className="min-h-screen flex flex-col items-center justify-center px-4 text-center"
      style={{ backgroundColor: "#FAF6F0" }}
    >
      {/* Decorative blob */}
      <div
        className="absolute top-1/4 left-1/2 w-96 h-96 rounded-full opacity-10 pointer-events-none -translate-x-1/2 -translate-y-1/2"
        style={{ background: "radial-gradient(circle, #B9A6E3, transparent)" }}
        aria-hidden="true"
      />

      <div className="relative z-10 max-w-md">
        <div className="text-7xl mb-6 animate-float" aria-hidden="true">🤖</div>

        <p
          className="text-xs font-bold tracking-widest uppercase mb-3"
          style={{ color: "#B79D84", fontFamily: "var(--font-nunito), Nunito, sans-serif" }}
        >
          404 — Page Not Found
        </p>

        <h1
          className="text-4xl font-bold mb-4"
          style={{ color: "#222222", fontFamily: "var(--font-quicksand), Quicksand, sans-serif" }}
        >
          Lost in the loop?
        </h1>

        <p
          className="text-base leading-relaxed mb-8"
          style={{ color: "#6B6B6B", fontFamily: "var(--font-nunito), Nunito, sans-serif" }}
        >
          This page doesn&apos;t exist — but there&apos;s lots to explore back home.
          Browse our AI literacy articles, take the family quiz, or subscribe for weekly insights.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/"
            className="px-6 py-3 rounded-xl font-bold text-sm text-white transition-all hover:scale-105 active:scale-95 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#7C63B8] shadow-md"
            style={{ backgroundColor: "#7C63B8", fontFamily: "var(--font-nunito), Nunito, sans-serif" }}
          >
            ← Go Home
          </Link>
          <Link
            href="/#articles"
            className="px-6 py-3 rounded-xl font-bold text-sm border-2 transition-all hover:scale-105 active:scale-95 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#F3A78E]"
            style={{ borderColor: "#F3A78E", color: "#F3A78E", backgroundColor: "transparent", fontFamily: "var(--font-nunito), Nunito, sans-serif" }}
          >
            Browse Articles →
          </Link>
        </div>

        <p className="text-xs mt-10" style={{ color: "#B9A6E3" }}>
          #ParentInTheLoop #FamilyAI #CuriousKids
        </p>
      </div>
    </main>
  )
}
