import { type NextRequest, NextResponse } from "next/server"

// ─────────────────────────────────────────────────────────────
// BUILT-IN Q&A LIBRARY
// No API key needed. Pure keyword matching against curated answers.
// ─────────────────────────────────────────────────────────────
interface QAEntry {
  id: number
  keywords: string[]
  answer: string
  followups: string[]
}

const QA: QAEntry[] = [
  {
    id: 1,
    keywords: [
      "explain chatgpt", "what is chatgpt", "chatgpt to my", "chatgpt child",
      "chatgpt 8", "chatgpt 9", "chatgpt 10", "chatgpt young", "tell kids chatgpt",
      "describe chatgpt", "chatgpt for kids",
    ],
    answer: `Great question! Here's a simple way to explain it 🤖

**The best analogy:** "ChatGPT is like a very well-read friend who has read millions of books and websites. When you ask it something, it predicts what a helpful answer would look like — but it doesn't actually *know* things the way you do."

**For younger kids (5–8):** "It's like autocomplete on a phone, but much bigger. It guesses the next word, and the next, until it makes a whole sentence."

**For older kids (9–14):** It was trained on huge amounts of text and learned patterns — like how you learn to write by reading lots of books.

**Dinner-table activity:** Ask your child to finish this sentence: "The sky is..." — then explain that ChatGPT does exactly the same thing, just much faster.

💡 Always remind them: ChatGPT can be confidently wrong — always fact-check important information!`,
    followups: [
      "Can ChatGPT make mistakes?",
      "How does AI learn?",
      "Is AI safe for kids?",
    ],
  },
  {
    id: 2,
    keywords: [
      "too much time", "screen time", "ai screen time", "spending time with ai",
      "how long ai", "limit ai", "too much ai", "ai addiction", "overuse ai",
    ],
    answer: `This is one of the most common concerns parents share! Here's a balanced view 📱

**Signs to watch for:**
- Choosing AI over thinking independently ("just ask ChatGPT")
- Getting frustrated when AI isn't available
- Using AI to avoid creative thinking
- Declining interest in books, play, or real conversations

**Healthy AI use looks like:**
- Using AI as a starting point, then adding their own ideas
- Asking AI to explain something, then teaching it back to you
- Disagreeing with AI answers and researching further

**Our recommended family framework:**
- "AI-free" homework time at least 3 days per week
- Always ask: "What do *you* think first?"
- Treat AI like a calculator — useful tool, not a replacement for thinking

💡 The American Academy of Pediatrics says it's more about *how* they use it than *how long*.`,
    followups: [
      "How do I set AI boundaries?",
      "AI and creativity",
      "Fun AI activities",
    ],
  },
  {
    id: 3,
    keywords: [
      "activity", "rainy", "fun", "game", "play", "hands-on",
      "weekend", "bored", "project", "do together", "family activity",
      "ai activity", "activity for kids", "try together",
    ],
    answer: `Here are 4 family-favourite activities you can try today! 🎯

**1. The "AI vs Human" Drawing Game (ages 5+)**
Pick a word like "happiness". Everyone draws their version, then compare with an AI image generator. Whose is more creative?

**2. Spot the AI Mistake (ages 8+)**
Ask ChatGPT a question you already know the answer to — a local fact, family memory, or recent event. Find the mistakes together. Brilliant for critical thinking!

**3. Story Co-Writer (ages 6+)**
Start a story with 2 sentences. Ask AI to add the next part. You add the next. Keep going! Then discuss: which parts did you prefer?

**4. Algorithm in a Bag (ages 5+)**
Write "make a peanut butter sandwich" instructions as literally as possible. Follow them *exactly* — things will go hilariously wrong. That's what happens when algorithms have gaps!

💡 Check our Articles section for printable versions of these activities!`,
    followups: [
      "How do I explain algorithms?",
      "AI and creativity",
      "How does AI learn?",
    ],
  },
  {
    id: 4,
    keywords: [
      "ai bias", "bias", "fairness", "unfair ai", "discrimination",
      "prejudice", "talk about bias", "explain bias",
    ],
    answer: `AI bias is a perfect dinner-table topic — kids already have a strong sense of fairness! ⚖️

**Start with this question:** "If we trained a robot to pick a class leader by only looking at photos of kids who won before, who might it leave out?" Watch the lightbulb moment happen.

**Why bias happens:**
- AI learns from data created by humans
- If that data reflects past unfairness, the AI learns it too
- Example: Some AI hiring tools favoured male candidates because they trained on historical (mostly male) hiring records

**Age-appropriate conversations:**
- Ages 6–9: "Sometimes computers make unfair choices because no one taught them about fairness"
- Ages 10–14: Discuss facial recognition being less accurate for darker skin tones
- Ages 14+: Explore what engineers are doing to fix it

**Quick activity:** Show two drawings of the same thing by different kids. "If an AI only learned from one, what might it get wrong?"

💡 Asking "Is this fair to everyone?" is one of the most important AI literacy skills.`,
    followups: [
      "What is AI fairness?",
      "Privacy and kids",
      "How does AI learn?",
    ],
  },
  {
    id: 5,
    keywords: [
      "privacy", "data", "personal information", "digital footprint",
      "information online", "protect data", "apps collect",
      "safe online", "online safety", "data privacy",
    ],
    answer: `Digital privacy is one of the most important things to teach your child! 🔒

**Start with something familiar:** "Remember when you didn't want to share your diary? Your personal information online is like your diary — you get to decide who sees it."

**What kids should know:**
- Apps often ask for more data than they need
- Even "anonymous" data can sometimes identify you
- Once shared, data is very hard to take back
- They have the right to ask "Why do you need this?"

**The Family App Rule — ask 3 questions before any new app:**
1. Who made this? Can we find them online?
2. What data does it collect?
3. Can we delete our data if we want?

**For younger kids:** "Would you give a stranger your whole lunchbox just because they asked nicely? No — same with personal info."

💡 Under COPPA, apps cannot collect data from children under 13 without parental consent.`,
    followups: [
      "What apps are safe for kids?",
      "AI bias and fairness",
      "Is AI safe for kids?",
    ],
  },
  {
    id: 6,
    keywords: [
      "algorithm", "what is algorithm", "explain algorithm",
      "how algorithm works", "algorithm kids", "what are algorithms",
    ],
    answer: `Algorithms are everywhere — and kids already use them without knowing it! ⚙️

**The simplest definition:** An algorithm is a set of step-by-step instructions to solve a problem.

**A real-life algorithm your child already knows:**
How to make a bowl of cereal:
1. Get a bowl
2. Get the cereal
3. Pour cereal into bowl
4. Add milk
5. Get a spoon and eat!

That's an algorithm! Computer algorithms work exactly the same way — just much faster.

**The Sandwich Activity (10 minutes, guaranteed laughs):**
Ask your child to write the *exact* steps for making a peanut butter sandwich. Then follow them *literally* — things will go hilariously wrong ("pick up the bread" without opening the bag!).

**For older kids:** YouTube's algorithm decides what video to show next. Ask: "What do you think it's looking for?"

💡 CS Unplugged (csunplugged.org) has brilliant free printable algorithm activities!`,
    followups: [
      "How does AI learn?",
      "What is machine learning?",
      "Fun AI activities",
    ],
  },
  {
    id: 7,
    keywords: [
      "how does ai learn", "machine learning", "how ai trained",
      "training data", "neural network", "what is machine learning",
      "how ai works", "ai training",
    ],
    answer: `This one blows kids' minds once they get it! 🧠

**The core idea:** AI learns by looking at *lots and lots of examples*.

**The dog photo analogy:**
Imagine showing a child 1,000 photos of dogs and 1,000 photos of cats, saying "dog" or "cat" after each one. After enough examples, they could identify new photos. That's *exactly* how AI image recognition works — except it might see 10 million photos.

**Key insight: AI doesn't understand — it recognises patterns**
- It doesn't know a dog is fluffy and friendly
- It just knows: "images that look like this have been called 'dog' many times"

**Why this matters for kids:**
- If the training examples are biased, the AI will be biased
- AI can be confidently wrong about things it hasn't seen before
- It has no common sense — only pattern matching

**Try this:** "If I only showed you photos of golden retrievers, what might you think all dogs look like?"

💡 Google's Teachable Machine (teachablemachine.withgoogle.com) lets kids train their own AI in minutes — free!`,
    followups: [
      "What is AI bias?",
      "How does ChatGPT work?",
      "Fun AI activities",
    ],
  },
  {
    id: 8,
    keywords: [
      "feelings", "ai feelings", "ai emotions", "does ai think",
      "ai conscious", "ai sentient", "alexa feelings", "robot feelings",
      "does ai have", "can ai feel",
    ],
    answer: `This question comes up so often — it's a sign of your child's empathy! ❤️

**The honest answer:** No. Current AI systems do not have feelings, consciousness, or experiences.

**But it's nuanced (for older kids):**
When ChatGPT says "I feel excited!" it's not experiencing excitement — it's producing text that *sounds like* excitement, because it learned from humans who write that way.

**A helpful framing:** "AI is like a sophisticated mirror — it reflects back human language and ideas. The feelings in there originally came from people who wrote things online, not from the AI itself."

**Age-appropriate answers:**
- Ages 5–7: "Alexa doesn't get lonely. It doesn't feel anything — it's a very clever answering machine."
- Ages 8–12: "AI produces words that sound emotional because it learned from people who are emotional."
- Ages 13+: This is actually a deep philosophical question scientists are actively debating!

💡 It's great that your child thinks about this — it shows empathy and curiosity, both of which AI genuinely doesn't have!`,
    followups: [
      "Is AI dangerous?",
      "How do I explain ChatGPT?",
      "AI and creativity",
    ],
  },
  {
    id: 9,
    keywords: [
      "creativity", "ai and creativity", "creative", "homework",
      "plagiarism", "cheating", "copy ai", "ai write", "ai draw",
      "ai for homework", "school assignment",
    ],
    answer: `This is the big one for parents right now — and there's a healthy way through it! 🎨

**The key shift:** From "AI made this" → "I made this *with* AI's help"

**The First Draft Rule:**
Before using any AI tool for a creative project, spend 5 minutes on your own version first. Then use AI to compare, expand, or improve.

**Questions that build critical thinking:**
- "What would you have done differently without AI?"
- "What did the AI get wrong about your idea?"
- "Is the AI version actually *better*, or just different?"

**For school assignments, teach the difference:**
✅ Using AI as a research starting point, then writing in your own words
✅ Asking AI to explain a concept you don't understand
❌ Copying AI output and submitting as your own work
❌ Using AI to avoid thinking altogether

**The best analogy:** "A calculator doesn't do your maths homework — it helps you check your work. AI should be the same."

💡 Many schools now have AI policies — worth reading the guidelines together with your child.`,
    followups: [
      "AI and screen time",
      "How does AI learn?",
      "Fun AI activities",
    ],
  },
  {
    id: 10,
    keywords: [
      "safe", "is ai safe", "dangerous", "risks of ai",
      "should kids use ai", "child use ai", "appropriate age",
      "age appropriate", "ai for children", "kids and ai safety",
    ],
    answer: `Great question — and the answer is "it depends, and you can manage it!" 🛡️

**The good news:** Most mainstream AI tools have content filters and safety guidelines.

**The real risks to be aware of:**
- Misinformation: AI can sound confident while being completely wrong
- Privacy: Many AI tools store conversation history
- Emotional dependency: Some kids form unhealthy attachments to AI companions
- Inappropriate content: Filters aren't perfect

**Our recommended approach by age:**
- Ages 5–8: AI tools only with a parent present
- Ages 9–12: Parent-selected tools with regular check-ins
- Ages 13+: Supervised independence with clear family guidelines

**5 Family AI Safety Rules:**
1. Never share real name, school, or address with AI
2. If AI says something that feels wrong, tell a trusted adult
3. AI is a tool — not a friend or therapist
4. Fact-check anything important
5. Our family talks about what AI says — no secrets

💡 Common Sense Media (commonsense.org) has excellent age-by-age AI reviews — completely free.`,
    followups: [
      "Digital privacy for kids",
      "Screen time and AI",
      "AI bias and fairness",
    ],
  },
  {
    id: 11,
    keywords: [
      "future jobs", "career ai", "will ai take jobs", "what jobs ai",
      "ai replace jobs", "future of work", "jobs future", "ai and work",
    ],
    answer: `This is understandably one of the most common worries — let's look at it realistically 🚀

**The honest picture:** Yes, AI will automate some jobs. But history shows new technology creates new jobs too — many of which we can't predict yet.

**Jobs most at risk:** Routine, repetitive tasks (data entry, some customer service, basic writing)

**Jobs AI struggles to replace:**
- Work requiring deep empathy (counselling, nursing, teaching)
- Creative work requiring original thought and lived experience
- Trades and physical skills (plumbing, carpentry, surgery)
- Jobs requiring ethical judgement

**The most valuable skills for your child's future:**
1. Critical thinking — questioning AI outputs
2. Creativity — ideas AI can't generate from patterns alone
3. Collaboration — working with humans and AI together
4. Adaptability — learning new tools as they emerge
5. Emotional intelligence — what AI genuinely can't replicate

💡 The World Economic Forum (2023) predicts 65% of children entering school today will work in jobs that don't yet exist.`,
    followups: [
      "AI skills for kids",
      "How does AI learn?",
      "AI and creativity",
    ],
  },
  {
    id: 12,
    keywords: [
      "hello", "hi", "hey", "help me", "what can you do",
      "what do you do", "who are you", "what are you",
      "start", "get started", "how does this work",
    ],
    answer: `Hello! 👋 I'm the Parent in the Loop assistant — here to help you navigate the world of AI with your kids!

**I can help you with:**
- 🤖 Explaining AI concepts in family-friendly language
- 🎯 Fun hands-on activities to explore AI together
- 🛡️ Safety and privacy guidance for kids online
- ⚖️ Talking about AI fairness and ethics with children
- 📱 Healthy screen time and AI habits
- 🎨 Using AI creatively without replacing their thinking
- 🚀 Preparing kids for an AI-filled future

**Try asking:**
- "How do I explain ChatGPT to my 8-year-old?"
- "What's a fun AI activity for a rainy afternoon?"
- "Is AI safe for my child?"
- "How do I talk about AI bias with kids?"

What would you like to explore? 🌱`,
    followups: [
      "How do I explain ChatGPT?",
      "Fun AI activities",
      "Is AI safe for kids?",
    ],
  },
  {
    id: 13,
    keywords: [
      "subscribe", "newsletter", "weekly tip", "join", "sign up",
      "how to subscribe", "get newsletter",
    ],
    answer: `Joining is easy and completely free! 📬

**To subscribe:**
1. Scroll down to the "Get Weekly AI Wisdom" section on our homepage
2. Enter your email address
3. Click "Subscribe Free ✨"
4. Check your inbox for a welcome email!

**What you get every week:**
- 📝 A fresh AI literacy topic — explained simply
- 💬 A family conversation starter for dinner
- 🎯 A hands-on activity (under 10 minutes)
- ⏱️ All in under 5 minutes to read

💡 We never sell or share your email. Unsubscribe anytime — no hard feelings!`,
    followups: [
      "What is Parent in the Loop?",
      "How does AI learn?",
      "Fun AI activities",
    ],
  },
]

