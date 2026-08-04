import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { dbConnect } from "@/lib/db"
import { Exercise } from "@/lib/models"
import { withUser } from "@/lib/api"

const exerciseSchema = z.object({
  name: z.string().min(1),
  muscleGroups: z.array(z.string()).default([]),
  equipment: z.string().default("bodyweight"),
  difficulty: z.enum(["beginner", "intermediate", "advanced"]).default("beginner"),
  demoUrl: z.string().default(""),
  description: z.string().default(""),
})

function slugify(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "")
}

export async function GET(req: NextRequest) {
  return withUser(async () => {
    await dbConnect()
    const searchParams = req.nextUrl.searchParams
    const q = searchParams.get("q")?.trim().toLowerCase() ?? ""
    const muscle = searchParams.get("muscle")?.trim().toLowerCase() ?? ""
    const filter: Record<string, unknown> = {}
    if (q) filter.name = { $regex: q, $options: "i" }
    if (muscle) filter.muscleGroups = muscle
    const docs = await Exercise.find(filter).sort({ name: 1 }).lean()
    return NextResponse.json(docs)
  })
}

export async function POST(req: NextRequest) {
  return withUser(async () => {
    await dbConnect()
    const body = await req.json().catch(() => ({}))
    const parsed = exerciseSchema.safeParse(body)
    if (!parsed.success) return NextResponse.json({ error: parsed.error.issues }, { status: 400 })
    const slug = slugify(parsed.data.name)
    const existing = await Exercise.findOne({ slug })
    if (existing) return NextResponse.json({ error: "An exercise with this name already exists" }, { status: 409 })
    const doc = await Exercise.create({ ...parsed.data, slug })
    return NextResponse.json(doc, { status: 201 })
  })
}
