"use client"
import { useTheme } from "next-themes"
import { useEffect, useState } from "react"

export default function DarkModeToggle({ className = "" }: { className?: string }) {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  // Avoid hydration mismatch
  useEffect(() => setMounted(true), [])
  if (!mounted) return <div className="w-9 h-9" />

  const isDark = theme === "dark"

  return (
    <button
      onClick={() => setTheme(isDark ? "light" : "dark")}
      className={`w-9 h-9 flex items-center justify-center rounded-xl transition-all duration-200 hover:scale-110 active:scale-95 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#7C63B8] ${className}`}
      style={{
        backgroundColor: isDark ? "rgba(185,166,227,0.2)" : "rgba(124,99,184,0.08)",
        border: "1.5px solid rgba(124,99,184,0.2)",
      }}
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
      title={isDark ? "Light mode" : "Dark mode"}
    >
      <span className="text-base" aria-hidden="true">
        {isDark ? "☀️" : "🌙"}
      </span>
    </button>
  )
}
