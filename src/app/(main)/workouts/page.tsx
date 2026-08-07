"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { AlertCircle, Plus, RotateCcw, Search, Trash2, ListChecks, Dumbbell } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button, buttonVariants } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Skeleton } from "@/components/ui/skeleton"
import { toast } from "sonner"
import type { ClientWorkout, ClientExercise } from "@/lib/client-types"
import { cn } from "@/lib/utils"

const difficultyColor: Record<string, string> = {
  beginner: "bg-green-500/15 text-green-600 dark:text-green-400",
  intermediate: "bg-amber-500/15 text-amber-600 dark:text-amber-400",
  advanced: "bg-red-500/15 text-red-600 dark:text-red-400",
}

export default function WorkoutsPage() {
  const [workouts, setWorkouts] = useState<ClientWorkout[] | null>(null)
  const [exercises, setExercises] = useState<ClientExercise[] | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [reload, setReload] = useState(0)
  const [q, setQ] = useState("")
  const [muscle, setMuscle] = useState("")
  const [tag, setTag] = useState("")

  useEffect(() => {
    let cancelled = false
    async function load() {
      setError(null)
      try {
        const [wRes, eRes] = await Promise.all([fetch("/api/workouts"), fetch("/api/exercises")])
        if (!wRes.ok || !eRes.ok) throw new Error("Failed to load library data")
        const [w, e] = await Promise.all([wRes.json(), eRes.json()])
        if (!cancelled) {
          setWorkouts(w)
          setExercises(e)
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Something went wrong")
          setWorkouts([])
          setExercises([])
        }
      }
    }
    load()
    return () => {
      cancelled = true
    }
  }, [reload])

  const muscleGroups = useMemo(() => {
    if (!exercises) return []
    return [...new Set(exercises.flatMap((e) => e.muscleGroups))].sort()
  }, [exercises])

  const exerciseMap = useMemo(() => {
    const m = new Map<string, ClientExercise>()
    for (const e of exercises ?? []) m.set(e._id, e)
    return m
  }, [exercises])

  const tagOptions = useMemo(() => {
    if (!workouts) return []
    return [...new Set(workouts.flatMap((w) => w.tags ?? []))].sort()
  }, [workouts])

  const filteredExercises = useMemo(() => {
    if (!exercises) return []
    return exercises.filter((e) => {
      const matchQ = !q || e.name.toLowerCase().includes(q.toLowerCase())
      const matchM = !muscle || e.muscleGroups.includes(muscle)
      return matchQ && matchM
    })
  }, [exercises, q, muscle])

  const filteredWorkouts = useMemo(() => {
    if (!workouts) return []
    return workouts.filter((w) => {
      const matchQ = !q || w.name.toLowerCase().includes(q.toLowerCase())
      const matchTag = !tag || w.tags?.includes(tag)
      return matchQ && matchTag
    })
  }, [workouts, q, tag])

  async function deleteWorkout(id: string) {
    if (!confirm("Delete this workout?")) return
    await fetch(`/api/workouts/${id}`, { method: "DELETE" })
    setWorkouts((prev) => prev?.filter((w) => w._id !== id) ?? null)
    toast.success("Workout deleted")
  }

  async function deleteExercise(id: string) {
    if (!confirm("Delete this exercise?")) return
    await fetch(`/api/exercises/${id}`, { method: "DELETE" })
    setExercises((prev) => prev?.filter((e) => e._id !== id) ?? null)
    toast.success("Exercise deleted")
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Workout library</h1>
          <p className="text-muted-foreground">Train on your own terms</p>
        </div>
        <Link href="/workouts/new" className={buttonVariants()}>
          <Plus className="h-4 w-4" /> Build workout
        </Link>
      </div>

      <div className="flex max-w-md items-center gap-2">
        <Search className="h-4 w-4 text-muted-foreground" />
        <Input placeholder="Search workouts or exercises..." value={q} onChange={(e) => setQ(e.target.value)} />
      </div>

      {error && (
        <div className="flex flex-col items-start gap-3 rounded-lg border border-destructive/40 bg-destructive/10 p-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-2">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-destructive" />
            <p className="text-sm text-destructive">
              Couldn&apos;t load the library: {error}. Check your connection and try again.
            </p>
          </div>
          <Button variant="secondary" size="sm" onClick={() => setReload((r) => r + 1)}>
            <RotateCcw className="h-4 w-4" /> Retry
          </Button>
        </div>
      )}

      <Tabs defaultValue="workouts">
        <TabsList>
          <TabsTrigger value="workouts">Workouts</TabsTrigger>
          <TabsTrigger value="exercises">Exercises</TabsTrigger>
        </TabsList>

        <TabsContent value="workouts" className="pt-4">
          {tagOptions.length > 0 && (
            <div className="mb-4 flex flex-wrap gap-2">
              <Button variant={tag === "" ? "secondary" : "ghost"} size="sm" onClick={() => setTag("")}>
                All
              </Button>
              {tagOptions.map((t) => (
                <Button key={t} variant={tag === t ? "secondary" : "ghost"} size="sm" onClick={() => setTag(t)}>
                  {t.charAt(0).toUpperCase() + t.slice(1)}
                </Button>
              ))}
            </div>
          )}
          {!workouts ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {[...Array(6)].map((_, i) => (
                <Skeleton key={i} className="h-36" />
              ))}
            </div>
          ) : filteredWorkouts.length === 0 ? (
            <EmptyState />
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {filteredWorkouts.map((w) => (
                <WorkoutCard key={w._id} workout={w} exerciseMap={exerciseMap} onDelete={() => deleteWorkout(w._id)} />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="exercises" className="pt-4">
          {muscleGroups.length > 0 && (
            <div className="mb-4 flex flex-wrap gap-2">
              <Button variant={muscle === "" ? "secondary" : "ghost"} size="sm" onClick={() => setMuscle("")}>
                All
              </Button>
              {muscleGroups.map((m) => (
                <Button key={m} variant={muscle === m ? "secondary" : "ghost"} size="sm" onClick={() => setMuscle(m)}>
                  {m.charAt(0).toUpperCase() + m.slice(1)}
                </Button>
              ))}
            </div>
          )}
          {!exercises ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {[...Array(9)].map((_, i) => (
                <Skeleton key={i} className="h-28" />
              ))}
            </div>
          ) : filteredExercises.length === 0 ? (
            <EmptyState />
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {filteredExercises.map((e) => (
                <Card key={e._id} className="group relative">
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    className="absolute right-2 top-2 text-muted-foreground transition-opacity sm:opacity-0 sm:group-hover:opacity-100"
                    onClick={() => deleteExercise(e._id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                  <CardHeader>
                    <div className="flex items-start justify-between gap-2">
                      <CardTitle className="flex items-center gap-2 text-base">
                        <Dumbbell className="h-4 w-4 text-primary" />
                        {e.name}
                      </CardTitle>
                      <Badge className={cn("shrink-0", difficultyColor[e.difficulty])}>{e.difficulty}</Badge>
                    </div>
                    <CardDescription className="line-clamp-2">{e.description || e.equipment}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-1.5">
                      {e.muscleGroups.slice(0, 4).map((m) => (
                        <Badge key={m} variant="outline" className="text-xs">
                          {m}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}

function WorkoutCard({
  workout,
  exerciseMap,
  onDelete,
}: {
  workout: ClientWorkout
  exerciseMap: Map<string, ClientExercise>
  onDelete: () => void
}) {
  const exerciseCount = workout.blocks.reduce((a, b) => a + b.exercises.length, 0)
  const totalRounds = workout.blocks.reduce((a, b) => a + (b.rounds ?? 1), 0)
  const muscleSet = new Set<string>()
  let timedCount = 0
  let repCount = 0
  for (const block of workout.blocks) {
    for (const ex of block.exercises) {
      const m = exerciseMap.get(ex.exerciseId)
      m?.muscleGroups.forEach((mg) => muscleSet.add(mg))
      if (ex.duration) timedCount += 1
      if (ex.reps) repCount += 1
    }
  }
  const muscleParts = [...muscleSet].slice(0, 3)

  return (
    <Card className="group relative">
      <Button
        variant="ghost"
        size="icon-sm"
        className="absolute right-2 top-2 text-muted-foreground transition-opacity sm:opacity-0 sm:group-hover:opacity-100"
        onClick={onDelete}
      >
        <Trash2 className="h-4 w-4" />
      </Button>
      <Link href={`/workout/${workout._id}`}>
        <CardHeader>
          <CardTitle className="pr-12 text-base">{workout.name}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="secondary">
              {totalRounds} round{totalRounds !== 1 ? "s" : ""}
            </Badge>
            <Badge variant="outline">{exerciseCount} exercises</Badge>
            {repCount > 0 && (
              <Badge variant="outline">
                {repCount} rep-based
              </Badge>
            )}
            {timedCount > 0 && (
              <Badge variant="outline">{timedCount} timed</Badge>
            )}
          </div>
          {muscleParts.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-1.5">
              {muscleParts.map((m) => (
                <Badge key={m} variant="outline" className="text-xs">
                  {m}
                </Badge>
              ))}
            </div>
          )}
        </CardContent>
      </Link>
    </Card>
  )
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center gap-2 py-16 text-center">
      <ListChecks className="h-10 w-10 text-muted-foreground" />
      <p className="text-sm text-muted-foreground">Nothing here yet.</p>
    </div>
  )
}
