"use client"

import { use, useCallback, useEffect, useMemo, useRef, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Pause, Play, SkipForward, RotateCcw, Check, Flag, Volume2, VolumeX, Dumbbell } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { toast } from "sonner"
import { buildTimeline, formatSeconds, type TimelineStep } from "@/lib/timer"
import { countdownBeep, endBeep, ensureAudio, speak, startBeep, stopSpeech } from "@/lib/audio"
import type { ClientWorkout, SessionDetail } from "@/lib/client-types"
import { cn } from "@/lib/utils"

type Phase = "idle" | "running" | "paused" | "finished"

export default function SessionPlayerPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const searchParams = useSearchParams()
  const router = useRouter()
  const fromProgram = searchParams.get("from") === "program"
  const programId = searchParams.get("programId")

  const [workout, setWorkout] = useState<ClientWorkout | null>(null)
  const [phase, setPhase] = useState<Phase>("idle")
  const [stepIndex, setStepIndex] = useState(0)
  const [secondsLeft, setSecondsLeft] = useState(0)
  const [elapsed, setElapsed] = useState(0)
  const [muted, setMuted] = useState(false)
  const [doneReps, setDoneReps] = useState<Set<string>>(new Set())
  const [doneSteps, setDoneSteps] = useState<Set<string>>(new Set())
  const secondsLeftRef = useRef(0)
  const [rating, setRating] = useState(7)
  const [saved, setSaved] = useState(false)
  const [saving, setSaving] = useState(false)

  const steps = useMemo(() => (workout ? buildTimeline(workout) : []), [workout])
  const current = steps[stepIndex]

  useEffect(() => {
    fetch(`/api/workouts/${id}`)
      .then((r) => r.json())
      .then(setWorkout)
  }, [id])

  const cue = useCallback(
    (step: TimelineStep | undefined) => {
      if (!step) return
      startBeep()
      if (muted) return
      if (step.isRepBased) {
        speak(`${step.exerciseName ?? "Exercise"}, ${step.reps} reps`)
      } else {
        speak(step.exerciseName && step.kind === "work" ? step.exerciseName : step.label)
      }
    },
    [muted]
  )

  const finish = useCallback(() => {
    stopSpeech()
    endBeep()
    setPhase("finished")
  }, [])

  const advance = useCallback(() => {
    if (stepIndex >= steps.length - 1) {
      finish()
      return
    }
    const next = steps[stepIndex + 1]
    const duration = next?.durationSec ?? 0
    secondsLeftRef.current = duration
    setSecondsLeft(duration)
    setStepIndex((i) => i + 1)
    cue(next)
  }, [stepIndex, steps, finish, cue])

  const start = async () => {
    await ensureAudio()
    setPhase("running")
    setElapsed(0)
    setStepIndex(0)
    const duration = steps[0]?.durationSec ?? 0
    secondsLeftRef.current = duration
    setSecondsLeft(duration)
    cue(steps[0])
  }

  const resume = async () => {
    await ensureAudio()
    setPhase("running")
    cue(steps[stepIndex])
  }

  const pause = () => {
    stopSpeech()
    setPhase("paused")
  }

  const skip = () => {
    stopSpeech()
    endBeep()
    advance()
  }

  const completeRep = () => {
    setDoneReps((prev) => {
      const next = new Set(prev)
      next.add(steps[stepIndex].id)
      return next
    })
    setDoneSteps((prev) => new Set(prev).add(steps[stepIndex].id))
    endBeep()
    advance()
  }

  const reset = () => {
    stopSpeech()
    setPhase("idle")
    setStepIndex(0)
    setElapsed(0)
    const duration = steps[0]?.durationSec ?? 0
    secondsLeftRef.current = duration
    setSecondsLeft(duration)
    setDoneReps(new Set())
    setDoneSteps(new Set())
    setSaved(false)
  }

  useEffect(() => {
    if (phase !== "running") return
    const iv = setInterval(() => {
      const next = Math.max(0, secondsLeftRef.current - 1)
      secondsLeftRef.current = next
      setSecondsLeft(next)
      setElapsed((e) => e + 1)
      if (!current || current.isRepBased) return
      if (next === 0) {
        if (current.kind === "work") setDoneSteps((prev) => new Set(prev).add(current.id))
        endBeep()
        advance()
      } else if (next <= 3 && !muted) {
        countdownBeep(next)
      }
    }, 1000)
    return () => clearInterval(iv)
  }, [phase, stepIndex, current, muted, advance])

  const details = useMemo<SessionDetail[]>(() => {
    const acc = new Map<string, SessionDetail>()
    for (const step of steps) {
      if (step.kind !== "work") continue
      if (!doneSteps.has(step.id)) continue
      const key = step.exerciseId ?? step.label
      const cur = acc.get(key) ?? {
        exerciseId: step.exerciseId,
        exerciseName: step.exerciseName ?? "",
        reps: 0,
        duration: 0,
        completed: true,
      }
      cur.reps = (cur.reps ?? 0) + (step.reps ?? 0)
      cur.duration = (cur.duration ?? 0) + (step.durationSec ?? 0)
      acc.set(key, cur)
    }
    return [...acc.values()].map((d) => ({
      exerciseId: d.exerciseId,
      exerciseName: d.exerciseName,
      reps: d.reps && d.reps > 0 ? d.reps : undefined,
      duration: d.duration && d.duration > 0 ? d.duration : undefined,
      completed: true,
    }))
  }, [steps, doneSteps])

  async function saveSession() {
    if (saved) return
    setSaving(true)
    try {
      const res = await fetch("/api/sessions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          workoutId: workout?._id,
          duration: elapsed,
          completed: true,
          source: fromProgram ? "program" : "manual",
          programId: programId ?? undefined,
          rating,
          details,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? "Failed to save")
      setSaved(true)
      if (fromProgram && programId) {
        await fetch("/api/program-progress", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ programId, sessionId: data._id }),
        })
      }
      toast.success("Session saved!")
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to save session")
    } finally {
      setSaving(false)
    }
  }

  if (!workout) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Dumbbell className="h-10 w-10 animate-pulse text-muted-foreground" />
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div className="text-center">
        <h1 className="text-2xl font-bold tracking-tight">{workout.name}</h1>
        <p className="text-muted-foreground">
          {steps.length} steps · est. {formatSeconds(steps.reduce((a, s) => a + (s.durationSec ?? 0), 0))}
        </p>
      </div>

      {phase === "idle" && (
        <Card className="p-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Workout preview</span>
              <span className="font-medium">Round {current?.round ?? 1}/{current?.roundsTotal ?? 1}</span>
            </div>
            <h2 className="text-center text-3xl font-bold">{current?.exerciseName ?? "Ready?"}</h2>
            {current?.isRepBased ? (
              <p className="text-center text-5xl font-bold text-primary">{current.reps} reps</p>
            ) : (
              <p className="text-center text-5xl font-bold tabular-nums text-primary">{formatSeconds(current?.durationSec ?? 0)}</p>
            )}
            <p className="text-center text-sm text-muted-foreground">
              {current?.kind === "work" ? "First exercise" : "Rest"}
            </p>
            <Button size="lg" className="w-full" onClick={start}>
              <Play className="h-4 w-4" /> Start workout
            </Button>
          </div>
        </Card>
      )}

      {phase === "running" && (
        <Card className="select-none p-4 sm:p-6">
          <Progress value={((stepIndex + 1) / steps.length) * 100} className="mb-6" />
          <div className="mb-2 flex flex-wrap items-center justify-between gap-x-4 gap-y-1 text-sm">
            <span className="text-muted-foreground">
              Step {stepIndex + 1}/{steps.length}
            </span>
            <span className="text-muted-foreground">
              Round {current?.round}/{current?.roundsTotal}
            </span>
            {doneReps.size > 0 && (
              <span className="font-medium text-primary">{doneReps.size} sets done</span>
            )}
          </div>

          <div className="mb-6 text-center">
            <h2 className="text-xl font-semibold sm:text-2xl">{current?.exerciseName ?? current?.label}</h2>
            <p className="text-sm text-muted-foreground">{current?.kind === "rest" ? "Rest" : current?.label}</p>
            {current?.isRepBased ? (
              <p className="mt-2 text-6xl font-bold tabular-nums text-primary">{current?.reps} reps</p>
            ) : (
              <p className="mt-2 text-6xl font-bold tabular-nums text-primary">{formatSeconds(secondsLeft)}</p>
            )}
          </div>

          <div className="flex items-center justify-center gap-2 sm:gap-3">
            {current?.isRepBased ? (
              <Button size="lg" onClick={completeRep} className="min-h-12 flex-1">
                <Check className="h-5 w-5" /> Complete set
              </Button>
            ) : (
              <Button variant="outline" size="icon-lg" onClick={pause} className="min-h-12 min-w-12">
                <Pause className="h-5 w-5" />
              </Button>
            )}
            <Button variant="outline" size="icon-lg" onClick={skip} title="Skip step" className="min-h-12 min-w-12">
              <SkipForward className="h-5 w-5" />
            </Button>
            <Button
              variant="ghost"
              size="icon-lg"
              className="min-h-12 min-w-12"
              onClick={() => {
                setMuted((m) => !m)
                if (!muted) stopSpeech()
              }}
            >
              {muted ? <VolumeX className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}
            </Button>
            <Button variant="ghost" size="icon-lg" onClick={reset} title="Restart" className="min-h-12 min-w-12">
              <RotateCcw className="h-5 w-5" />
            </Button>
          </div>
          <p className="mt-4 text-center text-sm text-muted-foreground">Elapsed {formatSeconds(elapsed)}</p>
        </Card>
      )}

      {phase === "paused" && (
        <Card className="p-6 text-center">
          <h2 className="mb-4 text-2xl font-bold">Paused</h2>
          <div className="flex items-center justify-center gap-3">
            <Button size="lg" onClick={resume}>
              <Play className="h-5 w-5" /> Resume
            </Button>
            <Button variant="outline" onClick={skip}>
              Skip step
            </Button>
            <Button variant="ghost" onClick={reset}>
              <RotateCcw className="h-4 w-4" /> Restart
            </Button>
          </div>
        </Card>
      )}

      {phase === "finished" && (
        <Card className="p-6">
          <div className="mb-6 text-center">
            <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-green-500/15 text-green-500">
              <Flag className="h-7 w-7" />
            </div>
            <h2 className="text-2xl font-bold">Workout complete!</h2>
            <p className="text-muted-foreground">
              {formatSeconds(elapsed)} total · {details.filter((d) => d.reps).length} exercises logged
            </p>
          </div>

          {!saved ? (
            <div className="space-y-4">
              <div>
                <p className="mb-2 text-sm font-medium">How did it feel?</p>
                <div className="flex flex-wrap gap-1.5">
                  {[...Array(11)].map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setRating(i)}
                      className={cn(
                        "h-11 w-11 touch-manipulation rounded-lg border text-sm font-medium transition-colors sm:h-9 sm:w-9",
                        rating === i ? "border-primary bg-primary text-primary-foreground" : "hover:bg-accent"
                      )}
                    >
                      {i}
                    </button>
                  ))}
                </div>
              </div>
              <Button className="w-full" size="lg" onClick={saveSession} disabled={saving}>
                <Check className="h-4 w-4" /> {saving ? "Saving..." : "Save session"}
              </Button>
              <Button variant="ghost" className="w-full" onClick={reset}>
                <RotateCcw className="h-4 w-4" /> Train again
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              <Button className="w-full" onClick={() => router.push("/progress")}>
                View your progress
              </Button>
              <Button variant="outline" className="w-full" onClick={() => router.push("/workouts")}>
                Back to library
              </Button>
            </div>
          )}
        </Card>
      )}
    </div>
  )
}
