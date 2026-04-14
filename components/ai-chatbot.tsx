"use client"

import { useState, useRef, useEffect } from "react"

interface Message {
  role: "user" | "assistant"
  content: string
  followups?: string[]
  id: number
}

const SUGGESTED = [
  "How do I explain ChatGPT to my 8-year-old?",
  "Fun AI activity for a rainy afternoon?",
  "How do I talk about AI bias with kids?",
  "Is AI safe for my child to use?",
]

let msgId = 0

function renderAnswer(text: string) {
  const F = { fontFamily: "var(--font-nunito), Nunito, sans-serif" }
  return text.split("\n\n").map((para, i) => {
    if (!para.trim()) return null

    // Heading: **text**
    if (para.startsWith("**") && para.endsWith("**") && !para.slice(2,-2).includes("**")) {
      return <p key={i} className="font-bold text-sm mt-3 mb-1" style={{ color: "#222222", ...F }}>{para.slice(2,-2)}</p>
    }

    // Bullet list
    if (para.split("\n").some((l) => l.startsWith("- ") || l.startsWith("✅") || l.startsWith("❌") || l.match(/^\d+\./))) {
      return (
        <ul key={i} className="space-y-1 my-2">
          {para.split("\n").filter(Boolean).map((line, j) => {
            const clean = line.replace(/^[-\d.]\s*/, "").replace(/^[✅❌]\s*/, "")
            const icon = line.startsWith("✅") ? "✅" : line.startsWith("❌") ? "❌" : "•"
            // Parse inline bold
            const parts = clean.split(/\*\*(.*?)\*\*/g)
            return (
              <li key={j} className="flex gap-2 text-xs leading-relaxed" style={{ color: "#3E3E3E", ...F }}>
                <span className="flex-shrink-0 mt-0.5">{icon === "•" ? "·" : icon}</span>
                <span>{parts.map((p, k) => k % 2 === 1 ? <strong key={k} style={{ color: "#222" }}>{p}</strong> : p)}</span>
              </li>
            )
          })}
        </ul>
      )
    }

    // Tip line
    if (para.startsWith("💡")) {
      return (
        <div key={i} className="mt-3 px-3 py-2 rounded-xl text-xs italic" style={{ backgroundColor: "rgba(244,215,139,0.2)", color: "#7a6a3a", ...F }}>
          {para}
        </div>
      )
    }

    // Regular paragraph with inline bold
    const parts = para.split(/\*\*(.*?)\*\*/g)
    return (
      <p key={i} className="text-xs leading-relaxed my-1" style={{ color: "#3E3E3E", ...F }}>
        {parts.map((p, k) => k % 2 === 1 ? <strong key={k} style={{ color: "#222" }}>{p}</strong> : p)}
      </p>
    )
  })
}

