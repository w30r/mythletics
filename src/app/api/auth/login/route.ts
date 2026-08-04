import { NextRequest, NextResponse } from "next/server"
import { dbConnect } from "@/lib/db"
import { ensureSeedAdmin, verifyPassword } from "@/lib/auth"
import { createSessionToken, SESSION_COOKIE } from "@/lib/session"

export async function POST(req: NextRequest) {
  await dbConnect()

  const forwardedHost = req.headers.get("x-forwarded-host") ?? req.headers.get("host")
  const forwardedProto = req.headers.get("x-forwarded-proto")?.split(",")[0]?.trim() ?? "http"
  const publicBase = forwardedHost ? `${forwardedProto}://${forwardedHost}` : null

  const contentType = req.headers.get("content-type") ?? ""
  const isForm =
    contentType.includes("application/x-www-form-urlencoded") || contentType.includes("multipart/form-data")

  let email = ""
  let password = ""
  let next = "/"

  if (isForm) {
    const form = await req.formData()
    email = String(form.get("email") ?? "").trim().toLowerCase()
    password = String(form.get("password") ?? "")
    const rawNext = String(form.get("next") ?? "/")
    if (rawNext.startsWith("/") && !rawNext.startsWith("//")) next = rawNext
  } else {
    const body = await req.json().catch(() => ({}))
    email = typeof body.email === "string" ? body.email.trim().toLowerCase() : ""
    password = typeof body.password === "string" ? body.password : ""
  }

  const redirectTo = (path: string) => {
    const url = publicBase ? new URL(path, publicBase) : path
    return NextResponse.redirect(url)
  }

  if (!email || !password) {
    if (isForm) {
      const res = redirectTo("/login?error=1")
      res.cookies.set(SESSION_COOKIE, "", { httpOnly: true, sameSite: "lax", secure: true, maxAge: 0, path: "/" })
      return res
    }
    return NextResponse.json({ error: "Email and password are required" }, { status: 400 })
  }

  let user = await ensureSeedAdmin()
  if (!user) {
    const { User } = await import("@/lib/models")
    user = await User.findOne({ email })
  }
  if (!user || !(await verifyPassword(password, user.passwordHash))) {
    if (isForm) {
      const res = redirectTo("/login?error=1")
      res.cookies.set(SESSION_COOKIE, "", { httpOnly: true, sameSite: "lax", secure: true, maxAge: 0, path: "/" })
      return res
    }
    return NextResponse.json({ error: "Invalid email or password" }, { status: 401 })
  }

  const token = await createSessionToken(String(user._id))
  const cookieOptions = {
    httpOnly: true,
    sameSite: "lax" as const,
    secure: true,
    maxAge: 60 * 60 * 24 * 30,
    path: "/",
  }

  if (isForm) {
    const res = redirectTo(next)
    res.cookies.set(SESSION_COOKIE, token, cookieOptions)
    return res
  }

  const res = NextResponse.json({ ok: true, user: { email: user.email, name: user.name } })
  res.cookies.set(SESSION_COOKIE, token, cookieOptions)
  return res
}
