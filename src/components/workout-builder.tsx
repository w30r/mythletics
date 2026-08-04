"use client"

import { useEffect, useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { Plus, Trash2, GripVertical, Save, ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { toast } from "sonner"
import type { ClientExercise, ClientWorkout } from "@/lib/client-types"

type BuilderExercise = {
  key: string
  exerciseId: string
  reps: number
  duration: number
  restAfter: number
}

type BuilderBlock = {
  key: string
  type: "circuit" | "interval" | "rest"
  name: string
  rounds: number
  restBetweenRounds: number
  duration: number
  exercises: BuilderExercise[]
}

const newKey = () => Math.random().toString(36).slice(2)
const emptyBlock = (): BuilderBlock => ({
  key: newKey(),
  type: "circuit",
  name: "",
  rounds: 3,
  restBetweenRounds: 30,
  duration: 0,
  exercises: [],
})

export default function WorkoutBuilder({ workout }: { workout?: ClientWorkout }) {
  const router = useRouter()
  const [exercises, setExercises] = useState<ClientExercise[]>([])
  const [name, setName] = useState(workout?.name ?? "")
  const [description, setDescription] = useState(workout?.description ?? "")
  const [tags, setTags] = useState(workout?.tags?.join(", ") ?? "")
  const [blocks, setBlocks] = useState<BuilderBlock[]>(() =>
    workout
      ? workout.blocks.map((b) => ({
          key: b._id ?? newKey(),
          type: b.type,
          name: b.name ?? "",
          rounds: b.rounds ?? 1,
          restBetweenRounds: b.restBetweenRounds ?? 0,
          duration: b.duration ?? 0,
          exercises: b.exercises.map((e) => ({
            key: newKey(),
            exerciseId: e.exerciseId,
            reps: e.reps ?? 0,
            duration: e.duration ?? 0,
            restAfter: e.restAfter ?? 0,
          })),
        }))
      : [emptyBlock()]
  )
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    fetch("/api/exercises")
      .then((r) => r.json())
      .then(setExercises)
  }, [])

  const exerciseMap = useMemo(() => new Map(exercises.map((e) => [e._id, e])), [exercises])

  function updateBlock(key: string, patch: Partial<BuilderBlock>) {
    setBlocks((prev) => prev.map((b) => (b.key === key ? { ...b, ...patch } : b)))
  }

  function updateExercise(blockKey: string, exKey: string, patch: Partial<BuilderExercise>) {
    setBlocks((prev) =>
      prev.map((b) =>
        b.key === blockKey
          ? { ...b, exercises: b.exercises.map((e) => (e.key === exKey ? { ...e, ...patch } : e)) }
          : b
      )
    )
  }

  function addExercise(blockKey: string) {
    setBlocks((prev) =>
      prev.map((b) =>
        b.key === blockKey
          ? { ...b, exercises: [...b.exercises, { key: newKey(), exerciseId: "", reps: 10, duration: 0, restAfter: 15 }] }
          : b
      )
    )
  }

  function removeExercise(blockKey: string, exKey: string) {
    setBlocks((prev) => prev.map((b) => (b.key === blockKey ? { ...b, exercises: b.exercises.filter((e) => e.key !== exKey) } : b)))
  }

  function moveExercise(blockKey: string, index: number, dir: -1 | 1) {
    setBlocks((prev) =>
      prev.map((b) => {
        if (b.key !== blockKey) return b
        const arr = [...b.exercises]
        const target = index + dir
        if (target < 0 || target >= arr.length) return b
        ;[arr[index], arr[target]] = [arr[target], arr[index]]
        return { ...b, exercises: arr }
      })
    )
  }

  function totalExerciseCount() {
    return blocks.reduce((a, b) => a + b.exercises.length, 0)
  }

  async function save() {
    if (!name.trim()) {
      toast.error("Give your workout a name")
      return
    }
    for (const b of blocks) {
      if (b.type === "rest") continue
      for (const e of b.exercises) {
        if (!e.exerciseId) {
          toast.error("Every exercise needs to be selected")
          return
        }
      }
    }
    const payload = {
      name: name.trim(),
      description: description.trim(),
      tags: tags.split(",").map((t) => t.trim()).filter(Boolean),
      blocks: blocks.map((b) => ({
        type: b.type,
        name: b.name,
        rounds: b.type === "rest" ? 1 : b.rounds,
        restBetweenRounds: b.type === "rest" ? 0 : b.restBetweenRounds,
        duration: b.type === "rest" ? Math.max(b.duration, 10) : undefined,
        exercises:
          b.type === "rest"
            ? []
            : b.exercises.map((e) => ({
                exerciseId: e.exerciseId,
                reps: e.reps > 0 ? e.reps : undefined,
                duration: e.duration > 0 ? e.duration : undefined,
                restAfter: e.restAfter,
              })),
      })),
    }
    setSaving(true)
    try {
      const res = await fetch(workout ? `/api/workouts/${workout._id}` : "/api/workouts", {
        method: workout ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })
      const data = await res.json()
      if (!res.ok) {
        toast.error(data.error ?? "Failed to save")
        return
      }
      toast.success(workout ? "Workout updated" : "Workout created")
      router.push(`/workout/${data._id}`)
      router.refresh()
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon-sm" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h1 className="text-2xl font-bold tracking-tight">{workout ? "Edit workout" : "Build workout"}</h1>
      </div>

      <Card>
        <CardContent className="space-y-4 pt-4">
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input id="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Morning Burn" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="desc">Description</Label>
            <Textarea id="desc" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="What should athletes know?" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="tags">Tags (comma separated)</Label>
            <Input id="tags" value={tags} onChange={(e) => setTags(e.target.value)} placeholder="full-body, cardio, beginner" />
          </div>
        </CardContent>
      </Card>

      <div className="space-y-4">
        {blocks.map((b) => (
          <Card key={b.key}>
            <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex flex-wrap items-center gap-2">
                <GripVertical className="h-4 w-4 text-muted-foreground" />
                <Select value={b.type} onValueChange={(v) => updateBlock(b.key, { type: v as BuilderBlock["type"] })}>
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="circuit">Circuit</SelectItem>
                    <SelectItem value="interval">Interval</SelectItem>
                    <SelectItem value="rest">Rest</SelectItem>
                  </SelectContent>
                </Select>
                <Input
                  className="w-full sm:w-44"
                  placeholder="Block name"
                  value={b.name}
                  onChange={(e) => updateBlock(b.key, { name: e.target.value })}
                />
              </div>
              <Button variant="ghost" size="icon-sm" onClick={() => setBlocks((prev) => prev.filter((x) => x.key !== b.key))}>
                <Trash2 className="h-4 w-4" />
              </Button>
            </CardHeader>
            <CardContent className="space-y-3">
              {b.type !== "rest" ? (
                <>
                  <div className="flex flex-wrap gap-4">
                    <div className="flex items-center gap-2">
                      <Label>Rounds</Label>
                      <Input
                        type="number"
                        min={1}
                        className="w-20"
                        value={b.rounds}
                        onChange={(e) => updateBlock(b.key, { rounds: Math.max(1, Number(e.target.value) || 1) })}
                      />
                    </div>
                    <div className="flex items-center gap-2">
                      <Label>Rest between rounds (s)</Label>
                      <Input
                        type="number"
                        min={0}
                        className="w-20"
                        value={b.restBetweenRounds}
                        onChange={(e) => updateBlock(b.key, { restBetweenRounds: Math.max(0, Number(e.target.value) || 0) })}
                      />
                    </div>
                  </div>

                  {b.exercises.map((e, idx) => {
                    const ex = exerciseMap.get(e.exerciseId)
                    return (
                      <div key={e.key} className="flex flex-wrap items-end gap-2 rounded-lg border p-2">
                        <div className="min-w-40 flex-1">
                          <Label className="text-xs text-muted-foreground">Exercise</Label>
                          <Select
                            value={e.exerciseId}
                            onValueChange={(v) => v && updateExercise(b.key, e.key, { exerciseId: v })}
                          >
                            <SelectTrigger className="w-full">
                              <SelectValue placeholder="Select exercise" />
                            </SelectTrigger>
                            <SelectContent className="max-h-64">
                              {exercises.map((x) => (
                                <SelectItem key={x._id} value={x._id}>
                                  {x.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        {ex && (
                          <Badge variant="secondary" className="mb-2 hidden sm:inline-flex">
                            {ex.muscleGroups.slice(0, 2).join(", ")}
                          </Badge>
                        )}
                        <div className="flex items-center gap-2">
                          <Label className="text-xs text-muted-foreground">Reps</Label>
                          <Input
                            type="number"
                            min={0}
                            className="w-20"
                            value={e.reps || ""}
                            placeholder="--"
                            onChange={(ev) => updateExercise(b.key, e.key, { reps: Number(ev.target.value) || 0 })}
                          />
                        </div>
                        <div className="flex items-center gap-2">
                          <Label className="text-xs text-muted-foreground">Sec</Label>
                          <Input
                            type="number"
                            min={0}
                            className="w-20"
                            value={e.duration || ""}
                            placeholder="--"
                            onChange={(ev) => updateExercise(b.key, e.key, { duration: Number(ev.target.value) || 0 })}
                          />
                        </div>
                        <div className="flex items-center gap-2">
                          <Label className="text-xs text-muted-foreground">Rest (s)</Label>
                          <Input
                            type="number"
                            min={0}
                            className="w-20"
                            value={e.restAfter}
                            onChange={(ev) => updateExercise(b.key, e.key, { restAfter: Number(ev.target.value) || 0 })}
                          />
                        </div>
                        <div className="flex gap-1">
                          <Button variant="ghost" size="icon-sm" disabled={idx === 0} onClick={() => moveExercise(b.key, idx, -1)}>
                            ↑
                          </Button>
                          <Button variant="ghost" size="icon-sm" disabled={idx === b.exercises.length - 1} onClick={() => moveExercise(b.key, idx, 1)}>
                            ↓
                          </Button>
                          <Button variant="ghost" size="icon-sm" onClick={() => removeExercise(b.key, e.key)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    )
                  })}
                  <Button variant="outline" size="sm" onClick={() => addExercise(b.key)}>
                    <Plus className="h-4 w-4" /> Add exercise
                  </Button>
                </>
              ) : (
                <div className="flex items-center gap-2">
                  <Label>Rest duration (s)</Label>
                  <Input
                    type="number"
                    min={10}
                    className="w-24"
                    value={b.duration || ""}
                    onChange={(e) => updateBlock(b.key, { duration: Number(e.target.value) || 0 })}
                  />
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <Button onClick={() => setBlocks((prev) => [...prev, emptyBlock()])} variant="outline">
          <Plus className="h-4 w-4" /> Add block
        </Button>
        <Button onClick={save} disabled={saving}>
          <Save className="h-4 w-4" /> {saving ? "Saving..." : workout ? "Save changes" : "Create workout"}
        </Button>
        <span className="text-sm text-muted-foreground">{blocks.length} blocks · {totalExerciseCount()} exercises</span>
      </div>
    </div>
  )
}
