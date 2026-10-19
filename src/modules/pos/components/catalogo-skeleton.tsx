"use client"

import { Skeleton } from "@/shared/components/ui/skeleton"

export function CatalogoSkeleton() {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 2xl:grid-cols-4" aria-busy="true">
      {Array.from({ length: 8 }).map((_, i) => (
        <Skeleton key={i} className="h-40 rounded-2xl dark:bg-stone-800" />
      ))}
    </div>
  )
}
