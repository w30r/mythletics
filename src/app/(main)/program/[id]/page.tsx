"use client"

import { useEffect, useState, use } from "react"
import Link from "next/link"
import { Sparkles, Play, Check, Dumbbell, ChevronRight } from "lucide-react"
import { buttonVariants } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { cn } from "@/lib/utils"
import { toast } from "sonner"
import type { ClientProgram, ActiveProgress } from "@/lib/client-types"

export default function ProgramDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const [program, setProgram] = useState<ClientProgram | null>(null)
  const [active, setActive] = useState<ActiveProgress | null>(null)

  useEffect(() => {
    Promise.all([fetch(`/api/programs/${id}`).then((r) => r.json()), fetch("/api/program-progress").then((r) => r.json())]).then(
      ([program, progress]) => {
        setProgram(program)
        setActive(progress.progress ? progress : null)
      }
    )
  }, [id])

  if (!program) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-32" />
        <Skeleton className="h-64" />
      </div>
    )
  }

  const isActive = active?.program._id === program._id && active.progress.status === "active"
  const completedSet = new Set((active?.progress.completedDays ?? []).map((c) => `${c.week}-${c.day}`))
  const todayWeek = isActive ? active.progress.currentWeek : 1
  const todayDay = isActive ? active.progress.currentDay : 1

  const start = async () => {
    const res = await fetch("/api/program-progress", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ programId: program._id }),
    })
    if (res.ok) {
      toast.success("Program started")
      const data = await res.json()
      window.location.href = `/program/${program._id}?started=1&progressId=${data._id}`
    } else {
      const err = await res.json().catch(() => ({}))
      toast.error(err.error ?? "Could not start program")
    }
  }

  const defaultWeek = `week-${todayWeek}`

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight">{program.name}</h1>
            {program.aiGenerated && (
              <Badge variant="outline" className="gap-1">
                <Sparkles className="h-3 w-3" /> AI generated
              </Badge>
            )}
          </div>
          <p className="mt-1 max-w-2xl text-muted-foreground">{program.description || "No description"}</p>
          <div className="mt-2 flex flex-wrap gap-2">
            <Badge variant="secondary">{program.weeks.length} weeks</Badge>
            {program.difficulty && <Badge variant="secondary">{program.difficulty}</Badge>}
          </div>
        </div>
        {!isActive && (
          <button onClick={start} className={buttonVariants({ size: "lg" })}>
            <Play className="h-4 w-4" /> Start this program
          </button>
        )}
      </div>

      {isActive && (
        <Card className="border-primary/30 bg-primary/5">
          <CardContent className="flex flex-wrap items-center justify-between gap-3 p-4">
            <p className="text-sm font-medium">
              You are on Week {active.progress.currentWeek}, Day {active.progress.currentDay}.
              {active.today.rest
                ? " Rest day — recover well."
                : active.today.workout
                  ? ` Today: ${active.today.workout.name}.`
                  : ""}
            </p>
            {!active.today.rest && active.today.workout && (
              <Link
                href={`/session/${active.today.workout._id}?from=program&programId=${program._id}`}
                className={buttonVariants()}
              >
                <Play className="h-4 w-4" /> Start today&apos;s session
              </Link>
            )}
          </CardContent>
        </Card>
      )}

      <Tabs defaultValue={defaultWeek}>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <TabsList>
            {program.weeks.map((w) => (
              <TabsTrigger key={w._id ?? w.week} value={`week-${w.week}`}>
                Week {w.week}
              </TabsTrigger>
            ))}
          </TabsList>
        </div>
        {program.weeks.map((w) => (
          <TabsContent key={w._id ?? w.week} value={`week-${w.week}`}>
            {w.theme && <p className="mb-3 text-sm font-medium text-muted-foreground">{w.theme}</p>}
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {w.days.map((d) => {
                const isCompleted = completedSet.has(`${w.week}-${d.day}`)
                const isToday = isActive && w.week === todayWeek && d.day === todayDay
                return (
                  <Card key={d._id ?? d.day} className={cn(isToday && "border-primary ring-1 ring-primary/30")}>
                    <CardHeader className="pb-2">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-sm">Day {d.day}</CardTitle>
                        {isCompleted ? (
                          <Badge variant="secondary" className="gap-1">
                            <Check className="h-3 w-3" /> Done
                          </Badge>
                        ) : isToday ? (
                          <Badge>Today</Badge>
                        ) : null}
                      </div>
                    </CardHeader>
                    <CardContent className="pt-0">
                      {d.rest ? (
                        <div className="flex items-center gap-2 py-2 text-muted-foreground">
                          <span className="text-sm">Rest day</span>
                        </div>
                      ) : d.workoutName ? (
                        <Link
                          href={`/workout/${d.workoutId}`}
                          className={cn(
                            buttonVariants({ variant: "ghost" }),
                            "h-auto w-full justify-start gap-2 px-2 py-2 text-left font-normal"
                          )}
                        >
                          <Dumbbell className="h-4 w-4 text-primary" />
                          <span className="text-sm font-medium">{d.workoutName}</span>
                          <ChevronRight className="ml-auto h-4 w-4 text-muted-foreground" />
                        </Link>
                      ) : (
                        <p className="py-2 text-sm text-muted-foreground">No workout</p>
                      )}
                      {d.note && <p className="mt-1 text-xs text-muted-foreground">{d.note}</p>}
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          </TabsContent>
        ))}
      </Tabs>

      <div>
        <CardDescription>
          <p>
            This is a <strong>{program.weeks.length}-week</strong> program. Start it to begin tracking your progress
            day by day.
          </p>
        </CardDescription>
      </div>
    </div>
  )
}
