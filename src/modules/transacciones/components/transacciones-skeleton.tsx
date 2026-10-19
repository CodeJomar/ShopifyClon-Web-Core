"use client"

import { Skeleton } from "@/shared/components/ui/skeleton"

export function TransaccionesSkeleton() {
  return (
    <div className="flex min-h-0 flex-1 flex-col gap-4 overflow-hidden" aria-busy="true">
      <div className="grid shrink-0 grid-cols-2 gap-3 sm:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-20 rounded-2xl dark:bg-stone-800" />
        ))}
      </div>
      <Skeleton className="min-h-0 flex-1 rounded-2xl dark:bg-stone-800" />
    </div>
  )
}
