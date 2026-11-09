"use client"

import * as React from "react"
import { Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"
import { cn } from "@/shared/utils/cn"
import { useMounted } from "@/shared/hooks/use-mounted"

type ThemeToggleProps = {
  className?: string
  showLabel?: boolean
}

/** Selector accesible de tema. next-themes conserva la preferencia en el navegador. */
export function ThemeToggle({ className, showLabel = false }: ThemeToggleProps) {
  const { resolvedTheme, setTheme } = useTheme()
  const mounted = useMounted()

  const isDark = mounted && resolvedTheme === "dark"
  const actionLabel = isDark ? "Cambiar a modo claro" : "Cambiar a modo oscuro"

  return (
    <button
      type="button"
      disabled={!mounted}
      aria-label={mounted ? actionLabel : "Cargando preferencia de tema"}
      aria-pressed={mounted ? isDark : false}
      title={mounted ? actionLabel : "Preferencia de tema"}
      onClick={() => setTheme(isDark ? "light" : "dark")}
      className={cn(
        "otemu-theme-toggle inline-flex h-10 min-w-10 shrink-0 items-center justify-center gap-2 rounded-xl border border-border bg-card px-2.5 text-foreground shadow-sm transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-wait disabled:opacity-70",
        showLabel && "px-3",
        className,
      )}
    >
      {isDark ? <Sun aria-hidden="true" className="size-[18px]" /> : <Moon aria-hidden="true" className="size-[18px]" />}
      {showLabel && <span className="text-xs font-semibold">{mounted ? (isDark ? "Modo claro" : "Modo oscuro") : "Tema"}</span>}
    </button>
  )
}
