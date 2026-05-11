"use client"

import { useEffect, useState, useCallback } from "react"
import { useTheme } from "next-themes"

type Tab = "overview" | "subscribers" | "emails" | "content" | "community" | "health"

interface Analytics {
  verified_subscribers: number; pending_subscribers: number; unsubscribed: number
  total_articles: number; published_articles: number; total_article_views: number
  emails_sent: number; emails_failed: number; emails_pending: number
  verification_emails: number; welcome_emails: number; weekly_emails: number
  approved_deliverables: number; total_deliverables: number
  total_quiz_attempts: number; total_contact_messages: number; total_reads: number
}

interface Deliverable {
  id: number; week_number: number; topic: string; status: string
  mentor_approved: boolean; sources_count: number; assets_produced: string[]
  novelty_pass: boolean; specificity_pass: boolean; coherence_pass: boolean; rigor_pass: boolean
}

interface UserPost {
  id: number; title: string; asset_type: string; status: string; created_at: string
}

// ── Stat card ──────────────────────────────────────────────────
function Stat({ label, value, sub, color = "#7C63B8" }: { label: string; value: string | number; sub?: string; color?: string }) {
  return (
    <div className="rounded-2xl p-5" style={{
      backgroundColor: "var(--card, #fff)",
      border: "1.5px solid var(--border, #EDE8E1)",
      borderLeft: `4px solid ${color}`,
    }}>
      <div className="text-2xl font-bold" style={{ color, fontFamily: "var(--font-quicksand), Quicksand, sans-serif" }}>{value}</div>
      <div className="text-xs font-semibold mt-1 uppercase tracking-wide" style={{ color: "var(--muted-foreground, #B79D84)", fontFamily: "var(--font-nunito), Nunito, sans-serif" }}>{label}</div>
      {sub && <div className="text-xs mt-0.5" style={{ color: "var(--muted-foreground, #B79D84)", fontFamily: "var(--font-nunito), Nunito, sans-serif" }}>{sub}</div>}
    </div>
  )
}

