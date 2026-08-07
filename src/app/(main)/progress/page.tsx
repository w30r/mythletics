import { Flame, Clock, Dumbbell, Activity, CalendarCheck, Timer, Trophy, ListChecks } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { computeStats, formatMinutes } from "@/lib/stats"
import { formatSeconds } from "@/lib/timer"
import { VolumeChart } from "@/components/volume-chart"
import { SplitHistory } from "@/components/split-history"

export const dynamic = "force-dynamic"

export default async function ProgressPage() {
  const { getSessionUserId } = await import("@/lib/auth")
  const userId = await getSessionUserId()
  if (!userId) return null

  const stats = await computeStats(userId)

  const statCards = [
    { label: "Streak", value: `${stats.streak}`, sub: "days", icon: Flame, color: "text-orange-500" },
    { label: "Total time", value: formatMinutes(stats.totalTime), sub: "trained", icon: Clock, color: "text-blue-500" },
    { label: "Sessions", value: String(stats.totalSessions), sub: "completed", icon: Dumbbell, color: "text-green-500" },
    { label: "Reps logged", value: stats.totalReps.toLocaleString(), sub: "all-time", icon: Activity, color: "text-purple-500" },
    {
      label: "This week",
      value: String(stats.thisWeekSessions),
      sub: `${formatMinutes(stats.thisWeekTime)} trained`,
      icon: CalendarCheck,
      color: "text-cyan-500",
    },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Progress</h1>
        <p className="text-muted-foreground">Your training analytics and personal records</p>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
        {statCards.map((c) => (
          <Card key={c.label}>
            <CardContent className="flex items-center gap-3 p-4">
              <div className={`rounded-lg bg-muted p-2 ${c.color}`}>
                <c.icon className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">{c.label}</p>
                <p className="text-lg font-bold leading-tight">
                  {c.value} <span className="text-xs font-normal text-muted-foreground">{c.sub}</span>
                </p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Timer className="h-5 w-5 text-primary" /> Training volume
          </CardTitle>
          <CardDescription>Minutes trained per day, last 14 days</CardDescription>
        </CardHeader>
        <CardContent>
          <VolumeChart data={stats.daily} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Personal records</CardTitle>
          <CardDescription>Best single-session output per exercise</CardDescription>
        </CardHeader>
        <CardContent>
          {stats.prs.length === 0 ? (
            <p className="py-6 text-center text-sm text-muted-foreground">
              Complete a workout to start logging records. Your PRs will appear here.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-left text-muted-foreground">
                    <th className="py-2 pr-4 font-medium">Exercise</th>
                    <th className="py-2 pr-4 font-medium">Max reps</th>
                    <th className="py-2 pr-4 font-medium">Max weight</th>
                    <th className="py-2 pr-4 font-medium">Max hold</th>
                    <th className="py-2 font-medium">Times done</th>
                  </tr>
                </thead>
                <tbody>
                  {stats.prs.map((pr) => (
                    <tr key={pr.exerciseName} className="border-b last:border-0">
                      <td className="py-2 pr-4 font-medium">{pr.exerciseName}</td>
                      <td className="py-2 pr-4">
                        {pr.maxReps ? (
                          <Badge variant="secondary">{pr.maxReps} reps</Badge>
                        ) : (
                          <span className="text-muted-foreground">—</span>
                        )}
                      </td>
                      <td className="py-2 pr-4">
                        {pr.maxWeight ? (
                          <Badge variant="secondary">{pr.maxWeight} kg</Badge>
                        ) : (
                          <span className="text-muted-foreground">—</span>
                        )}
                      </td>
                      <td className="py-2 pr-4">
                        {pr.maxDuration ? (
                          <Badge variant="secondary">{formatMinutes(pr.maxDuration)}</Badge>
                        ) : (
                          <span className="text-muted-foreground">—</span>
                        )}
                      </td>
                      <td className="py-2 text-muted-foreground">{pr.totalCount}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Trophy className="h-5 w-5 text-primary" /> Workout personal bests
          </CardTitle>
          <CardDescription>Fastest total completion time per workout</CardDescription>
        </CardHeader>
        <CardContent>
          {stats.workoutPbs.length === 0 ? (
            <p className="py-6 text-center text-sm text-muted-foreground">
              Complete a guided workout to start tracking completion-time PBs.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-left text-muted-foreground">
                    <th className="py-2 pr-4 font-medium">Workout</th>
                    <th className="py-2 pr-4 font-medium">Best time</th>
                    <th className="py-2 font-medium">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {stats.workoutPbs.map((pb) => (
                    <tr key={pb.workoutId} className="border-b last:border-0">
                      <td className="py-2 pr-4 font-medium">{pb.workoutName}</td>
                      <td className="py-2 pr-4">
                        <Badge variant="secondary">{formatSeconds(pb.bestTime)}</Badge>
                      </td>
                      <td className="py-2 text-muted-foreground">{pb.date.toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <ListChecks className="h-5 w-5 text-primary" /> Split history
          </CardTitle>
          <CardDescription>Fastest time to reach each round and exercise</CardDescription>
        </CardHeader>
        <CardContent>
          <SplitHistory workouts={stats.workoutSplits} />
        </CardContent>
      </Card>
    </div>
  )
}
