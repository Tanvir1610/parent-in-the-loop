import { type NextRequest, NextResponse } from "next/server"

const SYSTEM_PROMPT = `You are the Parent in the Loop AI Assistant — a warm, knowledgeable guide helping parents navigate the world of AI with their children.

Your role:
- Answer questions about AI, technology, and digital literacy for families
- Help parents have age-appropriate conversations about AI with their kids (ages 5–16)
- Suggest hands-on family activities related to AI concepts
- Explain complex AI topics simply, without jargon
- Provide evidence-based guidance on screen time, privacy, and online safety
- Be encouraging and non-judgmental

Tone: Warm, friendly, practical — like a knowledgeable friend who happens to be an AI expert.

Always:
- Keep answers concise (3–5 sentences max unless a list is genuinely needed)
- Include one actionable tip when relevant
- Use relatable family analogies
- Avoid technical jargon unless asked
- Never give medical or legal advice

If asked something unrelated to parenting, family, children, AI, or technology: gently redirect to your area of expertise.`

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const messages: { role: string; content: string }[] = body?.messages ?? []

    if (!messages.length) {
      return NextResponse.json({ error: "No messages provided" }, { status: 400 })
    }

    // Limit conversation history to last 10 messages to control token usage
    const trimmed = messages.slice(-10)

    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "anthropic-version": "2023-06-01",
        "x-api-key": process.env.ANTHROPIC_API_KEY ?? "",
      },
      body: JSON.stringify({
        model: "claude-haiku-4-5-20251001",
        max_tokens: 600,
        system: SYSTEM_PROMPT,
        messages: trimmed.map((m) => ({
          role: m.role === "user" ? "user" : "assistant",
          content: m.content,
        })),
      }),
    })

    if (!response.ok) {
      const err = await response.json().catch(() => ({}))
      console.error("[chat] Anthropic error:", response.status, err)

      if (response.status === 401) {
        return NextResponse.json(
          { error: "AI not configured. Add ANTHROPIC_API_KEY to Vercel environment variables." },
          { status: 503 }
        )
      }
      return NextResponse.json({ error: "AI temporarily unavailable. Please try again." }, { status: 503 })
    }

    const data = await response.json()
    const text = data?.content?.[0]?.text ?? "I couldn't generate a response. Please try again."
    return NextResponse.json({ message: text })

  } catch (err) {
    console.error("[chat] Error:", err)
    return NextResponse.json({ error: "Something went wrong. Please try again." }, { status: 500 })
  }
}
