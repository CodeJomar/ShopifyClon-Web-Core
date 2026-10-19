"use client"

import { Skeleton } from "@/shared/components/ui/skeleton"

export function MenuSkeleton() {
  return (
    <div className="flex flex-col gap-6" aria-busy="true">
      <div className="grid grid-cols-12 gap-3">
        <div className="col-span-12 md:col-span-5 lg:col-span-4">
          <Skeleton className="h-10 rounded-xl dark:bg-stone-800" />
        </div>
        <div className="col-span-12 md:col-span-7 lg:col-span-8">
          <Skeleton className="h-10 rounded-2xl dark:bg-stone-800" />
        </div>
      </div>
      <div className="grid grid-cols-12 gap-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="col-span-12 sm:col-span-6 lg:col-span-4 2xl:col-span-3">
            <Skeleton className="h-56 rounded-2xl dark:bg-stone-800" />
          </div>
        ))}
      </div>
    </div>
  )
}
