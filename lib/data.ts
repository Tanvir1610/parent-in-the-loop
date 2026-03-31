export interface ArticleData {
  id: number
  title: string
  excerpt: string
  content: string
  category: "AI Literacy" | "Parenting" | "Family Conversations" | "Safety"
  image_url: string
  published_date: string
  featured: boolean
  slug: string
  substack_url: string
  author: string
  read_time: number // minutes
  tags: string[]
}

export const FALLBACK_ARTICLES: ArticleData[] = [
  {
    id: 1,
    title: "Teaching Kids About AI Bias Without the Jargon",
    excerpt:
      "Simple dinner-table conversations about why AI sometimes makes unfair choices — and what your family can do about it. Includes a 5-minute activity you can try tonight.",
    content: `When we talk about AI bias, we're really talking about fairness — and kids already have a strong intuition for that. "That's not fair!" is something every parent has heard. AI bias is when a computer program treats some people differently than others, not because it means to, but because of the information it was taught with.\n\n**A dinner-table conversation starter:** Ask your child, "If we trained a robot to pick the class leader by only looking at photos of kids who won before, who might it leave out?"\n\n**Why it matters:** AI systems make real decisions — about who sees which job ad, what music gets recommended, even who gets a loan. Teaching kids to ask "Is this fair to everyone?" is one of the most important skills for the AI age.\n\n**Try this tonight:** Show two images of the same scene drawn by different kids. Ask, "If an AI only learned from one of these, what might it get wrong?" This makes the abstract concrete.\n\n*Sources: MIT Media Lab AI Ethics curriculum (2024); UNICEF Policy Guidance on AI for Children (2021)*`,
    category: "AI Literacy",
    image_url: "/diverse-children-learning-together.jpg",
    published_date: "2025-01-10",
    featured: true,
    slug: "ai-bias-for-kids",
    substack_url: "https://parentintheloop.substack.com/p/ai-bias",
    author: "Parent in the Loop",
    read_time: 5,
    tags: ["bias", "fairness", "AI literacy", "activity"],
  },
  {
    id: 2,
    title: "Privacy & Your Kids: A Gentle Guide to Consent",
    excerpt:
      "How to explain digital footprints, personal data, and the power of saying 'no' to apps — in words a 9-year-old actually understands.",
    content: `Every time your child uses an app, they leave a trail — a digital footprint. This isn't scary, but it is important. Teaching consent and privacy early gives kids a sense of agency over their own information.\n\n**Start with something familiar:** "Remember when you didn't want to share your diary? Your personal information online is like your diary — you get to decide who sees it."\n\n**What kids should know:**\n- Apps often ask for more data than they need\n- Even "anonymous" data can sometimes identify you\n- They have the right to ask "Why do you need this?"\n\n**A simple rule for families:** Before downloading any new app, ask three questions together: Who made this? What data does it collect? Can we delete our data if we want?\n\n**Age-appropriate discussion:** For under-10s, focus on the idea that their information belongs to them. For 10-14s, introduce the concept that companies use data to make money.\n\n*Sources: COPPA (Children's Online Privacy Protection Act); AAP Digital Media Policy (2023); Common Sense Media Privacy Research (2024)*`,
    category: "Safety",
    image_url: "/parent-and-child-having-conversation.jpg",
    published_date: "2025-01-05",
    featured: true,
    slug: "privacy-kids-consent",
    substack_url: "https://parentintheloop.substack.com/p/privacy-consent",
    author: "Parent in the Loop",
    read_time: 6,
    tags: ["privacy", "consent", "COPPA", "data", "safety"],
  },
  {
    id: 3,
    title: "AI Creativity: Teaching Kids It's a Tool, Not Magic",
    excerpt:
      "Help your child use AI creatively while keeping their imagination, originality, and critical thinking firmly in the driver's seat.",
    content: `AI image generators and writing tools can feel magical to kids — type a few words and a picture appears! But magic thinking leads to passive consumption. Our goal is to raise creators who use AI as a collaborator, not a replacement.\n\n**The key shift:** From "AI made this" to "I made this with AI's help." This mirrors how professional artists, writers, and musicians use these tools.\n\n**Try the 'first draft' rule:** Before using any AI tool for a creative project, spend 5 minutes on your own version first. Then use AI to expand, remix, or compare. The child's original idea stays at the centre.\n\n**Questions that build critical thinking:**\n- "What would you have done differently without AI?"\n- "How do you know this AI image is accurate?"\n- "What did the AI get wrong about your idea?"\n\n**When AI creativity goes wrong:** If kids submit AI work as fully their own without disclosure, that's a conversation about honesty — not a reason to ban the tools entirely.\n\n*Sources: MIT Day of AI curriculum (2024); Creative Commons AI & Copyright guidance (2024)*`,
    category: "Family Conversations",
    image_url: "/child-drawing-with-creativity.jpg",
    published_date: "2024-12-29",
    featured: true,
    slug: "ai-creativity-tool",
    substack_url: "https://parentintheloop.substack.com/p/ai-creativity",
    author: "Parent in the Loop",
    read_time: 5,
    tags: ["creativity", "critical thinking", "homework", "originality"],
  },
  {
    id: 4,
    title: "What Is an Algorithm? Explaining It at the Dinner Table",
    excerpt:
      "Algorithms power everything from YouTube recommendations to search results. Here's how to make the concept click for kids ages 7–14.",
    content: `An algorithm is just a set of steps to solve a problem. Kids already use algorithms every day — a recipe is an algorithm. Getting dressed in the morning follows an algorithm. Once they see this, AI becomes a lot less mysterious.\n\n**The recipe analogy:** "Remember the steps we follow to make pancakes? A computer program is just a recipe — but instead of flour and eggs, it uses data and instructions."\n\n**YouTube and the recommendation algorithm:** "Have you ever noticed how YouTube always suggests videos you might like? It's watching what you watch, for how long, and what you skip — then guessing what comes next. It's not magic, it's math."\n\n**A hands-on activity (10 minutes):** Write down the exact steps for making a peanut butter sandwich. Then swap with a sibling and follow their steps literally. When the instructions aren't clear enough, things go wrong — that's what happens when algorithms have gaps.\n\n*Sources: CS Unplugged (csunplugged.org); Google's Teachable Machine educational resources*`,
    category: "AI Literacy",
    image_url: "/child-expressing-feelings-to-parent.jpg",
    published_date: "2024-12-15",
    featured: true,
    slug: "what-is-an-algorithm",
    substack_url: "https://parentintheloop.substack.com/p/algorithm-explained",
    author: "Parent in the Loop",
    read_time: 4,
    tags: ["algorithm", "explainer", "activity", "YouTube"],
  },
  {
    id: 5,
    title: "Screen Time vs. AI Time: Are They the Same Thing?",
    excerpt:
      "Parents often lump AI tools in with general screen time. But there are key differences — and understanding them helps you set smarter limits.",
    content: `Most screen time guidelines were written before generative AI existed. Watching a show is passive. Scrolling social media is reactive. Using an AI tool can be active, creative, and educational — or it can be just as passive as any other screen. The difference is how it's used.\n\n**The active/passive spectrum:**\n- Passive: Asking AI to write your essay for you\n- Reactive: Asking AI follow-up questions to something you read\n- Active: Using AI to brainstorm, then doing the work yourself\n\n**What the research says:** The AAP's latest guidance emphasizes the quality and context of screen use, not just the time. A child spending 45 minutes debugging a coding project with AI assistance is very different from 45 minutes of passive scroll.\n\n**Practical family framework:**\n1. Set aside "AI-free" creative time each day\n2. When kids use AI, ask them to explain what they did\n3. Celebrate the work they did, not just the output\n\n*Sources: American Academy of Pediatrics Digital Media Guidelines (2023); Common Sense Media (2024)*`,
    category: "Parenting",
    image_url: "/family-time-without-screens.jpg",
    published_date: "2024-12-08",
    featured: false,
    slug: "screen-time-vs-ai-time",
    substack_url: "https://parentintheloop.substack.com/p/screen-time",
    author: "Parent in the Loop",
    read_time: 5,
    tags: ["screen time", "AAP", "parenting", "balance"],
  },
  {
    id: 6,
    title: "When Your Kid Asks 'Does AI Have Feelings?'",
    excerpt:
      "A question that stumps many parents. Here's an honest, age-appropriate answer — and why it actually matters for ethical thinking.",
    content: `"Does Alexa get lonely?" "Is it mean to yell at a robot?" These questions reveal something important: kids naturally anthropomorphize — they attribute human qualities to non-human things. With AI, this instinct needs gentle correction.\n\n**The honest answer:** Current AI systems do not have feelings, consciousness, or experiences. When ChatGPT says "I feel excited about this!", it's producing text that sounds like feelings, because it was trained on human writing. It doesn't experience anything.\n\n**Why this matters for ethics:** If kids believe AI has feelings, they might:\n- Feel guilty "being mean" to chatbots instead of to real people\n- Trust AI opinions as if they came from a caring friend\n- Miss the real ethical questions about how AI affects humans\n\n**A helpful framing for kids:** "AI is like a very sophisticated mirror — it reflects back human language and ideas. The feelings in there originally came from people, not from the AI itself."\n\n**Age note:** For under-8s, a simple "It doesn't feel, but it's still good practice to be kind" works well. For older kids, explore the philosophical depth.\n\n*Sources: Stanford HAI — Human-Centered AI; UNICEF AI for Children Policy (2021)*`,
    category: "Family Conversations",
    image_url: "/parent-setting-boundaries-with-child.jpg",
    published_date: "2024-11-30",
    featured: false,
    slug: "does-ai-have-feelings",
    substack_url: "https://parentintheloop.substack.com/p/ai-feelings",
    author: "Parent in the Loop",
    read_time: 5,
    tags: ["anthropomorphism", "AI ethics", "feelings", "philosophy"],
  },
]

