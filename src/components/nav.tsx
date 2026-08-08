"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { LogOut, Menu } from "lucide-react"
import { useState } from "react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"

const links = [
  { href: "/", label: "Dashboard" },
  { href: "/workouts", label: "Workouts" },
  { href: "/programs", label: "Programs" },
  { href: "/progress", label: "Progress" },
  { href: "/coach", label: "AI Coach" },
]

function Wordmark() {
  return (
    <span className="flex items-center gap-2.5">
      <span className="flex h-8 w-8 items-center justify-center border border-border bg-background">
        <span className="font-display text-xl leading-none text-foreground">M</span>
      </span>
      <span className="font-mono text-sm uppercase tracking-[0.25em] text-foreground">Mythletics</span>
    </span>
  )
}

function NavLinks({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname()
  return (
    <nav className="flex flex-col">
      {links.map((link) => {
        const active = pathname === link.href || (link.href !== "/" && pathname.startsWith(link.href))
        return (
          <Link
            key={link.href}
            href={link.href}
            onClick={onNavigate}
            className={cn(
              "flex items-center gap-3 border-l py-2.5 pl-4 font-mono text-sm uppercase tracking-[0.2em] transition-colors",
              active
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground"
            )}
          >
            <span className={cn("h-1.5 w-1.5 bg-primary transition-opacity", active ? "opacity-100" : "opacity-0")} />
            {link.label}
          </Link>
        )
      })}
    </nav>
  )
}

export function Sidebar({ userName }: { userName: string }) {
  const router = useRouter()
  const [open, setOpen] = useState(false)

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" })
    router.push("/login")
    router.refresh()
  }

  return (
    <>
      <aside className="hidden w-60 shrink-0 flex-col border-r bg-background md:flex">
        <div className="border-b px-5 py-5">
          <Link href="/">
            <Wordmark />
          </Link>
        </div>
        <div className="flex-1 px-3 pt-4">
          <NavLinks />
        </div>
        <div className="border-t px-5 py-4">
          <p className="truncate font-mono text-xs uppercase tracking-[0.15em] text-muted-foreground">{userName}</p>
          <Button variant="ghost" className="mt-2 w-full justify-start font-mono text-xs uppercase tracking-[0.15em]" onClick={logout}>
            <LogOut className="h-3.5 w-3.5" /> Sign out
          </Button>
        </div>
      </aside>

      <div className="sticky top-0 z-40 flex h-14 items-center justify-between border-b bg-background px-3 md:hidden">
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger
            render={
              <Button variant="ghost" size="icon" aria-label="Open menu" className="ml-1">
                <Menu className="h-6 w-6" />
              </Button>
            }
          />
          <SheetContent side="left" className="w-64">
            <div className="mb-6 border-b px-2 py-4">
              <Wordmark />
            </div>
            <NavLinks onNavigate={() => setOpen(false)} />
            <div className="mt-6 border-t pt-4">
              <p className="truncate px-4 font-mono text-xs uppercase tracking-[0.15em] text-muted-foreground">{userName}</p>
              <Button
                variant="ghost"
                className="mt-2 w-full justify-start font-mono text-xs uppercase tracking-[0.15em]"
                onClick={() => {
                  setOpen(false)
                  logout()
                }}
              >
                <LogOut className="h-3.5 w-3.5" /> Sign out
              </Button>
            </div>
          </SheetContent>
        </Sheet>
        <Link href="/" className="mr-3">
          <Wordmark />
        </Link>
      </div>
    </>
  )
}
