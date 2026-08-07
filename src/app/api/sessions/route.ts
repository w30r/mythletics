import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import mongoose from "mongoose"
import { dbConnect } from "@/lib/db"
import { WorkoutSession } from "@/lib/models"
import { apiError, withUser } from "@/lib/api"

const detailSchema = z.object({
  exerciseId: z.string().optional(),
  exerciseName: z.string().default(""),
  reps: z.number().optional(),
  duration: z.number().optional(),
  weight: z.number().optional(),
  notes: z.string().default(""),
  completed: z.boolean().default(true),
})

const splitSchema = z.object({
  stepIndex: z.number(),
  blockIndex: z.number(),
  round: z.number(),
  exerciseId: z.string().optional(),
  exerciseName: z.string().default(""),
  reps: z.number().optional(),
  elapsed: z.number(),
})

const sessionSchema = z.object({
  workoutId: z.string().optional(),
  workoutName: z.string().default(""),
  date: z.string().datetime().optional(),
  duration: z.number().min(0).default(0),
  completed: z.boolean().default(true),
  source: z.enum(["program", "manual", "ai"]).default("manual"),
  programId: z.string().optional(),
  rating: z.number().min(0).max(10).optional(),
  details: z.array(detailSchema).default([]),
  splits: z.array(splitSchema).default([]),
})

export async function GET(req: NextRequest) {
  return withUser(async (userId) => {
    await dbConnect()
    const searchParams = req.nextUrl.searchParams
    const workoutId = searchParams.get("workoutId")
    const limit = Math.min(Number(searchParams.get("limit") ?? 100), 500)
    const filter: Record<string, unknown> = { userId }
    if (workoutId && mongoose.isValidObjectId(workoutId)) filter.workoutId = workoutId
    const docs = await WorkoutSession.find(filter).sort({ date: -1 }).limit(limit).lean()
    return NextResponse.json(docs)
  })
}

export async function POST(req: NextRequest) {
  return withUser(async (userId) => {
    await dbConnect()
    const body = await req.json().catch(() => ({}))
    const parsed = sessionSchema.safeParse(body)
    if (!parsed.success) return NextResponse.json({ error: parsed.error.issues }, { status: 400 })
    const doc = await WorkoutSession.create({ ...parsed.data, userId })
    return NextResponse.json(doc, { status: 201 })
  })
}

export async function PATCH(req: NextRequest) {
  return withUser(async (userId) => {
    await dbConnect()
    const body = await req.json().catch(() => ({}))
    const id = body.id
    if (!id || !mongoose.isValidObjectId(id)) return apiError("Valid session id required", 400)
    delete body.id
    const doc = await WorkoutSession.findOneAndUpdate({ _id: id, userId }, body, { returnDocument: 'after' })
    if (!doc) return apiError("Not found", 404)
    return NextResponse.json(doc)
  })
}

export async function DELETE(req: NextRequest) {
  return withUser(async (userId) => {
    await dbConnect()
    const { searchParams } = new URL(req.url)
    const id = searchParams.get("id")
    if (!id || !mongoose.isValidObjectId(id)) return apiError("Valid session id required", 400)
    const doc = await WorkoutSession.findOneAndDelete({ _id: id, userId })
    if (!doc) return apiError("Not found", 404)
    return NextResponse.json({ ok: true })
  })
}
