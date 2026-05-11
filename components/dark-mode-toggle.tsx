"use client"
import { useTheme } from "next-themes"
import { useEffect, useState } from "react"

export default function DarkModeToggle({ className = "" }: { className?: string }) {
  const { theme, setTheme, resolvedTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => setMounted(true), [])
  // Avoid hydration mismatch — render empty placeholder until mounted
  if (!mounted) return <div className="w-9 h-9" aria-hidden="true" />

  const isDark = resolvedTheme === "dark"

  return (
    <button
      onClick={() => setTheme(isDark ? "light" : "dark")}
      className={`relative w-14 h-8 rounded-full transition-all duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#7C63B8] focus-visible:ring-offset-2 ${className}`}
      style={{
        backgroundColor: isDark ? "#7C63B8" : "#E5DFD8",
        border: "1.5px solid rgba(124,99,184,0.25)",
      }}
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
      title={isDark ? "Light mode" : "Dark mode"}
    >
      {/* Track text */}
      <span className="absolute inset-0 flex items-center justify-between px-1.5 text-[9px] font-bold select-none pointer-events-none"
        aria-hidden="true">
        <span style={{ color: isDark ? "rgba(255,255,255,0.7)" : "transparent", transition: "color 0.2s" }}>🌙</span>
        <span style={{ color: isDark ? "transparent" : "#B79D84", transition: "color 0.2s" }}>☀️</span>
      </span>
      {/* Thumb */}
      <span
        className="absolute top-0.5 left-0.5 w-6 h-6 rounded-full shadow-sm flex items-center justify-center transition-transform duration-300"
        style={{
          backgroundColor: "#fff",
          transform: isDark ? "translateX(24px)" : "translateX(0px)",
          fontSize: 13,
        }}
        aria-hidden="true"
      >
        {isDark ? "🌙" : "☀️"}
      </span>
    </button>
  )
}
