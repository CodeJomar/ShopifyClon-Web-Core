import { Star } from "lucide-react"
import { cn } from "@/shared/utils/cn"

const formato = (n: number) => n.toLocaleString("es-PE", { minimumFractionDigits: 1, maximumFractionDigits: 1 })

/**
 * Calificación en estrellas, solo lectura. El valor también se escribe con números y el conjunto tiene una etiqueta accesible
 * («4,6 de 5, 18 reseñas»): no depende del color ni de leer las estrellas una por una. Sin calificación no dibuja nada.
 */
export function Estrellas({ promedio, cantidad, tamano = "sm", mostrarNumero = true, mostrarVacio = false, className }: { promedio?: number | null; cantidad?: number; tamano?: "sm" | "lg"; mostrarNumero?: boolean; /** Sin calificaciones: dibuja las cinco estrellas vacías y «Sin reseñas» en lugar de nada. */ mostrarVacio?: boolean; className?: string }) {
  if (promedio == null || !cantidad) {
    if (!mostrarVacio) return null
    return (
      <span className={cn("inline-flex items-center gap-1.5", className)} role="img" aria-label="Sin reseñas todavía">
        <span className="inline-flex" aria-hidden="true">
          {[1, 2, 3, 4, 5].map((i) => (
            <Star key={i} className={cn(tamano === "lg" ? "size-5" : "size-3.5", "fill-transparent text-white/35")} strokeWidth={1.8} />
          ))}
        </span>
        {mostrarNumero && <span className={cn("font-medium text-white/50", tamano === "lg" ? "text-[14px]" : "text-[11.5px]")}>Sin reseñas</span>}
      </span>
    )
  }
  const redondeado = Math.round(promedio * 2) / 2
  return (
    <span className={cn("inline-flex items-center gap-1.5", className)} role="img" aria-label={`${formato(promedio)} de 5, ${cantidad} ${cantidad === 1 ? "reseña" : "reseñas"}`}>
      <span className="inline-flex" aria-hidden="true">
        {[1, 2, 3, 4, 5].map((i) => {
          const llena = redondeado >= i
          const media = !llena && redondeado >= i - 0.5
          return (
            <span key={i} className="relative inline-flex">
              <Star className={cn(tamano === "lg" ? "size-5" : "size-3.5", "text-warning", llena ? "fill-warning" : "fill-transparent")} strokeWidth={1.8} />
              {media && (
                <span className="absolute inset-0 overflow-hidden" style={{ width: "50%" }}>
                  <Star className={cn(tamano === "lg" ? "size-5" : "size-3.5", "fill-warning text-warning")} strokeWidth={1.8} />
                </span>
              )}
            </span>
          )
        })}
      </span>
      {mostrarNumero && (
        <span className={cn("font-semibold text-muted-foreground", tamano === "lg" ? "text-[14px]" : "text-[12px]")}>
          {formato(promedio)} <span className="font-medium">({cantidad})</span>
        </span>
      )}
    </span>
  )
}
