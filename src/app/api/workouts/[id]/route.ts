import { NextRequest, NextResponse } from "next/server"
import mongoose from "mongoose"
import { dbConnect } from "@/lib/db"
import { Workout } from "@/lib/models"
import { apiError, withUser } from "@/lib/api"
import { getPopulatedWorkout } from "@/lib/workout-utils"

type RouteContext = { params: Promise<{ id: string }> }

export async function GET(_req: NextRequest, ctx: RouteContext) {
  return withUser(async () => {
    await dbConnect()
    const { id } = await ctx.params
    if (!mongoose.isValidObjectId(id)) return apiError("Invalid id", 400)
    const populated = await getPopulatedWorkout(id)
    if (!populated) return apiError("Not found", 404)
    return NextResponse.json(populated)
  })
}

export async function PATCH(req: NextRequest, ctx: RouteContext) {
  return withUser(async () => {
    await dbConnect()
    const { id } = await ctx.params
    if (!mongoose.isValidObjectId(id)) return apiError("Invalid id", 400)
    const body = await req.json().catch(() => ({}))
    const doc = await Workout.findByIdAndUpdate(id, body, { returnDocument: "after" })
    if (!doc) return apiError("Not found", 404)
    const [populated] = await getPopulatedWorkout(id).then((p) => [p])
    return NextResponse.json(populated ?? doc)
  })
}

export async function DELETE(_req: NextRequest, ctx: RouteContext) {
  return withUser(async () => {
    await dbConnect()
    const { id } = await ctx.params
    if (!mongoose.isValidObjectId(id)) return apiError("Invalid id", 400)
    await Workout.findByIdAndDelete(id)
    return NextResponse.json({ ok: true })
  })
}
