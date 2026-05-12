"use client"

// components/create-menu.tsx — FIXED modal positioning + full form visibility

import { useState, useRef, useEffect, useCallback } from "react"
import {
  Plus, ChevronDown, X, StickyNote, FileText, Video,
  Check, AlertCircle, Loader2,
} from "lucide-react"
import ReactDOM from "react-dom"

// ── Types ──────────────────────────────────────────────────────────────────
const POST_TYPES = [
  { id: "note"    as const, label: "Note",    Icon: StickyNote, color: "#A6B6A1", desc: "Share a quick thought or tip",                hint: "Notes appear on the community feed after review." },
  { id: "article" as const, label: "Article", Icon: FileText,   color: "#7C63B8", desc: "Write a long-form AI parenting article",       hint: "Articles go through editorial review before publishing." },
  { id: "video"   as const, label: "Video",   Icon: Video,      color: "#F3A78E", desc: "Share a video link with commentary",           hint: "Share YouTube, Vimeo, or any public video URL." },
]
type PostTypeId = "note" | "article" | "video"
type PostType   = typeof POST_TYPES[number]
type SubmitState = "idle" | "submitting" | "success" | "error"

const CATEGORIES = ["AI Literacy", "Safety", "Family Conversations", "Parenting"]
const AGE_GROUPS = [
  { value: "all",   label: "All Ages"  },
  { value: "5-7",   label: "5–7 yrs"  },
  { value: "8-10",  label: "8–10 yrs" },
  { value: "11-13", label: "11–13 yrs"},
  { value: "14-16", label: "14–16 yrs"},
  { value: "17+",   label: "17+"       },
]

interface FormState {
  title: string; content: string; excerpt: string
  video_url: string; category: string; age_group: string
  tags: string; read_time: string
}
const EMPTY: FormState = {
  title: "", content: "", excerpt: "", video_url: "",
  category: "", age_group: "all", tags: "", read_time: "5",
}

// ── Validation ─────────────────────────────────────────────────────────────
function validate(typeId: PostTypeId, form: FormState) {
  const e: Record<string, string> = {}
  if (!form.title.trim())                                            e.title     = "Title is required."
  if (form.title.length > 120)                                       e.title     = "Keep title under 120 characters."
  if (typeId === "note"    && !form.content.trim())                  e.content   = "Please write some content."
  if (typeId === "article" && form.content.trim().length < 100)      e.content   = "Article should be at least 100 characters."
  if (typeId === "video"   && !form.video_url.trim())                e.video_url = "Video URL is required."
  if (typeId === "video"   && form.video_url && !/^https?:\/\/.+/.test(form.video_url.trim()))
    e.video_url = "Enter a valid URL starting with https://"
  return e
}

// ── Shared field components ────────────────────────────────────────────────
const iStyle = {
  backgroundColor: "var(--input, #FAF6F0)",
  borderColor:     "var(--border, #EDE8E1)",
  color:           "var(--foreground, #222222)",
  fontFamily:      "var(--font-nunito), Nunito, sans-serif",
  transition:      "border-color .15s, box-shadow .15s",
  width:           "100%",
  borderRadius:    12,
  padding:         "10px 13px",
  fontSize:        14,
  border:          "1.5px solid",
  outline:         "none",
}

function Lbl({ ch, req }: { ch: string; req?: boolean }) {
  return (
    <p style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase" as const,
      letterSpacing: "0.07em", marginBottom: 6, color: "var(--muted-foreground, #B79D84)",
      fontFamily: "var(--font-nunito), Nunito, sans-serif" }}>
      {ch}{req && <span style={{ color: "#F3A78E", marginLeft: 2 }}>*</span>}
    </p>
  )
}

function ErrMsg({ msg }: { msg?: string }) {
  if (!msg) return null
  return (
    <p style={{ fontSize: 11, color: "#e74c3c", marginTop: 4, display: "flex", alignItems: "center", gap: 4 }}>
      <AlertCircle size={11} />{msg}
    </p>
  )
}

