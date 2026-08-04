export type TimelineStep = {
  id: string
  kind: "work" | "rest"
  label: string
  exerciseId?: string
  exerciseName?: string
  reps?: number
  durationSec?: number
  isRepBased: boolean
  blockIndex: number
  round: number
  roundsTotal: number
}

export type PopulatedWorkoutExercise = {
  exerciseId: string
  reps?: number
  duration?: number
  restAfter?: number
  exerciseName?: string
}

export type PopulatedWorkout = {
  _id: string
  name: string
  description?: string
  blocks: {
    _id?: string
    type: "circuit" | "interval" | "rest"
    name?: string
    rounds?: number
    restBetweenRounds?: number
    duration?: number
    exercises: PopulatedWorkoutExercise[]
  }[]
}

let stepCounter = 0
function nextStepId(): string {
  stepCounter += 1
  return `step-${Date.now()}-${stepCounter}`
}

export function buildTimeline(workout: PopulatedWorkout): TimelineStep[] {
  const steps: TimelineStep[] = []
  workout.blocks.forEach((block, blockIndex) => {
    const rounds = Math.max(1, block.rounds ?? 1)

    if (block.type === "rest") {
      steps.push({
        id: nextStepId(),
        kind: "rest",
        label: block.name || "Rest",
        durationSec: block.duration ?? 30,
        isRepBased: false,
        blockIndex,
        round: 1,
        roundsTotal: 1,
      })
      return
    }

    for (let round = 1; round <= rounds; round++) {
      block.exercises.forEach((ex) => {
        const durationSec = ex.duration
        const isRepBased = !durationSec && Boolean(ex.reps)
        steps.push({
          id: nextStepId(),
          kind: "work",
          label: block.name && block.name !== "Main" ? `${block.name} · ${ex.exerciseName ?? "Exercise"}` : (ex.exerciseName ?? "Exercise"),
          exerciseId: ex.exerciseId,
          exerciseName: ex.exerciseName,
          reps: ex.reps,
          durationSec,
          isRepBased,
          blockIndex,
          round,
          roundsTotal: rounds,
        })
        if (ex.restAfter && ex.restAfter > 0) {
          steps.push({
            id: nextStepId(),
            kind: "rest",
            label: "Rest",
            durationSec: ex.restAfter,
            isRepBased: false,
            blockIndex,
            round,
            roundsTotal: rounds,
          })
        }
      })
      if (block.restBetweenRounds && block.restBetweenRounds > 0 && round < rounds) {
        steps.push({
          id: nextStepId(),
          kind: "rest",
          label: "Rest between rounds",
          durationSec: block.restBetweenRounds,
          isRepBased: false,
          blockIndex,
          round,
          roundsTotal: rounds,
        })
      }
    }
  })
  return steps
}

export function estimatedTotalSeconds(steps: TimelineStep[]): number {
  return steps.reduce((acc, s) => acc + (s.durationSec ?? 0), 0)
}

export function formatSeconds(total: number): string {
  const m = Math.floor(total / 60)
  const s = Math.round(total % 60)
  return `${m}:${String(s).padStart(2, "0")}`
}
