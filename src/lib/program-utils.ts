import { Workout } from "./models"

export type PopulatedProgramDay = {
  _id: string
  day: number
  workoutId?: string
  workoutName?: string
  rest: boolean
  note: string
}

export type PopulatedProgramWeek = {
  _id: string
  week: number
  theme: string
  days: PopulatedProgramDay[]
}

export type PopulatedProgram = {
  _id: string
  name: string
  description?: string
  difficulty?: string
  aiGenerated?: boolean
  weeks: PopulatedProgramWeek[]
  createdAt?: Date
}

type RawProgram = {
  _id: unknown
  name: string
  description?: string
  difficulty?: string
  aiGenerated?: boolean
  weeks?: {
    _id?: unknown
    week?: number
    theme?: string
    days?: { _id?: unknown; day?: number; workoutId?: unknown; rest?: boolean; note?: string }[]
  }[]
  createdAt?: Date
}

export async function populatePrograms(programs: RawProgram[]): Promise<PopulatedProgram[]> {
  const workoutIds = new Set<string>()
  for (const p of programs) {
    for (const w of p.weeks ?? []) {
      for (const d of w.days ?? []) {
        if (d.workoutId) workoutIds.add(String(d.workoutId))
      }
    }
  }
  const workouts = await Workout.find({ _id: { $in: [...workoutIds] } }).lean()
  const map = new Map(workouts.map((w) => [String(w._id), w.name]))

  return programs.map((p) => ({
    _id: String(p._id),
    name: p.name,
    description: p.description,
    difficulty: p.difficulty,
    aiGenerated: p.aiGenerated,
    weeks: (p.weeks ?? []).map((w) => ({
      _id: String(w._id ?? ""),
      week: w.week ?? 1,
      theme: w.theme ?? "",
      days: (w.days ?? []).map((d) => ({
        _id: String(d._id ?? ""),
        day: d.day ?? 1,
        workoutId: d.workoutId ? String(d.workoutId) : undefined,
        workoutName: d.workoutId ? map.get(String(d.workoutId)) : undefined,
        rest: d.rest ?? false,
        note: d.note ?? "",
      })),
    })),
    createdAt: p.createdAt,
  }))
}
