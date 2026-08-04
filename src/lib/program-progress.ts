import mongoose from "mongoose"
import { dbConnect } from "./db"
import { Program, ProgramProgress } from "./models"
import { populatePrograms, type PopulatedProgram } from "./program-utils"
import { getPopulatedWorkout, type PopulatedWorkout } from "./workout-utils"

export type TodayInfo = {
  week: number
  day: number
  rest: boolean
  workout: PopulatedWorkout | null
  note: string
}

export type ActiveProgramInfo = {
  progress: {
    _id: string
    currentWeek: number
    currentDay: number
    status: "active" | "completed"
    completedDays: { week: number; day: number; date: Date; sessionId?: string }[]
  }
  program: PopulatedProgram
  today: TodayInfo
}

export async function getActiveProgress(userId: string): Promise<ActiveProgramInfo | null> {
  await dbConnect()
  const progress = await ProgramProgress.findOne({ userId, status: "active" }).sort({ startedAt: -1 }).lean()
  if (!progress) return null

  const programRaw = await Program.findById(progress.programId).lean()
  if (!programRaw) return null
  const [program] = await populatePrograms([programRaw])
  const weekObj = program.weeks.find((w) => w.week === progress.currentWeek)
  const dayObj = weekObj?.days.find((d) => d.day === progress.currentDay)

  let workout: PopulatedWorkout | null = null
  if (dayObj?.workoutId && !dayObj.rest) {
    workout = await getPopulatedWorkout(dayObj.workoutId)
  }

  return {
    progress: {
      _id: String(progress._id),
      currentWeek: progress.currentWeek,
      currentDay: progress.currentDay,
      status: progress.status,
      completedDays: (progress.completedDays ?? []).map((c: { week: number; day: number; date: Date; sessionId?: unknown }) => ({
        week: c.week,
        day: c.day,
        date: c.date,
        sessionId: c.sessionId ? String(c.sessionId) : undefined,
      })),
    },
    program,
    today: {
      week: progress.currentWeek,
      day: progress.currentDay,
      rest: Boolean(dayObj?.rest),
      workout,
      note: dayObj?.note ?? "",
    },
  }
}

export async function startProgram(userId: string, programId: string) {
  await dbConnect()
  await ProgramProgress.updateMany({ userId, status: "active" }, { $set: { status: "archived" } })
  return ProgramProgress.create({ userId, programId, currentWeek: 1, currentDay: 1, status: "active" })
}

export async function advanceProgress(userId: string, programId: string, sessionId?: string) {
  await dbConnect()
  const progress = await ProgramProgress.findOne({ userId, programId, status: "active" })
  if (!progress) return null
  const program = await Program.findById(programId).lean()
  if (!program) return null

  const week = program.weeks.find((w: { week?: number }) => w.week === progress.currentWeek)
  if (!week) return null

  progress.completedDays.push({
    week: progress.currentWeek,
    day: progress.currentDay,
    date: new Date(),
    sessionId: sessionId ? (new mongoose.Types.ObjectId(sessionId) as never) : undefined,
  })

  const daysInWeek = week.days.length
  const nextDay = progress.currentDay + 1
  if (nextDay <= daysInWeek) {
    progress.currentDay = nextDay
  } else {
    const nextWeek = progress.currentWeek + 1
    if (nextWeek > program.weeks.length) {
      progress.currentDay = daysInWeek
      progress.status = "completed"
    } else {
      progress.currentWeek = nextWeek
      progress.currentDay = 1
    }
  }
  await progress.save()
  return progress
}