// ── Note Form ──────────────────────────────────────────────────────────────
function NoteForm({ form, set, errs }: { form: FormState; set: (k: keyof FormState, v: string) => void; errs: Record<string, string> }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <div>
        <Lbl ch="Title" req />
        <input value={form.title} onChange={e => set("title", e.target.value)}
          maxLength={120} placeholder="What's on your mind?"
          style={{ ...iStyle, borderColor: errs.title ? "#e74c3c" : "var(--border, #EDE8E1)" }} />
        <div style={{ display: "flex", justifyContent: "space-between", marginTop: 4 }}>
          <ErrMsg msg={errs.title} />
          <span style={{ fontSize: 11, color: "var(--muted-foreground, #B79D84)", marginLeft: "auto" }}>{form.title.length}/120</span>
        </div>
      </div>
      <div>
        <Lbl ch="Content" req />
        <textarea value={form.content} onChange={e => set("content", e.target.value)} rows={7}
          placeholder="Share your thought, experience, question, or tip for other parents navigating AI with their kids…"
          style={{ ...iStyle, resize: "vertical", lineHeight: 1.65, borderColor: errs.content ? "#e74c3c" : "var(--border, #EDE8E1)" }} />
        <ErrMsg msg={errs.content} />
      </div>
    </div>
  )
}

// ── Article Form ───────────────────────────────────────────────────────────
function ArticleForm({ form, set, errs }: { form: FormState; set: (k: keyof FormState, v: string) => void; errs: Record<string, string> }) {
  const words = form.content.trim().split(/\s+/).filter(Boolean).length
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <div>
        <Lbl ch="Title" req />
        <input value={form.title} onChange={e => set("title", e.target.value)}
          maxLength={120} placeholder="A compelling, family-friendly headline…"
          style={{ ...iStyle, borderColor: errs.title ? "#e74c3c" : "var(--border, #EDE8E1)" }} />
        <ErrMsg msg={errs.title} />
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        <div>
          <Lbl ch="Category" />
          <select value={form.category} onChange={e => set("category", e.target.value)} style={{ ...iStyle, cursor: "pointer" }}>
            <option value="">Select…</option>
            {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
        <div>
          <Lbl ch="Age Group" />
          <select value={form.age_group} onChange={e => set("age_group", e.target.value)} style={{ ...iStyle, cursor: "pointer" }}>
            {AGE_GROUPS.map(a => <option key={a.value} value={a.value}>{a.label}</option>)}
          </select>
        </div>
      </div>
      <div>
        <Lbl ch="Short Description" />
        <textarea value={form.excerpt} onChange={e => set("excerpt", e.target.value)} rows={2}
          placeholder="1–2 sentence summary shown in article preview cards…"
          style={{ ...iStyle, resize: "vertical" }} />
      </div>
      <div>
        <Lbl ch="Article Body" req />
        <div style={{ position: "relative" }}>
          <textarea value={form.content} onChange={e => set("content", e.target.value)} rows={11}
            placeholder={"Write your article here. Markdown is supported.\n\nSuggested structure:\n• Start with a relatable parent scenario\n• Explain the AI concept simply\n• Give 3–5 actionable tips\n• Add a conversation starter\n• End with a family activity"}
            style={{ ...iStyle, resize: "vertical", lineHeight: 1.7, borderColor: errs.content ? "#e74c3c" : "var(--border, #EDE8E1)", paddingBottom: 28 }} />
          <span style={{ position: "absolute", bottom: 10, right: 12, fontSize: 11, color: "var(--muted-foreground, #B79D84)" }}>
            {words} words
          </span>
        </div>
        <ErrMsg msg={errs.content} />
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        <div>
          <Lbl ch="Tags (comma-separated)" />
          <input value={form.tags} onChange={e => set("tags", e.target.value)}
            placeholder="AI literacy, privacy, family…" style={iStyle} />
        </div>
        <div>
          <Lbl ch="Read Time (minutes)" />
          <input type="number" min={1} max={60} value={form.read_time}
            onChange={e => set("read_time", e.target.value)} style={iStyle} />
        </div>
      </div>
    </div>
  )
}

