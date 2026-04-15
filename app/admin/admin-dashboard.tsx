"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from "recharts"

const BRAND = { plum: "#7C63B8", coral: "#F3A78E", sage: "#A6B6A1", gold: "#F4D78B", lavender: "#B9A6E3", sky: "#BFD6E1" }
const PIE_COLORS = [BRAND.plum, BRAND.coral, BRAND.sage, BRAND.gold]
const CATEGORIES = ["AI Literacy", "Parenting", "Family Conversations", "Safety"]
const F  = { fontFamily: "var(--font-nunito), Nunito, sans-serif" }
const FQ = { fontFamily: "var(--font-quicksand), Quicksand, sans-serif" }

interface Stats {
  totals: { subscribers: number; activeSubscribers: number; articles: number; messages: number; quizAttempts: number; avgQuizScore: number }
  growthData:   { week: string; count: number }[]
  categoryData: { name: string; count: number }[]
  topArticles:  { slug: string; views: number }[]
}

interface Article {
  id: number; title: string; slug: string; category: string
  published_date: string; featured: boolean; read_time: number
  tags: string[]; substack_url: string; excerpt: string; image_url?: string
}

function KpiCard({ label, value, emoji, color, suffix }: { label: string; value: number; emoji: string; color: string; suffix: string }) {
  const [n, setN] = useState(0)
  useEffect(() => {
    const dur = 1200, start = performance.now()
    const tick = (now: number) => {
      const p = Math.min((now - start) / dur, 1)
      setN(Math.round((1 - Math.pow(2, -10 * p)) * value))
      if (p < 1) requestAnimationFrame(tick)
    }
    requestAnimationFrame(tick)
  }, [value])
  return (
    <div className="rounded-2xl p-5 flex flex-col gap-3 transition-all hover:scale-[1.02] hover:shadow-md"
      style={{ backgroundColor: "#fff", border: "1.5px solid #EDE8E1" }}>
      <div className="flex items-center justify-between">
        <span className="text-2xl" aria-hidden="true">{emoji}</span>
        <div className="w-2 h-8 rounded-full" style={{ backgroundColor: color, opacity: 0.6 }} aria-hidden="true" />
      </div>
      <div>
        <p className="text-3xl font-bold tabular-nums" style={{ color, ...FQ }}>{n.toLocaleString()}{suffix}</p>
        <p className="text-xs mt-0.5 font-semibold" style={{ color: "#B79D84", ...F }}>{label}</p>
      </div>
    </div>
  )
}

const EMPTY: Partial<Article> & { content: string } = {
  title: "", slug: "", excerpt: "", content: "", category: "AI Literacy",
  image_url: "", substack_url: "", read_time: 5, featured: false, tags: [],
}

