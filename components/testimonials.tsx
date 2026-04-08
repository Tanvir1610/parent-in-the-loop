export default function Testimonials() {
  // AI literacy-focused testimonials matching mission & brand voice (non-judgmental, evidence-led, real-life)
  const testimonials = [
    {
      id: 1,
      text: "My 9-year-old now explains AI to her grandparents at dinner. Parent in the Loop gave us the vocabulary and the confidence to have those conversations.",
      author: "Priya S.",
      role: "Parent of two, Grade 3 & 6",
      emoji: "💬",
    },
    {
      id: 2,
      text: "The activities are genuinely fun. We did the 'is it AI or not?' game on a Saturday morning and it sparked a 45-minute conversation about fairness. Worth every minute.",
      author: "Marcus T.",
      role: "Father of three",
      emoji: "✨",
    },
    {
      id: 3,
      text: "I was nervous about talking to my kids about AI. These articles made it feel approachable — no scary predictions, just honest, practical guidance for real families.",
      author: "Anika R.",
      role: "Single parent, middle-schooler",
      emoji: "❤️",
    },
  ]

  return (
    <section
      className="py-20 px-4 sm:px-6 lg:px-8"
      style={{ backgroundColor: "#fff" }}
      aria-label="Parent testimonials"
    >
      <div className="max-w-5xl mx-auto">
        <div className="mb-14 text-center reveal">
          <p
            className="text-xs font-bold tracking-widest uppercase mb-3"
            style={{ color: "#B79D84", fontFamily: "var(--font-nunito), Nunito, sans-serif" }}
          >
            From Our Community
          </p>
          <h2
            className="text-4xl font-bold"
            style={{ color: "#222222", fontFamily: "var(--font-quicksand), Quicksand, sans-serif" }}
          >
            What Parents Say
          </h2>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {testimonials.map((testimonial) => (
            <blockquote
              key={testimonial.id}
              className="rounded-2xl p-6 flex flex-col gap-4 transition-shadow hover:shadow-md"
              style={{ backgroundColor: "#FAF6F0", border: "1.5px solid #F3A78E22" }}
            >
              {/* Emoji icon per brand guide */}
              <span className="text-2xl" aria-hidden="true">{testimonial.emoji}</span>

              <p
                className="leading-relaxed flex-1"
                style={{
                  color: "#3E3E3E",
                  fontFamily: "var(--font-nunito), Nunito, sans-serif",
                  fontStyle: "italic",
                  fontWeight: 400,
                }}
              >
                "{testimonial.text}"
              </p>
              <footer className="space-y-0.5">
                <p
                  className="font-bold"
                  style={{ color: "#7C63B8", fontFamily: "var(--font-quicksand), Quicksand, sans-serif" }}
                >
                  {testimonial.author}
                </p>
                <p
                  className="text-sm"
                  style={{ color: "#B79D84", fontFamily: "var(--font-nunito), Nunito, sans-serif" }}
                >
                  {testimonial.role}
                </p>
              </footer>
            </blockquote>
          ))}
        </div>
      </div>
    </section>
  )
}
