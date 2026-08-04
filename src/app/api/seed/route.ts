import { NextResponse } from "next/server"
import { runSeed } from "@/lib/seed"

export async function POST() {
  const result = await runSeed()
  return NextResponse.json(result)
}

export async function GET() {
  const { Exercise, Workout, Program, SeedDone } = await import("@/lib/models")
  const { dbConnect } = await import("@/lib/db")
  await dbConnect()
  const [exercises, workouts, programs, seeded] = await Promise.all([
    Exercise.countDocuments(),
    Workout.countDocuments(),
    Program.countDocuments(),
    SeedDone.exists({ key: "v2" }),
  ])
  return NextResponse.json({ exercises, workouts, programs, seeded: Boolean(seeded) })
}