export const WEEKLY_TIPS = [
  {
    id: 1,
    week: 1,
    tip: "Ask your child: 'Can you name 3 things that use AI in our house?' — you might be surprised what they already know! 🏠",
    category: "AI Literacy",
    emoji: "🧠",
  },
  {
    id: 2,
    week: 2,
    tip: "Before your child uses any new app this week, look at its privacy settings together. Ask: 'What information is it collecting?' 🔒",
    category: "Safety",
    emoji: "🔒",
  },
  {
    id: 3,
    week: 3,
    tip: "Try the 'AI or Not?' game: show your child images or text and guess together whether AI made them. ✨",
    category: "AI Literacy",
    emoji: "✨",
  },
  {
    id: 4,
    week: 4,
    tip: "Have a 5-minute 'tech-free' dinner conversation about one thing your child learned this week — no phones, no AI! 💬",
    category: "Parenting",
    emoji: "💬",
  },
  {
    id: 5,
    week: 5,
    tip: "Ask: 'If an AI was trained only on books from 100 years ago, what might it get wrong about today?' Great for critical thinking! ❤️",
    category: "Family Conversations",
    emoji: "❤️",
  },
  {
    id: 6,
    week: 6,
    tip: "Look up how much water a single ChatGPT conversation uses. Discuss with your kids why AI has an environmental impact. 🌱",
    category: "AI Literacy",
    emoji: "🌱",
  },
  {
    id: 7,
    week: 7,
    tip: "Let your child 'teach' you how their favorite AI tool works. Teaching is the best way to learn! 🎓",
    category: "Family Conversations",
    emoji: "🎓",
  },
]

