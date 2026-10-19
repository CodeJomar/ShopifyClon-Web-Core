import { Skeleton } from "@/shared/components/ui/skeleton"

/** Esqueleto que ocupa el espacio disponible sin desbordarlo. */
export function GrillaSkeleton() {
  return (
    <div
      className="grid min-h-0 flex-1 auto-rows-[136px] grid-cols-1 gap-4 overflow-hidden sm:grid-cols-2 xl:grid-cols-3"
      aria-busy="true"
    >
      {Array.from({ length: 9 }).map((_, i) => (
        <Skeleton key={i} className="rounded-2xl dark:bg-stone-800" />
      ))}
    </div>
  )
}
