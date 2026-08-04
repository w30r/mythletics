import { NextRequest, NextResponse } from "next/server"
import { dbConnect } from "@/lib/db"
import { CoachThread } from "@/lib/models"
import { withUser } from "@/lib/api"

export async function GET() {
  return withUser(async (userId) => {
    await dbConnect()
    const threads = await CoachThread.find({ userId }).sort({ updatedAt: -1 }).select("title updatedAt").lean()
    return NextResponse.json(threads)
  })
}

export async function POST(req: NextRequest) {
  return withUser(async (userId) => {
    await dbConnect()
    const body = await req.json().catch(() => ({}))
    const title = typeof body.title === "string" && body.title.trim() ? body.title.trim().slice(0, 60) : "New chat"
    const thread = await CoachThread.create({ userId, title, messages: [] })
    return NextResponse.json(thread, { status: 201 })
  })
}
