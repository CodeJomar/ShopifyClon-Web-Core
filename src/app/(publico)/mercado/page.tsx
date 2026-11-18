import Link from "next/link"
import { ChevronLeft, ChevronRight, Search, SearchX } from "lucide-react"
import { TarjetaProducto } from "@/modules/mercado/components/tarjeta-producto"
import { listarCategorias, listarProductos } from "@/modules/mercado/datos"
import { claseBotonContorno, claseContenedor } from "@/shared/components/marketing/estilos"
import { cn } from "@/shared/utils/cn"
import type { OrdenProductos } from "@/dtos/mercado"

export const metadata = { title: "Mercado | OTemu", description: "Productos de tiendas independientes en un solo lugar." }

type Params = { q?: string | string[]; categoria?: string | string[]; orden?: string | string[]; pagina?: string | string[] }
const uno = (v?: string | string[]) => (Array.isArray(v) ? v[0] : v)

const ORDENES: { valor: OrdenProductos; etiqueta: string }[] = [
  { valor: "recientes", etiqueta: "Más recientes" },
  { valor: "precio_asc", etiqueta: "Menor precio" },
  { valor: "precio_desc", etiqueta: "Mayor precio" },
]

export default async function Mercado({ searchParams }: { searchParams: Promise<Params> }) {
  const sp = await searchParams
  const q = uno(sp.q)?.trim() || undefined
  const categoria = uno(sp.categoria) || undefined
  const orden = (ORDENES.find((o) => o.valor === uno(sp.orden))?.valor ?? "recientes") as OrdenProductos
  const [resultado, categorias] = await Promise.all([
    listarProductos({ q, categoria, orden, pagina: Math.max(0, (Number(uno(sp.pagina)) || 1) - 1), tamano: 12 }),
    listarCategorias(),
  ])

  const enlace = (cambios: Record<string, string | undefined>) => {
    const p = new URLSearchParams()
    const base = { q, categoria, orden: orden === "recientes" ? undefined : orden, ...cambios }
    for (const [k, v] of Object.entries(base)) if (v) p.set(k, v)
    const texto = p.toString()
    return texto ? `/mercado?${texto}` : "/mercado"
  }
  const categoriaActual = categorias.find((c) => c.slug === categoria)
  const hayFiltros = Boolean(q || categoria)

  return (
    <div className={cn(claseContenedor, "py-10 sm:py-14")}>
      <h1 className="text-[34px] font-extrabold leading-tight tracking-tight text-foreground sm:text-[44px]">
        {categoriaActual ? categoriaActual.nombre : q ? `Resultados para «${q}»` : "Mercado"}
      </h1>
      <p className="mt-2 text-[15px] font-medium text-muted-foreground">
        {resultado.total} {resultado.total === 1 ? "producto" : "productos"}
        {hayFiltros ? " con estos filtros" : " de tiendas independientes"}.
      </p>

      <div className="mt-8 space-y-4 rounded-3xl vidrio p-4 sm:p-5">
        <form action="/mercado" method="get" role="search" className="flex gap-2">
          {categoria && <input type="hidden" name="categoria" value={categoria} />}
          {orden !== "recientes" && <input type="hidden" name="orden" value={orden} />}
          <label className="relative block flex-1">
            <span className="sr-only">Buscar en el mercado</span>
            <Search aria-hidden="true" className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <input
              name="q"
              type="search"
              defaultValue={q}
              placeholder="Buscar productos o tiendas"
              className="h-11 w-full rounded-xl border-[1.8px] border-input bg-transparent pl-10 pr-3 text-[14px] font-medium text-foreground outline-none transition-colors placeholder:text-muted-foreground hover:border-border-hover focus-visible:border-primary focus-visible:ring-[3.5px] focus-visible:ring-primary/18"
            />
          </label>
          <button type="submit" className="h-11 rounded-xl bg-primary px-5 text-[14px] font-extrabold text-sobre-marca outline-none transition-all hover:brightness-105 focus-visible:ring-[3px] focus-visible:ring-ring/40">
            Buscar
          </button>
        </form>

        <div className="flex flex-wrap items-center gap-2" role="group" aria-label="Categorías">
          {[{ slug: "", nombre: "Todas" }, ...categorias].map((c) => {
            const activa = (categoria ?? "") === c.slug
            return (
              <Link
                key={c.slug || "todas"}
                href={enlace({ categoria: c.slug || undefined, pagina: undefined })}
                aria-current={activa ? "true" : undefined}
                className={cn(
                  "rounded-full border px-4 py-2 text-[13.5px] font-semibold outline-none transition-colors focus-visible:ring-[3px] focus-visible:ring-ring/40",
                  activa ? "border-transparent bg-primary text-sobre-marca" : "border-white/12 bg-white/[0.06] text-foreground backdrop-blur-md hover:border-primary hover:bg-primary/10",
                )}
              >
                {c.nombre}
              </Link>
            )
          })}
        </div>

        <div className="flex flex-wrap items-center gap-2 border-t border-border/60 pt-4" role="group" aria-label="Ordenar por">
          <span className="mr-1 text-[13px] font-bold text-muted-foreground">Ordenar</span>
          {ORDENES.map((o) => (
            <Link
              key={o.valor}
              href={enlace({ orden: o.valor === "recientes" ? undefined : o.valor, pagina: undefined })}
              aria-current={orden === o.valor ? "true" : undefined}
              className={cn(
                "rounded-lg px-3 py-1.5 text-[13px] font-semibold outline-none transition-colors focus-visible:ring-[3px] focus-visible:ring-ring/40",
                orden === o.valor ? "bg-primary/15 text-brand-text" : "text-muted-foreground hover:text-foreground",
              )}
            >
              {o.etiqueta}
            </Link>
          ))}
        </div>
      </div>

      {resultado.datos.length === 0 ? (
        <div className="mt-10 flex flex-col items-center rounded-3xl border border-dashed border-border px-6 py-16 text-center">
          <SearchX aria-hidden="true" className="size-10 text-muted-foreground" strokeWidth={1.5} />
          <h2 className="mt-4 text-[20px] font-extrabold tracking-tight text-foreground">No encontramos productos con esa búsqueda</h2>
          <p className="mt-1 max-w-md text-[14px] text-muted-foreground">Prueba con otra palabra o quita los filtros para ver todo el mercado.</p>
          <Link href="/mercado" className={cn(claseBotonContorno, "mt-6")}>
            Ver todo el mercado
          </Link>
        </div>
      ) : (
        <ul className="mt-8 grid grid-cols-2 gap-3 sm:gap-5 md:grid-cols-3 lg:grid-cols-4">
          {resultado.datos.map((p) => (
            <li key={p.id}>
              <TarjetaProducto producto={p} className="h-full" />
            </li>
          ))}
        </ul>
      )}

      {resultado.total_paginas > 1 && (
        <nav aria-label="Paginación" className="mt-10 flex items-center justify-center gap-2">
          {(resultado.pagina_actual + 1) > 1 && (
            <Link href={enlace({ pagina: String((resultado.pagina_actual + 1) - 1) })} className={cn(claseBotonContorno, "h-10 px-3")} aria-label="Página anterior">
              <ChevronLeft aria-hidden="true" />
            </Link>
          )}
          <p className="px-3 text-[14px] font-semibold text-muted-foreground">
            Página {(resultado.pagina_actual + 1)} de {resultado.total_paginas}
          </p>
          {(resultado.pagina_actual + 1) < resultado.total_paginas && (
            <Link href={enlace({ pagina: String((resultado.pagina_actual + 1) + 1) })} className={cn(claseBotonContorno, "h-10 px-3")} aria-label="Página siguiente">
              <ChevronRight aria-hidden="true" />
            </Link>
          )}
        </nav>
      )}
    </div>
  )
}
