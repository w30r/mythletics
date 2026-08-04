"use client"

import { useEffect, useRef, useState } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { MessageSquare, Plus, Send, Sparkles, Trash2, Loader2, Bot, User } from "lucide-react"
import { Button } from "@/components/ui/button"
import { buttonVariants } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@/lib/utils"
import { toast } from "sonner"

type Thread = { _id: string; title: string; updatedAt: string }
type Msg = { role: "user" | "assistant" | "system"; content: string; date: string }

export default function CoachPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [threads, setThreads] = useState<Thread[] | null>(null)
  const [threadId, setThreadId] = useState<string | null>(null)
  const [messages, setMessages] = useState<Msg[]>([])
  const [input, setInput] = useState("")
  const [sending, setSending] = useState(false)
  const [streaming, setStreaming] = useState(false)
  const [planOpen, setPlanOpen] = useState(false)
  const [goal, setGoal] = useState("")
  const [weeks, setWeeks] = useState("4")
  const [generating, setGenerating] = useState(false)
  const bottomRef = useRef<HTMLDivElement | null>(null)

  async function loadThreads() {
    const data = await fetch("/api/coach").then((r) => r.json())
    setThreads(data)
    return data as Thread[]
  }

  async function newChat() {
    const res = await fetch("/api/coach", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({}),
    })
    if (res.ok) {
      const thread = await res.json()
      setThreadId(thread._id)
      setMessages([])
      await loadThreads()
    }
  }

  function openThread(id: string) {
    setThreadId(id)
    setMessages([])
    fetch(`/api/coach/${id}`)
      .then((r) => r.json())
      .then((t) => setMessages(t.messages ?? []))
  }

  async function deleteThread(id: string) {
    await fetch(`/api/coach/${id}`, { method: "DELETE" })
    if (threadId === id) {
      setThreadId(null)
      setMessages([])
    }
    await loadThreads()
  }

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- fetch threads once on mount (async callbacks only)
    loadThreads().then((threads) => {
      if (searchParams.get("newplan") === "1" || threads.length === 0) {
        fetch("/api/coach", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({}),
        })
          .then((r) => r.json())
          .then((t) => {
            setThreadId(t._id)
            loadThreads()
          })
        if (searchParams.get("newplan") === "1") setPlanOpen(true)
      } else if (threads.length > 0) {
        openThread(threads[0]._id)
      }
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages, streaming])

  async function send() {
    const text = input.trim()
    if (!text || !threadId || sending) return
    setInput("")
    setMessages((m) => [...m, { role: "user", content: text, date: new Date().toISOString() }])
    setSending(true)
    setStreaming(true)
    try {
      const res = await fetch(`/api/coach/${threadId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text }),
      })
      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        throw new Error(err.error ?? "Request failed")
      }
      if (!res.body) throw new Error("No response body")
      const reader = res.body.getReader()
      const decoder = new TextDecoder()
      let assistant = ""
      setMessages((m) => [...m, { role: "assistant", content: "", date: new Date().toISOString() }])
      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        const chunk = decoder.decode(value, { stream: true })
        for (const line of chunk.split("\n")) {
          const trimmed = line.trim()
          if (!trimmed.startsWith("data:")) continue
          const payload = JSON.parse(trimmed.slice(5).trim())
          if (payload.delta) {
            assistant += payload.delta
            setMessages((m) => {
              const copy = [...m]
              copy[copy.length - 1] = { role: "assistant", content: assistant, date: new Date().toISOString() }
              return copy
            })
          }
          if (payload.error) throw new Error(payload.error)
        }
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not reach the coach")
      setMessages((m) => m.filter((msg) => msg.content !== ""))
    } finally {
      setSending(false)
      setStreaming(false)
      await loadThreads()
    }
  }

  async function generatePlan() {
    if (!threadId || generating) return
    setGenerating(true)
    try {
      const res = await fetch(`/api/coach/${threadId}/plan`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ goal, weeks: Number(weeks) }),
      })
      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        throw new Error(err.error ?? "Plan generation failed")
      }
      const program = await res.json()
      setPlanOpen(false)
      toast.success("Program generated")
      router.push(`/program/${program._id}`)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not generate a plan")
    } finally {
      setGenerating(false)
    }
  }

  return (
    <div className="flex flex-col gap-4 lg:h-[calc(100dvh-8rem)] lg:flex-row">
      <Card className="flex w-full shrink-0 flex-col lg:w-64">
        <div className="flex items-center justify-between border-b p-3">
          <span className="text-sm font-semibold">Chats</span>
          <Button size="icon-xs" variant="ghost" onClick={newChat} title="New chat">
            <Plus className="h-4 w-4" />
          </Button>
        </div>
        <div className="max-h-44 flex-1 space-y-1 overflow-y-auto p-2 lg:max-h-none">
          {!threads ? (
            <Skeleton className="h-8 w-full" />
          ) : threads.length === 0 ? (
            <p className="px-2 py-4 text-center text-xs text-muted-foreground">Start your first chat</p>
          ) : (
            threads.map((t) => (
              <div
                key={t._id}
                className={cn(
                  "group flex cursor-pointer items-center gap-2 rounded-lg px-2 py-1.5 text-sm hover:bg-muted",
                  threadId === t._id && "bg-muted font-medium"
                )}
                onClick={() => openThread(t._id)}
              >
                <MessageSquare className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                <span className="truncate">{t.title}</span>
                <button
                  className="ml-auto shrink-0 text-muted-foreground hover:text-destructive sm:hidden sm:group-hover:block"
                  onClick={(e) => {
                    e.stopPropagation()
                    deleteThread(t._id)
                  }}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            ))
          )}
        </div>
        <div className="border-t p-3">
          <Dialog open={planOpen} onOpenChange={setPlanOpen}>
            <DialogTrigger
              render={
                <button className={cn(buttonVariants({ variant: "outline" }), "w-full")}>
                  <Sparkles className="h-4 w-4" /> Generate a plan
                </button>
              }
            />
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Generate a training program</DialogTitle>
                <DialogDescription>
                  The AI coach builds a weekly program from your workout library and recent history.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="goal">Goal or context</Label>
                  <Textarea
                    id="goal"
                    placeholder="e.g. Build upper body strength, 4x per week, focus on push-ups and pull-ups"
                    value={goal}
                    onChange={(e) => setGoal(e.target.value)}
                    rows={3}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="weeks">Duration</Label>
                  <Select value={weeks} onValueChange={(v) => v && setWeeks(v)}>
                    <SelectTrigger id="weeks" className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {["2", "4", "6", "8"].map((w) => (
                        <SelectItem key={w} value={w}>
                          {w} weeks
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter>
                <Button onClick={generatePlan} disabled={generating}>
                  {generating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
                  {generating ? "Generating…" : "Generate program"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </Card>

      <Card className="flex h-[65dvh] flex-1 flex-col overflow-hidden lg:h-auto">
        <div className="flex items-center gap-2 border-b p-3">
          <div className="rounded-lg bg-primary/10 p-1.5 text-primary">
            <Bot className="h-4 w-4" />
          </div>
          <div>
            <p className="text-sm font-semibold">Mythletics Coach</p>
            <p className="text-xs text-muted-foreground">DeepSeek-powered personal trainer</p>
          </div>
        </div>

        <div className="flex-1 space-y-4 overflow-y-auto p-4">
          {!threadId ? (
            <div className="flex h-full flex-col items-center justify-center gap-3 text-center">
              <Bot className="h-10 w-10 text-muted-foreground" />
              <div>
                <p className="font-medium">Your AI coach is ready</p>
                <p className="max-w-sm text-sm text-muted-foreground">
                  Ask about form, programming, motivation — or generate a full training plan.
                </p>
              </div>
              <Button variant="outline" onClick={newChat}>
                <Plus className="h-4 w-4" /> New chat
              </Button>
            </div>
          ) : messages.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center gap-2 text-center">
              <p className="text-sm text-muted-foreground">Say hi and start training smarter.</p>
            </div>
          ) : (
            messages.map((m, i) => (
              <div key={i} className={cn("flex gap-2", m.role === "user" && "justify-end")}>
                {m.role !== "user" && (
                  <div className="mt-1 rounded-lg bg-primary/10 p-1.5 text-primary">
                    <Bot className="h-4 w-4" />
                  </div>
                )}
                <div
                  className={cn(
                    "max-w-[80%] whitespace-pre-wrap rounded-2xl px-4 py-2 text-sm",
                    m.role === "user" ? "bg-primary text-primary-foreground" : "bg-muted"
                  )}
                >
                  {m.content || <span className="opacity-60">…</span>}
                </div>
                {m.role === "user" && (
                  <div className="mt-1 rounded-lg bg-muted p-1.5">
                    <User className="h-4 w-4 text-muted-foreground" />
                  </div>
                )}
              </div>
            ))
          )}
          <div ref={bottomRef} />
        </div>

        <div className="border-t p-3">
          <form
            className="flex gap-2"
            onSubmit={(e) => {
              e.preventDefault()
              send()
            }}
          >
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask your coach…"
              disabled={sending || !threadId}
              className="flex-1"
            />
            <Button type="submit" size="icon" disabled={sending || !input.trim() || !threadId}>
              {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            </Button>
          </form>
        </div>
      </Card>
    </div>
  )
}
