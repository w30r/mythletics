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
    return workouts.filter((w) => !q || w.name.toLowerCase().includes(q.toLowerCase()))
  }, [workouts, q])

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
              {filteredWorkouts.map((w) => {
                const exerciseCount = w.blocks.reduce((a, b) => a + b.exercises.length, 0)
                return (
                  <Card key={w._id} className="group relative">
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      className="absolute right-2 top-2 text-muted-foreground transition-opacity sm:opacity-0 sm:group-hover:opacity-100"
                      onClick={() => deleteWorkout(w._id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                    <Link href={`/workout/${w._id}`}>
                      <CardHeader>
                        <CardTitle className="pr-12 text-base">{w.name}</CardTitle>
                        <CardDescription className="line-clamp-2">{w.description || "No description"}</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="flex flex-wrap items-center gap-2">
                          <Badge variant="secondary">
                            {w.blocks.length} block{w.blocks.length !== 1 ? "s" : ""}
                          </Badge>
                          <Badge variant="outline">{exerciseCount} exercises</Badge>
                          {w.tags?.slice(0, 2).map((t) => (
                            <Badge key={t} variant="outline">
                              {t}
                            </Badge>
                          ))}
                        </div>
                      </CardContent>
                    </Link>
                  </Card>
                )
              })}
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

function EmptyState() {
  return (
    <div className="flex flex-col items-center gap-2 py-16 text-center">
      <ListChecks className="h-10 w-10 text-muted-foreground" />
      <p className="text-sm text-muted-foreground">Nothing here yet.</p>
    </div>
  )
}