// ── Data table ─────────────────────────────────────────────────
function DataTable({ headers, rows, statusCol }: { headers: string[]; rows: (string | number | boolean)[]; statusCol?: number }) {
  return (
    <div className="overflow-x-auto rounded-xl" style={{ border: "1px solid var(--border, #EDE8E1)" }}>
      <table className="w-full text-sm">
        <thead>
          <tr style={{ backgroundColor: "#7C63B8" }}>
            {headers.map(h => (
              <th key={h} className="px-4 py-3 text-left text-xs font-bold text-white uppercase tracking-wider whitespace-nowrap"
                style={{ fontFamily: "var(--font-nunito), Nunito, sans-serif" }}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {(rows as (string | number | boolean)[][]).map((row, i) => (
            <tr key={i} style={{ backgroundColor: i % 2 === 0 ? "var(--muted, #FAFAFA)" : "var(--card, #fff)", borderTop: "1px solid var(--border, #EDE8E1)" }}>
              {(row as (string | number | boolean)[]).map((cell, j) => {
                const s = String(cell)
                const isStatus = j === statusCol
                const statusStyle = isStatus ? {
                  background: s === "sent" || s === "published" || s === "approved" ? "rgba(166,182,161,0.3)"
                    : s === "failed" ? "rgba(243,167,142,0.2)"
                    : s === "pending" || s === "pending_review" ? "rgba(255,243,205,0.8)" : "rgba(185,166,227,0.2)",
                  color: s === "sent" || s === "published" || s === "approved" ? "#276227"
                    : s === "failed" ? "#c0392b"
                    : s === "pending" || s === "pending_review" ? "#7D6608" : "#7C63B8",
                  fontWeight: 700,
                  borderRadius: 99,
                  padding: "2px 10px",
                  fontSize: 11,
                } : {}
                return (
                  <td key={j} className="px-4 py-3 whitespace-nowrap"
                    style={{ color: "var(--foreground, #3E3E3E)", fontFamily: "var(--font-nunito), Nunito, sans-serif", verticalAlign: "middle" }}>
                    {isStatus ? <span style={statusStyle}>{cell as string}</span> : cell as string | number | boolean}
                  </td>
                )
              })}
            </tr>
          ))}
          {rows.length === 0 && (
            <tr><td colSpan={headers.length} className="px-4 py-8 text-center"
              style={{ color: "var(--muted-foreground, #B79D84)", fontFamily: "var(--font-nunito), Nunito, sans-serif" }}>
              No data
            </td></tr>
          )}
        </tbody>
      </table>
    </div>
  )
}

export default function AdminDashboard() {
  const [tab,         setTab]         = useState<Tab>("overview")
  const [data,        setData]        = useState<Record<string, unknown> | null>(null)
  const [subscribers, setSubscribers] = useState<Record<string, unknown>[]>([])
  const [subFilter,   setSubFilter]   = useState("all")
  const [loading,     setLoading]     = useState(true)
  const [health,      setHealth]      = useState("")
  const [userPosts,   setUserPosts]   = useState<UserPost[]>([])
  const [triggerMsg,  setTriggerMsg]  = useState("")
  const { resolvedTheme } = useTheme()

  const TABS: { key: Tab; label: string }[] = [
    { key: "overview",   label: "📊 Overview"     },
    { key: "subscribers",label: "👥 Subscribers"  },
    { key: "emails",     label: "📬 Email Queue"  },
    { key: "content",    label: "📝 Content Log"  },
    { key: "community",  label: "✍️ Community"    },
    { key: "health",     label: "🧪 Health"       },
  ]

  const fetchData = useCallback(async () => {
    setLoading(true)
    try {
      const res  = await fetch("/api/admin/stats")
      const json = await res.json()
      setData(json)
      setUserPosts((json.userPosts ?? []) as UserPost[])
    } catch { /* silent */ }
    setLoading(false)
  }, [])

  const fetchSubscribers = useCallback(async (filter: string) => {
    const res  = await fetch(`/api/admin/subscribers?filter=${filter}&pageSize=100`).catch(() => null)
    if (!res) return
    const json = await res.json()
    setSubscribers((json.subscribers ?? []) as Record<string, unknown>[])
  }, [])

  useEffect(() => { fetchData() }, [fetchData])
  useEffect(() => { if (tab === "subscribers") fetchSubscribers(subFilter) }, [tab, subFilter, fetchSubscribers])

  async function triggerDigest() {
    setTriggerMsg("Sending…")
    const res  = await fetch("/api/weekly-digest", { method: "POST" })
    const json = await res.json()
    setTriggerMsg(`Done — sent: ${json.sent ?? 0}, failed: ${json.failed ?? 0}`)
  }

  async function runHealth() {
    setHealth("Checking…")
    const res  = await fetch("/api/test-email")
    const json = await res.json()
    setHealth(JSON.stringify(json, null, 2))
  }

  async function approvePost(id: number) {
    await fetch("/api/admin/user-posts", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id, status: "approved" }) })
    setUserPosts(prev => prev.map(p => p.id === id ? { ...p, status: "approved" } : p))
  }

  const a = (data?.analytics ?? {}) as Analytics

  const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
    <div className="mb-8">
      <p className="text-xs font-bold uppercase tracking-widest mb-4"
        style={{ color: "#B79D84", fontFamily: "var(--font-nunito), Nunito, sans-serif" }}>{title}</p>
      {children}
    </div>
  )

  return (
    <div className="min-h-screen" style={{ backgroundColor: "var(--background, #FAF6F0)" }}>

      {/* Header */}
      <div style={{ background: "linear-gradient(135deg, #7C63B8, #B9A6E3)", padding: "20px 24px" }}>
        <h1 className="text-white font-bold text-xl" style={{ fontFamily: "var(--font-quicksand), Quicksand, sans-serif" }}>
          Parent in the Loop — Admin
        </h1>
        <p className="text-white/70 text-sm" style={{ fontFamily: "var(--font-nunito), Nunito, sans-serif" }}>
          Production dashboard
        </p>
      </div>

      {/* Tabs */}
      <div className="flex overflow-x-auto border-b" style={{ backgroundColor: "var(--card, #fff)", borderColor: "var(--border, #EDE8E1)" }}>
        {TABS.map(t => (
          <button key={t.key} onClick={() => setTab(t.key)}
            className="px-5 py-3.5 text-sm whitespace-nowrap transition-all focus:outline-none"
            style={{
              borderBottom: tab === t.key ? "3px solid #7C63B8" : "3px solid transparent",
              color:      tab === t.key ? "#7C63B8" : "var(--muted-foreground, #888)",
              fontWeight: tab === t.key ? 700 : 400,
              fontFamily: "var(--font-nunito), Nunito, sans-serif",
            }}>
            {t.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="max-w-6xl mx-auto p-6">
        {loading && !data && (
          <div className="text-center py-16" style={{ color: "var(--muted-foreground, #B79D84)", fontFamily: "var(--font-nunito), Nunito, sans-serif" }}>
            <div className="text-3xl mb-3 animate-spin">⚙️</div>Loading…
          </div>
        )}

        {/* OVERVIEW */}
        {tab === "overview" && data && (
          <>
            <Section title="Subscribers">
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                <Stat label="Verified"     value={a.verified_subscribers ?? "—"} color="#A6B6A1" />
                <Stat label="Pending"      value={a.pending_subscribers  ?? "—"} color="#F3A78E" />
                <Stat label="Unsubscribed" value={a.unsubscribed         ?? "—"} color="#e74c3c" />
              </div>
            </Section>
            <Section title="Email Pipeline">
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                <Stat label="Sent"          value={a.emails_sent          ?? "—"} color="#A6B6A1" />
                <Stat label="Failed"        value={a.emails_failed        ?? "—"} color="#e74c3c" />
                <Stat label="Verification"  value={a.verification_emails  ?? "—"} color="#7C63B8" />
                <Stat label="Welcome"       value={a.welcome_emails       ?? "—"} color="#B9A6E3" />
                <Stat label="Weekly"        value={a.weekly_emails        ?? "—"} color="#F3A78E" />
                <Stat label="Quiz Attempts" value={a.total_quiz_attempts  ?? "—"} color="#7C63B8" />
              </div>
            </Section>
            <Section title="Content">
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                <Stat label="Published Articles"    value={a.published_articles    ?? "—"} color="#7C63B8" />
                <Stat label="Article Views"         value={a.total_article_views   ?? "—"} color="#F3A78E" />
                <Stat label="Approved Deliverables" value={`${a.approved_deliverables ?? 0}/${a.total_deliverables ?? 0}`} color="#A6B6A1" />
                <Stat label="Total Reads"           value={a.total_reads           ?? "—"} color="#B9A6E3" />
                <Stat label="Contact Messages"      value={a.total_contact_messages ?? "—"} color="#F3A78E" />
                <Stat label="Community Posts"       value={userPosts.length}                color="#7C63B8" sub="pending review" />
              </div>
            </Section>
            <Section title="Quick Actions">
              <div className="flex flex-wrap gap-3">
                {[
                  { label: "📤 Trigger Weekly Digest", fn: triggerDigest, color: "#7C63B8" },
                  { label: "🔄 Refresh Stats", fn: fetchData, color: "#A6B6A1" },
                ].map(btn => (
                  <button key={btn.label} onClick={btn.fn}
                    className="px-5 py-2.5 rounded-xl text-sm font-bold text-white transition-all hover:scale-105 active:scale-95"
                    style={{ backgroundColor: btn.color, fontFamily: "var(--font-nunito), Nunito, sans-serif" }}>
                    {btn.label}
                  </button>
                ))}
              </div>
              {triggerMsg && <p className="mt-3 text-sm font-semibold" style={{ color: "#276227", fontFamily: "var(--font-nunito), Nunito, sans-serif" }}>{triggerMsg}</p>}
            </Section>
          </>
        )}

        {/* SUBSCRIBERS */}
        {tab === "subscribers" && (
          <>
            <div className="flex flex-wrap gap-2 mb-5">
              {["all","verified","pending","unsubscribed"].map(f => (
                <button key={f} onClick={() => setSubFilter(f)}
                  className="px-4 py-1.5 rounded-full text-xs font-bold transition-all"
                  style={{
                    backgroundColor: subFilter === f ? "#7C63B8" : "var(--muted, #EDE8E1)",
                    color:           subFilter === f ? "#fff"    : "var(--muted-foreground, #888)",
                    fontFamily: "var(--font-nunito), Nunito, sans-serif",
                  }}>
                  {f.charAt(0).toUpperCase() + f.slice(1)}
                </button>
              ))}
              <span className="ml-auto text-xs self-center" style={{ color: "var(--muted-foreground, #B79D84)", fontFamily: "var(--font-nunito), Nunito, sans-serif" }}>
                {subscribers.length} subscribers
              </span>
            </div>
            <DataTable
              headers={["Email","Verified","Active","Subscribed","Emails","Unsubscribed"]}
              rows={subscribers.map(s => [
                s.email as string,
                s.is_verified ? "✅" : "⏳",
                s.is_active   ? "✅" : "❌",
                new Date(s.subscribed_at as string).toLocaleDateString(),
                s.email_count as number ?? 0,
                s.unsubscribed_at ? new Date(s.unsubscribed_at as string).toLocaleDateString() : "—",
              ])}
            />
          </>
        )}

        {/* EMAILS */}
        {tab === "emails" && data && (
          <>
            <div className="grid grid-cols-3 gap-3 mb-6">
              <Stat label="Sent"    value={(data.emailsByStatus as Record<string,number>)?.sent    ?? 0} color="#A6B6A1" />
              <Stat label="Failed"  value={(data.emailsByStatus as Record<string,number>)?.failed  ?? 0} color="#e74c3c" />
              <Stat label="Pending" value={(data.emailsByStatus as Record<string,number>)?.pending ?? 0} color="#F3A78E" />
            </div>
            <DataTable
              headers={["#","Type","Recipient","Status","Created","Sent","Error"]}
              rows={((data.recentEmails ?? []) as Record<string,unknown>[]).map(e => [
                `#${e.id as number}`,
                e.email_type as string,
                e.recipient as string,
                e.status as string,
                new Date(e.created_at as string).toLocaleString(),
                e.sent_at ? new Date(e.sent_at as string).toLocaleString() : "—",
                (e.last_error as string) ?? "—",
              ])}
              statusCol={3}
            />
          </>
        )}

        {/* CONTENT LOG */}
        {tab === "content" && data && (
          <DataTable
            headers={["Wk","Topic","Status","Mentor ✓","Sources","Novelty","Specificity","Coherence","Rigour"]}
            rows={((data.deliverables ?? []) as Deliverable[]).map(d => [
              `W${d.week_number}`,
              d.topic,
              d.status,
              d.mentor_approved ? "✅" : "⏳",
              d.sources_count ?? 0,
              d.novelty_pass     ? "✅" : "❌",
              d.specificity_pass ? "✅" : "❌",
              d.coherence_pass   ? "✅" : "❌",
              d.rigor_pass       ? "✅" : "❌",
            ])}
            statusCol={2}
          />
        )}

        {/* COMMUNITY POSTS */}
        {tab === "community" && (
          <>
            <p className="text-sm mb-4" style={{ color: "var(--muted-foreground, #B79D84)", fontFamily: "var(--font-nunito), Nunito, sans-serif" }}>
              Community-submitted notes, articles, and videos awaiting review.
            </p>
            <div className="space-y-3">
              {userPosts.length === 0 ? (
                <div className="text-center py-12 rounded-2xl" style={{ border: "1.5px dashed var(--border, #EDE8E1)", color: "var(--muted-foreground, #B79D84)", fontFamily: "var(--font-nunito), Nunito, sans-serif" }}>
                  No community posts yet.
                </div>
              ) : userPosts.map(p => (
                <div key={p.id} className="flex items-center gap-4 px-5 py-4 rounded-xl"
                  style={{ backgroundColor: "var(--card, #fff)", border: "1.5px solid var(--border, #EDE8E1)" }}>
                  <div className="flex-1">
                    <p className="font-bold text-sm" style={{ color: "var(--foreground, #222222)", fontFamily: "var(--font-nunito), Nunito, sans-serif" }}>{p.title}</p>
                    <p className="text-xs mt-0.5" style={{ color: "var(--muted-foreground, #B79D84)", fontFamily: "var(--font-nunito), Nunito, sans-serif" }}>
                      {p.asset_type} · {new Date(p.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <span className="text-xs px-3 py-1 rounded-full font-semibold"
                    style={{ backgroundColor: p.status === "approved" ? "rgba(166,182,161,0.2)" : "rgba(255,243,205,0.8)",
                      color: p.status === "approved" ? "#276227" : "#7D6608",
                      fontFamily: "var(--font-nunito), Nunito, sans-serif" }}>
                    {p.status}
                  </span>
                  {p.status === "pending_review" && (
                    <button onClick={() => approvePost(p.id)}
                      className="px-4 py-1.5 rounded-lg text-xs font-bold text-white"
                      style={{ backgroundColor: "#7C63B8", fontFamily: "var(--font-nunito), Nunito, sans-serif" }}>
                      Approve
                    </button>
                  )}
                </div>
              ))}
            </div>
          </>
        )}

        {/* HEALTH CHECK */}
        {tab === "health" && (
          <>
            <button onClick={runHealth}
              className="mb-4 px-6 py-3 rounded-xl text-sm font-bold text-white"
              style={{ backgroundColor: "#7C63B8", fontFamily: "var(--font-nunito), Nunito, sans-serif" }}>
              🔍 Run Health Check
            </button>
            {health && (
              <pre className="text-xs overflow-x-auto p-4 rounded-xl"
                style={{ backgroundColor: "#1A1A2E", color: "#B9A6E3", fontFamily: "monospace", lineHeight: 1.7, maxHeight: 500 }}>
                {health}
              </pre>
            )}
          </>
        )}
      </div>
    </div>
  )
}
