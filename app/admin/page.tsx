'use client'

// app/admin/page.tsx
// Full admin dashboard: subscribers, email queue, content deliverables, analytics

import { useEffect, useState, useCallback } from 'react'

// ── Types ──────────────────────────────────────────────────────────
interface Analytics {
  verified_subscribers: number
  pending_subscribers:  number
  unsubscribed:         number
  total_articles:       number
  published_articles:   number
  total_article_views:  number
  emails_sent:          number
  emails_failed:        number
  verification_emails:  number
  welcome_emails:       number
  weekly_emails:        number
  approved_deliverables:number
  total_deliverables:   number
  total_quiz_attempts:  number
}

interface EmailRow {
  id: number; email_type: string; recipient: string
  status: string; created_at: string; sent_at: string | null; last_error: string | null
}

interface Deliverable {
  id: number; week_number: number; topic: string; ai_concept: string
  status: string; mentor_approved: boolean; sources_count: number
  assets_produced: string[]; novelty_pass: boolean; specificity_pass: boolean
  coherence_pass: boolean; rigor_pass: boolean
}

interface Subscriber {
  id: string; email: string; is_verified: boolean; is_active: boolean
  subscribed_at: string; email_count: number; unsubscribed_at: string | null
}

type Tab = 'overview' | 'subscribers' | 'emails' | 'content' | 'test'

// ── Colours ────────────────────────────────────────────────────────
const C = {
  purple: '#7C63B8', peach: '#F3A78E', green: '#A6B6A1',
  lavender: '#B9A6E3', bg: '#FAF6F0', card: '#FFFFFF',
  pass: '#D4EDDA', fail: '#F8D7DA', warn: '#FFF3CD',
  passText: '#276227', failText: '#922B21', warnText: '#7D6608',
}

// ── Stat card ──────────────────────────────────────────────────────
function StatCard({ label, value, sub, color }: { label: string; value: number | string; sub?: string; color?: string }) {
  return (
    <div style={{
      background: C.card, borderRadius: 14, padding: '1.25rem 1.5rem',
      boxShadow: '0 2px 12px rgba(0,0,0,0.06)', borderLeft: `4px solid ${color ?? C.purple}`,
    }}>
      <div style={{ fontSize: '1.9rem', fontWeight: 800, color: color ?? C.purple }}>{value}</div>
      <div style={{ fontSize: '0.82rem', fontWeight: 600, color: '#555', marginTop: 2 }}>{label}</div>
      {sub && <div style={{ fontSize: '0.75rem', color: '#999', marginTop: 2 }}>{sub}</div>}
    </div>
  )
}

// ── Badge ──────────────────────────────────────────────────────────
function Badge({ val, type }: { val: string; type?: 'pass' | 'fail' | 'warn' | 'info' }) {
  const map = { pass: [C.pass, C.passText], fail: [C.fail, C.failText], warn: [C.warn, C.warnText], info: ['#EDE8FF', C.purple] }
  const [bg, fg] = map[type ?? 'info']
  return (
    <span style={{ background: bg, color: fg, borderRadius: 99, padding: '2px 10px', fontSize: '0.75rem', fontWeight: 700 }}>
      {val}
    </span>
  )
}

