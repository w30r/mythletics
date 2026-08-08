import Link from "next/link"
import { Moon, Dumbbell, Sparkles } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { buttonVariants } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { getActiveProgress } from "@/lib/program-progress"
import { computeStats, formatMinutes } from "@/lib/stats"
import { dbConnect } from "@/lib/db"
import { WorkoutSession } from "@/lib/models"
import { RecentSessions } from "@/components/recent-sessions"

export const dynamic = "force-dynamic"

function SectionLabel({ index, children }: { index?: string; children: React.ReactNode }) {
  return (
    <div className="flex items-baseline gap-3">
      {index && <span className="font-mono text-xs tracking-[0.15em] text-primary">{index}</span>}
      <h2 className="font-mono text-sm uppercase tracking-[0.3em] text-foreground">{children}</h2>
    </div>
  )
}

export default async function DashboardPage() {
  const { getSessionUser } = await import("@/lib/auth")
  const user = await getSessionUser()
  if (!user) return null
  const userId = String(user._id)
  const firstName = (user.name ?? user.email ?? "").split(" ")[0]

  const [active, stats, recent] = await Promise.all([
    getActiveProgress(userId),
    computeStats(userId),
    (async () => {
      await dbConnect()
      return WorkoutSession.find({ userId, completed: true })
        .sort({ date: -1 })
        .limit(5)
        .select("workoutId workoutName date duration rating")
        .lean()
    })(),
  ])

  const today = active?.today

  return (
    <div className="space-y-10">
      <header className="space-y-2">
        <h1 className="font-display text-4xl font-medium leading-none tracking-tight text-foreground sm:text-5xl">
          Dashboard
        </h1>
        <p className="font-mono text-xs uppercase tracking-[0.25em] text-muted-foreground">
          Welcome back, {firstName} — here&apos;s your training at a glance
        </p>
      </header>

      <section className="space-y-4">
        <SectionLabel index="01">Your numbers</SectionLabel>
        {stats.totalSessions === 0 && (
          <p className="max-w-md text-sm text-muted-foreground">
            Complete your first workout and your streak, volume, and records will start to grow.
          </p>
        )}
        <div className="grid grid-cols-2 divide-x divide-border border border-border lg:grid-cols-4">
          {[
            { label: "Streak", value: stats.streak > 0 ? String(stats.streak) : "—" },
            { label: "Total time", value: formatMinutes(stats.totalTime) },
            { label: "Sessions", value: String(stats.totalSessions) },
            { label: "Reps logged", value: stats.totalReps.toLocaleString() },
          ].map((stat) => (
            <div key={stat.label} className="p-5 sm:p-6">
              <p className="font-mono text-[11px] uppercase tracking-[0.3em] text-muted-foreground">{stat.label}</p>
              <p className="mt-3 font-display text-4xl leading-none tabular-nums text-foreground">{stat.value}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="space-y-4">
        <SectionLabel index="02">Today&apos;s workout</SectionLabel>
        <Card className="h-full">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              {today?.rest ? (
                <Moon className="h-4 w-4 text-primary" />
              ) : (
                <Dumbbell className="h-4 w-4 text-primary" />
              )}
              Today&apos;s workout
            </CardTitle>
            <CardDescription>
              {active
                ? `${active.program.name} — Week ${today?.week}, Day ${today?.day}`
                : "No active program"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {!active ? (
              <div className="flex flex-col items-center gap-4 py-6 text-center">
                <p className="text-sm text-muted-foreground">
                  You haven&apos;t started a program yet. Pick a plan or train a workout on your own.
                </p>
                <div className="flex flex-wrap justify-center gap-2">
                  <Link href="/programs" className={buttonVariants()}>
                    Browse programs
                  </Link>
                  <Link href="/workouts" className={buttonVariants({ variant: "outline" })}>
                    Workout library
                  </Link>
                </div>
              </div>
            ) : today?.rest ? (
              <div className="flex flex-col items-center gap-2 py-6 text-center">
                <p className="text-lg font-medium">{today.note || "Recovery is part of progress."}</p>
              </div>
            ) : today?.workout ? (
              <div className="space-y-4">
                <div>
                  <h3 className="font-display text-2xl font-medium tracking-tight text-foreground">
                    {today.workout.name}
                  </h3>
                  <p className="mt-1 font-mono text-xs uppercase tracking-[0.2em] text-muted-foreground">
                    {today.workout.blocks.length} block{today.workout.blocks.length !== 1 ? "s" : ""} ·{" "}
                    {today.workout.blocks.reduce((a, b) => a + b.exercises.length, 0)} exercises
                  </p>
                </div>
                <Link
                  href={`/session/${today.workout._id}?from=program&programId=${active.program._id}`}
                  className={cn(buttonVariants(), "w-full sm:w-auto")}
                >
                  Start session
                </Link>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No workout scheduled today.</p>
            )}
          </CardContent>
        </Card>
      </section>

      <section className="space-y-4">
        <SectionLabel index="03">Recent sessions</SectionLabel>
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Recent sessions</CardTitle>
          </CardHeader>
          <CardContent>
            <RecentSessions
              items={recent.map((s) => ({
                _id: String(s._id),
                workoutId: s.workoutId ? String(s.workoutId) : undefined,
                name: s.workoutName || undefined,
                meta: `${new Date(s.date).toLocaleDateString(undefined, { month: "short", day: "numeric" })} · ${formatMinutes(s.duration ?? 0)}`,
                rating: s.rating ?? null,
              }))}
            />
          </CardContent>
        </Card>
      </section>

      <div className="flex flex-wrap gap-2 border-t border-border pt-6">
        <Link href="/coach" className={buttonVariants()}>
          <Sparkles className="h-4 w-4" /> Ask the AI coach
        </Link>
        <Link href="/workouts/new" className={buttonVariants({ variant: "outline" })}>
          Build a workout
        </Link>
      </div>
    </div>
  )
}
