import type { Metadata } from "next"
import Link from "next/link"

export const metadata: Metadata = {
  title: "Privacy Policy — Parent in the Loop",
  description: "How Parent in the Loop collects, uses, and protects your personal information.",
}

export default function PrivacyPage() {
  return (
    <main className="min-h-screen px-4 sm:px-6 lg:px-8 py-16" style={{ backgroundColor: "#FAF6F0" }}>
      <div className="max-w-2xl mx-auto">

        {/* Back */}
        <Link href="/" className="inline-flex items-center gap-2 text-sm font-semibold mb-10 transition-colors hover:text-[#7C63B8]"
          style={{ color: "#B79D84", fontFamily: "var(--font-nunito), Nunito, sans-serif" }}>
          ← Back to Home
        </Link>

        {/* Header */}
        <div className="mb-10">
          <p className="text-xs font-bold tracking-widest uppercase mb-2"
            style={{ color: "#B79D84", fontFamily: "var(--font-nunito), Nunito, sans-serif" }}>
            Legal
          </p>
          <h1 className="text-4xl font-bold mb-3"
            style={{ color: "#222222", fontFamily: "var(--font-quicksand), Quicksand, sans-serif" }}>
            Privacy Policy
          </h1>
          <p className="text-sm" style={{ color: "#B79D84", fontFamily: "var(--font-nunito), Nunito, sans-serif" }}>
            Last updated: January 2025
          </p>
        </div>

        {/* Content */}
        <div className="space-y-8" style={{ fontFamily: "var(--font-nunito), Nunito, sans-serif" }}>

          <section>
            <h2 className="text-xl font-bold mb-3" style={{ color: "#222222", fontFamily: "var(--font-quicksand), Quicksand, sans-serif" }}>
              1. Who We Are
            </h2>
            <p className="text-base leading-relaxed" style={{ color: "#3E3E3E" }}>
              Parent in the Loop is an AI literacy education programme for families, operated by Supanova Labs.
              We publish weekly articles, activities, and family conversation guides to help parents and children
              understand artificial intelligence. You can contact us at{" "}
              <a href="mailto:hello@parentintheloop.com" className="underline" style={{ color: "#7C63B8" }}>
                hello@parentintheloop.com
              </a>.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold mb-3" style={{ color: "#222222", fontFamily: "var(--font-quicksand), Quicksand, sans-serif" }}>
              2. What Information We Collect
            </h2>
            <p className="text-base leading-relaxed mb-3" style={{ color: "#3E3E3E" }}>
              We collect only the minimum information needed to provide our service:
            </p>
            <ul className="space-y-2 pl-4">
              {[
                "Email address — when you subscribe to our newsletter",
                "Name, email, and message — when you submit a contact form",
                "Anonymous usage data — page views and article reads (no personal identifiers)",
                "Quiz results — stored anonymously with a session ID, no name or email attached",
              ].map((item) => (
                <li key={item} className="flex gap-2 text-sm leading-relaxed" style={{ color: "#3E3E3E" }}>
                  <span style={{ color: "#F3A78E" }}>✦</span> {item}
                </li>
              ))}
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold mb-3" style={{ color: "#222222", fontFamily: "var(--font-quicksand), Quicksand, sans-serif" }}>
              3. How We Use Your Information
            </h2>
            <ul className="space-y-2 pl-4">
              {[
                "To send you our weekly AI literacy newsletter (email only)",
                "To respond to your contact form messages",
                "To improve our content based on anonymous readership data",
                "We never sell, rent, or share your personal data with third parties",
                "We never use your data for advertising purposes",
              ].map((item) => (
                <li key={item} className="flex gap-2 text-sm leading-relaxed" style={{ color: "#3E3E3E" }}>
                  <span style={{ color: "#A6B6A1" }}>✓</span> {item}
                </li>
              ))}
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold mb-3" style={{ color: "#222222", fontFamily: "var(--font-quicksand), Quicksand, sans-serif" }}>
              4. Children&apos;s Privacy (COPPA)
            </h2>
            <p className="text-base leading-relaxed" style={{ color: "#3E3E3E" }}>
              We do not knowingly collect personal information from children under 13. Our newsletter
              subscription and contact forms are intended for parents and adult caregivers only.
              If you believe a child has provided us with personal information, please contact us
              immediately and we will delete it. See our full{" "}
              <Link href="/coppa" className="underline" style={{ color: "#7C63B8" }}>COPPA Notice</Link>.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold mb-3" style={{ color: "#222222", fontFamily: "var(--font-quicksand), Quicksand, sans-serif" }}>
              5. Data Storage &amp; Security
            </h2>
            <p className="text-base leading-relaxed" style={{ color: "#3E3E3E" }}>
              Your email address is stored securely in Supabase (SOC 2 compliant). Email delivery
              is handled by Resend. We use industry-standard encryption in transit (TLS) and at rest.
              We retain subscriber data only as long as you remain subscribed.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold mb-3" style={{ color: "#222222", fontFamily: "var(--font-quicksand), Quicksand, sans-serif" }}>
              6. Your Rights
            </h2>
            <p className="text-base leading-relaxed mb-2" style={{ color: "#3E3E3E" }}>
              You have the right to:
            </p>
            <ul className="space-y-2 pl-4">
              {[
                "Unsubscribe from our newsletter at any time (link in every email)",
                "Request a copy of the personal data we hold about you",
                "Request deletion of your personal data",
                "Correct any inaccurate information we hold",
              ].map((item) => (
                <li key={item} className="flex gap-2 text-sm leading-relaxed" style={{ color: "#3E3E3E" }}>
                  <span style={{ color: "#B9A6E3" }}>→</span> {item}
                </li>
              ))}
            </ul>
            <p className="text-sm mt-3" style={{ color: "#3E3E3E" }}>
              To exercise any of these rights, email us at{" "}
              <a href="mailto:hello@parentintheloop.com" className="underline" style={{ color: "#7C63B8" }}>
                hello@parentintheloop.com
              </a>.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold mb-3" style={{ color: "#222222", fontFamily: "var(--font-quicksand), Quicksand, sans-serif" }}>
              7. Cookies
            </h2>
            <p className="text-base leading-relaxed" style={{ color: "#3E3E3E" }}>
              We use only essential cookies necessary for the site to function. We do not use
              advertising cookies or cross-site tracking cookies.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold mb-3" style={{ color: "#222222", fontFamily: "var(--font-quicksand), Quicksand, sans-serif" }}>
              8. Changes to This Policy
            </h2>
            <p className="text-base leading-relaxed" style={{ color: "#3E3E3E" }}>
              We may update this policy occasionally. When we do, we&apos;ll update the date at the top.
              Continued use of our site after changes constitutes acceptance.
            </p>
          </section>

          <div className="rounded-2xl p-6 mt-8" style={{ backgroundColor: "rgba(166,182,161,0.15)", border: "1.5px solid rgba(166,182,161,0.3)" }}>
            <p className="text-sm font-semibold mb-1" style={{ color: "#4d7a49" }}>Questions about this policy?</p>
            <p className="text-sm" style={{ color: "#3E3E3E" }}>
              Email us at{" "}
              <a href="mailto:hello@parentintheloop.com" className="underline font-semibold" style={{ color: "#7C63B8" }}>
                hello@parentintheloop.com
              </a>{" "}
              — we respond within 2 business days.
            </p>
          </div>
        </div>
      </div>
    </main>
  )
}
