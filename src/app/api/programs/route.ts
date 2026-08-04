import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import mongoose from "mongoose"
import { dbConnect } from "@/lib/db"
import { Program } from "@/lib/models"
import { apiError, withUser } from "@/lib/api"
import { populatePrograms } from "@/lib/program-utils"

const daySchema = z.object({
  day: z.number().int().positive(),
  workoutId: z.string().optional(),
  rest: z.boolean().default(false),
  note: z.string().default(""),
})

const weekSchema = z.object({
  week: z.number().int().positive(),
  theme: z.string().default(""),
  days: z.array(daySchema).default([]),
})

const programSchema = z.object({
  name: z.string().min(1),
  description: z.string().default(""),
  difficulty: z.string().default("beginner"),
  aiGenerated: z.boolean().default(false),
  weeks: z.array(weekSchema).default([]),
})

export async function GET() {
  return withUser(async () => {
    await dbConnect()
    const docs = await Program.find({}).sort({ createdAt: -1 }).lean()
    const populated = await populatePrograms(docs)
    return NextResponse.json(populated)
  })
}

export async function POST(req: NextRequest) {
  return withUser(async () => {
    await dbConnect()
    const body = await req.json().catch(() => ({}))
    const parsed = programSchema.safeParse(body)
    if (!parsed.success) return NextResponse.json({ error: parsed.error.issues }, { status: 400 })
    const doc = await Program.create(parsed.data)
    const [populated] = await populatePrograms([doc.toObject()])
    return NextResponse.json(populated, { status: 201 })
  })
}

export async function PATCH(req: NextRequest) {
  return withUser(async () => {
    await dbConnect()
    const body = await req.json().catch(() => ({}))
    const id = body.id
    if (!id || !mongoose.isValidObjectId(id)) return apiError("Valid program id required", 400)
    delete body.id
    const doc = await Program.findByIdAndUpdate(id, body, { returnDocument: 'after' })
    if (!doc) return apiError("Not found", 404)
    const [populated] = await populatePrograms([doc.toObject()])
    return NextResponse.json(populated ?? doc)
  })
}

export async function DELETE(req: NextRequest) {
  return withUser(async () => {
    await dbConnect()
    const { searchParams } = new URL(req.url)
    const id = searchParams.get("id")
    if (!id || !mongoose.isValidObjectId(id)) return apiError("Valid program id required", 400)
    await Program.findByIdAndDelete(id)
    return NextResponse.json({ ok: true })
  })
}