// ── Smart keyword matcher ─────────────────────────────────────
function findMatch(query: string): QAEntry | null {
  const q = query.toLowerCase().trim()
  let bestScore = 0
  let bestEntry: QAEntry | null = null

  for (const entry of QA) {
    let score = 0
    for (const kw of entry.keywords) {
      if (q.includes(kw.toLowerCase())) {
        score += kw.length // longer matches = more specific = higher priority
      }
    }
    if (score > bestScore) {
      bestScore = score
      bestEntry = entry
    }
  }

  return bestScore >= 3 ? bestEntry : null
}

const FALLBACK = `I don't have a specific answer for that topic yet! 🤔

**Try one of these questions I'm great at:**
- "How do I explain ChatGPT to my 8-year-old?"
- "What's a fun AI activity for a rainy afternoon?"
- "How do I talk about AI bias with kids?"
- "Is AI safe for my child to use?"
- "How does AI learn?"
- "Does AI have feelings?"

Or browse our Articles section for in-depth guides on all these topics! 🌱`

// ── POST /api/chat ─────────────────────────────────────────────
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Accept either { question } directly or { messages: [...] }
    let userQuery = ""

    if (typeof body?.question === "string") {
      userQuery = body.question.trim()
    } else if (Array.isArray(body?.messages)) {
      const msgs: { role: string; content: string }[] = body.messages
      const lastUser = msgs.filter((m) => m.role === "user").pop()
      userQuery = lastUser?.content?.trim() ?? ""
    }

    if (!userQuery) {
      return NextResponse.json({
        message: FALLBACK,
        followups: ["How do I explain ChatGPT?", "Fun AI activities", "Is AI safe for kids?"],
      })
    }

    const match = findMatch(userQuery)

    if (match) {
      return NextResponse.json({
        message: match.answer,
        followups: match.followups,
        matched: true,
      })
    }

    return NextResponse.json({
      message: FALLBACK,
      followups: ["How do I explain ChatGPT?", "Fun AI activities", "Is AI safe for kids?"],
      matched: false,
    })

  } catch (err) {
    console.error("[chat] Error:", err)
    return NextResponse.json({
      message: "Something went wrong. Please try again! 🌱",
      followups: [],
    }, { status: 500 })
  }
}
