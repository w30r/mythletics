import { getSessionUser } from "@/lib/auth"
import { redirect } from "next/navigation"
import { Sidebar } from "@/components/nav"

export const dynamic = "force-dynamic"

export default async function MainLayout({ children }: { children: React.ReactNode }) {
  const user = await getSessionUser()
  if (!user) redirect("/login")

  return (
    <div className="flex min-h-dvh flex-col bg-background md:flex-row">
      <Sidebar userName={user.name ?? user.email} />
      <main className="mx-auto w-full max-w-[1200px] flex-1 px-4 py-6 md:px-8">{children}</main>
    </div>
  )
}
