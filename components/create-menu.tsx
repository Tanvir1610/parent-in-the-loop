"use client"

// components/create-menu.tsx
// Substack-style Create dropdown: Note | Article | Video
// Opens a full modal with type-specific form

import { useState, useRef, useEffect } from "react"
import { Plus, ChevronDown, X, FileText, Video, StickyNote } from "lucide-react"
import { useUser } from "@clerk/nextjs"

const TYPES = [
  { id: "note",    label: "Note",    icon: StickyNote, color: "#A6B6A1", desc: "Share a quick thought or tip" },
  { id: "article", label: "Article", icon: FileText,   color: "#7C63B8", desc: "Write a long-form AI parenting article" },
  { id: "video",   label: "Video",   icon: Video,      color: "#F3A78E", desc: "Share a video link with commentary" },
] as const

type PostType = (typeof TYPES)[number]

const CATEGORIES = ["AI Literacy", "Safety", "Family Conversations", "Parenting"]
const AGE_GROUPS = [
  { value: "all", label: "All Ages" }, { value: "5-7", label: "5–7" },
  { value: "8-10", label: "8–10" },   { value: "11-13", label: "11–13" },
  { value: "14-16", label: "14–16" }, { value: "17+", label: "17+" },
]

export default function CreateMenu({ mobile = false }: { mobile?: boolean }) {
  const [open,      setOpen]      = useState(false)
  const [modal,     setModal]     = useState(false)
  const [postType,  setPostType]  = useState<PostType | null>(null)
  const dropRef = useRef<HTMLDivElement>(null)
  const { isSignedIn } = useUser()

  // Close dropdown when clicking outside
  useEffect(() => {
    function outside(e: MouseEvent) {
      if (dropRef.current && !dropRef.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener("mousedown", outside)
    return () => document.removeEventListener("mousedown", outside)
  }, [])

  function openModal(type: PostType) { setOpen(false); setPostType(type); setModal(true) }

  if (mobile) {
    return (
      <>
        <p className="text-xs font-bold tracking-widest uppercase mb-2" style={{ color: "#B79D84", fontFamily: "var(--font-nunito), Nunito, sans-serif" }}>Create</p>
        <div className="flex gap-2 flex-wrap">
          {TYPES.map(t => (
            <button key={t.id} onClick={() => openModal(t)}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-semibold border transition-all"
              style={{ color: t.color, borderColor: t.color + "44", backgroundColor: t.color + "10", fontFamily: "var(--font-nunito), Nunito, sans-serif" }}>
              <t.icon size={14} /> {t.label}
            </button>
          ))}
        </div>
        {modal && postType && <CreateModal type={postType} onClose={() => setModal(false)} />}
      </>
    )
  }

  return (
    <>
      <div ref={dropRef} className="relative">
        <button
          onClick={() => setOpen(o => !o)}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-bold text-white transition-all hover:scale-105 active:scale-95 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#F3A78E] focus-visible:ring-offset-2"
          style={{ backgroundColor: "#F3A78E", fontFamily: "var(--font-nunito), Nunito, sans-serif", boxShadow: "0 2px 8px rgba(243,167,142,0.4)" }}
          aria-expanded={open} aria-haspopup="menu"
          onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.backgroundColor = "#E8926A" }}
          onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.backgroundColor = "#F3A78E" }}
        >
          <Plus size={16} />
          Create
          <ChevronDown size={13} className={`transition-transform duration-200 ${open ? "rotate-180" : ""}`} />
        </button>

        {open && (
          <div
            className="absolute top-full right-0 mt-2 w-56 rounded-2xl overflow-hidden shadow-xl z-50"
            style={{ backgroundColor: "var(--card, #fff)", border: "1.5px solid #EDE8E1" }}
            role="menu" aria-label="Create options"
          >
            {/* Header */}
            <div className="px-4 pt-3 pb-2 border-b" style={{ borderColor: "#EDE8E1" }}>
              <p className="text-xs font-bold uppercase tracking-wider" style={{ color: "#B79D84", fontFamily: "var(--font-nunito), Nunito, sans-serif" }}>
                Share with community
              </p>
            </div>

            {TYPES.map((t, i) => (
              <button
                key={t.id}
                onClick={() => openModal(t)}
                className="w-full flex items-start gap-3 px-4 py-3 text-left transition-colors hover:bg-[#FAF6F0] dark:hover:bg-[#1A1A2E] focus:outline-none"
                style={{ borderBottom: i < TYPES.length - 1 ? "1px solid #EDE8E1" : "none" }}
                role="menuitem"
              >
                <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5"
                  style={{ backgroundColor: t.color + "18" }}>
                  <t.icon size={15} style={{ color: t.color }} />
                </div>
                <div>
                  <p className="text-sm font-bold" style={{ color: "var(--foreground, #222222)", fontFamily: "var(--font-nunito), Nunito, sans-serif" }}>{t.label}</p>
                  <p className="text-xs mt-0.5" style={{ color: "#B79D84", fontFamily: "var(--font-nunito), Nunito, sans-serif" }}>{t.desc}</p>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {modal && postType && <CreateModal type={postType} onClose={() => setModal(false)} />}
    </>
  )
}

// ── Create Modal ────────────────────────────────────────────────
function CreateModal({ type, onClose }: { type: PostType; onClose: () => void }) {
  const [form,       setForm]       = useState<Record<string, string | string[] | boolean | number>>({
    title: "", content: "", excerpt: "", video_url: "", category: "", age_group: "all", tagsRaw: "", read_time: 5,
  })
  const [submitting, setSubmitting] = useState(false)
  const [done,       setDone]       = useState(false)

  function set(k: string, v: unknown) { setForm(f => ({ ...f, [k]: v })) }

  // Trap focus inside modal
  useEffect(() => {
    function onKey(e: KeyboardEvent) { if (e.key === "Escape") onClose() }
    document.addEventListener("keydown", onKey)
    document.body.style.overflow = "hidden"
    return () => { document.removeEventListener("keydown", onKey); document.body.style.overflow = "" }
  }, [onClose])

  async function submit() {
    if (!String(form.title).trim()) return
    setSubmitting(true)
    try {
      const tags = String(form.tagsRaw || "").split(",").map(t => t.trim()).filter(Boolean)
      await fetch("/api/user-posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, tags, asset_type: type.id }),
      })
      setDone(true)
    } catch (e) {
      console.error("[CreateModal] submit error:", e)
    }
    setSubmitting(false)
  }

  const inputCls = "w-full px-3 py-2.5 rounded-xl text-sm border focus:outline-none focus-visible:ring-2 focus-visible:ring-[#7C63B8] transition-colors"
  const inputStyle = {
    backgroundColor: "var(--muted, #FAF6F0)",
    borderColor: "#EDE8E1",
    color: "var(--foreground, #222222)",
    fontFamily: "var(--font-nunito), Nunito, sans-serif",
  }
  const labelCls = "block text-xs font-bold uppercase tracking-wider mb-1.5"
  const labelStyle = { color: "#B79D84", fontFamily: "var(--font-nunito), Nunito, sans-serif" }

  return (
    <div
      className="fixed inset-0 z-[999] flex items-start justify-center pt-[5vh] pb-8 px-4 overflow-y-auto"
      style={{ backgroundColor: "rgba(0,0,0,0.55)", backdropFilter: "blur(6px)" }}
      onClick={e => { if (e.target === e.currentTarget) onClose() }}
      role="dialog" aria-modal="true" aria-label={`Create ${type.label}`}
    >
      <div className="w-full max-w-[560px] rounded-2xl overflow-hidden shadow-2xl"
        style={{ backgroundColor: "var(--card, #fff)", border: "1.5px solid #EDE8E1" }}>

        {/* Modal header */}
        <div className="flex items-center justify-between px-6 py-5"
          style={{ background: `linear-gradient(135deg, ${type.color}cc, ${type.color}88)`, borderBottom: "1px solid rgba(255,255,255,0.2)" }}>
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center">
              <type.icon size={18} className="text-white" />
            </div>
            <div>
              <h2 className="text-white font-bold text-lg" style={{ fontFamily: "var(--font-quicksand), Quicksand, sans-serif" }}>
                Create {type.label}
              </h2>
              <p className="text-white/75 text-xs" style={{ fontFamily: "var(--font-nunito), Nunito, sans-serif" }}>{type.desc}</p>
            </div>
          </div>
          <button onClick={onClose} aria-label="Close"
            className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-white">
            <X size={16} className="text-white" />
          </button>
        </div>

        <div className="px-6 py-6">
          {done ? (
            <div className="text-center py-8">
              <div className="text-5xl mb-4">🎉</div>
              <h3 className="text-lg font-bold mb-2" style={{ color: "var(--foreground, #222222)", fontFamily: "var(--font-quicksand), Quicksand, sans-serif" }}>
                Submitted for review!
              </h3>
              <p className="text-sm mb-6" style={{ color: "#B79D84", fontFamily: "var(--font-nunito), Nunito, sans-serif" }}>
                Your {type.label.toLowerCase()} will appear after our team reviews it. Thank you for contributing! 🙏
              </p>
              <button onClick={onClose}
                className="px-8 py-3 rounded-xl text-sm font-bold text-white"
                style={{ backgroundColor: type.color, fontFamily: "var(--font-nunito), Nunito, sans-serif" }}>
                Done
              </button>
            </div>
          ) : (
            <div className="space-y-4">

              {/* Title */}
              <div>
                <label className={labelCls} style={labelStyle}>Title *</label>
                <input value={String(form.title)} onChange={e => set("title", e.target.value)}
                  placeholder={type.id === "note" ? "What's on your mind?" : type.id === "video" ? "Video title…" : "Article title…"}
                  className={inputCls} style={inputStyle} />
              </div>

              {/* Video URL */}
              {type.id === "video" && (
                <div>
                  <label className={labelCls} style={labelStyle}>Video URL *</label>
                  <input value={String(form.video_url)} onChange={e => set("video_url", e.target.value)}
                    placeholder="https://youtube.com/watch?v=…"
                    className={inputCls} style={inputStyle} />
                </div>
              )}

              {/* Category + Age group row (article / video) */}
              {(type.id === "article" || type.id === "video") && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={labelCls} style={labelStyle}>Category</label>
                    <select value={String(form.category)} onChange={e => set("category", e.target.value)}
                      className={inputCls} style={inputStyle}>
                      <option value="">Select…</option>
                      {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className={labelCls} style={labelStyle}>Age Group</label>
                    <select value={String(form.age_group)} onChange={e => set("age_group", e.target.value)}
                      className={inputCls} style={inputStyle}>
                      {AGE_GROUPS.map(ag => <option key={ag.value} value={ag.value}>{ag.label}</option>)}
                    </select>
                  </div>
                </div>
              )}

              {/* Short description (article / video) */}
              {(type.id === "article" || type.id === "video") && (
                <div>
                  <label className={labelCls} style={labelStyle}>Short Description</label>
                  <textarea value={String(form.excerpt)} onChange={e => set("excerpt", e.target.value)}
                    placeholder="A 1–2 sentence summary…" rows={2}
                    className={inputCls} style={{ ...inputStyle, resize: "vertical" }} />
                </div>
              )}

              {/* Body */}
              <div>
                <label className={labelCls} style={labelStyle}>
                  {type.id === "note" ? "Content *" : "Body"}
                </label>
                <textarea value={String(form.content)} onChange={e => set("content", e.target.value)}
                  placeholder={type.id === "note" ? "Share your thought, experience, or question…" : "Write your full content here (Markdown supported)…"}
                  rows={type.id === "note" ? 5 : 9}
                  className={inputCls} style={{ ...inputStyle, resize: "vertical" }} />
              </div>

              {/* Tags + read time row (article only) */}
              {type.id === "article" && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={labelCls} style={labelStyle}>Tags <span style={{ color: "#D4C5FF", fontWeight: 400 }}>(comma-separated)</span></label>
                    <input value={String(form.tagsRaw)} onChange={e => set("tagsRaw", e.target.value)}
                      placeholder="AI literacy, privacy, family…"
                      className={inputCls} style={inputStyle} />
                  </div>
                  <div>
                    <label className={labelCls} style={labelStyle}>Est. Read Time (min)</label>
                    <input type="number" min={1} max={60} value={Number(form.read_time)}
                      onChange={e => set("read_time", parseInt(e.target.value) || 5)}
                      className={inputCls} style={inputStyle} />
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-3 justify-end pt-2 border-t" style={{ borderColor: "#EDE8E1" }}>
                <button onClick={onClose}
                  className="px-5 py-2.5 rounded-xl text-sm font-semibold border transition-colors"
                  style={{ color: "var(--foreground, #3E3E3E)", borderColor: "#EDE8E1", fontFamily: "var(--font-nunito), Nunito, sans-serif" }}>
                  Cancel
                </button>
                <button onClick={submit} disabled={submitting || !String(form.title).trim()}
                  className="px-6 py-2.5 rounded-xl text-sm font-bold text-white transition-all hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:scale-100"
                  style={{ backgroundColor: type.color, fontFamily: "var(--font-nunito), Nunito, sans-serif" }}>
                  {submitting ? "Submitting…" : `Submit ${type.label}`}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
