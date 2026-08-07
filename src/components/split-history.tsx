"use client"

import { useState } from "react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { formatSeconds } from "@/lib/timer"

export type SplitHistoryItem = {
  stepIndex: number
  exerciseName: string
  reps?: number
  round: number
  elapsed: number
}

export type SplitHistoryWorkout = {
  workoutId: string
  workoutName: string
  splits: SplitHistoryItem[]
}

export function SplitHistory({ workouts }: { workouts: SplitHistoryWorkout[] }) {
  const [selectedId, setSelectedId] = useState(workouts[0]?.workoutId ?? "")
  const current = workouts.find((w) => w.workoutId === selectedId) ?? workouts[0]

  if (!current) {
    return (
      <p className="py-6 text-center text-sm text-muted-foreground">
        Complete a workout to start tracking split times. Your fastest splits per round and exercise will appear here.
      </p>
    )
  }

  return (
    <div className="space-y-4">
      <Select value={current.workoutId} onValueChange={(v) => v && setSelectedId(v)}>
        <SelectTrigger className="w-full sm:w-64">
          <SelectValue>{current.workoutName}</SelectValue>
        </SelectTrigger>
        <SelectContent>
          {workouts.map((w) => (
            <SelectItem key={w.workoutId} value={w.workoutId}>
              {w.workoutName}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b text-left text-muted-foreground">
              <th className="py-2 pr-4 font-medium">Step</th>
              <th className="py-2 pr-4 font-medium">Exercise</th>
              <th className="py-2 pr-4 font-medium">Round</th>
              <th className="py-2 font-medium">Best split</th>
            </tr>
          </thead>
          <tbody>
            {current.splits.map((sp) => (
              <tr key={sp.stepIndex} className="border-b last:border-0">
                <td className="py-2 pr-4 text-muted-foreground">{sp.stepIndex + 1}</td>
                <td className="py-2 pr-4 font-medium">
                  {sp.exerciseName || "Rest"}
                  {sp.reps ? <span className="ml-2 text-muted-foreground">{sp.reps} reps</span> : null}
                </td>
                <td className="py-2 pr-4 text-muted-foreground">Round {sp.round}</td>
                <td className="py-2">
                  <Badge variant="secondary">{formatSeconds(sp.elapsed)}</Badge>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}