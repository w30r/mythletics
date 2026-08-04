import Link from "next/link"
import { Flame, Clock, Dumbbell, Activity, ChevronRight, Sparkles } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { buttonVariants } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { getActiveProgress } from "@/lib/program-progress"
import { computeStats, formatMinutes } from "@/lib/stats"
import { dbConnect } from "@/lib/db"
import { WorkoutSession } from "@/lib/models"

export const dynamic = "force-dynamic"

export default async function DashboardPage() {
  const { getSessionUserId } = await import("@/lib/auth")
  const userId = await getSessionUserId()
  if (!userId) return null

  const [active, stats, recent] = await Promise.all([
    getActiveProgress(userId),
    computeStats(userId),
    (async () => {
      await dbConnect()
      return WorkoutSession.find({ userId, completed: true })
        .sort({ date: -1 })
        .limit(5)
        .select("workoutId date duration rating")
        .lean()
    })(),
  ])

  const today = active?.today
  const statCards = [
    { label: "Streak", value: `${stats.streak}`, sub: "days", icon: Flame, color: "text-orange-500" },
    { label: "Total time", value: formatMinutes(stats.totalTime), sub: "trained", icon: Clock, color: "text-blue-500" },
    { label: "Sessions", value: String(stats.totalSessions), sub: "completed", icon: Dumbbell, color: "text-green-500" },
    { label: "Reps logged", value: stats.totalReps.toLocaleString(), sub: "all-time", icon: Activity, color: "text-purple-500" },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">Your training at a glance</p>
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {statCards.map((c) => (
          <Card key={c.label}>
            <CardContent className="flex items-center gap-4 p-4">
              <div className={`rounded-lg bg-muted p-2 ${c.color}`}>
                <c.icon className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">{c.label}</p>
                <p className="text-xl font-bold leading-tight">
                  {c.value} <span className="text-xs font-normal text-muted-foreground">{c.sub}</span>
                </p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <Card className="h-full">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                {today?.rest ? <Flame className="h-5 w-5 text-orange-500" /> : <Dumbbell className="h-5 w-5 text-primary" />}
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
                <div className="flex flex-col items-center gap-3 py-6 text-center">
                  <p className="text-sm text-muted-foreground">
                    You haven&apos;t started a program yet. Pick a plan or train a workout on your own.
                  </p>
                  <div className="flex gap-2">
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
                  <p className="text-lg font-medium">Rest day</p>
                  <p className="text-sm text-muted-foreground">{today.note || "Recovery is part of progress."}</p>
                </div>
              ) : today?.workout ? (
                <div className="space-y-4">
                  <div>
                    <h3 className="text-lg font-semibold">{today.workout.name}</h3>
                    <p className="text-sm text-muted-foreground">
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
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Recent sessions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {recent.length === 0 ? (
              <p className="text-sm text-muted-foreground">No sessions yet. Complete your first workout!</p>
            ) : (
              recent.map((s) => (
                <div key={String(s._id)} className="flex items-center justify-between border-b pb-2 last:border-0">
                  <div>
                    <p className="text-sm font-medium">{s.workoutId ? "Workout session" : "Workout session"}</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(s.date).toLocaleDateString(undefined, { month: "short", day: "numeric" })} ·{" "}
                      {formatMinutes(s.duration ?? 0)}
                    </p>
                  </div>
                  {s.rating ? (
                    <Badge variant="secondary">{s.rating}/10</Badge>
                  ) : (
                    <Badge variant="outline">Done</Badge>
                  )}
                </div>
              ))
            )}
            {recent.length > 0 ? (
              <Link href="/progress" className={cn(buttonVariants({ variant: "ghost" }), "w-full justify-between")}>
                View analytics <ChevronRight className="h-4 w-4" />
              </Link>
            ) : null}
          </CardContent>
        </Card>
      </div>

      <div className="flex flex-wrap gap-3">
        <Link href="/coach" className={buttonVariants({ variant: "outline" })}>
          <Sparkles className="h-4 w-4" /> Ask the AI coach
        </Link>
        <Link href="/workouts/new" className={buttonVariants({ variant: "outline" })}>
          Build a workout
        </Link>
      </div>
    </div>
  )
}
