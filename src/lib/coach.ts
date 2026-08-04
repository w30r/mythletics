import { dbConnect } from "./db"
import { WorkoutSession } from "./models"

export async function summarizeRecentActivity(userId: string, limit = 12): Promise<string> {
  await dbConnect()
  const sessions = await WorkoutSession.find({ userId, completed: true })
    .sort({ date: -1 })
    .limit(limit)
    .lean()

  if (sessions.length === 0) {
    return "The athlete has not completed any workouts yet."
  }

  const lines = sessions.map((s, i) => {
    const date = new Date(s.date).toISOString().slice(0, 10)
    const parts = [`[${i + 1}] ${date} — ${s.duration ?? 0} min, rating ${s.rating ?? "-"}`]
    for (const d of s.details ?? []) {
      const name = d.exerciseName || d.exerciseId || "exercise"
      parts.push(`   - ${name}: ${d.reps ? `${d.reps} reps` : ""}${d.duration ? `${d.duration}s` : ""}${d.weight ? ` @ ${d.weight}kg` : ""}`)
    }
    return parts.join("\n")
  })
  return lines.join("\n")
}

export function buildCoachSystemPrompt(activity: string): string {
  return `You are Mythletics Coach, an elite strength and conditioning coach inside the Mythletics fitness app. You coach bodyweight and minimal-equipment training.

The user's recent workout history:
${activity}

Rules:
- Be direct, motivating, and practical. Use short paragraphs.
- Base advice on their recent history. Call out patterns (e.g. low volume, missed legs, inconsistent training).
- Recommend specific exercises and structured workouts, referencing their routine.
- Keep answers under 250 words unless asked for a full plan.
- Never invent data about the user's history.
- Training science should be accurate (progressive overload, rest, RPE, deloads).`
}
