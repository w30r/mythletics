export type ClientExerciseRef = {
  exerciseId: string
  reps?: number
  duration?: number
  restAfter?: number
  exerciseName?: string
  exerciseSlug?: string
}

export type ClientBlock = {
  _id?: string
  type: "circuit" | "interval" | "rest"
  name?: string
  rounds?: number
  restBetweenRounds?: number
  duration?: number
  exercises: ClientExerciseRef[]
}

export type ClientWorkout = {
  _id: string
  name: string
  description?: string
  tags?: string[]
  blocks: ClientBlock[]
  createdAt?: string
}

export type ClientExercise = {
  _id: string
  name: string
  slug: string
  muscleGroups: string[]
  equipment: string
  difficulty: "beginner" | "intermediate" | "advanced"
  demoUrl?: string
  description?: string
}

export type ClientProgramDay = {
  _id?: string
  day: number
  workoutId?: string
  workoutName?: string
  rest: boolean
  note?: string
}

export type ClientProgramWeek = {
  _id?: string
  week: number
  theme?: string
  days: ClientProgramDay[]
}

export type ClientProgram = {
  _id: string
  name: string
  description?: string
  difficulty?: string
  aiGenerated?: boolean
  weeks: ClientProgramWeek[]
  createdAt?: string
}

export type ActiveProgress = {
  progress: {
    _id: string
    currentWeek: number
    currentDay: number
    status: "active" | "completed"
    completedDays: { week: number; day: number; date: string; sessionId?: string }[]
  }
  program: ClientProgram
  today: {
    week: number
    day: number
    rest: boolean
    workout: ClientWorkout | null
    note: string
  }
}

export type SessionDetail = {
  exerciseId?: string
  exerciseName: string
  reps?: number
  duration?: number
  weight?: number
  notes?: string
  completed: boolean
}

export type SessionSplit = {
  stepIndex: number
  blockIndex: number
  round: number
  exerciseId?: string
  exerciseName?: string
  reps?: number
  elapsed: number
}

export type ClientSession = {
  _id: string
  workoutId?: string
  workoutName?: string
  date: string
  duration: number
  completed: boolean
  source: "program" | "manual" | "ai"
  programId?: string
  rating?: number
  details: SessionDetail[]
  splits?: SessionSplit[]
}

export type Stats = {
  totalSessions: number
  totalTime: number
  totalReps: number
  streak: number
  thisWeekSessions: number
  thisWeekTime: number
  daily: { date: string; time: number; sessions: number }[]
  prs: {
    exerciseName: string
    maxReps?: number
    maxWeight?: number
    maxDuration?: number
    totalCount: number
  }[]
  workoutPbs: {
    workoutId: string
    workoutName: string
    bestTime: number
    date: string
  }[]
  workoutSplits: {
    workoutId: string
    workoutName: string
    splits: {
      stepIndex: number
      exerciseName: string
      reps?: number
      round: number
      elapsed: number
    }[]
  }[]
}
