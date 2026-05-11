"use client"

// components/AgeGroupFilter.tsx — age filter pills for articles section

const AGE_GROUPS = [
  { value: "all",   label: "All Ages",  emoji: "👨‍👩‍👧" },
  { value: "5-7",   label: "5–7 yrs",   emoji: "🌱" },
  { value: "8-10",  label: "8–10 yrs",  emoji: "🔍" },
  { value: "11-13", label: "11–13 yrs", emoji: "⚖️" },
  { value: "14-16", label: "14–16 yrs", emoji: "🛡️" },
  { value: "17+",   label: "17+",       emoji: "🚀" },
]

interface Props { selected: string; onChange: (val: string) => void; className?: string }

export default function AgeGroupFilter({ selected, onChange, className = "" }: Props) {
  return (
    <div className={`flex flex-wrap gap-2 items-center ${className}`} role="group" aria-label="Filter by child's age">
      <span className="text-xs font-bold tracking-wider uppercase mr-1"
        style={{ color: "#B79D84", fontFamily: "var(--font-nunito), Nunito, sans-serif" }}>
        Child's age:
      </span>
      {AGE_GROUPS.map(ag => {
        const active = selected === ag.value
        return (
          <button
            key={ag.value}
            onClick={() => onChange(ag.value)}
            title={ag.label}
            aria-pressed={active}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all hover:scale-105 active:scale-95 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#7C63B8]"
            style={{
              backgroundColor: active ? "#7C63B8" : "var(--card, #fff)",
              color:           active ? "#fff"    : "var(--muted-foreground, #888)",
              border:          `1.5px solid ${active ? "#7C63B8" : "#EDE8E1"}`,
              fontFamily: "var(--font-nunito), Nunito, sans-serif",
            }}
          >
            <span aria-hidden="true">{ag.emoji}</span>
            <span>{ag.label}</span>
          </button>
        )
      })}
    </div>
  )
}

export { AGE_GROUPS }
