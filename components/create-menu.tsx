"use client"

// components/create-menu.tsx
// Fully working Create modal for Note / Article / Video
// Each type has a complete, validated form with proper submit to /api/user-posts

import { useState, useRef, useEffect, useCallback } from "react"
import { Plus, ChevronDown, X, StickyNote, FileText, Video, Check, AlertCircle, Loader2, Upload } from "lucide-react"

// ── Types ─────────────────────────────────────────────────────────────────────
const POST_TYPES = [
  {
    id:    "note"    as const,
    label: "Note",
    icon:  StickyNote,
    color: "#A6B6A1",
    desc:  "Share a quick thought or tip",
    hint:  "Notes appear on the community feed after review.",
  },
  {
    id:    "article" as const,
    label: "Article",
    icon:  FileText,
    color: "#7C63B8",
    desc:  "Write a long-form AI parenting article",
    hint:  "Articles go through editorial review before publishing.",
  },
  {
    id:    "video" as const,
    label: "Video",
    icon:  Video,
    color: "#F3A78E",
    desc:  "Share a video link with commentary",
    hint:  "Share YouTube, Vimeo, or any publicly accessible video.",
  },
] as const

type PostTypeId = (typeof POST_TYPES)[number]["id"]
type PostType   = (typeof POST_TYPES)[number]
type SubmitState = "idle" | "submitting" | "success" | "error"

const CATEGORIES = ["AI Literacy", "Safety", "Family Conversations", "Parenting"]
const AGE_GROUPS = [
  { value: "all",   label: "All Ages" },
  { value: "5-7",   label: "5–7 yrs"  },
  { value: "8-10",  label: "8–10 yrs" },
  { value: "11-13", label: "11–13 yrs"},
  { value: "14-16", label: "14–16 yrs"},
  { value: "17+",   label: "17+"       },
]

// ── Shared form field styles ─────────────────────────────────────────────────
function Label({ children, required }: { children: React.ReactNode; required?: boolean }) {
  return (
    <label className="block text-xs font-bold uppercase tracking-wider mb-1.5"
      style={{ color: "var(--muted-foreground, #B79D84)", fontFamily: "var(--font-nunito), Nunito, sans-serif" }}>
      {children} {required && <span style={{ color: "#F3A78E" }}>*</span>}
    </label>
  )
}

const fieldStyle = {
  backgroundColor: "var(--muted, #FAF6F0)",
  borderColor:     "var(--border, #EDE8E1)",
  color:           "var(--foreground, #222222)",
  fontFamily:      "var(--font-nunito), Nunito, sans-serif",
  transition:      "border-color 0.15s, box-shadow 0.15s",
}

function Field({
  label, required, error, children,
}: { label: string; required?: boolean; error?: string; children: React.ReactNode }) {
  return (
    <div>
      <Label required={required}>{label}</Label>
      {children}
      {error && (
        <p className="mt-1 text-xs flex items-center gap-1" style={{ color: "#e74c3c" }}>
          <AlertCircle size={11} /> {error}
        </p>
      )}
    </div>
  )
}

// ── Character counter ─────────────────────────────────────────────────────────
function CharCount({ value, max }: { value: string; max: number }) {
  const pct = value.length / max
  const col  = pct > 0.9 ? "#e74c3c" : pct > 0.7 ? "#F3A78E" : "var(--muted-foreground, #B79D84)"
  return (
    <span className="text-xs float-right" style={{ color: col, fontFamily: "var(--font-nunito), Nunito, sans-serif" }}>
      {value.length}/{max}
    </span>
  )
}

// ── Form state per type ───────────────────────────────────────────────────────
interface FormState {
  title:     string
  content:   string
  excerpt:   string
  video_url: string
  category:  string
  age_group: string
  tags:      string   // raw comma-separated
  read_time: string
}

const EMPTY: FormState = {
  title: "", content: "", excerpt: "",
  video_url: "", category: "", age_group: "all",
  tags: "", read_time: "5",
}

