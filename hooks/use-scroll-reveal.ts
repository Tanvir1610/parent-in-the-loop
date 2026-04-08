"use client"
import { useEffect, useRef } from "react"

/**
 * Attaches an IntersectionObserver to elements with .reveal / .reveal-left /
 * .reveal-right / .reveal-scale inside the given container ref.
 * When each element enters the viewport it gets the .visible class.
 */
export function useScrollReveal(rootRef?: React.RefObject<HTMLElement | null>) {
  useEffect(() => {
    const root = rootRef?.current ?? document

    const targets = (root === document ? document : rootRef!.current!).querySelectorAll
      ? (root as Document | HTMLElement).querySelectorAll(
          ".reveal, .reveal-left, .reveal-right, .reveal-scale"
        )
      : []

    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("visible")
            io.unobserve(entry.target) // fire once
          }
        })
      },
      { threshold: 0.12 }
    )

    targets.forEach((el) => io.observe(el))
    return () => io.disconnect()
  }, [rootRef])
}

/**
 * Animates a number from 0 → target over `duration` ms.
 * Returns current display value.
 */
export function useCountUp(
  target: number,
  duration = 1800,
  active = true,
  suffix = ""
): string {
  const ref = useRef<number>(0)
  const frameRef = useRef<number>(0)
  const displayRef = useRef<HTMLSpanElement | null>(null)

  useEffect(() => {
    if (!active) return
    const start = performance.now()

    const tick = (now: number) => {
      const elapsed = now - start
      const progress = Math.min(elapsed / duration, 1)
      // easeOutExpo
      const eased = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress)
      ref.current = Math.round(eased * target)
      if (displayRef.current) {
        displayRef.current.textContent =
          ref.current.toLocaleString() + suffix
      }
      if (progress < 1) frameRef.current = requestAnimationFrame(tick)
    }

    frameRef.current = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(frameRef.current)
  }, [target, duration, active, suffix])

  return displayRef as unknown as string
}
