import { dbConnect } from "./db"
import { Exercise, Workout, Program, SeedDone } from "./models"

type SeedExercise = {
  name: string
  muscleGroups: string[]
  equipment?: string
  difficulty?: "beginner" | "intermediate" | "advanced"
  description?: string
}

export const SEED_EXERCISES: SeedExercise[] = [
  { name: "Push-Up", muscleGroups: ["chest", "triceps", "shoulders"], description: "Classic bodyweight press. Keep your core braced and lower your chest to the floor." },
  { name: "Wide Push-Up", muscleGroups: ["chest", "shoulders"], difficulty: "intermediate", description: "Hands wider than shoulder-width to emphasize the chest." },
  { name: "Diamond Push-Up", muscleGroups: ["triceps", "chest"], difficulty: "advanced", description: "Hands form a diamond under your chest. Strong triceps focus." },
  { name: "Incline Push-Up", muscleGroups: ["chest", "triceps"], description: "Hands elevated on a bench or step. Great for beginners." },
  { name: "Pull-Up", muscleGroups: ["back", "biceps"], equipment: "bar", difficulty: "advanced", description: "Hang from a bar and pull your chin over it." },
  { name: "Chin-Up", muscleGroups: ["back", "biceps"], equipment: "bar", difficulty: "advanced", description: "Underhand grip pull-up with a stronger biceps focus." },
  { name: "Jumping Jack", muscleGroups: ["cardio", "full body"], difficulty: "beginner", description: "Jump feet out and raise arms overhead, then return." },
  { name: "Burpee", muscleGroups: ["full body", "cardio"], difficulty: "advanced", description: "Squat, kick back to plank, do a push-up, jump up." },
  { name: "Squat", muscleGroups: ["legs", "glutes"], difficulty: "beginner", description: "Lower hips back and down until thighs are parallel." },
  { name: "Jump Squat", muscleGroups: ["legs", "glutes"], difficulty: "intermediate", description: "Squat then explode upward into a jump." },
  { name: "Lunge", muscleGroups: ["legs", "glutes"], description: "Step forward and lower until both knees are bent at 90°." },
  { name: "Reverse Lunge", muscleGroups: ["legs", "glutes"], description: "Step backward into a lunge, keeping your front knee stable." },
  { name: "Jumping Lunge", muscleGroups: ["legs", "glutes", "cardio"], difficulty: "advanced", description: "Switch legs in a jump between lunge positions." },
  { name: "Glute Bridge", muscleGroups: ["glutes", "core"], description: "Lying on your back, drive your hips up and squeeze." },
  { name: "Hip Thrust", muscleGroups: ["glutes"], equipment: "bench", difficulty: "intermediate", description: "Upper back on a bench, drive hips to full extension." },
  { name: "Plank", muscleGroups: ["core"], description: "Hold a rigid straight line on your forearms and toes." },
  { name: "Side Plank", muscleGroups: ["core"], difficulty: "intermediate", description: "Support your body on one forearm, hips lifted." },
  { name: "Mountain Climber", muscleGroups: ["core", "cardio"], difficulty: "intermediate", description: "From a plank, drive knees toward your chest alternately." },
  { name: "Bicycle Crunch", muscleGroups: ["core"], difficulty: "intermediate", description: "Alternate elbow-to-opposite-knee while extending the other leg." },
  { name: "Sit-Up", muscleGroups: ["core"], description: "From your back, curl your torso up toward your knees." },
  { name: "Crunch", muscleGroups: ["core"], description: "Curl your shoulders off the floor, focusing on the abs." },
  { name: "Russian Twist", muscleGroups: ["core"], difficulty: "intermediate", description: "Seated, rotate your torso side to side with hands together." },
  { name: "Leg Raise", muscleGroups: ["core"], difficulty: "intermediate", description: "Lying flat, raise straight legs to vertical and lower slowly." },
  { name: "Superman Hold", muscleGroups: ["back", "glutes"], description: "Prone, lift arms and legs off the floor and hold." },
  { name: "Wall Sit", muscleGroups: ["legs"], description: "Slide down a wall into a seated position and hold." },
  { name: "High Knees", muscleGroups: ["cardio", "core"], description: "Run in place driving knees above hip height." },
  { name: "Bear Crawl", muscleGroups: ["full body", "core"], difficulty: "intermediate", description: "Crawl forward on hands and toes with hips level." },
  { name: "Inchworm", muscleGroups: ["full body", "core"], description: "Walk hands out to a plank, then walk back to your feet." },
  { name: "Tricep Dip", muscleGroups: ["triceps", "shoulders"], equipment: "bench", difficulty: "intermediate", description: "Lower yourself from a bench with hands behind you." },
  { name: "Star Jump", muscleGroups: ["cardio", "full body"], difficulty: "intermediate", description: "Jump and spread arms and legs into a star shape." },
  { name: "Leg Lever", muscleGroups: ["core"], difficulty: "intermediate", description: "Lying flat, raise straight legs to vertical while keeping your lower back pressed into the floor." },
  { name: "V-Sit", muscleGroups: ["core"], difficulty: "intermediate", description: "Balance on your glutes and extend your legs and torso into a V shape, then lower." },
  { name: "Handstand Push-Up", muscleGroups: ["shoulders", "triceps"], equipment: "wall", difficulty: "advanced", description: "Kick up against a wall and press your body down and back up in a handstand." },
  { name: "One-Arm Push-Up", muscleGroups: ["chest", "triceps"], difficulty: "advanced", description: "Push-up on a single arm with the other hand resting behind your back." },
  { name: "Pistol Squat", muscleGroups: ["legs", "glutes"], difficulty: "advanced", description: "A deep single-leg squat with the other leg extended straight in front." },
  { name: "High Jump", muscleGroups: ["legs", "cardio"], difficulty: "intermediate", description: "Jump as high as you can, landing softly with bent knees." },
  { name: "Run", muscleGroups: ["cardio", "legs"], description: "Run at a steady, sustainable pace for the given time." },
]