// ── Validate form ─────────────────────────────────────────────────────────────
function validate(type: PostTypeId, form: FormState): Record<string, string> {
  const errs: Record<string, string> = {}
  if (!form.title.trim())                          errs.title     = "Title is required."
  if (form.title.length > 120)                     errs.title     = "Title must be under 120 characters."
  if (type === "note" && !form.content.trim())     errs.content   = "Content is required for a note."
  if (type === "video" && !form.video_url.trim())  errs.video_url = "Video URL is required."
  if (type === "video" && form.video_url.trim() &&
      !/^https?:\/\/.+/.test(form.video_url.trim()))
    errs.video_url = "Please enter a valid URL starting with https://"
  if (type === "article" && form.content.trim().length < 100)
    errs.content = "Article body should be at least 100 characters."
  return errs
}

// ── Note form ─────────────────────────────────────────────────────────────────
function NoteForm({ form, set, errs }: { form: FormState; set: (k: keyof FormState, v: string) => void; errs: Record<string,string> }) {
  return (
    <div className="space-y-4">
      <Field label="Title" required error={errs.title}>
        <div className="relative">
          <input
            value={form.title}
            onChange={e => set("title", e.target.value)}
            maxLength={120}
            placeholder="What's on your mind?"
            className="w-full px-3 py-2.5 rounded-xl text-sm border focus:outline-none focus-visible:ring-2 focus-visible:ring-[#A6B6A1]"
            style={{ ...fieldStyle, borderColor: errs.title ? "#e74c3c" : undefined }}
          />
          <CharCount value={form.title} max={120} />
        </div>
      </Field>

      <Field label="Content" required error={errs.content}>
        <textarea
          value={form.content}
          onChange={e => set("content", e.target.value)}
          placeholder="Share your thought, experience, question, or tip for other parents navigating AI with their kids…"
          rows={6}
          className="w-full px-3 py-2.5 rounded-xl text-sm border focus:outline-none focus-visible:ring-2 focus-visible:ring-[#A6B6A1]"
          style={{ ...fieldStyle, resize: "vertical", borderColor: errs.content ? "#e74c3c" : undefined }}
        />
      </Field>
    </div>
  )
}

