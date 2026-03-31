"use client"

import { useState, useRef } from "react"
import { AI_QUIZ_QUESTIONS } from "@/lib/data"

type QuizState = "idle" | "playing" | "done"

export default function AIQuiz() {
  const [state, setState] = useState<QuizState>("idle")
  const [current, setCurrent] = useState(0)
  const [selected, setSelected] = useState<number | null>(null)
  const [score, setScore] = useState(0)
  const [answered, setAnswered] = useState<boolean[]>([])
  const [showExplanation, setShowExplanation] = useState(false)
  const sessionId = useRef(`quiz-${Date.now()}-${Math.random().toString(36).slice(2)}`)

  const q = AI_QUIZ_QUESTIONS[current]
  const total = AI_QUIZ_QUESTIONS.length

  const handleStart = () => {
    setState("playing")
    setCurrent(0)
    setSelected(null)
    setScore(0)
    setAnswered([])
    setShowExplanation(false)
    sessionId.current = `quiz-${Date.now()}-${Math.random().toString(36).slice(2)}`
  }

  const handleAnswer = (idx: number) => {
    if (selected !== null) return
    setSelected(idx)
    setShowExplanation(true)
    const correct = idx === q.correct
    if (correct) setScore((s) => s + 1)
    setAnswered((a) => [...a, correct])
  }

  const handleNext = (currentScore: number, currentAnswered: boolean[]) => {
    if (current + 1 >= total) {
      setState("done")
      // Save result to backend (best-effort, non-blocking)
      fetch("/api/quiz-result", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          score: currentScore,
          total,
          answers: currentAnswered,
          session_id: sessionId.current,
        }),
      }).catch(() => {}) // silent — quiz UX is unaffected by save failure
    } else {
      setCurrent((c) => c + 1)
      setSelected(null)
      setShowExplanation(false)
    }
  }

  const OPTION_LETTERS = ["A", "B", "C", "D"]

  const ScoreBadge = () => {
    const pct = (score / total) * 100
    if (pct === 100) return <span>🏆 Perfect score!</span>
    if (pct >= 80) return <span>⭐ AI Explorer!</span>
    if (pct >= 60) return <span>🧠 Getting there!</span>
    return <span>💡 Keep learning!</span>
  }

  return (
    <section
      className="py-16 px-4 sm:px-6 lg:px-8"
      style={{ backgroundColor: "#FAF6F0" }}
      aria-label="AI literacy quiz for families"
      id="quiz"
    >
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <p
            className="text-xs font-bold tracking-widest uppercase mb-2"
            style={{ color: "#B79D84", fontFamily: "var(--font-nunito), Nunito, sans-serif" }}
          >
            <span style={{ color: "#B9A6E3" }}>🧠</span> FAMILY ACTIVITY
          </p>
          <h2
            className="text-3xl font-bold mb-2"
            style={{ color: "#222222", fontFamily: "var(--font-quicksand), Quicksand, sans-serif" }}
          >
            AI Quiz — Test Your Knowledge!
          </h2>
          <p
            className="text-sm"
            style={{ color: "#B79D84", fontFamily: "var(--font-nunito), Nunito, sans-serif" }}
          >
            Play together with your kids · {total} questions · No wrong answers, just learning ✨
          </p>
        </div>

        {/* IDLE */}
        {state === "idle" && (
          <div
            className="rounded-3xl p-8 text-center"
            style={{
              background: "linear-gradient(135deg, #fff 0%, rgba(185,166,227,0.1) 100%)",
              border: "2px solid rgba(124,99,184,0.15)",
            }}
          >
            <div className="text-6xl mb-4 animate-float" aria-hidden="true">🤖</div>
            <h3
              className="text-xl font-bold mb-3"
              style={{ color: "#222222", fontFamily: "var(--font-quicksand), Quicksand, sans-serif" }}
            >
              How much do you know about AI?
            </h3>
            <p
              className="text-sm mb-6 max-w-sm mx-auto"
              style={{ color: "#6B6B6B", fontFamily: "var(--font-nunito), Nunito, sans-serif" }}
            >
              {total} quick questions covering AI basics, privacy, creativity, and ethics. Perfect for parents and kids to tackle together!
            </p>
            <button
              onClick={handleStart}
              className="px-8 py-3.5 rounded-xl font-bold text-white text-sm transition-all hover:scale-105 active:scale-95 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#7C63B8] shadow-md"
              style={{ backgroundColor: "#7C63B8", fontFamily: "var(--font-nunito), Nunito, sans-serif" }}
            >
              Start the Quiz ✨
            </button>
          </div>
        )}

        {/* PLAYING */}
        {state === "playing" && (
          <div
            className="rounded-3xl overflow-hidden"
            style={{ border: "2px solid rgba(124,99,184,0.15)" }}
          >
            {/* Progress bar */}
            <div style={{ backgroundColor: "#EDE8E1", height: "6px" }}>
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{
                  width: `${((current) / total) * 100}%`,
                  background: "linear-gradient(90deg, #7C63B8, #B9A6E3)",
                }}
                role="progressbar"
                aria-valuenow={current}
                aria-valuemin={0}
                aria-valuemax={total}
              />
            </div>

            <div className="p-8" style={{ backgroundColor: "#fff" }}>
              {/* Question header */}
              <div className="flex items-center justify-between mb-6">
                <span
                  className="text-xs font-bold px-3 py-1 rounded-full"
                  style={{
                    backgroundColor: "rgba(124,99,184,0.1)",
                    color: "#7C63B8",
                    fontFamily: "var(--font-nunito), Nunito, sans-serif",
                  }}
                >
                  Question {current + 1} of {total}
                </span>
                <span
                  className="text-xs font-bold"
                  style={{ color: "#B79D84", fontFamily: "var(--font-nunito), Nunito, sans-serif" }}
                >
                  Score: {score}/{current}
                </span>
              </div>

              {/* Question */}
              <div className="flex items-start gap-3 mb-7">
                <span className="text-3xl flex-shrink-0 mt-0.5" aria-hidden="true">{q.emoji}</span>
                <h3
                  className="text-xl font-bold leading-snug"
                  style={{ color: "#222222", fontFamily: "var(--font-quicksand), Quicksand, sans-serif" }}
                >
                  {q.question}
                </h3>
              </div>

              {/* Options */}
              <div className="space-y-3">
                {q.options.map((opt, idx) => {
                  const isSelected = selected === idx
                  const isCorrect = idx === q.correct
                  const isWrong = isSelected && !isCorrect
                  const showCorrect = selected !== null && isCorrect

                  let bg = "#FAF6F0"
                  let border = "#EDE8E1"
                  let color = "#3E3E3E"

                  if (showCorrect) { bg = "rgba(77,122,73,0.1)"; border = "#4d7a49"; color = "#2d5a2a" }
                  if (isWrong) { bg = "rgba(243,167,142,0.15)"; border = "#c97a5a"; color = "#c97a5a" }

                  return (
                    <button
                      key={idx}
                      onClick={() => handleAnswer(idx)}
                      disabled={selected !== null}
                      className="w-full text-left flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#7C63B8]"
                      style={{
                        backgroundColor: bg,
                        border: `2px solid ${border}`,
                        cursor: selected !== null ? "default" : "pointer",
                        transform: selected === null ? undefined : "none",
                        fontFamily: "var(--font-nunito), Nunito, sans-serif",
                      }}
                      onMouseEnter={(e) => {
                        if (selected === null) {
                          (e.currentTarget as HTMLButtonElement).style.borderColor = "#7C63B8"
                          ;(e.currentTarget as HTMLButtonElement).style.backgroundColor = "rgba(124,99,184,0.06)"
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (selected === null) {
                          (e.currentTarget as HTMLButtonElement).style.borderColor = "#EDE8E1"
                          ;(e.currentTarget as HTMLButtonElement).style.backgroundColor = "#FAF6F0"
                        }
                      }}
                      aria-pressed={isSelected}
                    >
                      <span
                        className="w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold flex-shrink-0"
                        style={{
                          backgroundColor: showCorrect ? "#4d7a49" : isWrong ? "#c97a5a" : "#7C63B8",
                          color: "#fff",
                        }}
                      >
                        {showCorrect ? "✓" : isWrong ? "✗" : OPTION_LETTERS[idx]}
                      </span>
                      <span className="text-sm font-semibold" style={{ color }}>{opt}</span>
                    </button>
                  )
                })}
              </div>

              {/* Explanation */}
              {showExplanation && (
                <div
                  className="mt-5 p-4 rounded-xl"
                  style={{ backgroundColor: "rgba(185,166,227,0.12)", border: "1px solid rgba(124,99,184,0.2)" }}
                  role="alert"
                >
                  <p
                    className="text-sm leading-relaxed"
                    style={{ color: "#3E3E3E", fontFamily: "var(--font-nunito), Nunito, sans-serif" }}
                  >
                    <span className="font-bold" style={{ color: "#7C63B8" }}>💡 </span>
                    {q.explanation}
                  </p>
                </div>
              )}

              {/* Next button */}
              {selected !== null && (
                <div className="mt-6 flex justify-end">
                  <button
                    onClick={() => handleNext(score, answered)}
                    className="px-6 py-2.5 rounded-xl font-bold text-sm text-white transition-all hover:scale-105 active:scale-95 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#7C63B8]"
                    style={{ backgroundColor: "#7C63B8", fontFamily: "var(--font-nunito), Nunito, sans-serif" }}
                  >
                    {current + 1 >= total ? "See Results 🏆" : "Next Question →"}
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* DONE */}
        {state === "done" && (
          <div
            className="rounded-3xl p-8 text-center"
            style={{
              background: "linear-gradient(135deg, #fff 0%, rgba(185,166,227,0.12) 100%)",
              border: "2px solid rgba(124,99,184,0.2)",
            }}
          >
            <div className="text-5xl mb-4" aria-hidden="true">
              {score === total ? "🏆" : score >= total * 0.8 ? "⭐" : score >= total * 0.6 ? "🧠" : "💡"}
            </div>
            <h3
              className="text-2xl font-bold mb-1"
              style={{ color: "#222222", fontFamily: "var(--font-quicksand), Quicksand, sans-serif" }}
            >
              <ScoreBadge />
            </h3>
            <p
              className="text-4xl font-bold mt-3 mb-1"
              style={{ color: "#7C63B8", fontFamily: "var(--font-quicksand), Quicksand, sans-serif" }}
            >
              {score} / {total}
            </p>
            <p
              className="text-sm mb-2"
              style={{ color: "#B79D84", fontFamily: "var(--font-nunito), Nunito, sans-serif" }}
            >
              {score === total
                ? "You got every single one! AI literacy champion! 🎉"
                : `You got ${score} out of ${total} questions right. Keep exploring!`}
            </p>

            {/* Per-question results */}
            <div className="flex justify-center gap-2 my-5">
              {answered.map((correct, i) => (
                <span
                  key={i}
                  className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold"
                  style={{
                    backgroundColor: correct ? "rgba(77,122,73,0.15)" : "rgba(201,122,90,0.15)",
                    color: correct ? "#4d7a49" : "#c97a5a",
                  }}
                  aria-label={`Question ${i + 1}: ${correct ? "correct" : "incorrect"}`}
                >
                  {correct ? "✓" : "✗"}
                </span>
              ))}
            </div>

            <div className="flex flex-col sm:flex-row gap-3 justify-center mt-4">
              <button
                onClick={handleStart}
                className="px-6 py-3 rounded-xl font-bold text-sm text-white transition-all hover:scale-105 active:scale-95 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#7C63B8]"
                style={{ backgroundColor: "#7C63B8", fontFamily: "var(--font-nunito), Nunito, sans-serif" }}
              >
                Play Again ↺
              </button>
              <button
                onClick={() => document.getElementById("articles")?.scrollIntoView({ behavior: "smooth" })}
                className="px-6 py-3 rounded-xl font-bold text-sm border-2 transition-all hover:scale-105 active:scale-95"
                style={{ borderColor: "#F3A78E", color: "#F3A78E", backgroundColor: "transparent", fontFamily: "var(--font-nunito), Nunito, sans-serif" }}
              >
                Read More Articles →
              </button>
            </div>
          </div>
        )}
      </div>
    </section>
  )
}
