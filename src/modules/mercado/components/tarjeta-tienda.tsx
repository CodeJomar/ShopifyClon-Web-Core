import type { CSSProperties } from "react"
import Link from "next/link"
import { MapPin } from "lucide-react"
import { cn } from "@/shared/utils/cn"
import type { TiendaMercado } from "@/dtos/mercado"

/** Avatar de la tienda: inicial sobre el degradado de su matiz (mientras no haya logo). */
export function AvatarTienda({ tienda, className }: { tienda: Pick<TiendaMercado, "nombre" | "tono">; className?: string }) {
  return (
    <span
      aria-hidden="true"
      style={{ "--t": tienda.tono } as CSSProperties}
      className={cn(
        "flex size-12 shrink-0 items-center justify-center rounded-2xl text-[19px] font-extrabold",
        "bg-[linear-gradient(140deg,hsl(var(--t)_85%_82%),hsl(calc(var(--t)+40)_80%_70%))] text-[hsl(var(--t)_60%_20%)]",
        "dark:bg-[linear-gradient(140deg,hsl(var(--t)_50%_28%),hsl(calc(var(--t)+40)_50%_20%))] dark:text-[hsl(var(--t)_90%_88%)]",
        className,
      )}
    >
      {tienda.nombre.charAt(0)}
    </span>
  )
}

/** Tienda en una lista del mercado. */
export function TarjetaTienda({ tienda, className }: { tienda: TiendaMercado; className?: string }) {
  return (
    <Link
      href={`/mercado/tienda/${tienda.subdominio}`}
      className={cn(
        "group flex h-full flex-col gap-3 rounded-2xl border border-island-border bg-card p-5 shadow-isla outline-none transition-all duration-200",
        "hover:-translate-y-0.5 hover:border-primary/60 focus-visible:ring-[3px] focus-visible:ring-ring/30",
        className,
      )}
    >
      <div className="flex items-center gap-3">
        <AvatarTienda tienda={tienda} />
        <div className="min-w-0">
          <h3 className="truncate text-[15px] font-extrabold tracking-tight text-foreground">{tienda.nombre}</h3>
          <p className="flex items-center gap-1 text-[12px] font-medium text-muted-foreground">
            <MapPin aria-hidden="true" className="size-3.5" />
            {tienda.ciudad}
          </p>
        </div>
      </div>
      <p className="line-clamp-3 text-[13px] leading-relaxed text-muted-foreground">{tienda.descripcion}</p>
      <p className="mt-auto pt-1 text-[12.5px] font-bold text-brand-text">
        {tienda.total_productos} {tienda.total_productos === 1 ? "producto" : "productos"}
      </p>
    </Link>
  )
}