// ── Article form ─────────────────────────────────────────────────────────────
function ArticleForm({ form, set, errs }: { form: FormState; set: (k: keyof FormState, v: string) => void; errs: Record<string,string> }) {
  return (
    <div className="space-y-4">
      <Field label="Title" required error={errs.title}>
        <input
          value={form.title}
          onChange={e => set("title", e.target.value)}
          maxLength={120}
          placeholder="A compelling, family-friendly title…"
          className="w-full px-3 py-2.5 rounded-xl text-sm border focus:outline-none focus-visible:ring-2 focus-visible:ring-[#7C63B8]"
          style={{ ...fieldStyle, borderColor: errs.title ? "#e74c3c" : undefined }}
        />
      </Field>

      <div className="grid grid-cols-2 gap-3">
        <Field label="Category">
          <select
            value={form.category}
            onChange={e => set("category", e.target.value)}
            className="w-full px-3 py-2.5 rounded-xl text-sm border focus:outline-none focus-visible:ring-2 focus-visible:ring-[#7C63B8]"
            style={fieldStyle}
          >
            <option value="">Select…</option>
            {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </Field>
        <Field label="Age Group">
          <select
            value={form.age_group}
            onChange={e => set("age_group", e.target.value)}
            className="w-full px-3 py-2.5 rounded-xl text-sm border focus:outline-none focus-visible:ring-2 focus-visible:ring-[#7C63B8]"
            style={fieldStyle}
          >
            {AGE_GROUPS.map(ag => <option key={ag.value} value={ag.value}>{ag.label}</option>)}
          </select>
        </Field>
      </div>

      <Field label="Short Description">
        <textarea
          value={form.excerpt}
          onChange={e => set("excerpt", e.target.value)}
          placeholder="1–2 sentences summarising your article (appears in preview cards)…"
          rows={2}
          className="w-full px-3 py-2.5 rounded-xl text-sm border focus:outline-none focus-visible:ring-2 focus-visible:ring-[#7C63B8]"
          style={{ ...fieldStyle, resize: "vertical" }}
        />
      </Field>

      <Field label="Article Body" required error={errs.content}>
        <div className="relative">
          <textarea
            value={form.content}
            onChange={e => set("content", e.target.value)}
            placeholder="Write your full article here. Markdown is supported.

Structure suggestion:
- Start with a relatable parent scenario
- Explain the AI concept clearly (no jargon)
- Give 3–5 actionable tips
- Include a family conversation starter
- End with a hands-on activity"
            rows={12}
            className="w-full px-3 py-2.5 rounded-xl text-sm border focus:outline-none focus-visible:ring-2 focus-visible:ring-[#7C63B8]"
            style={{ ...fieldStyle, resize: "vertical", borderColor: errs.content ? "#e74c3c" : undefined }}
          />
          <span className="absolute bottom-3 right-3 text-xs" style={{ color: "var(--muted-foreground, #B79D84)" }}>
            {form.content.trim().split(/\s+/).filter(Boolean).length} words
          </span>
        </div>
        {errs.content && (
          <p className="mt-1 text-xs flex items-center gap-1" style={{ color: "#e74c3c" }}>
            <AlertCircle size={11} /> {errs.content}
          </p>
        )}
      </Field>

      <div className="grid grid-cols-2 gap-3">
        <Field label="Tags (comma-separated)">
          <input
            value={form.tags}
            onChange={e => set("tags", e.target.value)}
            placeholder="AI literacy, privacy, family…"
            className="w-full px-3 py-2.5 rounded-xl text-sm border focus:outline-none focus-visible:ring-2 focus-visible:ring-[#7C63B8]"
            style={fieldStyle}
          />
        </Field>
        <Field label="Est. Read Time (min)">
          <input
            type="number" min={1} max={60}
            value={form.read_time}
            onChange={e => set("read_time", e.target.value)}
            className="w-full px-3 py-2.5 rounded-xl text-sm border focus:outline-none focus-visible:ring-2 focus-visible:ring-[#7C63B8]"
            style={fieldStyle}
          />
        </Field>
      </div>
    </div>
  )
}

// ── Video form ────────────────────────────────────────────────────────────────
function VideoForm({ form, set, errs }: { form: FormState; set: (k: keyof FormState, v: string) => void; errs: Record<string,string> }) {
  // Auto-detect YouTube preview
  const ytId = form.video_url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\s]+)/)?.[1]

  return (
    <div className="space-y-4">
      <Field label="Title" required error={errs.title}>
        <input
          value={form.title}
          onChange={e => set("title", e.target.value)}
          maxLength={120}
          placeholder="Video title…"
          className="w-full px-3 py-2.5 rounded-xl text-sm border focus:outline-none focus-visible:ring-2 focus-visible:ring-[#F3A78E]"
          style={{ ...fieldStyle, borderColor: errs.title ? "#e74c3c" : undefined }}
        />
      </Field>

      <Field label="Video URL" required error={errs.video_url}>
        <input
          type="url"
          value={form.video_url}
          onChange={e => set("video_url", e.target.value)}
          placeholder="https://youtube.com/watch?v=… or any public video URL"
          className="w-full px-3 py-2.5 rounded-xl text-sm border focus:outline-none focus-visible:ring-2 focus-visible:ring-[#F3A78E]"
          style={{ ...fieldStyle, borderColor: errs.video_url ? "#e74c3c" : undefined }}
        />
      </Field>

      {/* YouTube preview */}
      {ytId && (
        <div className="rounded-xl overflow-hidden" style={{ border: "1.5px solid var(--border, #EDE8E1)" }}>
          <img
            src={`https://img.youtube.com/vi/${ytId}/hqdefault.jpg`}
            alt="Video preview"
            className="w-full h-40 object-cover"
          />
          <div className="px-3 py-2 flex items-center gap-2"
            style={{ backgroundColor: "var(--muted, #FAF6F0)" }}>
            <span className="text-xs text-red-500 font-bold">▶ YouTube</span>
            <span className="text-xs" style={{ color: "var(--muted-foreground, #B79D84)" }}>Preview detected ✓</span>
          </div>
        </div>
      )}

      <div className="grid grid-cols-2 gap-3">
        <Field label="Category">
          <select
            value={form.category}
            onChange={e => set("category", e.target.value)}
            className="w-full px-3 py-2.5 rounded-xl text-sm border focus:outline-none focus-visible:ring-2 focus-visible:ring-[#F3A78E]"
            style={fieldStyle}
          >
            <option value="">Select…</option>
            {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </Field>
        <Field label="Age Group">
          <select
            value={form.age_group}
            onChange={e => set("age_group", e.target.value)}
            className="w-full px-3 py-2.5 rounded-xl text-sm border focus:outline-none focus-visible:ring-2 focus-visible:ring-[#F3A78E]"
            style={fieldStyle}
          >
            {AGE_GROUPS.map(ag => <option key={ag.value} value={ag.value}>{ag.label}</option>)}
          </select>
        </Field>
      </div>

      <Field label="Commentary / Description">
        <textarea
          value={form.excerpt}
          onChange={e => set("excerpt", e.target.value)}
          placeholder="Why are you sharing this video? What should parents take away from it?"
          rows={4}
          className="w-full px-3 py-2.5 rounded-xl text-sm border focus:outline-none focus-visible:ring-2 focus-visible:ring-[#F3A78E]"
          style={{ ...fieldStyle, resize: "vertical" }}
        />
      </Field>
    </div>
  )
}