type SeedBlock = {
  type: "circuit" | "interval" | "rest"
  name?: string
  rounds?: number
  restBetweenRounds?: number
  duration?: number
  exercises: { slug: string; reps?: number; duration?: number; restAfter?: number }[]
}

type SeedWorkout = { name: string; description: string; tags: string[]; blocks: SeedBlock[] }

export const SEED_WORKOUTS: SeedWorkout[] = [
  {
    name: "Mythletics Basics",
    description: "A gentle full-body introduction. Learn the core movements with 3 rounds of simple circuits.",
    tags: ["beginner", "full-body"],
    blocks: [
      { type: "circuit", name: "Main", rounds: 3, restBetweenRounds: 45, exercises: [
        { slug: "squat", reps: 12, restAfter: 15 },
        { slug: "incline-push-up", reps: 10, restAfter: 15 },
        { slug: "glute-bridge", reps: 12, restAfter: 15 },
        { slug: "plank", duration: 20, restAfter: 20 },
      ]},
    ],
  },
  {
    name: "Pulse Riser",
    description: "Heart-pumping interval work. 4 rounds of explosive cardio with short rests.",
    tags: ["cardio", "intermediate"],
    blocks: [
      { type: "interval", name: "Go Hard", rounds: 4, restBetweenRounds: 60, exercises: [
        { slug: "jumping-jack", duration: 30, restAfter: 10 },
        { slug: "high-knees", duration: 30, restAfter: 10 },
        { slug: "star-jump", duration: 30, restAfter: 10 },
        { slug: "mountain-climber", duration: 30, restAfter: 10 },
      ]},
    ],
  },
  {
    name: "Core Crusher",
    description: "Blast your midsection. 3 rounds of core work with short breaks.",
    tags: ["core", "intermediate"],
    blocks: [
      { type: "circuit", name: "Core", rounds: 3, restBetweenRounds: 45, exercises: [
        { slug: "crunch", reps: 20, restAfter: 10 },
        { slug: "bicycle-crunch", reps: 16, restAfter: 10 },
        { slug: "russian-twist", reps: 20, restAfter: 10 },
        { slug: "leg-raise", reps: 12, restAfter: 15 },
        { slug: "plank", duration: 30, restAfter: 15 },
      ]},
    ],
  },
  {
    name: "Lower Body Burn",
    description: "Legs and glutes. Expect to feel the burn by round 4.",
    tags: ["legs", "glutes", "intermediate"],
    blocks: [
      { type: "circuit", name: "Legs", rounds: 4, restBetweenRounds: 60, exercises: [
        { slug: "squat", reps: 20, restAfter: 15 },
        { slug: "lunge", reps: 16, restAfter: 15 },
        { slug: "jump-squat", reps: 12, restAfter: 15 },
        { slug: "glute-bridge", reps: 20, restAfter: 15 },
        { slug: "wall-sit", duration: 30, restAfter: 20 },
      ]},
    ],
  },
  {
    name: "Upper Body Power",
    description: "Push and pull. A strength-focused circuit for chest, back, and arms.",
    tags: ["upper-body", "strength"],
    blocks: [
      { type: "circuit", name: "Push / Pull", rounds: 4, restBetweenRounds: 75, exercises: [
        { slug: "push-up", reps: 15, restAfter: 20 },
        { slug: "diamond-push-up", reps: 10, restAfter: 20 },
        { slug: "tricep-dip", reps: 12, restAfter: 20 },
        { slug: "inchworm", reps: 10, restAfter: 20 },
        { slug: "superman-hold", duration: 25, restAfter: 20 },
      ]},
    ],
  },
  {
    name: "Full Beast",
    description: "The ultimate test. 5 rounds of full-body hell for advanced athletes.",
    tags: ["full-body", "advanced"],
    blocks: [
      { type: "interval", name: "Beast Mode", rounds: 5, restBetweenRounds: 90, exercises: [
        { slug: "burpee", reps: 10, restAfter: 15 },
        { slug: "jump-squat", reps: 15, restAfter: 15 },
        { slug: "push-up", reps: 15, restAfter: 15 },
        { slug: "jumping-lunge", reps: 12, restAfter: 15 },
        { slug: "plank", duration: 30, restAfter: 15 },
      ]},
    ],
  },
  {
    name: "Aphrodite",
    description: "The legendary Freeletics benchmark. 5 descending rounds of Burpees, Squats, and Sit-Ups with no breaks. Beat your best time.",
    tags: ["freeletics", "classic", "benchmark", "full-body"],
    blocks: [
      { type: "circuit", name: "Round 1", rounds: 1, exercises: [
        { slug: "burpee", reps: 50 },
        { slug: "squat", reps: 50 },
        { slug: "sit-up", reps: 50 },
      ]},
      { type: "circuit", name: "Round 2", rounds: 1, exercises: [
        { slug: "burpee", reps: 40 },
        { slug: "squat", reps: 40 },
        { slug: "sit-up", reps: 40 },
      ]},
      { type: "circuit", name: "Round 3", rounds: 1, exercises: [
        { slug: "burpee", reps: 30 },
        { slug: "squat", reps: 30 },
        { slug: "sit-up", reps: 30 },
      ]},
      { type: "circuit", name: "Round 4", rounds: 1, exercises: [
        { slug: "burpee", reps: 20 },
        { slug: "squat", reps: 20 },
        { slug: "sit-up", reps: 20 },
      ]},
      { type: "circuit", name: "Round 5", rounds: 1, exercises: [
        { slug: "burpee", reps: 10 },
        { slug: "squat", reps: 10 },
        { slug: "sit-up", reps: 10 },
      ]},
    ],
  },
  {
    name: "Athena",
    description: "5 lightning-fast rounds of Mountain Climbers, Sit-Ups, and Squats. Reps and rest shrink every round — all-out from the start.",
    tags: ["freeletics", "cardio", "core", "legs"],
    blocks: [
      { type: "circuit", name: "Round 1", rounds: 1, exercises: [
        { slug: "mountain-climber", reps: 25 },
        { slug: "sit-up", reps: 25 },
        { slug: "squat", reps: 25 },
      ]},
      { type: "rest", name: "Rest", duration: 25, exercises: [] },
      { type: "circuit", name: "Round 2", rounds: 1, exercises: [
        { slug: "mountain-climber", reps: 20 },
        { slug: "sit-up", reps: 20 },
        { slug: "squat", reps: 20 },
      ]},
      { type: "rest", name: "Rest", duration: 20, exercises: [] },
      { type: "circuit", name: "Round 3", rounds: 1, exercises: [
        { slug: "mountain-climber", reps: 15 },
        { slug: "sit-up", reps: 15 },
        { slug: "squat", reps: 15 },
      ]},
      { type: "rest", name: "Rest", duration: 15, exercises: [] },
      { type: "circuit", name: "Round 4", rounds: 1, exercises: [
        { slug: "mountain-climber", reps: 10 },
        { slug: "sit-up", reps: 10 },
        { slug: "squat", reps: 10 },
      ]},
      { type: "rest", name: "Rest", duration: 10, exercises: [] },
      { type: "circuit", name: "Round 5", rounds: 1, exercises: [
        { slug: "mountain-climber", reps: 5 },
        { slug: "sit-up", reps: 5 },
        { slug: "squat", reps: 5 },
      ]},
    ],
  },
  {
    name: "Artemis",
    description: "One giant set: 50 Burpees, 50 Pull-Ups, 100 Push-Ups, 150 Squats, then 50 more Burpees. A pull-up bar required.",
    tags: ["freeletics", "strength", "advanced"],
    blocks: [
      { type: "circuit", name: "The Gauntlet", rounds: 1, exercises: [
        { slug: "burpee", reps: 50 },
        { slug: "pull-up", reps: 50 },
        { slug: "push-up", reps: 100 },
        { slug: "squat", reps: 150 },
        { slug: "burpee", reps: 50 },
      ]},
    ],
  },
  {
    name: "Dione",
    description: "3 rounds of Jumping Jacks, Burpees, and Leg Levers with Sit-Ups in between. No equipment needed, no breaks.",
    tags: ["freeletics", "cardio", "full-body"],
    blocks: [
      { type: "circuit", name: "Dione", rounds: 3, exercises: [
        { slug: "jumping-jack", reps: 75 },
        { slug: "burpee", reps: 25 },
        { slug: "leg-lever", reps: 50 },
        { slug: "jumping-jack", reps: 75 },
        { slug: "sit-up", reps: 50 },
        { slug: "burpee", reps: 25 },
      ]},
    ],
  },
  {
    name: "Hades",
    description: "Burpees, Pull-Ups, Push-Ups, and an 80m sprint — 3 rounds. Requires a pull-up bar and running space.",
    tags: ["freeletics", "strength", "cardio"],
    blocks: [
      { type: "circuit", name: "Hades", rounds: 3, exercises: [
        { slug: "burpee", reps: 25 },
        { slug: "pull-up", reps: 15 },
        { slug: "push-up", reps: 15 },
        { slug: "burpee", reps: 25 },
        { slug: "run", duration: 20 },
      ]},
    ],
  },
  {
    name: "Iris",
    description: "Bookended by 1km runs, with 5 rounds of Jumping Jacks and Mountain Climbers in between. A true endurance test.",
    tags: ["freeletics", "cardio", "endurance"],
    blocks: [
      { type: "circuit", name: "Run Out", rounds: 1, exercises: [
        { slug: "run", duration: 300 },
      ]},
      { type: "circuit", name: "Intervals", rounds: 5, exercises: [
        { slug: "jumping-jack", reps: 100 },
        { slug: "mountain-climber", reps: 100 },
      ]},
      { type: "circuit", name: "Run Back", rounds: 1, exercises: [
        { slug: "run", duration: 300 },
      ]},
    ],
  },
  {
    name: "Metis",
    description: "Short and savage: Burpees, Mountain Climbers, and High Jumps in a 10-25-10 ladder. No breaks.",
    tags: ["freeletics", "cardio", "short"],
    blocks: [
      { type: "circuit", name: "Round 1", rounds: 1, exercises: [
        { slug: "burpee", reps: 10 },
        { slug: "mountain-climber", reps: 10 },
        { slug: "high-jump", reps: 10 },
      ]},
      { type: "circuit", name: "Round 2", rounds: 1, exercises: [
        { slug: "burpee", reps: 25 },
        { slug: "mountain-climber", reps: 25 },
        { slug: "high-jump", reps: 25 },
      ]},
      { type: "circuit", name: "Round 3", rounds: 1, exercises: [
        { slug: "burpee", reps: 10 },
        { slug: "mountain-climber", reps: 10 },
        { slug: "high-jump", reps: 10 },
      ]},
    ],
  },
  {
    name: "Poseidon",
    description: "Pull-Ups and Push-Ups in a descending 20-15-10-5 ladder. Requires a pull-up bar.",
    tags: ["freeletics", "strength", "upper-body"],
    blocks: [
      { type: "circuit", name: "Round 1", rounds: 1, exercises: [
        { slug: "pull-up", reps: 20 },
        { slug: "push-up", reps: 20 },
      ]},
      { type: "circuit", name: "Round 2", rounds: 1, exercises: [
        { slug: "pull-up", reps: 15 },
        { slug: "push-up", reps: 15 },
      ]},
      { type: "circuit", name: "Round 3", rounds: 1, exercises: [
        { slug: "pull-up", reps: 10 },
        { slug: "push-up", reps: 10 },
      ]},
      { type: "circuit", name: "Round 4", rounds: 1, exercises: [
        { slug: "pull-up", reps: 5 },
        { slug: "push-up", reps: 5 },
      ]},
    ],
  },
  {
    name: "Venus",
    description: "4 rounds of Push-Ups, V-Sits, and Squats. A strength-and-core burner.",
    tags: ["freeletics", "strength", "core"],
    blocks: [
      { type: "circuit", name: "Venus", rounds: 4, exercises: [
        { slug: "push-up", reps: 50 },
        { slug: "v-sit", reps: 20 },
        { slug: "squat", reps: 50 },
      ]},
    ],
  },
  {
    name: "Zeus",
    description: "4 rounds of Handstand Push-Ups, Pull-Ups, Push-Ups, Sit-Ups, and Squats. Mandatory 2 minutes rest between rounds.",
    tags: ["freeletics", "strength", "advanced"],
    blocks: [
      { type: "circuit", name: "Zeus", rounds: 4, restBetweenRounds: 120, exercises: [
        { slug: "handstand-push-up", reps: 5 },
        { slug: "pull-up", reps: 15 },
        { slug: "push-up", reps: 25 },
        { slug: "sit-up", reps: 35 },
        { slug: "squat", reps: 45 },
      ]},
    ],
  },
  {
    name: "Kronos",
    description: "50 of everything: Push-Ups, Squats, Sit-Ups, Leg Levers, and Pull-Ups. A full-body gauntlet.",
    tags: ["freeletics", "full-body", "strength"],
    blocks: [
      { type: "circuit", name: "Kronos", rounds: 1, exercises: [
        { slug: "push-up", reps: 50 },
        { slug: "squat", reps: 50 },
        { slug: "sit-up", reps: 50 },
        { slug: "leg-lever", reps: 50 },
        { slug: "pull-up", reps: 50 },
      ]},
    ],
  },
  {
    name: "Hyperion",
    description: "6 rounds of Handstand Push-Ups, Pull-Ups, One-Arm Push-Ups, and Pistol Squats. Elite-level strength.",
    tags: ["freeletics", "strength", "advanced"],
    blocks: [
      { type: "circuit", name: "Hyperion", rounds: 6, restBetweenRounds: 60, exercises: [
        { slug: "handstand-push-up", reps: 6 },
        { slug: "pull-up", reps: 12 },
        { slug: "one-arm-push-up", reps: 6 },
        { slug: "pistol-squat", reps: 12 },
      ]},
    ],
  },
]

