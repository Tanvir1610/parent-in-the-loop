import { NextResponse } from "next/server"
import { WEEKLY_TIPS } from "@/lib/data"

export async function GET() {
  // Rotate tips based on ISO week number so it changes weekly
  const now = new Date()
  const startOfYear = new Date(now.getFullYear(), 0, 1)
  const weekNumber = Math.floor(
    ((now.getTime() - startOfYear.getTime()) / 86400000 + startOfYear.getDay() + 1) / 7
  )
  const tip = WEEKLY_TIPS[weekNumber % WEEKLY_TIPS.length]
  return NextResponse.json({ tip, week: weekNumber })
}