// ── Main page ──────────────────────────────────────────────────────
export default function AdminDashboard() {
  const [tab,          setTab]          = useState<Tab>('overview')
  const [data,         setData]         = useState<any>(null)
  const [subscribers,  setSubscribers]  = useState<Subscriber[]>([])
  const [subFilter,    setSubFilter]    = useState('all')
  const [loading,      setLoading]      = useState(true)
  const [testResult,   setTestResult]   = useState<string>('')
  const [testLoading,  setTestLoading]  = useState(false)
  const [triggerMsg,   setTriggerMsg]   = useState('')

  const ADMIN_SECRET = process.env.NEXT_PUBLIC_ADMIN_SECRET ?? ''

  const fetchData = useCallback(async () => {
    setLoading(true)
    try {
      const res  = await fetch('/api/admin/stats', {
        headers: { Authorization: `Bearer ${ADMIN_SECRET}` }
      })
      const json = await res.json()
      setData(json)
    } catch { /* silent */ }
    setLoading(false)
  }, [ADMIN_SECRET])

  const fetchSubscribers = useCallback(async (filter = 'all') => {
    try {
      const res  = await fetch(`/api/admin/subscribers?filter=${filter}&pageSize=100`, {
        headers: { Authorization: `Bearer ${ADMIN_SECRET}` }
      })
      const json = await res.json()
      setSubscribers(json.subscribers ?? [])
    } catch { /* silent */ }
  }, [ADMIN_SECRET])

  useEffect(() => { fetchData() }, [fetchData])
  useEffect(() => {
    if (tab === 'subscribers') fetchSubscribers(subFilter)
  }, [tab, subFilter, fetchSubscribers])

  async function triggerWeeklyDigest() {
    setTriggerMsg('Sending…')
    const res  = await fetch('/api/weekly-digest', {
      method: 'POST',
      headers: { Authorization: `Bearer ${process.env.NEXT_PUBLIC_CRON_SECRET ?? ''}` }
    })
    const json = await res.json()
    setTriggerMsg(`Done — sent: ${json.sent ?? 0}, failed: ${json.failed ?? 0}`)
  }

  async function runEmailTest() {
    setTestLoading(true)
    const res  = await fetch('/api/test-email')
    const json = await res.json()
    setTestResult(JSON.stringify(json, null, 2))
    setTestLoading(false)
  }

  const a: Analytics = data?.analytics ?? {}

  // ── TAB: Overview ────────────────────────────────────────────────
  const OverviewTab = () => (
    <div>
      <h2 style={sH2}>📊 Platform Analytics</h2>

      {/* Subscribers */}
      <SectionLabel>Subscribers</SectionLabel>
      <div style={grid3}>
        <StatCard label="Verified Subscribers"   value={a.verified_subscribers  ?? '—'} color={C.green}   sub="Active, confirmed" />
        <StatCard label="Pending Verification"   value={a.pending_subscribers   ?? '—'} color={C.warn}    sub="Signed up, not verified" />
        <StatCard label="Unsubscribed"           value={a.unsubscribed          ?? '—'} color="#e74c3c"   sub="Opted out" />
      </div>

      {/* Emails */}
      <SectionLabel>Email Pipeline</SectionLabel>
      <div style={grid3}>
        <StatCard label="Emails Sent"       value={a.emails_sent        ?? '—'} color={C.green}   />
        <StatCard label="Emails Failed"     value={a.emails_failed      ?? '—'} color="#e74c3c"   />
        <StatCard label="Verification Sent" value={a.verification_emails?? '—'} color={C.purple}  />
      </div>
      <div style={{ ...grid3, marginTop: 12 }}>
        <StatCard label="Welcome Emails"   value={a.welcome_emails  ?? '—'} color={C.lavender} />
        <StatCard label="Weekly Digests"   value={a.weekly_emails   ?? '—'} color={C.peach}    />
        <StatCard label="Quiz Attempts"    value={a.total_quiz_attempts ?? '—'} color={C.purple} />
      </div>

      {/* Content */}
      <SectionLabel>Content</SectionLabel>
      <div style={grid3}>
        <StatCard label="Published Articles"   value={a.published_articles   ?? '—'} color={C.purple} />
        <StatCard label="Total Article Views"  value={a.total_article_views  ?? '—'} color={C.peach}  />
        <StatCard label="Approved Deliverables" value={`${a.approved_deliverables ?? 0} / ${a.total_deliverables ?? 0}`} color={C.green} />
      </div>

      {/* Quick actions */}
      <SectionLabel>Quick Actions</SectionLabel>
      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
        <ActionBtn onClick={triggerWeeklyDigest} color={C.purple}>📤 Trigger Weekly Digest</ActionBtn>
        <ActionBtn onClick={fetchData} color={C.green}>🔄 Refresh Stats</ActionBtn>
        <ActionBtn onClick={() => setTab('emails')} color={C.peach}>📬 View Email Queue</ActionBtn>
      </div>
      {triggerMsg && <p style={{ marginTop: 12, color: C.passText, fontWeight: 600, fontSize: '0.9rem' }}>{triggerMsg}</p>}

      {/* Top articles */}
      {data?.topArticles?.length > 0 && (
        <>
          <SectionLabel>Top Articles by Views</SectionLabel>
          <Table
            headers={['Title', 'Category', 'Views', 'Age Group', 'Published']}
            rows={data.topArticles.map((a: any) => [
              a.title,
              a.category,
              a.view_count ?? 0,
              a.age_group ?? 'all',
              a.published_date ? new Date(a.published_date).toLocaleDateString() : '—',
            ])}
          />
        </>
      )}
    </div>
  )

  // ── TAB: Subscribers ─────────────────────────────────────────────
  const SubscribersTab = () => (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <h2 style={sH2}>👥 Subscribers</h2>
        <div style={{ display: 'flex', gap: 8 }}>
          {(['all','verified','pending','unsubscribed'] as const).map(f => (
            <button
              key={f}
              onClick={() => setSubFilter(f)}
              style={{
                padding: '6px 14px', borderRadius: 99, border: 'none', cursor: 'pointer',
                fontWeight: 600, fontSize: '0.8rem',
                background: subFilter === f ? C.purple : '#EDE8FF',
                color:      subFilter === f ? '#fff'   : C.purple,
              }}
            >{f.charAt(0).toUpperCase() + f.slice(1)}</button>
          ))}
        </div>
      </div>
      <p style={{ color: '#888', fontSize: '0.85rem', marginBottom: 12 }}>
        Showing {subscribers.length} subscribers
      </p>
      <Table
        headers={['Email', 'Verified', 'Active', 'Subscribed', 'Emails Sent', 'Last Email', 'Unsubscribed']}
        rows={subscribers.map(s => [
          s.email,
          s.is_verified ? '✅' : '⏳',
          s.is_active   ? '✅' : '❌',
          new Date(s.subscribed_at).toLocaleDateString(),
          s.email_count ?? 0,
          s.last_email_sent_at ? new Date(s.last_email_sent_at).toLocaleDateString() : '—',
          s.unsubscribed_at    ? new Date(s.unsubscribed_at).toLocaleDateString()    : '—',
        ])}
      />
    </div>
  )

  // ── TAB: Email Queue ─────────────────────────────────────────────
  const EmailsTab = () => (
    <div>
      <h2 style={sH2}>📬 Email Queue</h2>
      <div style={grid3}>
        <StatCard label="Sent"    value={data?.emailsByStatus?.sent    ?? 0} color={C.green}   />
        <StatCard label="Failed"  value={data?.emailsByStatus?.failed  ?? 0} color="#e74c3c"   />
        <StatCard label="Pending" value={data?.emailsByStatus?.pending ?? 0} color={C.peach}   />
      </div>
      <div style={{ ...grid3, marginTop: 12, marginBottom: 24 }}>
        <StatCard label="Verification" value={data?.emailsByType?.verification ?? 0} color={C.purple}   />
        <StatCard label="Welcome"      value={data?.emailsByType?.welcome      ?? 0} color={C.lavender} />
        <StatCard label="Weekly"       value={data?.emailsByType?.weekly       ?? 0} color={C.peach}    />
      </div>
      <SectionLabel>Recent Activity (last 20)</SectionLabel>
      <Table
        headers={['ID', 'Type', 'Recipient', 'Status', 'Created', 'Sent', 'Error']}
        rows={(data?.recentEmails ?? []).map((e: EmailRow) => [
          `#${e.id}`,
          e.email_type,
          e.recipient,
          e.status,
          new Date(e.created_at).toLocaleString(),
          e.sent_at ? new Date(e.sent_at).toLocaleString() : '—',
          e.last_error ?? '—',
        ])}
        statusColIndex={3}
      />
    </div>
  )

  // ── TAB: Content Log ────────────────────────────────────────────
  const ContentTab = () => (
    <div>
      <h2 style={sH2}>📝 Content Deliverables (Table 6.1)</h2>
      <p style={{ color: '#888', fontSize: '0.85rem', marginBottom: 16 }}>
        16-week content log as documented in the Internship Report
      </p>
      <div style={{ overflowX: 'auto' }}>
        <table style={tableStyle}>
          <thead>
            <tr>
              {['Wk', 'Topic', 'AI Concept', 'Assets', 'Novelty', 'Specificity', 'Coherence', 'Rigour', 'Sources', 'Status', 'Mentor ✓'].map(h => (
                <th key={h} style={thStyle}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {(data?.deliverables ?? []).map((d: Deliverable, i: number) => (
              <tr key={d.id} style={{ background: i % 2 === 0 ? '#FAFAFA' : '#FFF' }}>
                <td style={tdStyle}><strong style={{ color: C.purple }}>W{d.week_number}</strong></td>
                <td style={{ ...tdStyle, maxWidth: 180 }}>{d.topic}</td>
                <td style={{ ...tdStyle, fontSize: '0.78rem', color: '#666' }}>{d.ai_concept}</td>
                <td style={{ ...tdStyle, fontSize: '0.75rem' }}>{d.assets_produced?.length ?? 0} assets</td>
                <td style={tdStyle}>{d.novelty_pass     ? '✅' : '❌'}</td>
                <td style={tdStyle}>{d.specificity_pass ? '✅' : '❌'}</td>
                <td style={tdStyle}>{d.coherence_pass   ? '✅' : '❌'}</td>
                <td style={tdStyle}>{d.rigor_pass       ? '✅' : '❌'}</td>
                <td style={{ ...tdStyle, textAlign: 'center' }}>{d.sources_count}</td>
                <td style={tdStyle}><Badge val={d.status} type={d.status === 'published' ? 'pass' : 'info'} /></td>
                <td style={{ ...tdStyle, textAlign: 'center' }}>{d.mentor_approved ? '✅' : '⏳'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )

  // ── TAB: Test ────────────────────────────────────────────────────
  const TestTab = () => (
    <div>
      <h2 style={sH2}>🧪 System Health Check</h2>
      <p style={{ color: '#888', fontSize: '0.85rem', marginBottom: 16 }}>
        Verify all environment variables, Edge Function, and DB connections are working.
      </p>
      <ActionBtn onClick={runEmailTest} color={C.purple} disabled={testLoading}>
        {testLoading ? 'Checking…' : '🔍 Run Health Check'}
      </ActionBtn>
      {testResult && (
        <pre style={{
          marginTop: 16, background: '#1A1A2E', color: '#B9A6E3',
          padding: '1.25rem', borderRadius: 12, fontSize: '0.78rem',
          overflowX: 'auto', lineHeight: 1.7, maxHeight: 480,
        }}>
          {testResult}
        </pre>
      )}
    </div>
  )

  // ── Shell ────────────────────────────────────────────────────────
  if (loading && !data) {
    return (
      <Shell tab={tab} setTab={setTab}>
        <div style={{ textAlign: 'center', padding: '4rem', color: '#888' }}>
          <div style={{ fontSize: '2rem', marginBottom: 8 }}>⏳</div>
          Loading dashboard…
        </div>
      </Shell>
    )
  }

  return (
    <Shell tab={tab} setTab={setTab}>
      {tab === 'overview'     && <OverviewTab />}
      {tab === 'subscribers'  && <SubscribersTab />}
      {tab === 'emails'       && <EmailsTab />}
      {tab === 'content'      && <ContentTab />}
      {tab === 'test'         && <TestTab />}
    </Shell>
  )
}

// ── Shell wrapper ──────────────────────────────────────────────────
function Shell({ children, tab, setTab }: { children: React.ReactNode; tab: Tab; setTab: (t: Tab) => void }) {
  const TABS: { key: Tab; label: string }[] = [
    { key: 'overview',    label: '📊 Overview'     },
    { key: 'subscribers', label: '👥 Subscribers'  },
    { key: 'emails',      label: '📬 Email Queue'  },
    { key: 'content',     label: '📝 Content Log'  },
    { key: 'test',        label: '🧪 Health Check' },
  ]
  return (
    <div style={{ minHeight: '100vh', background: C.bg, fontFamily: "'Segoe UI',Arial,sans-serif" }}>
      {/* Header */}
      <div style={{ background: `linear-gradient(135deg,${C.purple},${C.lavender})`, padding: '1.25rem 2rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <div>
          <div style={{ fontWeight: 800, fontSize: '1.2rem', color: '#fff' }}>Parent in the Loop</div>
          <div style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.8)' }}>Admin Dashboard</div>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ background: '#fff', borderBottom: '1.5px solid #EDE8E1', display: 'flex', gap: 0, overflowX: 'auto', padding: '0 1.5rem' }}>
        {TABS.map(t => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            style={{
              padding: '0.9rem 1.25rem',
              background: 'none',
              border: 'none',
              borderBottom: tab === t.key ? `3px solid ${C.purple}` : '3px solid transparent',
              color:    tab === t.key ? C.purple : '#666',
              fontWeight: tab === t.key ? 700 : 400,
              cursor:   'pointer',
              fontSize: '0.88rem',
              whiteSpace: 'nowrap',
              transition: 'all 0.15s',
            }}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '2rem 1.5rem' }}>
        {children}
      </div>
    </div>
  )
}

// ── Reusable helpers ───────────────────────────────────────────────
function SectionLabel({ children }: { children: React.ReactNode }) {
  return <p style={{ fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#B79D84', margin: '1.75rem 0 0.65rem' }}>{children}</p>
}

function ActionBtn({ children, onClick, color, disabled }: { children: React.ReactNode; onClick: () => void; color: string; disabled?: boolean }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{
        background: color, color: '#fff', border: 'none', borderRadius: 50,
        padding: '10px 20px', fontWeight: 700, fontSize: '0.85rem',
        cursor: disabled ? 'not-allowed' : 'pointer', opacity: disabled ? 0.6 : 1,
      }}
    >
      {children}
    </button>
  )
}

function Table({ headers, rows, statusColIndex }: { headers: string[]; rows: (string | number)[]; statusColIndex?: number }) {
  return (
    <div style={{ overflowX: 'auto' }}>
      <table style={tableStyle}>
        <thead>
          <tr>{headers.map(h => <th key={h} style={thStyle}>{h}</th>)}</tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={i} style={{ background: i % 2 === 0 ? '#FAFAFA' : '#FFF' }}>
              {(row as any[]).map((cell, j) => {
                let extra = {}
                if (j === statusColIndex) {
                  const s = String(cell)
                  const bg = s === 'sent' ? C.pass : s === 'failed' ? C.fail : s === 'pending' ? C.warn : '#EDE8FF'
                  const fg = s === 'sent' ? C.passText : s === 'failed' ? C.failText : s === 'pending' ? C.warnText : C.purple
                  extra = { background: bg, color: fg, fontWeight: 700 }
                }
                return <td key={j} style={{ ...tdStyle, ...extra }}>{cell}</td>
              })}
            </tr>
          ))}
          {rows.length === 0 && (
            <tr><td colSpan={headers.length} style={{ ...tdStyle, textAlign: 'center', color: '#aaa', padding: '2rem' }}>No data</td></tr>
          )}
        </tbody>
      </table>
    </div>
  )
}

// ── Styles ─────────────────────────────────────────────────────────
const grid3:      React.CSSProperties = { display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(200px,1fr))', gap: 12 }
const sH2:        React.CSSProperties = { fontSize: '1.25rem', fontWeight: 800, color: '#1A1A2E', margin: '0 0 1rem' }
const tableStyle: React.CSSProperties = { width: '100%', borderCollapse: 'collapse', fontSize: '0.83rem', minWidth: 600 }
const thStyle:    React.CSSProperties = { background: '#7C63B8', color: '#fff', fontWeight: 700, padding: '9px 12px', textAlign: 'left', fontSize: '0.78rem', whiteSpace: 'nowrap' }
const tdStyle:    React.CSSProperties = { padding: '8px 12px', borderBottom: '1px solid #EDE8E1', verticalAlign: 'middle', color: '#333' }
