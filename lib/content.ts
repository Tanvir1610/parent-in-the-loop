export interface Article {
  id: number
  title: string
  excerpt: string
  category: "AI Literacy" | "Parenting" | "Family Conversations" | "Safety"
  date: string
  slug: string
  image: string
}

// Sample articles aligned with Parent in the Loop mission:
// AI literacy, ethical awareness, family conversations, privacy & safety
export const featuredArticles: Article[] = [
  {
    id: 1,
    title: "Teaching Kids About AI Bias Without the Jargon",
    excerpt:
      "Simple dinner-table conversations about why AI sometimes makes unfair choices — and what your family can do about it.",
    category: "AI Literacy",
    date: "Jan 10, 2025",
    slug: "ai-bias-for-kids",
    image: "/diverse-children-learning-together.jpg",
  },
  {
    id: 2,
    title: "Privacy & Your Kids: A Gentle Guide to Consent",
    excerpt:
      "How to explain digital footprints, personal data, and the power of saying 'no' to apps — in words a 9-year-old understands.",
    category: "Safety",
    date: "Jan 5, 2025",
    slug: "privacy-kids-consent",
    image: "/parent-and-child-having-conversation.jpg",
  },
  {
    id: 3,
    title: "AI Creativity: Teaching Kids It's a Tool, Not Magic",
    excerpt:
      "Help your child use AI creatively while keeping their imagination, originality, and critical thinking firmly in the driver's seat.",
    category: "Family Conversations",
    date: "Dec 29, 2024",
    slug: "ai-creativity-tool",
    image: "/child-drawing-with-creativity.jpg",
  },
]

// Category badge colors using brand palette:
// Plum Reflection, Coral Peach, Sage Gray-Green, Sky Mist Blue
export const categoryColors: Record<Article["category"], string> = {
  "AI Literacy": "text-[#7C63B8] bg-[#7C63B8]/10",
  Parenting: "text-[#F3A78E] bg-[#F3A78E]/15",
  "Family Conversations": "text-[#5a8a56] bg-[#A6B6A1]/20",
  Safety: "text-[#4a7a96] bg-[#BFD6E1]/30",
}
