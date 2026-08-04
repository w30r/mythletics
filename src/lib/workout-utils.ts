import { Exercise, Workout } from "./models"

export type PopulatedExerciseRef = {
  exerciseId: string
  reps?: number
  duration?: number
  restAfter?: number
  exerciseName?: string
  exerciseSlug?: string
}

export type PopulatedBlock = {
  _id: string
  type: "circuit" | "interval" | "rest"
  name?: string
  rounds?: number
  restBetweenRounds?: number
  duration?: number
  exercises: PopulatedExerciseRef[]
}

export type PopulatedWorkout = {
  _id: string
  name: string
  description?: string
  tags?: string[]
  blocks: PopulatedBlock[]
  createdAt?: Date
}

type RawExerciseRef = { exerciseId: unknown; reps?: number; duration?: number; restAfter?: number }
type RawBlock = {
  _id?: unknown
  type?: string
  name?: string
  rounds?: number
  restBetweenRounds?: number
  duration?: number
  exercises?: RawExerciseRef[]
}
type RawWorkout = {
  _id: unknown
  name: string
  description?: string
  tags?: string[]
  blocks?: RawBlock[]
  createdAt?: Date
}

export async function populateWorkouts(workouts: RawWorkout[]): Promise<PopulatedWorkout[]> {
  const ids = new Set<string>()
  for (const w of workouts) {
    for (const b of w.blocks ?? []) {
      for (const e of b.exercises ?? []) ids.add(String(e.exerciseId))
    }
  }
  const exerciseDocs = await Exercise.find({ _id: { $in: [...ids] } }).lean()
  const map = new Map(exerciseDocs.map((e) => [String(e._id), e]))

  return workouts.map((w) => ({
    _id: String(w._id),
    name: w.name,
    description: w.description,
    tags: w.tags,
    blocks: (w.blocks ?? []).map((b) => ({
      _id: String(b._id ?? ""),
      type: (b.type ?? "circuit") as "circuit" | "interval" | "rest",
      name: b.name,
      rounds: b.rounds,
      restBetweenRounds: b.restBetweenRounds,
      duration: b.duration,
      exercises: (b.exercises ?? []).map((e) => {
        const ex = map.get(String(e.exerciseId))
        return {
          exerciseId: String(e.exerciseId),
          reps: e.reps,
          duration: e.duration,
          restAfter: e.restAfter,
          exerciseName: ex?.name,
          exerciseSlug: ex?.slug,
        }
      }),
    })),
    createdAt: w.createdAt,
  }))
}

export async function getPopulatedWorkout(id: string): Promise<PopulatedWorkout | null> {
  const w = await Workout.findById(id).lean()
  if (!w) return null
  const [populated] = await populateWorkouts([w as unknown as RawWorkout])
  return populated
}