// ── Video Form ─────────────────────────────────────────────────────────────
function VideoForm({ form, set, errs }: { form: FormState; set: (k: keyof FormState, v: string) => void; errs: Record<string, string> }) {
  const ytId = form.video_url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\s]+)/)?.[1]
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <div>
        <Lbl ch="Title" req />
        <input value={form.title} onChange={e => set("title", e.target.value)}
          maxLength={120} placeholder="Video title…"
          style={{ ...iStyle, borderColor: errs.title ? "#e74c3c" : "var(--border, #EDE8E1)" }} />
        <ErrMsg msg={errs.title} />
      </div>
      <div>
        <Lbl ch="Video URL" req />
        <input type="url" value={form.video_url} onChange={e => set("video_url", e.target.value)}
          placeholder="https://youtube.com/watch?v=… or any public video link"
          style={{ ...iStyle, borderColor: errs.video_url ? "#e74c3c" : "var(--border, #EDE8E1)" }} />
        <ErrMsg msg={errs.video_url} />
      </div>
      {ytId && (
        <div style={{ borderRadius: 12, overflow: "hidden", border: "1.5px solid var(--border, #EDE8E1)" }}>
          <img src={`https://img.youtube.com/vi/${ytId}/hqdefault.jpg`} alt="YouTube thumbnail"
            style={{ width: "100%", height: 160, objectFit: "cover", display: "block" }} />
          <div style={{ padding: "8px 12px", background: "var(--muted, #FAF6F0)", display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ color: "#e74c3c", fontWeight: 700, fontSize: 12 }}>▶ YouTube</span>
            <span style={{ color: "var(--muted-foreground, #B79D84)", fontSize: 12 }}>Preview detected ✓</span>
          </div>
        </div>
      )}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        <div>
          <Lbl ch="Category" />
          <select value={form.category} onChange={e => set("category", e.target.value)} style={{ ...iStyle, cursor: "pointer" }}>
            <option value="">Select…</option>
            {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
        <div>
          <Lbl ch="Age Group" />
          <select value={form.age_group} onChange={e => set("age_group", e.target.value)} style={{ ...iStyle, cursor: "pointer" }}>
            {AGE_GROUPS.map(a => <option key={a.value} value={a.value}>{a.label}</option>)}
          </select>
        </div>
      </div>
      <div>
        <Lbl ch="Commentary / Why Share This?" />
        <textarea value={form.excerpt} onChange={e => set("excerpt", e.target.value)} rows={4}
          placeholder="Why are you sharing this video? What should parents take away from it?"
          style={{ ...iStyle, resize: "vertical", lineHeight: 1.65 }} />
      </div>
    </div>
  )
}

