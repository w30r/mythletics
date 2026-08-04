import { SignJWT, jwtVerify } from "jose"

export const SESSION_COOKIE = "mythletics_session"

const secret = new TextEncoder().encode(process.env.AUTH_SECRET ?? "")

export function hasSessionSecret(): boolean {
  return Boolean(process.env.AUTH_SECRET)
}

export async function createSessionToken(userId: string): Promise<string> {
  return new SignJWT({ sub: userId })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("30d")
    .sign(secret)
}

export async function verifySessionToken(token: string): Promise<string | null> {
  try {
    const { payload } = await jwtVerify(token, secret)
    return typeof payload.sub === "string" ? payload.sub : null
  } catch {
    return null
  }
}
