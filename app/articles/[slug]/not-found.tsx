import Link from "next/link"

export default function NotFound() {
  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center px-4 text-center"
      style={{ backgroundColor: "#FAF6F0" }}
    >
      <div className="text-6xl mb-6" aria-hidden="true">🤖</div>
      <h1
        className="text-3xl font-bold mb-3"
        style={{ color: "#222222", fontFamily: "var(--font-quicksand), Quicksand, sans-serif" }}
      >
        Article not found
      </h1>
      <p
        className="text-base mb-8 max-w-sm"
        style={{ color: "#B79D84", fontFamily: "var(--font-nunito), Nunito, sans-serif" }}
      >
        This article may have moved or doesn&apos;t exist yet. Head back home to browse all our AI literacy content.
      </p>
      <Link
        href="/"
        className="px-6 py-3 rounded-xl font-bold text-sm text-white transition-all hover:scale-105 active:scale-95 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#7C63B8]"
        style={{ backgroundColor: "#7C63B8", fontFamily: "var(--font-nunito), Nunito, sans-serif" }}
      >
        ← Back to Home
      </Link>
    </div>
  )
}