// ── MODAL — rendered via portal so it's ALWAYS above everything ────────────
function CreateModal({ type, onClose }: { type: PostType; onClose: () => void }) {
  const [form,       setFormState] = useState<FormState>(EMPTY)
  const [errs,       setErrs]      = useState<Record<string, string>>({})
  const [submitState,setSubmit]    = useState<SubmitState>("idle")
  const [serverErr,  setServerErr] = useState("")
  const scrollRef = useRef<HTMLDivElement>(null)

  // Lock body scroll, handle Escape
  useEffect(() => {
    const prev = document.body.style.overflow
    document.body.style.overflow = "hidden"
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose() }
    window.addEventListener("keydown", onKey)
    return () => { document.body.style.overflow = prev; window.removeEventListener("keydown", onKey) }
  }, [onClose])

  const setField = useCallback((k: keyof FormState, v: string) => {
    setFormState(f => ({ ...f, [k]: v }))
    setErrs(e => { const n = { ...e }; delete n[k]; return n })
  }, [])

  async function submit() {
    const validation = validate(type.id, form)
    if (Object.keys(validation).length) { setErrs(validation); return }
    setSubmit("submitting"); setServerErr("")
    try {
      const payload: Record<string, unknown> = {
        title:      form.title.trim(),
        asset_type: type.id,
        age_group:  form.age_group || "all",
      }
      if (form.content.trim())   payload.content   = form.content.trim()
      if (form.excerpt.trim())   payload.excerpt   = form.excerpt.trim()
      if (form.video_url.trim()) payload.video_url = form.video_url.trim()
      if (form.category)         payload.category  = form.category
      if (form.tags.trim())      payload.tags      = form.tags.split(",").map(t => t.trim()).filter(Boolean)
      if (form.read_time)        payload.read_time = Number(form.read_time) || 5

      const res  = await fetch("/api/user-posts", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })
      const data = await res.json()
      if (!res.ok) { setServerErr(data.error ?? "Submission failed. Please try again."); setSubmit("error"); return }
      setSubmit("success")
    } catch {
      setServerErr("Network error. Check your connection and try again.")
      setSubmit("error")
    }
  }

  const col = type.color

  // ── Render via portal to document.body ────────────────────────────────
  const modal = (
    <div
      onClick={e => { if (e.target === e.currentTarget) onClose() }}
      style={{
        position:        "fixed",
        inset:           0,
        zIndex:          99999,           // above EVERYTHING including navbar
        backgroundColor: "rgba(0,0,0,0.65)",
        backdropFilter:  "blur(6px)",
        display:         "flex",
        alignItems:      "flex-start",
        justifyContent:  "center",
        overflowY:       "auto",
        padding:         "60px 16px 40px", // 60px top so modal clears navbar
      }}
      role="dialog"
      aria-modal="true"
      aria-label={`Create ${type.label}`}
    >
      {/* Modal card */}
      <div
        ref={scrollRef}
        style={{
          width:           "100%",
          maxWidth:        600,
          borderRadius:    20,
          overflow:        "hidden",
          boxShadow:       "0 32px 80px rgba(0,0,0,0.35)",
          backgroundColor: "var(--card, #ffffff)",
          border:          "1.5px solid var(--border, #EDE8E1)",
          // Do NOT set max-height here — let it grow naturally and scroll the backdrop
        }}
        onClick={e => e.stopPropagation()}
      >
        {/* ── Coloured header ─────────────────────────────────────── */}
        <div style={{
          background:  `linear-gradient(135deg, ${col}ee, ${col}99)`,
          padding:     "20px 24px",
          display:     "flex",
          alignItems:  "center",
          justifyContent: "space-between",
          gap:         12,
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ width: 40, height: 40, borderRadius: 12, background: "rgba(255,255,255,0.22)",
              display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <type.Icon size={19} color="#fff" />
            </div>
            <div>
              <h2 style={{ color: "#fff", fontWeight: 800, fontSize: 18, margin: 0,
                fontFamily: "var(--font-quicksand), Quicksand, sans-serif" }}>
                Create {type.label}
              </h2>
              <p style={{ color: "rgba(255,255,255,0.78)", fontSize: 12, margin: "3px 0 0",
                fontFamily: "var(--font-nunito), Nunito, sans-serif" }}>
                {type.hint}
              </p>
            </div>
          </div>
          <button onClick={onClose} aria-label="Close"
            style={{ width: 32, height: 32, borderRadius: "50%", border: "none", cursor: "pointer",
              background: "rgba(255,255,255,0.22)", display: "flex", alignItems: "center",
              justifyContent: "center", flexShrink: 0, transition: "background .15s" }}
            onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = "rgba(255,255,255,0.35)" }}
            onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = "rgba(255,255,255,0.22)" }}>
            <X size={15} color="#fff" />
          </button>
        </div>

        {/* ── Body ─────────────────────────────────────────────────── */}
        <div style={{ padding: "28px 28px 24px" }}>

          {/* SUCCESS STATE */}
          {submitState === "success" ? (
            <div style={{ textAlign: "center", padding: "24px 0" }}>
              <div style={{ width: 64, height: 64, borderRadius: "50%", background: "rgba(166,182,161,0.18)",
                display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" }}>
                <Check size={28} color="#4d7a49" />
              </div>
              <h3 style={{ fontWeight: 800, fontSize: 20, marginBottom: 10,
                color: "var(--foreground, #222222)", fontFamily: "var(--font-quicksand), Quicksand, sans-serif" }}>
                Submitted for review!
              </h3>
              <p style={{ fontSize: 14, color: "var(--muted-foreground, #B79D84)", marginBottom: 6, lineHeight: 1.6,
                fontFamily: "var(--font-nunito), Nunito, sans-serif" }}>
                Your {type.label.toLowerCase()} will appear after our team reviews it.
              </p>
              <p style={{ fontSize: 13, color: "var(--muted-foreground, #B79D84)", marginBottom: 28,
                fontFamily: "var(--font-nunito), Nunito, sans-serif" }}>
                Thank you for contributing to the community! 🙏
              </p>
              <div style={{ display: "flex", gap: 12, justifyContent: "center" }}>
                <button onClick={() => { setSubmit("idle"); setFormState(EMPTY); setErrs({}) }}
                  style={{ padding: "10px 20px", borderRadius: 99, border: `2px solid ${col}55`,
                    background: "transparent", color: col, fontWeight: 700, fontSize: 13, cursor: "pointer",
                    fontFamily: "var(--font-nunito), Nunito, sans-serif" }}>
                  Create another
                </button>
                <button onClick={onClose}
                  style={{ padding: "10px 24px", borderRadius: 99, border: "none",
                    background: col, color: "#fff", fontWeight: 700, fontSize: 13, cursor: "pointer",
                    fontFamily: "var(--font-nunito), Nunito, sans-serif" }}>
                  Done
                </button>
              </div>
            </div>
          ) : (
            <>
              {/* THE FORM */}
              {type.id === "note"    && <NoteForm    form={form} set={setField} errs={errs} />}
              {type.id === "article" && <ArticleForm form={form} set={setField} errs={errs} />}
              {type.id === "video"   && <VideoForm   form={form} set={setField} errs={errs} />}

              {/* Guidelines */}
              <div style={{ marginTop: 20, padding: "12px 16px", borderRadius: 12,
                background: "rgba(124,99,184,0.05)", border: "1px solid rgba(124,99,184,0.15)" }}>
                <p style={{ fontSize: 12, color: "#7C63B8", margin: 0,
                  fontFamily: "var(--font-nunito), Nunito, sans-serif", lineHeight: 1.55 }}>
                  📋 All submissions are reviewed before publishing. Keep content family-friendly and evidence-based.
                </p>
              </div>

              {/* Server error */}
              {serverErr && (
                <div style={{ marginTop: 12, padding: "12px 16px", borderRadius: 12,
                  background: "rgba(231,76,60,0.07)", border: "1px solid rgba(231,76,60,0.25)",
                  display: "flex", alignItems: "flex-start", gap: 8 }}>
                  <AlertCircle size={15} color="#e74c3c" style={{ flexShrink: 0, marginTop: 1 }} />
                  <p style={{ fontSize: 13, color: "#e74c3c", margin: 0,
                    fontFamily: "var(--font-nunito), Nunito, sans-serif" }}>{serverErr}</p>
                </div>
              )}

              {/* Action buttons */}
              <div style={{ display: "flex", justifyContent: "flex-end", gap: 12, marginTop: 24,
                paddingTop: 16, borderTop: "1px solid var(--border, #EDE8E1)" }}>
                <button onClick={onClose}
                  style={{ padding: "10px 20px", borderRadius: 99, border: "1.5px solid var(--border, #EDE8E1)",
                    background: "transparent", color: "var(--foreground, #3E3E3E)", fontWeight: 600,
                    fontSize: 13, cursor: "pointer", fontFamily: "var(--font-nunito), Nunito, sans-serif" }}>
                  Cancel
                </button>
                <button
                  onClick={submit}
                  disabled={submitState === "submitting"}
                  style={{ padding: "10px 28px", borderRadius: 99, border: "none", background: col,
                    color: "#fff", fontWeight: 700, fontSize: 13, cursor: submitState === "submitting" ? "wait" : "pointer",
                    opacity: submitState === "submitting" ? 0.7 : 1,
                    display: "flex", alignItems: "center", gap: 8,
                    fontFamily: "var(--font-nunito), Nunito, sans-serif",
                    boxShadow: `0 2px 12px ${col}55` }}>
                  {submitState === "submitting"
                    ? <><Loader2 size={14} className="animate-spin" /> Submitting…</>
                    : `Submit ${type.label}`}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )

  // Portal to body — bypasses ALL z-index stacking contexts
  if (typeof window === "undefined") return null
  return ReactDOM.createPortal(modal, document.body)
}

// ── Type picker modal (when no type pre-selected) ──────────────────────────
function TypePickerModal({ onPick, onClose }: { onPick: (t: PostType) => void; onClose: () => void }) {
  useEffect(() => {
    const prev = document.body.style.overflow
    document.body.style.overflow = "hidden"
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose() }
    window.addEventListener("keydown", onKey)
    return () => { document.body.style.overflow = prev; window.removeEventListener("keydown", onKey) }
  }, [onClose])

  const modal = (
    <div
      onClick={e => { if (e.target === e.currentTarget) onClose() }}
      style={{ position: "fixed", inset: 0, zIndex: 99999, backgroundColor: "rgba(0,0,0,0.6)",
        backdropFilter: "blur(6px)", display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
      <div style={{ width: "100%", maxWidth: 480, borderRadius: 20, overflow: "hidden",
        boxShadow: "0 32px 80px rgba(0,0,0,0.3)",
        backgroundColor: "var(--card, #fff)", border: "1.5px solid var(--border, #EDE8E1)" }}
        onClick={e => e.stopPropagation()}>

        <div style={{ background: "linear-gradient(135deg, #7C63B8, #B9A6E3)", padding: "20px 24px",
          display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div>
            <h2 style={{ color: "#fff", fontWeight: 800, fontSize: 18, margin: 0,
              fontFamily: "var(--font-quicksand), Quicksand, sans-serif" }}>Create</h2>
            <p style={{ color: "rgba(255,255,255,0.78)", fontSize: 12, margin: "3px 0 0",
              fontFamily: "var(--font-nunito), Nunito, sans-serif" }}>Share with the Parent in the Loop community</p>
          </div>
          <button onClick={onClose} aria-label="Close"
            style={{ width: 32, height: 32, borderRadius: "50%", border: "none", cursor: "pointer",
              background: "rgba(255,255,255,0.22)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <X size={15} color="#fff" />
          </button>
        </div>

        <div style={{ padding: "20px 24px 24px", display: "flex", flexDirection: "column", gap: 10 }}>
          <p style={{ fontSize: 13, color: "var(--muted-foreground, #B79D84)", margin: "0 0 4px",
            fontFamily: "var(--font-nunito), Nunito, sans-serif" }}>What would you like to create?</p>
          {POST_TYPES.map(t => (
            <button key={t.id} onClick={() => onPick(t)}
              style={{ display: "flex", alignItems: "center", gap: 14, padding: "14px 16px",
                borderRadius: 14, border: "1.5px solid var(--border, #EDE8E1)", background: "transparent",
                cursor: "pointer", textAlign: "left", transition: "all .15s", width: "100%" }}
              onMouseEnter={e => { const b = e.currentTarget as HTMLButtonElement; b.style.borderColor = t.color; b.style.background = t.color + "0f" }}
              onMouseLeave={e => { const b = e.currentTarget as HTMLButtonElement; b.style.borderColor = "var(--border, #EDE8E1)"; b.style.background = "transparent" }}>
              <div style={{ width: 44, height: 44, borderRadius: 12, background: t.color + "1a",
                display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <t.Icon size={20} color={t.color} />
              </div>
              <div style={{ flex: 1 }}>
                <p style={{ fontWeight: 700, fontSize: 15, margin: "0 0 3px",
                  color: "var(--foreground, #222222)", fontFamily: "var(--font-nunito), Nunito, sans-serif" }}>{t.label}</p>
                <p style={{ fontSize: 12, margin: 0, color: "var(--muted-foreground, #B79D84)",
                  fontFamily: "var(--font-nunito), Nunito, sans-serif" }}>{t.desc}</p>
              </div>
              <span style={{ color: "var(--muted-foreground, #B79D84)", fontSize: 18 }}>→</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  )

  if (typeof window === "undefined") return null
  return ReactDOM.createPortal(modal, document.body)
}

// ── Dropdown button ────────────────────────────────────────────────────────
export default function CreateMenu({ mobile = false }: { mobile?: boolean }) {
  const [dropOpen,  setDropOpen]  = useState(false)
  const [showPick,  setShowPick]  = useState(false)
  const [activeType,setActiveType]= useState<PostType | null>(null)
  const dropRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function outside(e: MouseEvent) {
      if (dropRef.current && !dropRef.current.contains(e.target as Node)) setDropOpen(false)
    }
    document.addEventListener("mousedown", outside)
    return () => document.removeEventListener("mousedown", outside)
  }, [])

  function open(t?: PostType) { setDropOpen(false); if (t) { setActiveType(t); setShowPick(false) } else { setActiveType(null); setShowPick(true) } }
  function closeAll() { setActiveType(null); setShowPick(false) }

  // Mobile row
  if (mobile) {
    return (
      <>
        <p style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase" as const,
          letterSpacing: "0.08em", color: "#B79D84", marginBottom: 8,
          fontFamily: "var(--font-nunito), Nunito, sans-serif" }}>Create</p>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
          {POST_TYPES.map(t => (
            <button key={t.id} onClick={() => open(t)}
              style={{ display: "flex", alignItems: "center", gap: 6, padding: "8px 14px",
                borderRadius: 99, border: `1.5px solid ${t.color}55`, background: t.color + "12",
                color: t.color, fontWeight: 700, fontSize: 13, cursor: "pointer",
                fontFamily: "var(--font-nunito), Nunito, sans-serif" }}>
              <t.Icon size={14} />{t.label}
            </button>
          ))}
        </div>
        {activeType && <CreateModal type={activeType} onClose={closeAll} />}
      </>
    )
  }

  // Desktop dropdown
  return (
    <>
      <div ref={dropRef} style={{ position: "relative" }}>
        <button
          onClick={() => setDropOpen(o => !o)}
          aria-expanded={dropOpen}
          aria-haspopup="menu"
          style={{ display: "flex", alignItems: "center", gap: 6, padding: "8px 18px",
            borderRadius: 99, border: "none", background: "#F3A78E", color: "#fff",
            fontWeight: 700, fontSize: 14, cursor: "pointer", transition: "background .15s",
            fontFamily: "var(--font-nunito), Nunito, sans-serif",
            boxShadow: "0 2px 8px rgba(243,167,142,0.4)" }}
          onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = "#E8926A" }}
          onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = "#F3A78E" }}>
          <Plus size={15} />
          Create
          <ChevronDown size={13} style={{ transform: dropOpen ? "rotate(180deg)" : "none", transition: "transform .2s" }} />
        </button>

        {dropOpen && (
          <div style={{ position: "absolute", top: "calc(100% + 8px)", right: 0, width: 240,
            borderRadius: 16, overflow: "hidden", boxShadow: "0 12px 40px rgba(0,0,0,0.15)",
            background: "var(--card, #fff)", border: "1.5px solid var(--border, #EDE8E1)", zIndex: 9999 }}
            role="menu">
            <div style={{ padding: "10px 16px 8px", borderBottom: "1px solid var(--border, #EDE8E1)" }}>
              <p style={{ fontSize: 10, fontWeight: 800, textTransform: "uppercase" as const,
                letterSpacing: "0.09em", color: "#B79D84", margin: 0,
                fontFamily: "var(--font-nunito), Nunito, sans-serif" }}>Share with Community</p>
            </div>
            {POST_TYPES.map((t, i) => (
              <button key={t.id} onClick={() => open(t)} role="menuitem"
                style={{ display: "flex", alignItems: "flex-start", gap: 12, padding: "12px 16px", width: "100%",
                  border: "none", borderBottom: i < POST_TYPES.length - 1 ? "1px solid var(--border, #EDE8E1)" : "none",
                  background: "transparent", cursor: "pointer", textAlign: "left", transition: "background .1s" }}
                onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = t.color + "0a" }}
                onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = "transparent" }}>
                <div style={{ width: 32, height: 32, borderRadius: 8, background: t.color + "1a",
                  display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginTop: 2 }}>
                  <t.Icon size={15} color={t.color} />
                </div>
                <div>
                  <p style={{ fontWeight: 700, fontSize: 13, margin: "0 0 2px",
                    color: "var(--foreground, #222222)", fontFamily: "var(--font-nunito), Nunito, sans-serif" }}>{t.label}</p>
                  <p style={{ fontSize: 11, margin: 0, color: "var(--muted-foreground, #B79D84)",
                    fontFamily: "var(--font-nunito), Nunito, sans-serif" }}>{t.desc}</p>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Picker or direct form */}
      {showPick  && <TypePickerModal onPick={t => { setShowPick(false); setActiveType(t) }} onClose={closeAll} />}
      {activeType && <CreateModal type={activeType} onClose={closeAll} />}
    </>
  )
}
