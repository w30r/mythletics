import { NextRequest, NextResponse } from "next/server"
import mongoose from "mongoose"
import { z } from "zod"
import { dbConnect } from "@/lib/db"
import { CoachThread, Program, Workout } from "@/lib/models"
import { apiError, withUser } from "@/lib/api"
import { chatCompletion, isAiConfigured, type ChatMessage } from "@/lib/ai"
import { summarizeRecentActivity } from "@/lib/coach"
import { populatePrograms } from "@/lib/program-utils"

type RouteContext = { params: Promise<{ id: string }> }

const aiPlanSchema = z.object({
  name: z.string(),
  difficulty: z.enum(["beginner", "intermediate", "advanced"]),
  description: z.string(),
  weeks: z.array(
    z.object({
      week: z.number().int().positive(),
      theme: z.string(),
      days: z.array(
        z.object({
          day: z.number().int().positive(),
          workoutName: z.string().optional(),
          rest: z.boolean().optional(),
          note: z.string().optional(),
        })
      ),
    })
  ),
})

export async function POST(req: NextRequest, ctx: RouteContext) {
  return withUser(async (userId) => {
    const { id } = await ctx.params
    if (!mongoose.isValidObjectId(id)) return apiError("Invalid id", 400)
    await dbConnect()

    const thread = await CoachThread.findOne({ _id: id, userId })
    if (!thread) return apiError("Not found", 404)

    if (!isAiConfigured()) {
      return NextResponse.json({ error: "DEEPSEEK_API_KEY is not configured. Add it to .env.local to use the AI coach." }, { status: 503 })
    }

    const body = await req.json().catch(() => ({}))
    const goal = typeof body.goal === "string" ? body.goal.trim().slice(0, 300) : ""
    const weeksCount = Math.min(Math.max(Number(body.weeks ?? 4), 1), 8)

    const workouts = await Workout.find({}).select("name").lean()
    const availableNames = workouts.map((w) => w.name)
    const activity = await summarizeRecentActivity(userId)

    const messages: ChatMessage[] = [
      {
        role: "system",
        content: `You are Mythletics Coach. You generate structured weekly training programs for a bodyweight athlete.
The athlete's recent activity:
${activity}

Available workouts in the library (you MUST only reference these by exact name, or mark a day as rest):
${availableNames.join("\n")}

Return ONLY valid JSON matching this schema (no markdown, no commentary):
{
  "name": "string",
  "difficulty": "beginner" | "intermediate" | "advanced",
  "description": "string",
  "weeks": [
    {
      "week": 1,
      "theme": "string",
      "days": [
        { "day": 1, "workoutName": "<exact workout name or omit>", "rest": false, "note": "string" },
        { "day": 2, "rest": true }
      ]
    }
  ]
}
Rules:
- Generate exactly ${weeksCount} weeks, each with 7 days.
- 3-4 training days per week (7-day plan), the rest are rest days.
- Progress intensity across weeks (volume, rounds, or workout selection). Base difficulty on recent history.
- ${goal ? `Athlete goal/context: ${goal}` : "No specific goal given; build a balanced full-body plan."}`,
      },
    ]

    let raw: string
    try {
      raw = await chatCompletion(messages, { json: true, temperature: 0.5, maxTokens: 2500 })
    } catch (err) {
      return NextResponse.json({ error: err instanceof Error ? err.message : "AI request failed" }, { status: 502 })
    }

    const cleaned = raw.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/, "")
    let parsed: z.infer<typeof aiPlanSchema>
    try {
      parsed = aiPlanSchema.parse(JSON.parse(cleaned))
    } catch (err) {
      return NextResponse.json({ error: `Could not parse AI plan: ${err instanceof Error ? err.message : "invalid JSON"}` }, { status: 502 })
    }

    const nameToId = new Map(workouts.map((w) => [w.name, String(w._id)]))
    const weeks = parsed.weeks.map((w) => ({
      week: w.week,
      theme: w.theme,
      days: w.days.map((d) => ({
        day: d.day,
        rest: d.rest ?? !d.workoutName,
        workoutId: d.workoutName && nameToId.has(d.workoutName) ? nameToId.get(d.workoutName) : undefined,
        note: d.note ?? "",
      })),
    }))

    const program = await Program.create({
      name: parsed.name.slice(0, 80),
      description: parsed.description,
      difficulty: parsed.difficulty,
      aiGenerated: true,
      weeks,
    })

    const [populated] = await populatePrograms([program.toObject()])
    return NextResponse.json(populated, { status: 201 })
  })
}