function slugify(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "")
}

export async function runSeed(): Promise<{ exercises: number; workouts: number; programs: number; seeded: boolean }> {
  await dbConnect()
  const already = await SeedDone.findOne({ key: "v2" })
  if (already) {
    return { exercises: await Exercise.countDocuments(), workouts: await Workout.countDocuments(), programs: await Program.countDocuments(), seeded: false }
  }

  const bySlug = new Map<string, string>()
  for (const ex of SEED_EXERCISES) {
    const slug = slugify(ex.name)
    const doc = await Exercise.findOneAndUpdate(
      { slug },
      { $setOnInsert: { ...ex, slug, equipment: ex.equipment ?? "bodyweight", difficulty: ex.difficulty ?? "beginner", demoUrl: "" } },
      { upsert: true, returnDocument: 'after' }
    )
    bySlug.set(slug, String(doc._id))
  }

  for (const w of SEED_WORKOUTS) {
    const blocks = w.blocks.map((b) => ({
      type: b.type,
      name: b.name ?? "",
      rounds: b.rounds ?? 1,
      restBetweenRounds: b.restBetweenRounds ?? 0,
      duration: b.duration,
      exercises: b.exercises
        .filter((e) => bySlug.has(e.slug))
        .map((e) => ({
          exerciseId: bySlug.get(e.slug)!,
          reps: e.reps,
          duration: e.duration,
          restAfter: e.restAfter ?? 0,
        })),
    }))
    await Workout.updateOne({ name: w.name }, { $setOnInsert: { ...w, blocks } }, { upsert: true })
  }

  await seedSampleProgram(bySlug)

  await SeedDone.create({ key: "v2" })
  return {
    exercises: await Exercise.countDocuments(),
    workouts: await Workout.countDocuments(),
    programs: await Program.countDocuments(),
    seeded: true,
  }
}

