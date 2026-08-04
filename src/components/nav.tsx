"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { Dumbbell, LayoutDashboard, ListChecks, CalendarRange, TrendingUp, Bot, LogOut, Menu } from "lucide-react"
import { useState } from "react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"

const links = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/workouts", label: "Workouts", icon: ListChecks },
  { href: "/programs", label: "Programs", icon: CalendarRange },
  { href: "/progress", label: "Progress", icon: TrendingUp },
  { href: "/coach", label: "AI Coach", icon: Bot },
]

function NavLinks({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname()
  return (
    <nav className="flex flex-col gap-1">
      {links.map((link) => {
        const active = pathname === link.href || (link.href !== "/" && pathname.startsWith(link.href))
        return (
          <Link
            key={link.href}
            href={link.href}
            onClick={onNavigate}
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
              active ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-accent hover:text-foreground"
            )}
          >
            <link.icon className="h-4 w-4" />
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
      <aside className="hidden w-60 shrink-0 flex-col border-r bg-card p-4 md:flex">
        <Link href="/" className="mb-6 flex items-center gap-2 px-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <Dumbbell className="h-4 w-4" />
          </div>
          <span className="text-lg font-bold">Mythletics</span>
        </Link>
        <div className="flex-1">
          <NavLinks />
        </div>
        <div className="border-t pt-3">
          <p className="truncate px-3 text-sm font-medium">{userName}</p>
          <Button variant="ghost" className="mt-1 w-full justify-start text-muted-foreground" onClick={logout}>
            <LogOut className="h-4 w-4" /> Sign out
          </Button>
        </div>
      </aside>

      <div className="sticky top-0 z-40 flex h-12 items-center border-b bg-background/95 px-2 backdrop-blur md:hidden">
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger
            render={
              <Button variant="ghost" size="icon" aria-label="Open menu" className="ml-1">
                <Menu className="h-6 w-6" />
              </Button>
            }
          />
          <SheetContent side="left" className="w-64">
            <div className="mb-6 flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                <Dumbbell className="h-4 w-4" />
              </div>
              <span className="text-lg font-bold">Mythletics</span>
            </div>
            <NavLinks onNavigate={() => setOpen(false)} />
            <div className="mt-6 border-t pt-3">
              <p className="truncate px-3 text-sm font-medium">{userName}</p>
              <Button
                variant="ghost"
                className="mt-1 w-full justify-start text-muted-foreground"
                onClick={() => {
                  setOpen(false)
                  logout()
                }}
              >
                <LogOut className="h-4 w-4" /> Sign out
              </Button>
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </>
  )
}
