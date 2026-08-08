import { Card, CardContent } from "@/components/ui/card"

export default function Loading() {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <div className="h-7 w-36 animate-pulse rounded-md bg-muted" />
        <div className="h-4 w-64 animate-pulse rounded-md bg-muted/70" />
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i}>
            <CardContent className="flex items-center gap-4 p-4">
              <div className="size-9 animate-pulse rounded-lg bg-muted" />
              <div className="space-y-2">
                <div className="h-3 w-16 animate-pulse rounded-md bg-muted/70" />
                <div className="h-5 w-20 animate-pulse rounded-md bg-muted" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardContent className="space-y-4 p-6">
            <div className="h-5 w-40 animate-pulse rounded-md bg-muted" />
            <div className="h-4 w-56 animate-pulse rounded-md bg-muted/70" />
            <div className="h-5 w-48 animate-pulse rounded-md bg-muted/70" />
            <div className="h-10 w-36 animate-pulse rounded-lg bg-muted" />
          </CardContent>
        </Card>
        <Card>
          <CardContent className="space-y-3 p-6">
            <div className="h-5 w-32 animate-pulse rounded-md bg-muted" />
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="flex justify-between border-b pb-2 last:border-0">
                <div className="h-4 w-28 animate-pulse rounded-md bg-muted/70" />
                <div className="h-4 w-14 animate-pulse rounded-md bg-muted/70" />
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