async function seedSampleProgram(bySlug: Map<string, string>) {
  const workouts = await Workout.find({}).lean()
  const findWorkout = (name: string) => {
    const w = workouts.find((x) => x.name === name)
    return w ? String(w._id) : undefined
  }

  const weeks = [
    { week: 1, theme: "Foundation", days: [
      { day: 1, workoutId: findWorkout("Mythletics Basics") },
      { day: 2, rest: true },
      { day: 3, workoutId: findWorkout("Pulse Riser") },
      { day: 4, rest: true },
      { day: 5, workoutId: findWorkout("Mythletics Basics") },
      { day: 6, rest: true },
      { day: 7, rest: true },
    ]},
    { week: 2, theme: "Build", days: [
      { day: 1, workoutId: findWorkout("Pulse Riser") },
      { day: 2, rest: true },
      { day: 3, workoutId: findWorkout("Core Crusher") },
      { day: 4, rest: true },
      { day: 5, workoutId: findWorkout("Lower Body Burn") },
      { day: 6, rest: true },
      { day: 7, rest: true },
    ]},
    { week: 3, theme: "Strength", days: [
      { day: 1, workoutId: findWorkout("Lower Body Burn") },
      { day: 2, rest: true },
      { day: 3, workoutId: findWorkout("Upper Body Power") },
      { day: 4, rest: true },
      { day: 5, workoutId: findWorkout("Core Crusher") },
      { day: 6, rest: true },
      { day: 7, rest: true },
    ]},
    { week: 4, theme: "Peak", days: [
      { day: 1, workoutId: findWorkout("Full Beast") },
      { day: 2, rest: true },
      { day: 3, workoutId: findWorkout("Upper Body Power") },
      { day: 4, rest: true },
      { day: 5, workoutId: findWorkout("Full Beast") },
      { day: 6, rest: true },
      { day: 7, rest: true },
    ]},
  ]

  const program = await Program.findOneAndUpdate(
    { name: "4-Week Foundation" },
    {
      $setOnInsert: {
        name: "4-Week Foundation",
        description: "A progressive 4-week plan to build your baseline. Train 3 days a week, rest in between.",
        difficulty: "beginner",
        aiGenerated: false,
        weeks,
      },
    },
    { upsert: true, returnDocument: 'after' }
  )
  void bySlug
  return program
}
