import { ThemeToggle } from "@/shared/components/theme/theme-toggle"

export default function Loading() {
  return (
    <div className="relative flex min-h-screen items-center justify-center bg-background text-foreground">
      <div className="absolute right-5 top-5">
        <ThemeToggle />
      </div>
      <div className="flex flex-col items-center gap-4">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-border border-t-primary" aria-hidden="true" />
        <p className="text-lg font-medium text-muted-foreground" role="status" aria-live="polite">Cargando OTemu…</p>
      </div>
    </div>
  )
}
