import { NextResponse } from "next/server"
import { withUser } from "@/lib/api"
import { computeStats } from "@/lib/stats"

export async function GET() {
  return withUser(async (userId) => {
    const stats = await computeStats(userId)
    return NextResponse.json(stats)
  })
}
