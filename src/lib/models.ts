import mongoose, { Schema, type InferSchemaType, type Types } from "mongoose"

const userSchema = new Schema(
  {
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true },
    name: { type: String, default: "Athlete" },
    createdAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
)

const exerciseSchema = new Schema({
  name: { type: String, required: true, trim: true },
  slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
  muscleGroups: [{ type: String, lowercase: true }],
  equipment: { type: String, default: "bodyweight" },
  difficulty: { type: String, enum: ["beginner", "intermediate", "advanced"], default: "beginner" },
  demoUrl: { type: String, default: "" },
  description: { type: String, default: "" },
})

const workoutExerciseSchema = new Schema(
  {
    exerciseId: { type: Schema.Types.ObjectId, ref: "Exercise", required: true },
    reps: { type: Number },
    duration: { type: Number },
    restAfter: { type: Number, default: 0 },
  },
  { _id: false }
)

const workoutBlockSchema = new Schema({
  _id: { type: Schema.Types.ObjectId, auto: true },
  type: { type: String, enum: ["circuit", "interval", "rest"], required: true },
  name: { type: String, default: "" },
  rounds: { type: Number, default: 1 },
  restBetweenRounds: { type: Number, default: 0 },
  duration: { type: Number },
  exercises: { type: [workoutExerciseSchema], default: [] },
})

const workoutSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    description: { type: String, default: "" },
    blocks: { type: [workoutBlockSchema], default: [] },
    tags: [{ type: String }],
    createdAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
)

const programDaySchema = new Schema(
  {
    _id: { type: Schema.Types.ObjectId, auto: true },
    day: { type: Number, required: true },
    workoutId: { type: Schema.Types.ObjectId, ref: "Workout" },
    rest: { type: Boolean, default: false },
    note: { type: String, default: "" },
  },
  { _id: false }
)

const programWeekSchema = new Schema({
  _id: { type: Schema.Types.ObjectId, auto: true },
  week: { type: Number, required: true },
  theme: { type: String, default: "" },
  days: { type: [programDaySchema], default: [] },
})

const programSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    description: { type: String, default: "" },
    weeks: { type: [programWeekSchema], default: [] },
    aiGenerated: { type: Boolean, default: false },
    difficulty: { type: String, default: "beginner" },
    createdAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
)

const programProgressSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    programId: { type: Schema.Types.ObjectId, ref: "Program", required: true },
    currentWeek: { type: Number, default: 1 },
    currentDay: { type: Number, default: 1 },
    status: { type: String, enum: ["active", "completed"], default: "active" },
    startedAt: { type: Date, default: Date.now },
    completedDays: [
      {
        _id: false,
        week: Number,
        day: Number,
        date: Date,
        sessionId: { type: Schema.Types.ObjectId, ref: "WorkoutSession" },
      },
    ],
  },
  { timestamps: true }
)

const sessionDetailSchema = new Schema(
  {
    exerciseId: { type: Schema.Types.ObjectId, ref: "Exercise" },
    exerciseName: { type: String, default: "" },
    reps: { type: Number },
    duration: { type: Number },
    weight: { type: Number },
    notes: { type: String, default: "" },
    completed: { type: Boolean, default: true },
  },
  { _id: false }
)

const workoutSessionSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    workoutId: { type: Schema.Types.ObjectId, ref: "Workout" },
    date: { type: Date, default: Date.now },
    duration: { type: Number, default: 0 },
    completed: { type: Boolean, default: true },
    source: { type: String, enum: ["program", "manual", "ai"], default: "manual" },
    programId: { type: Schema.Types.ObjectId, ref: "Program" },
    rating: { type: Number, min: 0, max: 10 },
    details: { type: [sessionDetailSchema], default: [] },
  },
  { timestamps: true }
)

const coachMessageSchema = new Schema(
  {
    role: { type: String, enum: ["user", "assistant", "system"], required: true },
    content: { type: String, required: true },
    date: { type: Date, default: Date.now },
  },
  { _id: false }
)

const coachThreadSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    title: { type: String, default: "New chat" },
    messages: { type: [coachMessageSchema], default: [] },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
)

const seedDoneSchema = new Schema({ key: { type: String, unique: true }, done: { type: Boolean, default: true } })

export const User = mongoose.models.User ?? mongoose.model("User", userSchema)
export const Exercise = mongoose.models.Exercise ?? mongoose.model("Exercise", exerciseSchema)
export const Workout = mongoose.models.Workout ?? mongoose.model("Workout", workoutSchema)
export const Program = mongoose.models.Program ?? mongoose.model("Program", programSchema)
export const ProgramProgress = mongoose.models.ProgramProgress ?? mongoose.model("ProgramProgress", programProgressSchema)
export const WorkoutSession = mongoose.models.WorkoutSession ?? mongoose.model("WorkoutSession", workoutSessionSchema)
export const CoachThread = mongoose.models.CoachThread ?? mongoose.model("CoachThread", coachThreadSchema)
export const SeedDone = mongoose.models.SeedDone ?? mongoose.model("SeedDone", seedDoneSchema)

export type UserDoc = InferSchemaType<typeof userSchema> & { _id: Types.ObjectId }
export type ExerciseDoc = InferSchemaType<typeof exerciseSchema> & { _id: Types.ObjectId }
export type WorkoutDoc = InferSchemaType<typeof workoutSchema> & { _id: Types.ObjectId }
export type ProgramDoc = InferSchemaType<typeof programSchema> & { _id: Types.ObjectId }
export type ProgramProgressDoc = InferSchemaType<typeof programProgressSchema> & { _id: Types.ObjectId }
export type WorkoutSessionDoc = InferSchemaType<typeof workoutSessionSchema> & { _id: Types.ObjectId }
export type CoachThreadDoc = InferSchemaType<typeof coachThreadSchema> & { _id: Types.ObjectId }
