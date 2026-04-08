"use client"
import { useEffect } from "react"

export default function ScrollRevealProvider() {
  useEffect(() => {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add("visible")
            io.unobserve(e.target)
          }
        })
      },
      { threshold: 0.1, rootMargin: "0px 0px -40px 0px" }
    )

    const observe = () => {
      document
        .querySelectorAll(".reveal, .reveal-left, .reveal-right, .reveal-scale")
        .forEach((el) => {
          if (!el.classList.contains("visible")) io.observe(el)
        })
    }

    observe()

    // Re-observe after dynamic content renders (route changes, etc.)
    const mo = new MutationObserver(observe)
    mo.observe(document.body, { childList: true, subtree: true })

    return () => { io.disconnect(); mo.disconnect() }
  }, [])

  return null
}