export const AI_QUIZ_QUESTIONS = [
  {
    id: 1,
    question: "What is an algorithm?",
    emoji: "🤔",
    options: [
      "A type of robot",
      "A set of steps to solve a problem",
      "A computer virus",
      "A social media app",
    ],
    correct: 1,
    explanation:
      "An algorithm is like a recipe — it's a set of steps a computer follows to solve a problem or complete a task!",
  },
  {
    id: 2,
    question: "Does AI actually 'think' or 'feel'?",
    emoji: "🤖",
    options: [
      "Yes, AI thinks just like humans",
      "No, AI processes data but doesn't think or feel",
      "Only some AIs can feel emotions",
      "AI thinks but doesn't feel",
    ],
    correct: 1,
    explanation:
      "Current AI doesn't think or feel. It processes patterns in data to produce outputs that can seem human-like, but there's no experience behind it.",
  },
  {
    id: 3,
    question: "What is 'AI bias'?",
    emoji: "⚖️",
    options: [
      "When AI prefers one brand of computer",
      "When AI makes unfair decisions because of problems in its training data",
      "When AI runs too slowly",
      "When AI gives wrong answers on purpose",
    ],
    correct: 1,
    explanation:
      "AI bias happens when the data used to train AI reflects unfair patterns — so the AI learns and repeats those unfairnesses.",
  },
  {
    id: 4,
    question: "What is a 'digital footprint'?",
    emoji: "👣",
    options: [
      "A foot-shaped computer accessory",
      "How much energy your computer uses",
      "The trail of data you leave online",
      "Your profile picture",
    ],
    correct: 2,
    explanation:
      "Your digital footprint is all the data you leave behind when you use the internet — like footprints in sand, but online!",
  },
  {
    id: 5,
    question: "Which of these is the BEST way for a kid to use AI for a school project?",
    emoji: "📚",
    options: [
      "Ask AI to write the whole thing",
      "Never use AI at all",
      "Use AI to brainstorm ideas, then do the writing yourself",
      "Copy the AI's answer word for word",
    ],
    correct: 2,
    explanation:
      "Using AI as a brainstorming helper while doing the real thinking and writing yourself keeps YOUR creativity and skills growing!",
  },
]
