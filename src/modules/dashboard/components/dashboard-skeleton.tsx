"use client"

import { Skeleton } from "@/shared/components/ui/skeleton"

export function DashboardSkeleton() {
  return (
    <div className="grid grid-cols-12 gap-4 lg:gap-5" aria-busy="true">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="col-span-12 sm:col-span-6 xl:col-span-3">
          <Skeleton className="h-28 rounded-2xl dark:bg-stone-800" />
        </div>
      ))}
      <div className="col-span-12 xl:col-span-8">
        <Skeleton className="h-72 rounded-2xl dark:bg-stone-800" />
      </div>
      <div className="col-span-12 xl:col-span-4">
        <Skeleton className="h-72 rounded-2xl dark:bg-stone-800" />
      </div>
      <div className="col-span-12 xl:col-span-8">
        <Skeleton className="h-64 rounded-2xl dark:bg-stone-800" />
      </div>
      <div className="col-span-12 xl:col-span-4">
        <Skeleton className="h-64 rounded-2xl dark:bg-stone-800" />
      </div>
    </div>
  )
}
