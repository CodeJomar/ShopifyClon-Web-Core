import { cn } from "@/shared/utils/cn"
import type { EstadoConexion } from "@/lib/tiempo-real/canal"

const TEXTO: Record<EstadoConexion, string> = {
  conectando: "Conectando…",
  conectado: "En vivo",
  reconectando: "Reconectando…",
  cerrado: "Sin conexión en vivo",
}

/** Indicador discreto del tiempo real: punto verde «En vivo», ámbar mientras reconecta, gris si no hay conexión. */
export function IndicadorEnVivo({ estado, className }: { estado: EstadoConexion; className?: string }) {
  return (
    <span
      role="status"
      aria-live="polite"
      className={cn("inline-flex items-center gap-1.5 rounded-full bg-secondary px-2.5 py-1 text-[11.5px] font-bold text-muted-foreground", className)}
    >
      <span
        aria-hidden="true"
        className={cn(
          "size-2 rounded-full",
          estado === "conectado" && "bg-primary shadow-[0_0_0_3px_rgb(var(--brand-rgb)/0.2)]",
          (estado === "conectando" || estado === "reconectando") && "animate-pulse bg-warning",
          estado === "cerrado" && "bg-muted-foreground/50",
        )}
      />
      {TEXTO[estado]}
    </span>
  )
}
