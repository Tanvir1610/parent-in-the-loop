import type { Metadata } from "next"
import Link from "next/link"

export const metadata: Metadata = {
  title: "Terms of Use — Parent in the Loop",
  description: "Terms and conditions for using the Parent in the Loop website and newsletter.",
}

export default function TermsPage() {
  return (
    <main className="min-h-screen px-4 sm:px-6 lg:px-8 py-16" style={{ backgroundColor: "#FAF6F0" }}>
      <div className="max-w-2xl mx-auto">

        <Link href="/" className="inline-flex items-center gap-2 text-sm font-semibold mb-10 transition-colors hover:text-[#7C63B8]"
          style={{ color: "#B79D84", fontFamily: "var(--font-nunito), Nunito, sans-serif" }}>
          ← Back to Home
        </Link>

        <div className="mb-10">
          <p className="text-xs font-bold tracking-widest uppercase mb-2"
            style={{ color: "#B79D84", fontFamily: "var(--font-nunito), Nunito, sans-serif" }}>Legal</p>
          <h1 className="text-4xl font-bold mb-3"
            style={{ color: "#222222", fontFamily: "var(--font-quicksand), Quicksand, sans-serif" }}>
            Terms of Use
          </h1>
          <p className="text-sm" style={{ color: "#B79D84", fontFamily: "var(--font-nunito), Nunito, sans-serif" }}>
            Last updated: January 2025
          </p>
        </div>

        <div className="space-y-8" style={{ fontFamily: "var(--font-nunito), Nunito, sans-serif" }}>

          <section>
            <h2 className="text-xl font-bold mb-3" style={{ color: "#222222", fontFamily: "var(--font-quicksand), Quicksand, sans-serif" }}>
              1. Acceptance of Terms
            </h2>
            <p className="text-base leading-relaxed" style={{ color: "#3E3E3E" }}>
              By accessing or using the Parent in the Loop website and newsletter, you agree to be bound
              by these Terms of Use. If you do not agree, please do not use our services. These terms
              apply to all visitors, subscribers, and users of our content.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold mb-3" style={{ color: "#222222", fontFamily: "var(--font-quicksand), Quicksand, sans-serif" }}>
              2. Educational Content Only
            </h2>
            <p className="text-base leading-relaxed" style={{ color: "#3E3E3E" }}>
              All content published by Parent in the Loop is for <strong>educational purposes only</strong>.
              Nothing on this site constitutes medical, psychological, legal, or therapeutic advice.
              Always consult qualified professionals for concerns related to your child&apos;s health,
              development, or wellbeing. We add an &ldquo;educational only&rdquo; disclaimer whenever
              content touches on sensitive topics.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold mb-3" style={{ color: "#222222", fontFamily: "var(--font-quicksand), Quicksand, sans-serif" }}>
              3. Intellectual Property
            </h2>
            <p className="text-base leading-relaxed" style={{ color: "#3E3E3E" }}>
              All articles, images, activities, and other content on this site are owned by Parent in the Loop
              / Supanova Labs unless otherwise noted. You may share links to our content freely. You may not
              reproduce, republish, or distribute our content without written permission.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold mb-3" style={{ color: "#222222", fontFamily: "var(--font-quicksand), Quicksand, sans-serif" }}>
              4. Newsletter Subscription
            </h2>
            <p className="text-base leading-relaxed" style={{ color: "#3E3E3E" }}>
              By subscribing to our newsletter, you consent to receive weekly email communications from us.
              You may unsubscribe at any time using the link in any email we send. We will never send
              unsolicited commercial email or share your address with third parties for marketing purposes.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold mb-3" style={{ color: "#222222", fontFamily: "var(--font-quicksand), Quicksand, sans-serif" }}>
              5. User Conduct
            </h2>
            <p className="text-base leading-relaxed mb-2" style={{ color: "#3E3E3E" }}>
              When interacting with our site or community, you agree not to:
            </p>
            <ul className="space-y-2 pl-4">
              {[
                "Submit false, misleading, or harmful information",
                "Attempt to bypass security measures or access systems unauthorised",
                "Use our platform to harass, threaten, or harm others",
                "Submit personal information belonging to minors under 13",
              ].map((item) => (
                <li key={item} className="flex gap-2 text-sm leading-relaxed" style={{ color: "#3E3E3E" }}>
                  <span style={{ color: "#F3A78E" }}>✗</span> {item}
                </li>
              ))}
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold mb-3" style={{ color: "#222222", fontFamily: "var(--font-quicksand), Quicksand, sans-serif" }}>
              6. Disclaimer of Warranties
            </h2>
            <p className="text-base leading-relaxed" style={{ color: "#3E3E3E" }}>
              Our content is provided &ldquo;as is&rdquo; without warranties of any kind. We make every effort
              to ensure accuracy but cannot guarantee that all information is current, complete, or error-free.
              AI technology changes rapidly; always verify time-sensitive claims independently.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold mb-3" style={{ color: "#222222", fontFamily: "var(--font-quicksand), Quicksand, sans-serif" }}>
              7. Limitation of Liability
            </h2>
            <p className="text-base leading-relaxed" style={{ color: "#3E3E3E" }}>
              To the fullest extent permitted by law, Parent in the Loop and Supanova Labs shall not be
              liable for any indirect, incidental, or consequential damages arising from your use of
              our content or services.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold mb-3" style={{ color: "#222222", fontFamily: "var(--font-quicksand), Quicksand, sans-serif" }}>
              8. Changes to These Terms
            </h2>
            <p className="text-base leading-relaxed" style={{ color: "#3E3E3E" }}>
              We reserve the right to update these terms at any time. Continued use of our site
              after changes are posted constitutes your acceptance of the new terms.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold mb-3" style={{ color: "#222222", fontFamily: "var(--font-quicksand), Quicksand, sans-serif" }}>
              9. Contact
            </h2>
            <p className="text-base leading-relaxed" style={{ color: "#3E3E3E" }}>
              Questions about these terms? Email{" "}
              <a href="mailto:hello@parentintheloop.com" className="underline" style={{ color: "#7C63B8" }}>
                hello@parentintheloop.com
              </a>.
            </p>
          </section>

          <div className="flex gap-4 pt-4">
            <Link href="/privacy" className="text-sm font-semibold underline" style={{ color: "#7C63B8" }}>Privacy Policy</Link>
            <Link href="/coppa" className="text-sm font-semibold underline" style={{ color: "#7C63B8" }}>COPPA Notice</Link>
          </div>
        </div>
      </div>
    </main>
  )
}