// ── Main CreateModal ─────────────────────────────────────────────────────────
function CreateModal({ onClose, initialType }: { onClose: () => void; initialType: PostType | null }) {
  const [selectedType, setSelectedType] = useState<PostType | null>(initialType)
  const [form,         setForm]         = useState<FormState>(EMPTY)
  const [errs,         setErrs]         = useState<Record<string, string>>({})
  const [submitState,  setSubmitState]  = useState<SubmitState>("idle")
  const [serverError,  setServerError]  = useState<string>("")
  const firstInputRef = useRef<HTMLInputElement>(null)

  // Lock body scroll + trap Escape key
  useEffect(() => {
    document.body.style.overflow = "hidden"
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose() }
    document.addEventListener("keydown", onKey)
    return () => { document.body.style.overflow = ""; document.removeEventListener("keydown", onKey) }
  }, [onClose])

  // Focus first input when type is selected
  useEffect(() => {
    if (selectedType) setTimeout(() => firstInputRef.current?.focus(), 100)
  }, [selectedType])

  const setField = useCallback((k: keyof FormState, v: string) => {
    setForm(f => ({ ...f, [k]: v }))
    if (errs[k]) setErrs(e => { const n = { ...e }; delete n[k]; return n })
  }, [errs])

  async function handleSubmit() {
    if (!selectedType) return
    const validation = validate(selectedType.id, form)
    if (Object.keys(validation).length > 0) { setErrs(validation); return }

    setSubmitState("submitting")
    setServerError("")

    try {
      const payload: Record<string, unknown> = {
        title:      form.title.trim(),
        asset_type: selectedType.id,
        age_group:  form.age_group || "all",
      }
      if (form.content.trim())   payload.content   = form.content.trim()
      if (form.excerpt.trim())   payload.excerpt   = form.excerpt.trim()
      if (form.video_url.trim()) payload.video_url = form.video_url.trim()
      if (form.category)         payload.category  = form.category
      if (form.tags.trim())      payload.tags      = form.tags.split(",").map(t => t.trim()).filter(Boolean)
      if (form.read_time)        payload.read_time = Number(form.read_time) || 5

      const res  = await fetch("/api/user-posts", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify(payload),
      })
      const data = await res.json()

      if (!res.ok) {
        setServerError(data.error ?? "Submission failed. Please try again.")
        setSubmitState("error")
        return
      }

      setSubmitState("success")
    } catch (e) {
      setServerError("Network error. Please check your connection.")
      setSubmitState("error")
    }
  }

  const type = selectedType

  return (
    <div
      className="fixed inset-0 z-[999] flex items-start justify-center pt-[3vh] pb-8 px-4 overflow-y-auto"
      style={{ backgroundColor: "rgba(0,0,0,0.6)", backdropFilter: "blur(6px)" }}
      onClick={e => { if (e.target === e.currentTarget) onClose() }}
      role="dialog" aria-modal="true"
      aria-label={type ? `Create ${type.label}` : "Create content"}
    >
      <div
        className="w-full max-w-[600px] rounded-2xl overflow-hidden shadow-2xl"
        style={{
          backgroundColor: "var(--card, #fff)",
          border: "1.5px solid var(--border, #EDE8E1)",
        }}
      >
        {/* ── Modal header ──────────────────────────────────────── */}
        <div
          className="flex items-center justify-between px-6 py-5"
          style={{
            background: type
              ? `linear-gradient(135deg, ${type.color}dd, ${type.color}88)`
              : "linear-gradient(135deg, #7C63B8, #B9A6E3)",
          }}
        >
          <div className="flex items-center gap-3">
            {type && (
              <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
                <type.icon size={18} className="text-white" />
              </div>
            )}
            <div>
              <h2 className="text-white font-bold text-lg leading-tight"
                style={{ fontFamily: "var(--font-quicksand), Quicksand, sans-serif" }}>
                {type ? `Create ${type.label}` : "Create"}
              </h2>
              <p className="text-white/75 text-xs" style={{ fontFamily: "var(--font-nunito), Nunito, sans-serif" }}>
                {type ? type.hint : "Share with the Parent in the Loop community"}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Close"
            className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/35 flex items-center justify-center transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-white"
          >
            <X size={16} className="text-white" />
          </button>
        </div>

        {/* ── Modal body ────────────────────────────────────────── */}
        <div className="px-6 py-6">

          {/* ── SUCCESS ─────────────────────────────────────────── */}
          {submitState === "success" && (
            <div className="text-center py-10">
              <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"
                style={{ backgroundColor: "rgba(166,182,161,0.2)" }}>
                <Check size={28} style={{ color: "#4d7a49" }} />
              </div>
              <h3 className="text-xl font-bold mb-2"
                style={{ color: "var(--foreground, #222222)", fontFamily: "var(--font-quicksand), Quicksand, sans-serif" }}>
                Submitted for review!
              </h3>
              <p className="text-sm mb-2" style={{ color: "var(--muted-foreground, #B79D84)", fontFamily: "var(--font-nunito), Nunito, sans-serif" }}>
                Your {type?.label.toLowerCase()} has been received and will appear after our team reviews it.
              </p>
              <p className="text-xs mb-8" style={{ color: "var(--muted-foreground, #B79D84)", fontFamily: "var(--font-nunito), Nunito, sans-serif" }}>
                Thank you for contributing to the Parent in the Loop community! 🙏
              </p>
              <div className="flex gap-3 justify-center">
                <button
                  onClick={() => { setSubmitState("idle"); setForm(EMPTY); setSelectedType(null) }}
                  className="px-5 py-2.5 rounded-xl text-sm font-bold border-2 transition-all hover:scale-105"
                  style={{ color: "#7C63B8", borderColor: "rgba(124,99,184,0.35)", fontFamily: "var(--font-nunito), Nunito, sans-serif" }}
                >
                  Create another
                </button>
                <button
                  onClick={onClose}
                  className="px-5 py-2.5 rounded-xl text-sm font-bold text-white transition-all hover:scale-105"
                  style={{ backgroundColor: type?.color ?? "#7C63B8", fontFamily: "var(--font-nunito), Nunito, sans-serif" }}
                >
                  Done
                </button>
              </div>
            </div>
          )}

          {/* ── TYPE PICKER ─────────────────────────────────────── */}
          {submitState !== "success" && !type && (
            <div>
              <p className="text-sm mb-4" style={{ color: "var(--muted-foreground, #B79D84)", fontFamily: "var(--font-nunito), Nunito, sans-serif" }}>
                What would you like to create?
              </p>
              <div className="space-y-3">
                {POST_TYPES.map(t => (
                  <button
                    key={t.id}
                    onClick={() => { setSelectedType(t); setForm(EMPTY); setErrs({}) }}
                    className="w-full flex items-center gap-4 px-4 py-4 rounded-2xl text-left border-2 transition-all hover:scale-[1.01] focus:outline-none focus-visible:ring-2"
                    style={{
                      backgroundColor: "transparent",
                      borderColor:     "var(--border, #EDE8E1)",
                      focusRingColor:  t.color,
                    }}
                    onMouseEnter={e => {
                      const b = e.currentTarget as HTMLButtonElement
                      b.style.borderColor     = t.color
                      b.style.backgroundColor = t.color + "10"
                    }}
                    onMouseLeave={e => {
                      const b = e.currentTarget as HTMLButtonElement
                      b.style.borderColor     = "var(--border, #EDE8E1)"
                      b.style.backgroundColor = "transparent"
                    }}
                  >
                    <div className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0"
                      style={{ backgroundColor: t.color + "20" }}>
                      <t.icon size={20} style={{ color: t.color }} />
                    </div>
                    <div className="flex-1">
                      <p className="font-bold text-base" style={{ color: "var(--foreground, #222222)", fontFamily: "var(--font-nunito), Nunito, sans-serif" }}>
                        {t.label}
                      </p>
                      <p className="text-xs mt-0.5" style={{ color: "var(--muted-foreground, #B79D84)", fontFamily: "var(--font-nunito), Nunito, sans-serif" }}>
                        {t.desc}
                      </p>
                    </div>
                    <span style={{ color: "var(--muted-foreground, #B79D84)", fontSize: 18 }}>→</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* ── FORM ────────────────────────────────────────────── */}
          {submitState !== "success" && type && (
            <>
              {/* Back button */}
              <button
                onClick={() => { setSelectedType(null); setErrs({}); setServerError("") }}
                className="flex items-center gap-1.5 text-xs font-semibold mb-5 transition-colors focus:outline-none"
                style={{ color: "var(--muted-foreground, #B79D84)", fontFamily: "var(--font-nunito), Nunito, sans-serif" }}
                onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.color = "#7C63B8" }}
                onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.color = "var(--muted-foreground, #B79D84)" }}
              >
                ← Back
              </button>

              {/* Render the correct form */}
              {type.id === "note"    && <NoteForm    form={form} set={setField} errs={errs} />}
              {type.id === "article" && <ArticleForm form={form} set={setField} errs={errs} />}
              {type.id === "video"   && <VideoForm   form={form} set={setField} errs={errs} />}

              {/* Server error */}
              {serverError && (
                <div className="mt-4 px-4 py-3 rounded-xl flex items-start gap-2"
                  style={{ backgroundColor: "rgba(243,167,142,0.1)", border: "1px solid rgba(243,167,142,0.3)" }}>
                  <AlertCircle size={15} style={{ color: "#e74c3c", flexShrink: 0, marginTop: 1 }} />
                  <p className="text-xs" style={{ color: "#e74c3c", fontFamily: "var(--font-nunito), Nunito, sans-serif" }}>
                    {serverError}
                  </p>
                </div>
              )}

              {/* Guidelines reminder */}
              <div className="mt-4 px-4 py-3 rounded-xl"
                style={{ backgroundColor: "rgba(124,99,184,0.05)", border: "1px solid rgba(124,99,184,0.15)" }}>
                <p className="text-xs" style={{ color: "#7C63B8", fontFamily: "var(--font-nunito), Nunito, sans-serif" }}>
                  📋 All submissions are reviewed before publishing. Please keep content family-friendly and evidence-based. Avoid personal data about minors.
                </p>
              </div>

              {/* Action buttons */}
              <div className="flex gap-3 justify-end mt-5 pt-4"
                style={{ borderTop: "1px solid var(--border, #EDE8E1)" }}>
                <button
                  onClick={onClose}
                  className="px-5 py-2.5 rounded-xl text-sm font-semibold border transition-colors"
                  style={{
                    color:       "var(--foreground, #3E3E3E)",
                    borderColor: "var(--border, #EDE8E1)",
                    fontFamily:  "var(--font-nunito), Nunito, sans-serif",
                    backgroundColor: "transparent",
                  }}
                >
                  Cancel
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={submitState === "submitting"}
                  className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold text-white transition-all hover:scale-105 active:scale-95 disabled:opacity-60 disabled:scale-100 disabled:cursor-wait focus:outline-none focus-visible:ring-2"
                  style={{
                    backgroundColor: type.color,
                    fontFamily:      "var(--font-nunito), Nunito, sans-serif",
                    boxShadow:       `0 2px 12px ${type.color}44`,
                  }}
                >
                  {submitState === "submitting" ? (
                    <><Loader2 size={14} className="animate-spin" /> Submitting…</>
                  ) : (
                    <>Submit {type.label}</>
                  )}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

// ── Dropdown button ──────────────────────────────────────────────────────────
export default function CreateMenu({ mobile = false }: { mobile?: boolean }) {
  const [dropOpen, setDropOpen] = useState(false)
  const [modal,    setModal]    = useState(false)
  const [initType, setInitType] = useState<PostType | null>(null)
  const dropRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function outside(e: MouseEvent) {
      if (dropRef.current && !dropRef.current.contains(e.target as Node)) setDropOpen(false)
    }
    document.addEventListener("mousedown", outside)
    return () => document.removeEventListener("mousedown", outside)
  }, [])

  function openModal(type: PostType | null = null) {
    setDropOpen(false)
    setInitType(type)
    setModal(true)
  }

  // Mobile variant — just a row of buttons
  if (mobile) {
    return (
      <>
        <div>
          <p className="text-xs font-bold uppercase tracking-widest mb-2"
            style={{ color: "#B79D84", fontFamily: "var(--font-nunito), Nunito, sans-serif" }}>
            Create
          </p>
          <div className="flex flex-wrap gap-2">
            {POST_TYPES.map(t => (
              <button
                key={t.id}
                onClick={() => openModal(t)}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-semibold border transition-all hover:scale-105"
                style={{
                  color:           t.color,
                  borderColor:     t.color + "44",
                  backgroundColor: t.color + "10",
                  fontFamily:      "var(--font-nunito), Nunito, sans-serif",
                }}
              >
                <t.icon size={14} />
                {t.label}
              </button>
            ))}
          </div>
        </div>
        {modal && <CreateModal onClose={() => setModal(false)} initialType={initType} />}
      </>
    )
  }

  // Desktop dropdown
  return (
    <>
      <div ref={dropRef} className="relative">
        <button
          onClick={() => setDropOpen(o => !o)}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-bold text-white transition-all hover:scale-105 active:scale-95 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#F3A78E]"
          style={{
            backgroundColor: "#F3A78E",
            fontFamily:      "var(--font-nunito), Nunito, sans-serif",
            boxShadow:       "0 2px 8px rgba(243,167,142,0.4)",
          }}
          aria-expanded={dropOpen}
          aria-haspopup="menu"
          onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.backgroundColor = "#E8926A" }}
          onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.backgroundColor = "#F3A78E" }}
        >
          <Plus size={15} />
          Create
          <ChevronDown size={13} className={`transition-transform duration-200 ${dropOpen ? "rotate-180" : ""}`} />
        </button>

        {dropOpen && (
          <div
            className="absolute top-full right-0 mt-2 w-60 rounded-2xl overflow-hidden shadow-2xl z-50"
            style={{
              backgroundColor: "var(--card, #fff)",
              border:          "1.5px solid var(--border, #EDE8E1)",
            }}
            role="menu"
            aria-label="Create options"
          >
            <div className="px-4 pt-3 pb-2 border-b" style={{ borderColor: "var(--border, #EDE8E1)" }}>
              <p className="text-xs font-bold uppercase tracking-widest"
                style={{ color: "#B79D84", fontFamily: "var(--font-nunito), Nunito, sans-serif" }}>
                Share with Community
              </p>
            </div>

            {POST_TYPES.map((t, i) => (
              <button
                key={t.id}
                onClick={() => openModal(t)}
                className="w-full flex items-start gap-3 px-4 py-3 text-left transition-colors focus:outline-none"
                style={{
                  borderBottom: i < POST_TYPES.length - 1 ? "1px solid var(--border, #EDE8E1)" : "none",
                  backgroundColor: "transparent",
                }}
                role="menuitem"
                onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.backgroundColor = t.color + "08" }}
                onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.backgroundColor = "transparent" }}
              >
                <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5"
                  style={{ backgroundColor: t.color + "18" }}>
                  <t.icon size={15} style={{ color: t.color }} />
                </div>
                <div>
                  <p className="text-sm font-bold"
                    style={{ color: "var(--foreground, #222222)", fontFamily: "var(--font-nunito), Nunito, sans-serif" }}>
                    {t.label}
                  </p>
                  <p className="text-xs mt-0.5"
                    style={{ color: "var(--muted-foreground, #B79D84)", fontFamily: "var(--font-nunito), Nunito, sans-serif" }}>
                    {t.desc}
                  </p>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {modal && <CreateModal onClose={() => setModal(false)} initialType={initType} />}
    </>
  )
}