export default function AIChatbot() {
  const [open, setOpen]           = useState(false)
  const [messages, setMessages]   = useState<Message[]>([])
  const [input, setInput]         = useState("")
  const [loading, setLoading]     = useState(false)
  const [hasGreeted, setHasGreeted] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)
  const inputRef  = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    if (open && !hasGreeted) {
      setHasGreeted(true)
      setMessages([{
        role: "assistant",
        content: "Hi! 👋 I'm the Parent in the Loop assistant. Ask me anything about helping your kids understand AI — from explaining ChatGPT to planning family activities. What's on your mind?",
        followups: SUGGESTED,
        id: ++msgId,
      }])
    }
    if (open) setTimeout(() => inputRef.current?.focus(), 200)
  }, [open, hasGreeted])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages, loading])

  const send = async (text: string) => {
    const content = text.trim()
    if (!content || loading) return

    setInput("")

    // Add user message to UI
    const userMsg: Message = { role: "user", content, id: ++msgId }
    setMessages((prev) => [...prev, userMsg])
    setLoading(true)

    try {
      // Send just the question directly — no need for full history
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: content }),
      })
      const data = await res.json()

      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: data.message ?? "I don\'t have an answer for that yet. Try one of the suggestions below! 🌱",
          followups: data.followups ?? [],
          id: ++msgId,
        },
      ])
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "Network error — please check your connection and try again. 🌱", id: ++msgId },
      ])
    } finally {
      setLoading(false)
    }
  }

  const handleKey = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(input) }
  }

  const F  = { fontFamily: "var(--font-nunito), Nunito, sans-serif" }
  const FQ = { fontFamily: "var(--font-quicksand), Quicksand, sans-serif" }

  return (
    <>
      {/* Chat panel */}
      {open && (
        <div
          className="fixed bottom-24 right-5 sm:right-6 z-50 w-[calc(100vw-40px)] sm:w-[380px] max-h-[600px] flex flex-col rounded-3xl overflow-hidden shadow-2xl"
          style={{ backgroundColor: "#fff", border: "1.5px solid #EDE8E1" }}
          role="dialog" aria-label="AI Parenting Assistant" aria-modal="true"
        >
          {/* Header */}
          <div className="flex items-center gap-3 px-5 py-4 flex-shrink-0"
            style={{ background: "linear-gradient(135deg, #7C63B8 0%, #B9A6E3 100%)" }}>
            <div className="w-9 h-9 rounded-xl flex items-center justify-center text-lg flex-shrink-0"
              style={{ backgroundColor: "rgba(255,255,255,0.2)" }} aria-hidden="true">🤖</div>
            <div className="flex-1 min-w-0">
              <p className="font-bold text-white text-sm" style={FQ}>AI Parenting Assistant</p>
              <p className="text-xs" style={{ color: "rgba(255,255,255,0.75)", ...F }}>Ask anything about kids & AI</p>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-green-300" aria-label="Online" />
              <button onClick={() => setOpen(false)}
                className="ml-1 w-7 h-7 flex items-center justify-center rounded-lg text-white hover:bg-white/20 transition-colors focus:outline-none"
                aria-label="Close chat">✕</button>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4" style={{ minHeight: 0 }}>
            {messages.map((msg) => (
              <div key={msg.id} className={`flex gap-2 ${msg.role === "user" ? "flex-row-reverse" : "flex-row"}`}>
                {msg.role === "assistant" && (
                  <div className="w-7 h-7 rounded-xl flex-shrink-0 flex items-center justify-center text-sm mt-0.5"
                    style={{ backgroundColor: "rgba(124,99,184,0.1)" }} aria-hidden="true">🤖</div>
                )}
                <div className="max-w-[85%] flex flex-col gap-2">
                  {/* Bubble */}
                  <div
                    className="px-4 py-3 rounded-2xl"
                    style={{
                      backgroundColor: msg.role === "user" ? "#7C63B8" : "#FAF6F0",
                      borderBottomRightRadius: msg.role === "user" ? "4px" : undefined,
                      borderBottomLeftRadius:  msg.role === "assistant" ? "4px" : undefined,
                    }}
                  >
                    {msg.role === "user" ? (
                      <p className="text-sm text-white" style={F}>{msg.content}</p>
                    ) : (
                      <div>{renderAnswer(msg.content)}</div>
                    )}
                  </div>

                  {/* Follow-up suggestions */}
                  {msg.role === "assistant" && msg.followups && msg.followups.length > 0 && (
                    <div className="space-y-1.5 pl-1">
                      {msg.followups.map((f) => (
                        <button key={f} onClick={() => send(f)}
                          className="block w-full text-left px-3 py-2 rounded-xl text-xs font-semibold transition-all hover:scale-[1.01] hover:shadow-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-[#7C63B8]"
                          style={{ backgroundColor: "#fff", border: "1.5px solid #EDE8E1", color: "#7C63B8", ...F }}>
                          → {f}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}

            {/* Loading dots */}
            {loading && (
              <div className="flex gap-2 items-start">
                <div className="w-7 h-7 rounded-xl flex-shrink-0 flex items-center justify-center text-sm"
                  style={{ backgroundColor: "rgba(124,99,184,0.1)" }} aria-hidden="true">🤖</div>
                <div className="px-4 py-3 rounded-2xl" style={{ backgroundColor: "#FAF6F0", borderBottomLeftRadius: "4px" }}
                  aria-label="Thinking...">
                  <span className="flex gap-1.5 items-center">
                    {[0,1,2].map((i) => (
                      <span key={i} className="w-2 h-2 rounded-full animate-bounce"
                        style={{ backgroundColor: "#B9A6E3", animationDelay: `${i * 0.15}s` }} />
                    ))}
                  </span>
                </div>
              </div>
            )}

            <div ref={bottomRef} />
          </div>

          {/* Input */}
          <div className="px-4 pb-4 pt-2 flex-shrink-0" style={{ borderTop: "1px solid #EDE8E1" }}>
            <div className="flex gap-2 items-end">
              <textarea
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKey}
                placeholder="Ask about kids and AI…"
                rows={1}
                disabled={loading}
                className="flex-1 resize-none rounded-xl px-4 py-3 text-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-[#7C63B8] disabled:opacity-60"
                style={{ backgroundColor: "#FAF6F0", border: "1.5px solid #EDE8E1", color: "#222222", maxHeight: "100px", lineHeight: "1.5", ...F }}
                aria-label="Type your message"
              />
              <button onClick={() => send(input)} disabled={loading || !input.trim()}
                className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 transition-all hover:scale-110 active:scale-95 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#7C63B8] disabled:opacity-40"
                style={{ backgroundColor: "#7C63B8" }} aria-label="Send message">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                  <path d="M14 8L2 2l2.5 6L2 14l12-6z" fill="white"/>
                </svg>
              </button>
            </div>
            <p className="text-center text-xs mt-2" style={{ color: "#B79D84", ...F }}>
              Parent in the Loop · Answers based on curated research
            </p>
          </div>
        </div>
      )}

      {/* Floating button */}
      <button
        onClick={() => setOpen((o) => !o)}
        className="fixed bottom-5 right-5 sm:right-6 z-50 w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg transition-all duration-200 hover:scale-110 active:scale-95 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#7C63B8]"
        style={{
          background: open ? "linear-gradient(135deg,#F3A78E,#E89175)" : "linear-gradient(135deg,#7C63B8,#B9A6E3)",
          boxShadow: "0 8px 24px rgba(124,99,184,0.4)",
        }}
        aria-label={open ? "Close assistant" : "Open AI parenting assistant"}
        aria-expanded={open}
      >
        <span className="text-2xl" aria-hidden="true">{open ? "✕" : "🤖"}</span>
        {!open && (
          <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full flex items-center justify-center text-white"
            style={{ backgroundColor: "#F3A78E", fontSize: "9px", fontWeight: 800 }} aria-hidden="true">
            AI
          </span>
        )}
      </button>
    </>
  )
}
