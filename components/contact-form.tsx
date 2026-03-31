"use client"

import { useState } from "react"

type FormState = "idle" | "loading" | "success" | "error"

const SUBJECTS = [
  "General question",
  "Article suggestion",
  "Partnership / collaboration",
  "Report an issue",
  "Other",
]

export default function ContactForm() {
  const [name, setName]       = useState("")
  const [email, setEmail]     = useState("")
  const [subject, setSubject] = useState(SUBJECTS[0])
  const [message, setMessage] = useState("")
  const [formState, setFormState] = useState<FormState>("idle")
  const [errorMsg, setErrorMsg]   = useState("")

  const reset = () => {
    setName(""); setEmail(""); setSubject(SUBJECTS[0]); setMessage("")
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setFormState("loading")
    setErrorMsg("")

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim(), email: email.trim(), subject, message: message.trim() }),
      })
      const data = await res.json()
      if (res.ok && data.success) {
        setFormState("success")
        reset()
      } else {
        setErrorMsg(data?.error || "Something went wrong. Please try again.")
        setFormState("error")
      }
    } catch {
      setErrorMsg("Network error — please check your connection.")
      setFormState("error")
    }
  }

  const inputStyle = {
    backgroundColor: "#fff",
    border: "1.5px solid #EDE8E1",
    color: "#222222",
    fontFamily: "var(--font-nunito), Nunito, sans-serif",
    borderRadius: "0.75rem",
    padding: "0.75rem 1rem",
    width: "100%",
    fontSize: "0.875rem",
    outline: "none",
    transition: "border-color 0.15s",
  }

  return (
    <section
      className="py-16 px-4 sm:px-6 lg:px-8"
      id="contact"
      style={{ backgroundColor: "#FAF6F0" }}
      aria-label="Contact form"
    >
      <div className="max-w-xl mx-auto">
        {/* Header */}
        <div className="text-center mb-10">
          <p className="text-xs font-bold tracking-widest uppercase mb-2" style={{ color: "#B79D84", fontFamily: "var(--font-nunito), Nunito, sans-serif" }}>
            <span style={{ color: "#F3A78E" }}>✦</span> GET IN TOUCH
          </p>
          <h2 className="text-3xl font-bold mb-2" style={{ color: "#222222", fontFamily: "var(--font-quicksand), Quicksand, sans-serif" }}>
            Say Hello 👋
          </h2>
          <p className="text-sm" style={{ color: "#B79D84", fontFamily: "var(--font-nunito), Nunito, sans-serif" }}>
            Questions, ideas, or just want to connect? We read every message.
          </p>
        </div>

        {/* Success */}
        {formState === "success" && (
          <div
            className="rounded-2xl p-8 text-center mb-6"
            style={{ backgroundColor: "rgba(166,182,161,0.15)", border: "2px solid rgba(166,182,161,0.4)" }}
            role="alert"
            aria-live="polite"
          >
            <div className="text-4xl mb-3">🎉</div>
            <h3 className="text-lg font-bold mb-2" style={{ color: "#222222", fontFamily: "var(--font-quicksand), Quicksand, sans-serif" }}>
              Message sent!
            </h3>
            <p className="text-sm" style={{ color: "#4d7a49", fontFamily: "var(--font-nunito), Nunito, sans-serif" }}>
              Thanks for reaching out. We&apos;ll get back to you within a few days.
            </p>
            <button
              onClick={() => setFormState("idle")}
              className="mt-4 px-5 py-2 rounded-xl text-sm font-bold transition-all hover:scale-105"
              style={{ backgroundColor: "#A6B6A1", color: "#fff", fontFamily: "var(--font-nunito), Nunito, sans-serif" }}
            >
              Send another message
            </button>
          </div>
        )}

        {/* Form */}
        {formState !== "success" && (
          <form
            onSubmit={handleSubmit}
            className="space-y-5"
            noValidate
            aria-label="Contact us"
          >
            {/* Name + Email row */}
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor="contact-name"
                  className="block text-xs font-bold mb-1.5"
                  style={{ color: "#3E3E3E", fontFamily: "var(--font-nunito), Nunito, sans-serif" }}
                >
                  Your name <span style={{ color: "#F3A78E" }}>*</span>
                </label>
                <input
                  id="contact-name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Alex"
                  required
                  maxLength={100}
                  disabled={formState === "loading"}
                  style={inputStyle}
                  onFocus={(e) => { (e.target as HTMLInputElement).style.borderColor = "#7C63B8" }}
                  onBlur={(e) => { (e.target as HTMLInputElement).style.borderColor = "#EDE8E1" }}
                  aria-required="true"
                />
              </div>
              <div>
                <label
                  htmlFor="contact-email"
                  className="block text-xs font-bold mb-1.5"
                  style={{ color: "#3E3E3E", fontFamily: "var(--font-nunito), Nunito, sans-serif" }}
                >
                  Email address <span style={{ color: "#F3A78E" }}>*</span>
                </label>
                <input
                  id="contact-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@email.com"
                  required
                  maxLength={254}
                  autoComplete="email"
                  disabled={formState === "loading"}
                  style={inputStyle}
                  onFocus={(e) => { (e.target as HTMLInputElement).style.borderColor = "#7C63B8" }}
                  onBlur={(e) => { (e.target as HTMLInputElement).style.borderColor = "#EDE8E1" }}
                  aria-required="true"
                />
              </div>
            </div>

            {/* Subject */}
            <div>
              <label
                htmlFor="contact-subject"
                className="block text-xs font-bold mb-1.5"
                style={{ color: "#3E3E3E", fontFamily: "var(--font-nunito), Nunito, sans-serif" }}
              >
                Subject
              </label>
              <select
                id="contact-subject"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                disabled={formState === "loading"}
                style={{ ...inputStyle, cursor: "pointer" }}
                onFocus={(e) => { (e.target as HTMLSelectElement).style.borderColor = "#7C63B8" }}
                onBlur={(e) => { (e.target as HTMLSelectElement).style.borderColor = "#EDE8E1" }}
              >
                {SUBJECTS.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>

            {/* Message */}
            <div>
              <label
                htmlFor="contact-message"
                className="block text-xs font-bold mb-1.5"
                style={{ color: "#3E3E3E", fontFamily: "var(--font-nunito), Nunito, sans-serif" }}
              >
                Message <span style={{ color: "#F3A78E" }}>*</span>
                <span className="ml-2 font-normal" style={{ color: "#B79D84" }}>
                  ({message.length}/2000)
                </span>
              </label>
              <textarea
                id="contact-message"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Hi! I wanted to ask about..."
                required
                minLength={10}
                maxLength={2000}
                rows={5}
                disabled={formState === "loading"}
                style={{ ...inputStyle, resize: "vertical", minHeight: "120px" }}
                onFocus={(e) => { (e.target as HTMLTextAreaElement).style.borderColor = "#7C63B8" }}
                onBlur={(e) => { (e.target as HTMLTextAreaElement).style.borderColor = "#EDE8E1" }}
                aria-required="true"
              />
            </div>

            {/* Error */}
            {formState === "error" && errorMsg && (
              <div
                className="rounded-xl px-4 py-3 text-sm font-semibold"
                style={{ backgroundColor: "rgba(243,167,142,0.15)", color: "#c97a5a", fontFamily: "var(--font-nunito), Nunito, sans-serif" }}
                role="alert"
              >
                ⚠️ {errorMsg}
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={formState === "loading" || !name.trim() || !email.trim() || message.trim().length < 10}
              className="w-full py-3.5 rounded-xl font-bold text-sm text-white transition-all hover:scale-[1.02] active:scale-[0.98] focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#7C63B8] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
              style={{ backgroundColor: "#7C63B8", fontFamily: "var(--font-nunito), Nunito, sans-serif" }}
              onMouseEnter={(e) => { if (formState !== "loading") (e.currentTarget as HTMLButtonElement).style.backgroundColor = "#6B5599" }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.backgroundColor = "#7C63B8" }}
            >
              {formState === "loading" ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin" aria-hidden="true" />
                  Sending…
                </span>
              ) : "Send Message ✨"}
            </button>

            <p className="text-xs text-center" style={{ color: "#B79D84", fontFamily: "var(--font-nunito), Nunito, sans-serif" }}>
              We typically respond within 2–3 business days. Educational content only — this is not a medical or therapeutic service.
            </p>
          </form>
        )}
      </div>
    </section>
  )
}
