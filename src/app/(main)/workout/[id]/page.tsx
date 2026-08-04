"use client"

import { useEffect, useState, use } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, Play, Pencil, Trash2, Clock } from "lucide-react"
import { Button, buttonVariants } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { toast } from "sonner"
import WorkoutBuilder from "@/components/workout-builder"
import type { ClientWorkout } from "@/lib/client-types"
import { cn } from "@/lib/utils"

export default function WorkoutDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const router = useRouter()
  const [workout, setWorkout] = useState<ClientWorkout | null>(null)
  const [editing, setEditing] = useState(false)
  const [notFound, setNotFound] = useState(false)

  useEffect(() => {
    fetch(`/api/workouts/${id}`)
      .then(async (r) => {
        if (!r.ok) {
          setNotFound(true)
          return null
        }
        return r.json()
      })
      .then(setWorkout)
  }, [id])

  async function remove() {
    if (!confirm("Delete this workout?")) return
    await fetch(`/api/workouts/${id}`, { method: "DELETE" })
    toast.success("Workout deleted")
    router.push("/workouts")
    router.refresh()
  }

  if (notFound) {
    return (
      <div className="py-16 text-center">
        <p className="text-muted-foreground">Workout not found.</p>
        <Button variant="outline" className="mt-4" onClick={() => router.push("/workouts")}>
          Back to library
        </Button>
      </div>
    )
  }

  if (editing && workout) {
    return <WorkoutBuilder workout={workout} />
  }

  if (!workout) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-4 w-72" />
        <div className="grid gap-4 sm:grid-cols-2">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon-sm" onClick={() => router.push("/workouts")}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold tracking-tight">{workout.name}</h1>
          <p className="text-muted-foreground">{workout.description || "No description"}</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => setEditing(true)}>
            <Pencil className="h-4 w-4" /> Edit
          </Button>
          <Button variant="ghost" size="icon-sm" onClick={remove}>
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        {workout.tags?.map((t) => (
          <Badge key={t} variant="outline">
            {t}
          </Badge>
        ))}
      </div>

      <div className="space-y-4">
        {workout.blocks.map((block, bi) => {
          if (block.type === "rest") {
            return (
              <div key={block._id ?? bi} className="rounded-lg border border-dashed p-4 text-center">
                <p className="font-medium">{block.name || "Rest"}</p>
                <p className="text-sm text-muted-foreground">
                  <Clock className="mr-1 inline h-4 w-4" />
                  {block.duration}s
                </p>
              </div>
            )
          }
          return (
            <div key={block._id ?? bi} className="rounded-lg border p-4">
              <div className="mb-3 flex items-center gap-2">
                <Badge>{block.type === "interval" ? "Interval" : "Circuit"}</Badge>
                <span className="font-medium">{block.name || `Block ${bi + 1}`}</span>
                <span className="text-sm text-muted-foreground">
                  {block.rounds} round{block.rounds !== 1 ? "s" : ""}
                  {block.restBetweenRounds ? ` · ${block.restBetweenRounds}s between rounds` : ""}
                </span>
              </div>
              <div className="divide-y">
                {block.exercises.map((e, ei) => (
                  <div key={e.exerciseId + ei} className="flex items-center justify-between py-2">
                    <div>
                      <p className="font-medium">{e.exerciseName || "Unknown exercise"}</p>
                      <p className="text-xs text-muted-foreground">
                        {e.reps ? `${e.reps} reps` : ""}
                        {e.reps && e.duration ? " · " : ""}
                        {e.duration ? `${e.duration}s` : ""}
                      </p>
                    </div>
                    {(e.restAfter ?? 0) > 0 && <span className="text-xs text-muted-foreground">{e.restAfter}s rest</span>}
                  </div>
                ))}
              </div>
            </div>
          )
        })}
      </div>

      <a
        href={`/session/${workout._id}`}
        className={cn(buttonVariants({ size: "lg" }), "w-full sm:w-auto")}
      >
        <Play className="h-4 w-4" /> Start guided session
      </a>
    </div>
  )
}
