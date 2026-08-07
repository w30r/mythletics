"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Trash2, ChevronRight } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button, buttonVariants } from "@/components/ui/button"
import { toast } from "sonner"
import { cn } from "@/lib/utils"

type RecentSessionItem = {
  _id: string
  meta: string
  rating: number | null
}

export function RecentSessions({ items }: { items: RecentSessionItem[] }) {
  const router = useRouter()
  const [sessions, setSessions] = useState(items)

  async function remove(id: string) {
    if (!window.confirm("Delete this session? It will be removed from your stats and personal records.")) return
    try {
      const res = await fetch(`/api/sessions?id=${id}`, { method: "DELETE" })
      if (!res.ok) throw new Error("Failed to delete session")
      setSessions((prev) => prev.filter((s) => s._id !== id))
      toast.success("Session deleted")
      router.refresh()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to delete session")
    }
  }

  if (sessions.length === 0) {
    return (
      <div className="space-y-3">
        <p className="text-sm text-muted-foreground">No sessions yet. Complete your first workout!</p>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {sessions.map((s) => (
        <div key={s._id} className="flex items-center justify-between border-b pb-2 last:border-0">
          <div>
            <p className="text-sm font-medium">Workout session</p>
            <p className="text-xs text-muted-foreground">{s.meta}</p>
          </div>
          <div className="flex items-center gap-1">
            {s.rating ? (
              <Badge variant="secondary">{s.rating}/10</Badge>
            ) : (
              <Badge variant="outline">Done</Badge>
            )}
            <Button
              variant="ghost"
              size="icon-sm"
              aria-label="Delete session"
              title="Delete session"
              onClick={() => remove(s._id)}
              className="text-muted-foreground hover:text-destructive"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      ))}
      <Link href="/progress" className={cn(buttonVariants({ variant: "ghost" }), "w-full justify-between")}>
        View analytics <ChevronRight className="h-4 w-4" />
      </Link>
    </div>
  )
}