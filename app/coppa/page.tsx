import type { Metadata } from "next"
import Link from "next/link"

export const metadata: Metadata = {
  title: "COPPA Notice — Parent in the Loop",
  description: "Parent in the Loop's Children's Online Privacy Protection Act (COPPA) compliance notice.",
}

export default function CoppaPage() {
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
            COPPA Notice
          </h1>
          <p className="text-sm" style={{ color: "#B79D84", fontFamily: "var(--font-nunito), Nunito, sans-serif" }}>
            Children&apos;s Online Privacy Protection Act Compliance · Last updated: January 2025
          </p>
        </div>

        {/* Notice banner */}
        <div className="rounded-2xl p-5 mb-8" style={{ backgroundColor: "rgba(185,166,227,0.15)", border: "1.5px solid rgba(124,99,184,0.25)" }}>
          <p className="text-sm font-semibold" style={{ color: "#7C63B8", fontFamily: "var(--font-nunito), Nunito, sans-serif" }}>
            🔒 We take children&apos;s privacy seriously. Parent in the Loop does not collect personal
            information from children under 13, full stop.
          </p>
        </div>

        <div className="space-y-8" style={{ fontFamily: "var(--font-nunito), Nunito, sans-serif" }}>

          <section>
            <h2 className="text-xl font-bold mb-3" style={{ color: "#222222", fontFamily: "var(--font-quicksand), Quicksand, sans-serif" }}>
              Our Commitment
            </h2>
            <p className="text-base leading-relaxed" style={{ color: "#3E3E3E" }}>
              Parent in the Loop is designed for <strong>parents and adult caregivers</strong>, not for
              children to use directly. We comply fully with the Children&apos;s Online Privacy Protection
              Act (COPPA, 15 U.S.C. §§ 6501–6506) and similar laws worldwide. We do not knowingly
              collect, use, or disclose personal information from children under 13 years of age.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold mb-3" style={{ color: "#222222", fontFamily: "var(--font-quicksand), Quicksand, sans-serif" }}>
              What We Do Not Collect from Children
            </h2>
            <ul className="space-y-2 pl-4">
              {[
                "Names, email addresses, or contact details from anyone under 13",
                "Photos, videos, or audio recordings of children",
                "Location data or device identifiers tied to a child",
                "Behavioural data or profiles on children",
              ].map((item) => (
                <li key={item} className="flex gap-2 text-sm leading-relaxed" style={{ color: "#3E3E3E" }}>
                  <span style={{ color: "#4d7a49" }}>✓</span> We do NOT collect: {item}
                </li>
              ))}
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold mb-3" style={{ color: "#222222", fontFamily: "var(--font-quicksand), Quicksand, sans-serif" }}>
              Who Our Services Are For
            </h2>
            <p className="text-base leading-relaxed" style={{ color: "#3E3E3E" }}>
              Our newsletter subscription, contact form, and interactive features (quiz, weekly tip)
              are intended for use by <strong>parents, guardians, and adult educators</strong> — not
              directly by children. Children may participate in family activities alongside a parent,
              but they should not submit any forms or personal information independently.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold mb-3" style={{ color: "#222222", fontFamily: "var(--font-quicksand), Quicksand, sans-serif" }}>
              If You Believe a Child Has Submitted Information
            </h2>
            <p className="text-base leading-relaxed" style={{ color: "#3E3E3E" }}>
              If you believe that a child under 13 has provided us with personal information without
              parental consent, please contact us immediately at{" "}
              <a href="mailto:hello@parentintheloop.com" className="underline" style={{ color: "#7C63B8" }}>
                hello@parentintheloop.com
              </a>. We will promptly delete that information from our records.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold mb-3" style={{ color: "#222222", fontFamily: "var(--font-quicksand), Quicksand, sans-serif" }}>
              Parental Controls &amp; Guidance
            </h2>
            <p className="text-base leading-relaxed" style={{ color: "#3E3E3E" }}>
              We encourage parents to supervise their children&apos;s online activities and to use
              available parental control tools. Our content is designed to be used <em>by parents</em>{" "}
              to have conversations <em>with</em> their children — not as a direct child-facing platform.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold mb-3" style={{ color: "#222222", fontFamily: "var(--font-quicksand), Quicksand, sans-serif" }}>
              Third-Party Services
            </h2>
            <p className="text-base leading-relaxed" style={{ color: "#3E3E3E" }}>
              We use the following third-party services, all of which comply with COPPA:
            </p>
            <ul className="space-y-2 pl-4 mt-3">
              {[
                "Supabase — secure database storage (SOC 2 Type II compliant)",
                "Resend — transactional email delivery",
                "Vercel — website hosting and analytics (anonymised)",
              ].map((item) => (
                <li key={item} className="flex gap-2 text-sm leading-relaxed" style={{ color: "#3E3E3E" }}>
                  <span style={{ color: "#B9A6E3" }}>→</span> {item}
                </li>
              ))}
            </ul>
            <p className="text-sm mt-3" style={{ color: "#B79D84" }}>
              None of these services are authorised to collect personal information from children on our behalf.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold mb-3" style={{ color: "#222222", fontFamily: "var(--font-quicksand), Quicksand, sans-serif" }}>
              Contact Us
            </h2>
            <p className="text-base leading-relaxed" style={{ color: "#3E3E3E" }}>
              For any questions about this COPPA notice or our privacy practices regarding children:
            </p>
            <div className="mt-3 rounded-xl p-4" style={{ backgroundColor: "#fff", border: "1.5px solid #EDE8E1" }}>
              <p className="text-sm font-bold mb-1" style={{ color: "#222222" }}>Parent in the Loop / Supanova Labs</p>
              <p className="text-sm" style={{ color: "#3E3E3E" }}>
                Email:{" "}
                <a href="mailto:hello@parentintheloop.com" className="underline" style={{ color: "#7C63B8" }}>
                  hello@parentintheloop.com
                </a>
              </p>
            </div>
          </section>

          <div className="flex gap-4 pt-4">
            <Link href="/privacy" className="text-sm font-semibold underline" style={{ color: "#7C63B8" }}>Privacy Policy</Link>
            <Link href="/terms" className="text-sm font-semibold underline" style={{ color: "#7C63B8" }}>Terms of Use</Link>
          </div>
        </div>
      </div>
    </main>
  )
}
