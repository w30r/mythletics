import { dbConnect } from "./db"
import { WorkoutSession } from "./models"

export type Stats = {
  totalSessions: number
  totalTime: number
  totalReps: number
  streak: number
  thisWeekSessions: number
  thisWeekTime: number
  daily: { date: string; time: number; sessions: number }[]
  prs: {
    exerciseName: string
    maxReps?: number
    maxWeight?: number
    maxDuration?: number
    totalCount: number
  }[]
}

export async function computeStats(userId: string): Promise<Stats> {
  await dbConnect()
  const sessions = await WorkoutSession.find({ userId, completed: true }).select("date duration details").lean()

  const totalSessions = sessions.length
  const totalTime = sessions.reduce((a, s) => a + (s.duration ?? 0), 0)

  let totalReps = 0
  const exerciseStats = new Map<string, { reps: number; weight: number; duration: number; count: number }>()
  for (const s of sessions) {
    for (const d of s.details ?? []) {
      if (!d.completed) continue
      const key = d.exerciseName || d.exerciseId || "Unknown"
      const stat = exerciseStats.get(key) ?? { reps: 0, weight: 0, duration: 0, count: 0 }
      stat.reps += d.reps ?? 0
      stat.duration += d.duration ?? 0
      if (d.weight) stat.weight = Math.max(stat.weight, d.weight)
      stat.count += 1
      exerciseStats.set(key, stat)
    }
  }
  totalReps = [...exerciseStats.values()].reduce((a, s) => a + s.reps, 0)

  const prs = [...exerciseStats.entries()]
    .filter(([, s]) => s.reps > 0 || s.duration > 0 || s.weight > 0)
    .map(([name, s]) => ({
      exerciseName: name,
      maxReps: s.reps > 0 ? s.reps : undefined,
      maxWeight: s.weight > 0 ? s.weight : undefined,
      maxDuration: s.duration > 0 ? s.duration : undefined,
      totalCount: s.count,
    }))
    .sort((a, b) => (b.maxReps ?? 0) - (a.maxReps ?? 0))
    .slice(0, 15)

  const streak = computeStreak(sessions.map((s) => s.date))

  const now = new Date()
  const weekStart = new Date(now)
  weekStart.setDate(now.getDate() - ((now.getDay() + 6) % 7))
  weekStart.setHours(0, 0, 0, 0)

  let thisWeekSessions = 0
  let thisWeekTime = 0
  const daily: { date: string; time: number; sessions: number }[] = []
  for (let i = 13; i >= 0; i--) {
    const d = new Date(now)
    d.setDate(now.getDate() - i)
    d.setHours(0, 0, 0, 0)
    daily.push({ date: d.toISOString().slice(0, 10), time: 0, sessions: 0 })
  }
  const dailyMap = new Map(daily.map((d) => [d.date, d]))
  for (const s of sessions) {
    const dateStr = new Date(s.date).toISOString().slice(0, 10)
    const entry = dailyMap.get(dateStr)
    if (entry) {
      entry.time += s.duration ?? 0
      entry.sessions += 1
    }
    if (s.date >= weekStart) {
      thisWeekSessions += 1
      thisWeekTime += s.duration ?? 0
    }
  }

  return { totalSessions, totalTime, totalReps, streak, thisWeekSessions, thisWeekTime, daily, prs }
}

function computeStreak(dates: Date[]): number {
  if (dates.length === 0) return 0
  const daySet = new Set<number>()
  for (const d of dates) {
    daySet.add(new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime())
  }
  let streak = 0
  const cursor = new Date()
  cursor.setHours(0, 0, 0, 0)
  if (!daySet.has(cursor.getTime())) {
    cursor.setDate(cursor.getDate() - 1)
  }
  while (daySet.has(cursor.getTime())) {
    streak += 1
    cursor.setDate(cursor.getDate() - 1)
  }
  return streak
}

export function formatMinutes(seconds: number): string {
  const mins = Math.round(seconds / 60)
  if (mins < 60) return `${mins}m`
  return `${Math.floor(mins / 60)}h ${mins % 60}m`
}
