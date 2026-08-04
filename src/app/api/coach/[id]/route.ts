import { NextRequest, NextResponse } from "next/server"
import mongoose from "mongoose"
import { dbConnect } from "@/lib/db"
import { CoachThread } from "@/lib/models"
import { apiError, withUser } from "@/lib/api"
import { streamCompletion, isAiConfigured, type ChatMessage } from "@/lib/ai"
import { buildCoachSystemPrompt, summarizeRecentActivity } from "@/lib/coach"

type RouteContext = { params: Promise<{ id: string }> }

export async function GET(_req: NextRequest, ctx: RouteContext) {
  return withUser(async (userId) => {
    await dbConnect()
    const { id } = await ctx.params
    if (!mongoose.isValidObjectId(id)) return apiError("Invalid id", 400)
    const thread = await CoachThread.findOne({ _id: id, userId }).lean()
    if (!thread) return apiError("Not found", 404)
    return NextResponse.json(thread)
  })
}

export async function DELETE(_req: NextRequest, ctx: RouteContext) {
  return withUser(async (userId) => {
    await dbConnect()
    const { id } = await ctx.params
    if (!mongoose.isValidObjectId(id)) return apiError("Invalid id", 400)
    await CoachThread.findOneAndDelete({ _id: id, userId })
    return NextResponse.json({ ok: true })
  })
}

export async function POST(req: NextRequest, ctx: RouteContext) {
  return withUser(async (userId) => {
    const { id } = await ctx.params
    if (!mongoose.isValidObjectId(id)) return apiError("Invalid id", 400)
    await dbConnect()

    const thread = await CoachThread.findOne({ _id: id, userId })
    if (!thread) return apiError("Not found", 404)

    const body = await req.json().catch(() => ({}))
    const message = typeof body.message === "string" ? body.message.trim() : ""
    if (!message) return apiError("Message required", 400)

    if (!isAiConfigured()) {
      return NextResponse.json({ error: "DEEPSEEK_API_KEY is not configured. Add it to .env.local to use the AI coach." }, { status: 503 })
    }

    thread.messages.push({ role: "user", content: message })
    thread.updatedAt = new Date()
    await thread.save()

    const history: ChatMessage[] = thread.messages
      .filter((m: { role: string }) => m.role === "user" || m.role === "assistant")
      .map((m: { role: string; content: string }) => ({ role: m.role as "user" | "assistant", content: m.content }))

    const activity = await summarizeRecentActivity(userId)
    const messages: ChatMessage[] = [
      { role: "system", content: buildCoachSystemPrompt(activity) },
      ...history.slice(-12),
    ]

    const encoder = new TextEncoder()
    const stream = new ReadableStream({
      async start(controller) {
        let full = ""
        try {
          for await (const delta of streamCompletion(messages)) {
            full += delta
            controller.enqueue(encoder.encode(`data: ${JSON.stringify({ delta })}\n\n`))
          }
          await CoachThread.updateOne(
            { _id: thread._id },
            { $push: { messages: { role: "assistant", content: full, date: new Date() } }, $set: { updatedAt: new Date() } }
          )
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ done: true })}\n\n`))
        } catch (err) {
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ error: err instanceof Error ? err.message : "AI error" })}\n\n`))
        } finally {
          controller.close()
        }
      },
    })

    return new Response(stream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache, no-transform",
        Connection: "keep-alive",
      },
    })
  })
}
