"use client"

export default function Newsletter() {
  return (
    <section
      className="py-20 px-4 sm:px-6 lg:px-8 relative overflow-hidden"
      id="newsletter"
      style={{ backgroundColor: "#A6B6A1" }}
      aria-label="Newsletter subscription"
    >
      {/* Decorative blob */}
      <div
        className="absolute top-0 right-0 w-64 h-64 rounded-full opacity-20 pointer-events-none"
        style={{ background: "radial-gradient(circle, #F4D78B, transparent)", transform: "translate(20%, -20%)" }}
        aria-hidden="true"
      />
      <div
        className="absolute bottom-0 left-0 w-48 h-48 rounded-full opacity-15 pointer-events-none"
        style={{ background: "radial-gradient(circle, #B9A6E3, transparent)", transform: "translate(-20%, 20%)" }}
        aria-hidden="true"
      />

      <div className="max-w-2xl mx-auto text-center relative z-10">
        {/* Icon row */}
        <div className="flex justify-center gap-2 text-2xl mb-4" aria-hidden="true">
          <span>💬</span><span>✨</span><span>🧠</span>
        </div>

        <h2
          className="text-4xl font-bold text-white mb-4"
          style={{ fontFamily: "var(--font-quicksand), Quicksand, sans-serif" }}
        >
          Get Weekly AI Wisdom
        </h2>
        <p
          className="text-lg leading-relaxed mb-2"
          style={{ color: "rgba(255,255,255,0.9)", fontFamily: "var(--font-nunito), Nunito, sans-serif" }}
        >
          Join parents who are building AI curiosity and critical thinking in their kids.
          Weekly essays, family conversation starters, and practical hands-on activities.
        </p>
        <p
          className="text-sm mb-8"
          style={{ color: "rgba(255,255,255,0.75)", fontFamily: "var(--font-nunito), Nunito, sans-serif" }}
        >
          No jargon. No hype. Just honest, evidence-based guidance you can use tonight.
        </p>

        <iframe
          src="https://parentintheloop.substack.com/embed"
          width="100%"
          height="320"
          frameBorder="0"
          scrolling="no"
          className="rounded-2xl"
          title="Subscribe to Parent in the Loop newsletter"
        />

        <p
          className="text-xs mt-6"
          style={{ color: "rgba(255,255,255,0.65)", fontFamily: "var(--font-nunito), Nunito, sans-serif" }}
        >
          Powered by{" "}
          <a
            href="https://substack.com"
            target="_blank"
            rel="noopener noreferrer"
            className="underline hover:text-white focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-white rounded transition"
            aria-label="Substack - opens in new tab"
          >
            Substack
          </a>
          . Unsubscribe anytime. We respect your privacy.
        </p>
      </div>
    </section>
  )
}
