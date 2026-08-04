import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import mongoose from "mongoose"
import { dbConnect } from "@/lib/db"
import { Workout } from "@/lib/models"
import { withUser } from "@/lib/api"
import { populateWorkouts } from "@/lib/workout-utils"

const workoutExerciseSchema = z.object({
  exerciseId: z.string().refine((v) => mongoose.isValidObjectId(v), "Invalid exercise id"),
  reps: z.number().int().positive().optional(),
  duration: z.number().int().positive().optional(),
  restAfter: z.number().int().min(0).default(0),
})

const workoutBlockSchema = z.object({
  type: z.enum(["circuit", "interval", "rest"]),
  name: z.string().default(""),
  rounds: z.number().int().min(1).default(1),
  restBetweenRounds: z.number().int().min(0).default(0),
  duration: z.number().int().positive().optional(),
  exercises: z.array(workoutExerciseSchema).default([]),
})

const workoutSchema = z.object({
  name: z.string().min(1),
  description: z.string().default(""),
  tags: z.array(z.string()).default([]),
  blocks: z.array(workoutBlockSchema).default([]),
})

export async function GET() {
  return withUser(async () => {
    await dbConnect()
    const docs = await Workout.find({}).sort({ createdAt: -1 }).lean()
    const populated = await populateWorkouts(docs)
    return NextResponse.json(populated)
  })
}

export async function POST(req: NextRequest) {
  return withUser(async () => {
    await dbConnect()
    const body = await req.json().catch(() => ({}))
    const parsed = workoutSchema.safeParse(body)
    if (!parsed.success) return NextResponse.json({ error: parsed.error.issues }, { status: 400 })
    const doc = await Workout.create(parsed.data)
    const [populated] = await populateWorkouts([doc.toObject()])
    return NextResponse.json(populated, { status: 201 })
  })
}
