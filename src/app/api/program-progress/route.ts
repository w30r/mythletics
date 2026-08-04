import { NextRequest, NextResponse } from "next/server"
import mongoose from "mongoose"
import { dbConnect } from "@/lib/db"
import { Program } from "@/lib/models"
import { apiError, withUser } from "@/lib/api"
import { getActiveProgress, startProgram, advanceProgress } from "@/lib/program-progress"

export async function GET() {
  return withUser(async (userId) => {
    const active = await getActiveProgress(userId)
    if (!active) return NextResponse.json({ progress: null })
    return NextResponse.json(active)
  })
}

export async function POST(req: NextRequest) {
  return withUser(async (userId) => {
    await dbConnect()
    const body = await req.json().catch(() => ({}))
    const programId = body.programId
    if (!programId || !mongoose.isValidObjectId(programId)) return apiError("Valid programId required", 400)
    const program = await Program.findById(programId)
    if (!program) return apiError("Program not found", 404)
    const progress = await startProgram(userId, programId)
    return NextResponse.json(progress, { status: 201 })
  })
}

export async function PATCH(req: NextRequest) {
  return withUser(async (userId) => {
    await dbConnect()
    const body = await req.json().catch(() => ({}))
    const programId = body.programId
    if (!programId || !mongoose.isValidObjectId(programId)) return apiError("Valid programId required", 400)
    const progress = await advanceProgress(userId, programId, body.sessionId)
    if (!progress) return apiError("Active progress not found", 404)
    return NextResponse.json(progress)
  })
}
