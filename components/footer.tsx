"use client"
import Link from "next/link"

const LINKS = {
  Platform: [
    { label: "Articles",   href: "/#articles" },
    { label: "AI Quiz",    href: "/#quiz" },
    { label: "Newsletter", href: "/#newsletter" },
    { label: "Dashboard",  href: "/dashboard" },
  ],
  Resources: [
    { label: "Substack",   href: "https://parentintheloop.substack.com", external: true },
    { label: "AI Literacy Levels", href: "/#articles" },
    { label: "Contact",    href: "/contact" },
  ],
  Legal: [
    { label: "Privacy",    href: "/privacy" },
    { label: "Terms",      href: "/terms" },
    { label: "COPPA",      href: "/coppa" },
    { label: "Unsubscribe", href: "/unsubscribe" },
  ],
}

export default function Footer() {
  return (
    <footer
      className="border-t py-16 px-4 sm:px-6 lg:px-8"
      style={{
        backgroundColor: "var(--card, #fff)",
        borderColor:     "var(--border, #EDE8E1)",
      }}
      aria-label="Site footer"
    >
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          {/* Brand */}
          <div className="md:col-span-1">
            <div className="flex items-center gap-2.5 mb-4">
              <img src="/images/pitl-20logo1.png" alt="Parent in the Loop logo" className="w-8 h-8 object-contain" />
              <span className="font-bold text-base"
                style={{ fontFamily: "var(--font-quicksand), Quicksand, sans-serif", color: "var(--foreground, #222222)" }}>
                Parent in the Loop
              </span>
            </div>
            <p className="text-sm leading-relaxed mb-4"
              style={{ color: "var(--muted-foreground, #B79D84)", fontFamily: "var(--font-nunito), Nunito, sans-serif" }}>
              Helping families navigate AI literacy — one conversation at a time.
            </p>
            <div className="flex gap-2">
              {["📧","🐦","📸"].map((icon, i) => (
                <button key={i} aria-label={["Email","Twitter","Instagram"][i]}
                  className="w-9 h-9 rounded-xl flex items-center justify-center transition-colors text-sm"
                  style={{ backgroundColor: "var(--muted, #EDE8E1)", color: "var(--muted-foreground, #B79D84)" }}
                  onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.backgroundColor = "#7C63B8"; (e.currentTarget as HTMLButtonElement).style.color = "#fff" }}
                  onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.backgroundColor = "var(--muted, #EDE8E1)"; (e.currentTarget as HTMLButtonElement).style.color = "var(--muted-foreground, #B79D84)" }}>
                  {icon}
                </button>
              ))}
            </div>
          </div>

          {/* Link columns */}
          {Object.entries(LINKS).map(([group, links]) => (
            <div key={group}>
              <h3 className="text-xs font-bold uppercase tracking-widest mb-4"
                style={{ color: "#B79D84", fontFamily: "var(--font-nunito), Nunito, sans-serif" }}>
                {group}
              </h3>
              <ul className="space-y-2.5">
                {links.map(l => (
                  <li key={l.label}>
                    <Link
                      href={l.href}
                      target={"external" in l && l.external ? "_blank" : "_self"}
                      rel={"external" in l && l.external ? "noopener noreferrer" : ""}
                      className="text-sm transition-colors focus:outline-none focus-visible:underline"
                      style={{ color: "var(--muted-foreground, #B79D84)", fontFamily: "var(--font-nunito), Nunito, sans-serif" }}
                      onMouseEnter={e => { (e.currentTarget as HTMLAnchorElement).style.color = "#7C63B8" }}
                      onMouseLeave={e => { (e.currentTarget as HTMLAnchorElement).style.color = "var(--muted-foreground, #B79D84)" }}
                    >
                      {l.label}{"external" in l && l.external ? " ↗" : ""}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4"
          style={{ borderTop: "1px solid var(--border, #EDE8E1)" }}>
          <p className="text-xs" style={{ color: "var(--muted-foreground, #B79D84)", fontFamily: "var(--font-nunito), Nunito, sans-serif" }}>
            © {new Date().getFullYear()} Parent in the Loop. Made with ❤️ for curious families.
          </p>
          <div className="flex items-center gap-1.5">
            <span className="text-xs px-2.5 py-1 rounded-full"
              style={{ backgroundColor: "rgba(166,182,161,0.2)", color: "#4d7a49", fontFamily: "var(--font-nunito), Nunito, sans-serif", fontSize: 11 }}>
              🔒 COPPA Compliant
            </span>
            <span className="text-xs px-2.5 py-1 rounded-full"
              style={{ backgroundColor: "rgba(124,99,184,0.1)", color: "#7C63B8", fontFamily: "var(--font-nunito), Nunito, sans-serif", fontSize: 11 }}>
              ✨ Always Free
            </span>
          </div>
        </div>
      </div>
    </footer>
  )
}