export default function AdminDashboard({ userEmail }: { userEmail: string }) {
  const [tab, setTab] = useState<"overview" | "articles" | "messages">("overview")
  const [stats, setStats]         = useState<Stats | null>(null)
  const [articles, setArticles]   = useState<Article[]>([])
  const [statsLoading, setSL]     = useState(true)
  const [artLoading, setAL]       = useState(false)
  const [statsError, setSE]       = useState("")
  const [showForm, setShowForm]   = useState(false)
  const [editing, setEditing]     = useState<Article | null>(null)
  const [form, setForm]           = useState({ ...EMPTY })
  const [saving, setSaving]       = useState(false)
  const [saveMsg, setSaveMsg]     = useState("")
  const [deleting, setDeleting]   = useState<number | null>(null)

  useEffect(() => {
    fetch("/api/admin/stats")
      .then((r) => r.json())
      .then((d) => { if (d.error) setSE(d.error); else setStats(d) })
      .catch(() => setSE("Failed to load"))
      .finally(() => setSL(false))
  }, [])

  useEffect(() => {
    if (tab !== "articles") return
    setAL(true)
    fetch("/api/admin/articles", { headers: { "x-admin-email": userEmail } })
      .then((r) => r.json()).then((d) => setArticles(d.articles ?? []))
      .finally(() => setAL(false))
  }, [tab, userEmail])

  const setF = (key: string, val: unknown) => setForm((p) => ({ ...p, [key]: val }))

  const openNew = () => { setEditing(null); setForm({ ...EMPTY }); setShowForm(true); setSaveMsg("") }
  const openEdit = (a: Article) => {
    setEditing(a)
    setForm({ title: a.title, slug: a.slug, excerpt: a.excerpt, content: "", category: a.category,
      image_url: a.image_url ?? "", substack_url: a.substack_url ?? "", read_time: a.read_time ?? 5,
      featured: a.featured, tags: a.tags ?? [] })
    setShowForm(true); setSaveMsg("")
  }

  const handleSave = async () => {
    setSaving(true); setSaveMsg("")
    try {
      const method = editing ? "PATCH" : "POST"
      const body   = editing ? { id: editing.id, ...form } : form
      const res = await fetch("/api/admin/articles", {
        method, headers: { "Content-Type": "application/json", "x-admin-email": userEmail },
        body: JSON.stringify(body),
      })
      const d = await res.json()
      if (!res.ok) { setSaveMsg("Error: " + d.error); return }
      setSaveMsg(editing ? "Article updated!" : "Article created!")
      setShowForm(false)
      fetch("/api/admin/articles", { headers: { "x-admin-email": userEmail } })
        .then((r) => r.json()).then((d) => setArticles(d.articles ?? []))
    } catch { setSaveMsg("Network error") }
    finally { setSaving(false) }
  }

  const handleDelete = async (id: number) => {
    if (!confirm("Delete this article permanently?")) return
    setDeleting(id)
    await fetch("/api/admin/articles", {
      method: "DELETE",
      headers: { "Content-Type": "application/json", "x-admin-email": userEmail },
      body: JSON.stringify({ id }),
    })
    setArticles((prev) => prev.filter((a) => a.id !== id))
    setDeleting(null)
  }

  const KPI_CFG = [
    { key: "activeSubscribers", label: "Active Subscribers", emoji: "📬", color: BRAND.plum,     suffix: "" },
    { key: "articles",          label: "Articles Published", emoji: "📝", color: BRAND.sage,     suffix: "" },
    { key: "quizAttempts",      label: "Quiz Completions",   emoji: "🧠", color: BRAND.coral,    suffix: "" },
    { key: "avgQuizScore",      label: "Avg Quiz Score",     emoji: "⭐", color: BRAND.gold,     suffix: "%" },
    { key: "messages",          label: "Messages Received",  emoji: "💬", color: BRAND.sky,      suffix: "" },
    { key: "subscribers",       label: "Total Subscribers",  emoji: "👥", color: BRAND.lavender, suffix: "" },
  ]

  return (
    <main className="min-h-screen px-4 sm:px-6 lg:px-8 py-10" style={{ backgroundColor: "#FAF6F0" }}>
      <div className="max-w-6xl mx-auto">
        {/* Top bar */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <Link href="/"><img src="/images/pitl-20logo1.png" alt="" className="w-9 h-9 object-contain" aria-hidden="true" /></Link>
            <div>
              <h1 className="text-2xl font-bold" style={{ color: "#222222", ...FQ }}>Admin Dashboard</h1>
              <p className="text-xs" style={{ color: "#B79D84", ...F }}>{userEmail}</p>
            </div>
          </div>
          <div className="flex gap-3">
            <Link href="/dashboard" className="text-sm font-semibold px-4 py-2 rounded-xl"
              style={{ backgroundColor: "#fff", border: "1.5px solid #EDE8E1", color: "#3E3E3E", ...F }}>My Account</Link>
            <Link href="/" className="text-sm font-semibold px-4 py-2 rounded-xl text-white"
              style={{ backgroundColor: "#7C63B8", ...F }}>View Site →</Link>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-8">
          {(["overview","articles","messages"] as const).map((t) => (
            <button key={t} onClick={() => setTab(t)}
              className="px-5 py-2.5 rounded-xl text-sm font-bold capitalize transition-all"
              style={{ backgroundColor: tab===t?"#7C63B8":"#fff", color: tab===t?"#fff":"#3E3E3E",
                       border: `1.5px solid ${tab===t?"#7C63B8":"#EDE8E1"}`, ...F }}>
              {t==="overview"?"📊 Overview":t==="articles"?"📝 Articles":"💬 Messages"}
            </button>
          ))}
        </div>

        {/* OVERVIEW */}
        {tab==="overview" && (
          <div className="space-y-8">
            {statsLoading && <div className="flex justify-center py-32"><div className="w-12 h-12 rounded-full border-4 border-t-transparent animate-spin" style={{ borderColor:"#7C63B8",borderTopColor:"transparent" }}/></div>}
            {statsError && !statsLoading && <div className="rounded-2xl p-8 text-center" style={{ backgroundColor:"rgba(243,167,142,0.1)",border:"1.5px solid rgba(243,167,142,0.3)" }}><p className="font-bold" style={{ color:"#c97a5a",...FQ }}>⚠️ {statsError}</p></div>}
            {stats && (<>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {KPI_CFG.map((cfg) => <KpiCard key={cfg.key} {...cfg} value={stats.totals[cfg.key as keyof typeof stats.totals]}/>)}
              </div>
              <div className="rounded-2xl p-6" style={{ backgroundColor:"#fff",border:"1.5px solid #EDE8E1" }}>
                <h2 className="text-base font-bold mb-1" style={{ color:"#222",...FQ }}>📈 Subscriber Growth — Last 8 Weeks</h2>
                <p className="text-xs mb-5" style={{ color:"#B79D84",...F }}>New subscribers per week</p>
                <ResponsiveContainer width="100%" height={220}>
                  <AreaChart data={stats.growthData} margin={{ top:4,right:4,left:-20,bottom:0 }}>
                    <defs><linearGradient id="sg" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor={BRAND.plum} stopOpacity={0.25}/><stop offset="95%" stopColor={BRAND.plum} stopOpacity={0}/></linearGradient></defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#EDE8E1"/>
                    <XAxis dataKey="week" tick={{ fontSize:10,fill:"#B79D84",fontFamily:"Nunito" }}/>
                    <YAxis tick={{ fontSize:10,fill:"#B79D84",fontFamily:"Nunito" }} allowDecimals={false}/>
                    <Tooltip contentStyle={{ borderRadius:12,border:"1px solid #EDE8E1",fontFamily:"Nunito",fontSize:12 }}/>
                    <Area type="monotone" dataKey="count" name="New Subscribers" stroke={BRAND.plum} strokeWidth={2.5} fill="url(#sg)" dot={{ fill:BRAND.plum,r:4 }} activeDot={{ r:6 }}/>
                  </AreaChart>
                </ResponsiveContainer>
              </div>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="rounded-2xl p-6" style={{ backgroundColor:"#fff",border:"1.5px solid #EDE8E1" }}>
                  <h2 className="text-base font-bold mb-4" style={{ color:"#222",...FQ }}>📚 Articles by Category</h2>
                  {stats.categoryData.length>0 ? (
                    <ResponsiveContainer width="100%" height={200}><PieChart><Pie data={stats.categoryData} cx="50%" cy="50%" innerRadius={55} outerRadius={85} dataKey="count" nameKey="name" paddingAngle={3}>{stats.categoryData.map((_,i)=><Cell key={i} fill={PIE_COLORS[i%PIE_COLORS.length]}/>)}</Pie><Tooltip contentStyle={{ borderRadius:12,fontFamily:"Nunito",fontSize:12 }}/><Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize:11,fontFamily:"Nunito" }}/></PieChart></ResponsiveContainer>
                  ) : <div className="h-48 flex items-center justify-center"><p style={{ color:"#B79D84",...F }}>No articles yet</p></div>}
                </div>
                <div className="rounded-2xl p-6" style={{ backgroundColor:"#fff",border:"1.5px solid #EDE8E1" }}>
                  <h2 className="text-base font-bold mb-4" style={{ color:"#222",...FQ }}>🔥 Most Read Articles</h2>
                  {stats.topArticles.length>0 ? (
                    <ResponsiveContainer width="100%" height={200}><BarChart data={stats.topArticles} layout="vertical" margin={{ top:0,right:4,left:4,bottom:0 }}><CartesianGrid strokeDasharray="3 3" stroke="#EDE8E1" horizontal={false}/><XAxis type="number" tick={{ fontSize:10,fill:"#B79D84",fontFamily:"Nunito" }}/><YAxis type="category" dataKey="slug" width={100} tick={{ fontSize:9,fill:"#B79D84",fontFamily:"Nunito" }} tickFormatter={(s)=>s.replace(/-/g," ").slice(0,14)+"…"}/><Tooltip contentStyle={{ borderRadius:12,fontFamily:"Nunito",fontSize:12 }} formatter={(v:number)=>[`${v} views`,"Views"]}/><Bar dataKey="views" radius={[0,6,6,0]}>{stats.topArticles.map((_,i)=><Cell key={i} fill={[BRAND.coral,BRAND.plum,BRAND.sage,BRAND.gold,BRAND.sky,BRAND.lavender][i]??BRAND.plum}/>)}</Bar></BarChart></ResponsiveContainer>
                  ) : <div className="h-48 flex items-center justify-center"><p style={{ color:"#B79D84",...F }}>No views yet</p></div>}
                </div>
              </div>
              <div className="rounded-2xl p-6" style={{ backgroundColor:"#fff",border:"1.5px solid #EDE8E1" }}>
                <h2 className="text-base font-bold mb-4" style={{ color:"#222",...FQ }}>🔧 Quick Actions</h2>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {[{label:"Health Check",href:"/api/health",emoji:"💚"},{label:"All Articles",href:"/api/articles",emoji:"📝"},{label:"Test Email",href:"/api/test-email",emoji:"📧"},{label:"View Site",href:"/",emoji:"🌐"}].map((a)=>(
                    <a key={a.label} href={a.href} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-semibold transition-all hover:scale-[1.02]" style={{ backgroundColor:"#FAF6F0",border:"1.5px solid #EDE8E1",color:"#3E3E3E",...F }}>{a.emoji} {a.label} ↗</a>
                  ))}
                </div>
              </div>
            </>)}
          </div>
        )}

        {/* ARTICLES */}
        {tab==="articles" && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold" style={{ color:"#222",...FQ }}>Article Management</h2>
              <button onClick={openNew} className="px-5 py-2.5 rounded-xl text-sm font-bold text-white transition-all hover:scale-105" style={{ backgroundColor:"#F3A78E",...F }}>+ New Article</button>
            </div>
            {saveMsg && <div className="mb-4 px-4 py-3 rounded-xl text-sm font-semibold" style={{ backgroundColor:saveMsg.includes("Error")?"rgba(243,167,142,0.15)":"rgba(166,182,161,0.2)", color:saveMsg.includes("Error")?"#c97a5a":"#4d7a49",...F }}>{saveMsg}</div>}
            {showForm && (
              <div className="rounded-2xl p-6 mb-6" style={{ backgroundColor:"#fff",border:"1.5px solid #EDE8E1" }}>
                <h3 className="text-base font-bold mb-5" style={{ color:"#222",...FQ }}>{editing?"Edit Article":"New Article"}</h3>
                <div className="grid sm:grid-cols-2 gap-4">
                  {[{key:"title",label:"Title *",type:"text"},{key:"slug",label:"Slug (auto-gen if blank)",type:"text"},{key:"substack_url",label:"Substack URL",type:"url"},{key:"image_url",label:"Image URL",type:"url"},{key:"read_time",label:"Read Time (min)",type:"number"}].map(({key,label,type})=>(
                    <div key={key}>
                      <label className="block text-xs font-bold mb-1" style={{ color:"#3E3E3E",...F }}>{label}</label>
                      <input type={type} value={String((form as Record<string,unknown>)[key]??"")} onChange={(e)=>setF(key,type==="number"?parseInt(e.target.value)||0:e.target.value)} className="w-full px-3 py-2.5 rounded-xl text-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-[#7C63B8]" style={{ backgroundColor:"#FAF6F0",border:"1.5px solid #EDE8E1",color:"#222",...F }}/>
                    </div>
                  ))}
                  <div>
                    <label className="block text-xs font-bold mb-1" style={{ color:"#3E3E3E",...F }}>Category *</label>
                    <select value={form.category as string} onChange={(e)=>setF("category",e.target.value)} className="w-full px-3 py-2.5 rounded-xl text-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-[#7C63B8]" style={{ backgroundColor:"#FAF6F0",border:"1.5px solid #EDE8E1",color:"#222",...F }}>
                      {CATEGORIES.map((c)=><option key={c}>{c}</option>)}
                    </select>
                  </div>
                  <div className="flex items-center gap-3 pt-5">
                    <input type="checkbox" id="feat" checked={!!form.featured} onChange={(e)=>setF("featured",e.target.checked)} className="w-4 h-4 accent-[#7C63B8]"/>
                    <label htmlFor="feat" className="text-sm font-semibold" style={{ color:"#3E3E3E",...F }}>Featured article</label>
                  </div>
                </div>
                <div className="mt-4">
                  <label className="block text-xs font-bold mb-1" style={{ color:"#3E3E3E",...F }}>Excerpt *</label>
                  <textarea value={form.excerpt as string} onChange={(e)=>setF("excerpt",e.target.value)} rows={2} className="w-full px-3 py-2.5 rounded-xl text-sm resize-none focus:outline-none focus-visible:ring-2 focus-visible:ring-[#7C63B8]" style={{ backgroundColor:"#FAF6F0",border:"1.5px solid #EDE8E1",color:"#222",...F }}/>
                </div>
                <div className="mt-4">
                  <label className="block text-xs font-bold mb-1" style={{ color:"#3E3E3E",...F }}>Content (Markdown: **bold**, - bullets, blank lines = paragraphs)</label>
                  <textarea value={form.content as string} onChange={(e)=>setF("content",e.target.value)} rows={7} className="w-full px-3 py-2.5 rounded-xl text-sm resize-y focus:outline-none focus-visible:ring-2 focus-visible:ring-[#7C63B8]" style={{ backgroundColor:"#FAF6F0",border:"1.5px solid #EDE8E1",color:"#222",...F }}/>
                </div>
                <div className="flex gap-3 mt-5">
                  <button onClick={handleSave} disabled={saving||!form.title||!form.excerpt} className="px-6 py-2.5 rounded-xl text-sm font-bold text-white disabled:opacity-50 transition-all hover:scale-105" style={{ backgroundColor:"#7C63B8",...F }}>{saving?"Saving…":editing?"Update Article":"Create Article"}</button>
                  <button onClick={()=>setShowForm(false)} className="px-5 py-2.5 rounded-xl text-sm font-semibold transition-all hover:scale-105" style={{ backgroundColor:"#FAF6F0",border:"1.5px solid #EDE8E1",color:"#3E3E3E",...F }}>Cancel</button>
                </div>
              </div>
            )}
            {artLoading ? <div className="flex justify-center py-16"><div className="w-10 h-10 rounded-full border-4 border-t-transparent animate-spin" style={{ borderColor:"#7C63B8",borderTopColor:"transparent" }}/></div> : (
              <div className="rounded-2xl overflow-hidden" style={{ border:"1.5px solid #EDE8E1" }}>
                <table className="w-full text-sm">
                  <thead><tr style={{ backgroundColor:"#FAF6F0",borderBottom:"1px solid #EDE8E1" }}>{["Title","Category","Date","Featured","Actions"].map((h)=><th key={h} className="text-left px-4 py-3 text-xs font-bold" style={{ color:"#B79D84",...F }}>{h}</th>)}</tr></thead>
                  <tbody>
                    {articles.map((a,i)=>(
                      <tr key={a.id} style={{ backgroundColor:i%2===0?"#fff":"#FAFAFA",borderBottom:"1px solid #EDE8E1" }}>
                        <td className="px-4 py-3"><p className="font-semibold line-clamp-1" style={{ color:"#222",...F }}>{a.title}</p><p className="text-xs" style={{ color:"#B79D84",...F }}>/{a.slug}</p></td>
                        <td className="px-4 py-3"><span className="px-2 py-1 rounded-full text-xs font-bold" style={{ backgroundColor:"rgba(124,99,184,0.1)",color:"#7C63B8",...F }}>{a.category}</span></td>
                        <td className="px-4 py-3 text-xs" style={{ color:"#B79D84",...F }}>{new Date(a.published_date).toLocaleDateString("en-US",{month:"short",day:"numeric",year:"numeric"})}</td>
                        <td className="px-4 py-3" style={{ color:a.featured?"#4d7a49":"#B79D84" }}>{a.featured?"⭐ Yes":"No"}</td>
                        <td className="px-4 py-3"><div className="flex gap-2"><button onClick={()=>openEdit(a)} className="px-3 py-1.5 rounded-lg text-xs font-bold transition-all hover:scale-105" style={{ backgroundColor:"rgba(124,99,184,0.1)",color:"#7C63B8",...F }}>Edit</button><button onClick={()=>handleDelete(a.id)} disabled={deleting===a.id} className="px-3 py-1.5 rounded-lg text-xs font-bold transition-all hover:scale-105 disabled:opacity-50" style={{ backgroundColor:"rgba(243,167,142,0.15)",color:"#c97a5a",...F }}>{deleting===a.id?"…":"Delete"}</button></div></td>
                      </tr>
                    ))}
                    {articles.length===0 && <tr><td colSpan={5} className="text-center py-12" style={{ color:"#B79D84",...F }}>No articles yet. Click &ldquo;+ New Article&rdquo; to add one.</td></tr>}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* MESSAGES */}
        {tab==="messages" && (
          <div className="rounded-2xl p-8 text-center" style={{ backgroundColor:"#fff",border:"1.5px solid #EDE8E1" }}>
            <div className="text-4xl mb-3">💬</div>
            <h2 className="text-xl font-bold mb-2" style={{ color:"#222",...FQ }}>Contact Messages</h2>
            <p className="text-sm mb-4" style={{ color:"#B79D84",...F }}>View messages in your Supabase dashboard → Table Editor → contact_messages</p>
            <a href="https://supabase.com/dashboard/project/riybvfwcrqvoryslkokz/editor" target="_blank" rel="noopener noreferrer" className="inline-block px-6 py-2.5 rounded-xl text-sm font-bold text-white transition-all hover:scale-105" style={{ backgroundColor:"#7C63B8",...F }}>Open Supabase Table Editor ↗</a>
          </div>
        )}
      </div>
    </main>
  )
}
