"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Sparkles, Play, ArrowRight } from "lucide-react"
import { buttonVariants } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@/lib/utils"
import { toast } from "sonner"
import type { ClientProgram, ActiveProgress } from "@/lib/client-types"

export default function ProgramsPage() {
  const router = useRouter()
  const [programs, setPrograms] = useState<ClientProgram[] | null>(null)
  const [active, setActive] = useState<ActiveProgress | null>(null)

  useEffect(() => {
    Promise.all([fetch("/api/programs").then((r) => r.json()), fetch("/api/program-progress").then((r) => r.json())]).then(
      ([programs, progress]) => {
        setPrograms(programs)
        setActive(progress.progress ? progress : null)
      }
    )
  }, [])

  async function start(programId: string) {
    const res = await fetch("/api/program-progress", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ programId }),
    })
    if (res.ok) {
      toast.success("Program started")
      const data = await res.json()
      router.push(`/program/${programId}?started=1&progressId=${data._id}`)
    } else {
      const err = await res.json().catch(() => ({}))
      toast.error(err.error ?? "Could not start program")
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Training programs</h1>
          <p className="text-muted-foreground">Structured plans that guide your training week by week.</p>
        </div>
        <Link href="/coach?newplan=1" className={buttonVariants({ variant: "outline" })}>
          <Sparkles className="h-4 w-4" />
          Generate with AI
        </Link>
      </div>

      {active && active.progress.status === "active" && (
        <Card className="border-primary/30 bg-primary/5">
          <CardHeader>
            <CardTitle className="text-base">Active program: {active.program.name}</CardTitle>
            <CardDescription>
              Week {active.progress.currentWeek} · Day {active.progress.currentDay}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link href={`/program/${active.program._id}`} className={buttonVariants()}>
              Continue training
              <ArrowRight className="h-4 w-4" />
            </Link>
          </CardContent>
        </Card>
      )}

      {!programs ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-44" />
          ))}
        </div>
      ) : programs.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-lg font-medium">No programs yet</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Browse the workout library or ask the AI coach to build you a plan.
            </p>
            <div className="mt-4 flex justify-center gap-3">
              <Link href="/workouts" className={buttonVariants()}>
                Workout library
              </Link>
              <Link href="/coach?newplan=1" className={buttonVariants({ variant: "outline" })}>
                <Sparkles className="h-4 w-4" />
                Generate with AI
              </Link>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {programs.map((program) => (
            <Card key={program._id} className="flex flex-col">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <CardTitle className="text-base leading-snug">{program.name}</CardTitle>
                  {program.aiGenerated && (
                    <Badge variant="outline" className="gap-1">
                      <Sparkles className="h-3 w-3" /> AI
                    </Badge>
                  )}
                </div>
                <CardDescription className="line-clamp-2">{program.description || "No description"}</CardDescription>
              </CardHeader>
              <CardContent className="mt-auto flex flex-col gap-3">
                <div className="flex flex-wrap gap-2">
                  <Badge variant="secondary">{program.weeks.length} weeks</Badge>
                  {program.difficulty && <Badge variant="secondary">{program.difficulty}</Badge>}
                </div>
                <div className="flex gap-2">
                  <button onClick={() => start(program._id)} className={cn(buttonVariants(), "flex-1")}>
                    <Play className="h-4 w-4" />
                    Start
                  </button>
                  <Link href={`/program/${program._id}`} className={buttonVariants({ variant: "outline", size: "icon" })}>
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
