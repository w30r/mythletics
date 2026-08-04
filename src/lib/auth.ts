import { cookies } from "next/headers"
import bcrypt from "bcryptjs"
import { dbConnect } from "./db"
import { User } from "./models"
import { SESSION_COOKIE, verifySessionToken } from "./session"

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10)
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash)
}

export async function getSessionUserId(): Promise<string | null> {
  const cookieStore = await cookies()
  const token = cookieStore.get(SESSION_COOKIE)?.value
  if (!token) return null
  return verifySessionToken(token)
}

export async function getSessionUser() {
  const userId = await getSessionUserId()
  if (!userId) return null
  await dbConnect()
  return User.findById(userId).lean()
}

export async function requireUser(): Promise<string> {
  const userId = await getSessionUserId()
  if (!userId) throw new UnauthorizedError()
  return userId
}

export class UnauthorizedError extends Error {
  constructor() {
    super("Not authenticated")
  }
}

export async function ensureSeedAdmin() {
  const email = process.env.SEED_ADMIN_EMAIL
  const password = process.env.SEED_ADMIN_PASSWORD
  if (!email || !password) return null
  await dbConnect()
  const existing = await User.findOne({ email })
  if (existing) return existing
  const user = await User.create({ email, passwordHash: await hashPassword(password), name: "Athlete" })
  return user
}
