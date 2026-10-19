"use client"

import { Skeleton } from "@/shared/components/ui/skeleton"

export function KdsSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4" aria-busy="true">
      {Array.from({ length: 8 }).map((_, i) => (
        <div
          key={i}
          className="flex flex-col h-64 rounded-2xl border border-slate-100 dark:border-stone-800 bg-white dark:bg-stone-900 p-4 justify-between"
        >
          <div className="flex justify-between items-center">
            <Skeleton className="h-5 w-24 rounded-md dark:bg-stone-800" />
            <Skeleton className="h-5 w-16 rounded-full dark:bg-stone-800" />
          </div>
          <div className="space-y-2 my-auto">
            <Skeleton className="h-4 w-3/4 rounded dark:bg-stone-800" />
            <Skeleton className="h-4 w-1/2 rounded dark:bg-stone-800" />
            <Skeleton className="h-4 w-2/3 rounded dark:bg-stone-800" />
          </div>
          <Skeleton className="h-10 w-full rounded-xl dark:bg-stone-800 mt-auto" />
        </div>
      ))}
    </div>
  )
}
