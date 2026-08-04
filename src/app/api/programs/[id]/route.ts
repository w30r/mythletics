import { NextRequest, NextResponse } from "next/server"
import mongoose from "mongoose"
import { dbConnect } from "@/lib/db"
import { Program } from "@/lib/models"
import { apiError, withUser } from "@/lib/api"
import { populatePrograms } from "@/lib/program-utils"

type RouteContext = { params: Promise<{ id: string }> }

export async function GET(_req: NextRequest, ctx: RouteContext) {
  return withUser(async () => {
    await dbConnect()
    const { id } = await ctx.params
    if (!mongoose.isValidObjectId(id)) return apiError("Invalid id", 400)
    const raw = await Program.findById(id).lean()
    if (!raw) return apiError("Not found", 404)
    const [program] = await populatePrograms([raw])
    return NextResponse.json(program)
  })
}
