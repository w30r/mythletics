import { NextRequest, NextResponse } from "next/server"
import mongoose from "mongoose"
import { dbConnect } from "@/lib/db"
import { Exercise } from "@/lib/models"
import { apiError, withUser } from "@/lib/api"

type RouteContext = { params: Promise<{ id: string }> }

export async function GET(_req: NextRequest, ctx: RouteContext) {
  return withUser(async () => {
    await dbConnect()
    const { id } = await ctx.params
    if (!mongoose.isValidObjectId(id)) return apiError("Invalid id", 400)
    const doc = await Exercise.findById(id).lean()
    if (!doc) return apiError("Not found", 404)
    return NextResponse.json(doc)
  })
}

export async function PATCH(req: NextRequest, ctx: RouteContext) {
  return withUser(async () => {
    await dbConnect()
    const { id } = await ctx.params
    if (!mongoose.isValidObjectId(id)) return apiError("Invalid id", 400)
    const body = await req.json().catch(() => ({}))
    const doc = await Exercise.findByIdAndUpdate(id, body, { returnDocument: "after" })
    if (!doc) return apiError("Not found", 404)
    return NextResponse.json(doc)
  })
}

export async function DELETE(_req: NextRequest, ctx: RouteContext) {
  return withUser(async () => {
    await dbConnect()
    const { id } = await ctx.params
    if (!mongoose.isValidObjectId(id)) return apiError("Invalid id", 400)
    await Exercise.findByIdAndDelete(id)
    return NextResponse.json({ ok: true })
  })
}
