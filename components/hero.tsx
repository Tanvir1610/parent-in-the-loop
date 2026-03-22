"use client"

export default function Hero() {
  return (
    <section
      className="min-h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8 relative overflow-hidden"
      style={{ backgroundColor: "#FAF6F0" }}
      aria-label="Hero section"
    >
      {/* Decorative background blobs */}
      <div
        className="absolute top-0 right-0 w-96 h-96 rounded-full opacity-20 pointer-events-none"
        style={{
          background: "radial-gradient(circle, #B9A6E3 0%, transparent 70%)",
          transform: "translate(30%, -30%)",
        }}
        aria-hidden="true"
      />
      <div
        className="absolute bottom-0 left-0 w-80 h-80 rounded-full opacity-15 pointer-events-none"
        style={{
          background: "radial-gradient(circle, #F3A78E 0%, transparent 70%)",
          transform: "translate(-30%, 30%)",
        }}
        aria-hidden="true"
      />
      <div
        className="absolute top-1/2 left-1/4 w-64 h-64 rounded-full opacity-10 pointer-events-none"
        style={{ background: "radial-gradient(circle, #F4D78B 0%, transparent 70%)" }}
        aria-hidden="true"
      />

      <div className="max-w-2xl mx-auto text-center space-y-8 relative z-10">
        {/* Logo + icons row */}
        <div className="flex flex-col items-center gap-4">
          <div className="animate-float">
            <img
              src="/images/pitl-20logo1.png"
              alt="Parent in the Loop logo"
              className="w-24 h-24 object-contain drop-shadow-md"
            />
          </div>
          {/* Brand guide: line art / hand-drawn emojis 💬 ✨ ❤️ 🧠 */}
          <div className="flex gap-3 text-2xl" aria-hidden="true">
            <span className="animate-sparkle" style={{ animationDelay: "0s" }}>💬</span>
            <span className="animate-sparkle" style={{ animationDelay: "0.4s" }}>✨</span>
            <span className="animate-sparkle" style={{ animationDelay: "0.8s" }}>🧠</span>
            <span className="animate-sparkle" style={{ animationDelay: "1.2s" }}>❤️</span>
          </div>
        </div>

        {/* Eyebrow label */}
        <p
          className="text-xs font-bold tracking-widest uppercase"
          style={{ color: "#B79D84", fontFamily: "var(--font-nunito), Nunito, sans-serif" }}
        >
          AI Literacy for Families
        </p>

        {/* Headline */}
        <h1
          className="text-5xl md:text-6xl font-bold leading-tight"
          style={{ color: "#222222", fontFamily: "var(--font-quicksand), Quicksand, sans-serif" }}
        >
          Help Your Kids{" "}
          <span className="relative inline-block" style={{ color: "#7C63B8" }}>
            Understand AI
            <span
              className="absolute bottom-0 left-0 w-full h-1 rounded-full opacity-40"
              style={{ backgroundColor: "#F4D78B", transform: "translateY(4px)" }}
              aria-hidden="true"
            />
          </span>
        </h1>

        {/* Mission description — warm, plain-spoken for parents */}
        <p
          className="text-lg leading-relaxed max-w-xl mx-auto"
          style={{ color: "#3E3E3E", fontFamily: "var(--font-nunito), Nunito, sans-serif", fontWeight: 400 }}
        >
          Weekly articles, family conversations, and hands-on activities that demystify AI for
          elementary and middle school kids — building curiosity, critical thinking, and ethical
          awareness in a joyful, screen-friendly way.
        </p>

        {/* CTAs */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
          <button
            className="px-8 py-3.5 font-bold rounded-xl shadow-md transition-all duration-200 hover:scale-105 active:scale-95 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#7C63B8]"
            style={{
              backgroundColor: "#F3A78E",
              color: "#fff",
              fontFamily: "var(--font-nunito), Nunito, sans-serif",
            }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.backgroundColor = "#E89175" }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.backgroundColor = "#F3A78E" }}
            onClick={() => document.getElementById("newsletter")?.scrollIntoView({ behavior: "smooth" })}
            aria-label="Subscribe to our weekly newsletter"
          >
            Subscribe — It&apos;s Free ✨
          </button>
          <button
            className="px-8 py-3.5 font-bold rounded-xl border-2 transition-all duration-200 hover:scale-105 active:scale-95 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#7C63B8]"
            style={{
              borderColor: "#B79D84",
              color: "#3E3E3E",
              backgroundColor: "transparent",
              fontFamily: "var(--font-nunito), Nunito, sans-serif",
            }}
            onMouseEnter={(e) => {
              const btn = e.currentTarget as HTMLButtonElement
              btn.style.borderColor = "#7C63B8"
              btn.style.color = "#7C63B8"
            }}
            onMouseLeave={(e) => {
              const btn = e.currentTarget as HTMLButtonElement
              btn.style.borderColor = "#B79D84"
              btn.style.color = "#3E3E3E"
            }}
            onClick={() => document.getElementById("articles")?.scrollIntoView({ behavior: "smooth" })}
            aria-label="Browse our latest articles"
          >
            Read Latest Articles →
          </button>
        </div>

        {/* Social proof */}
        <div className="pt-8 flex flex-col items-center gap-2">
          <div className="flex gap-1" aria-hidden="true">
            {[...Array(5)].map((_, i) => (
              <span key={i} style={{ color: "#F4D78B" }}>★</span>
            ))}
          </div>
          <p
            className="text-sm"
            style={{ color: "#B79D84", fontFamily: "var(--font-nunito), Nunito, sans-serif" }}
          >
            Trusted by families building AI literacy at home
          </p>
          <p className="text-xs" style={{ color: "#B9A6E3" }}>
            #ParentInTheLoop #FamilyAI #CuriousKids
          </p>
        </div>
      </div>
    </section>
  )
}
