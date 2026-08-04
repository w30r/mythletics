import { NextResponse } from "next/server"
import { UnauthorizedError, requireUser } from "./auth"

export function apiError(message: string, status = 400) {
  return NextResponse.json({ error: message }, { status })
}

export async function withUser(handler: (userId: string, ...args: unknown[]) => Promise<Response>): Promise<Response> {
  try {
    const userId = await requireUser()
    return await handler(userId)
  } catch (err) {
    if (err instanceof UnauthorizedError) return apiError("Not authenticated", 401)
    console.error(err)
    return apiError("Internal server error", 500)
  }
}
