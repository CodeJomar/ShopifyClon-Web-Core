import * as React from "react"
import Link from "next/link"
import { ChevronLeft, ChevronRight, Search, SearchX } from "lucide-react"
import { claseBotonContorno, claseContenedor } from "@/shared/components/marketing/estilos"
import { cn } from "@/shared/utils/cn"

/** Un enlace de filtro u orden: etiqueta, destino y si está activo. */
export interface OpcionListado {
  etiqueta: string
  href: string
  activa: boolean
}

interface ListadoMercadoProps {
  titulo: string
  descripcion: React.ReactNode
  /** Formulario de búsqueda: a dónde va, el texto actual y los parámetros que se conservan al buscar. */
  buscador: { accion: string; placeholder: string; valor?: string; conservar?: Record<string, string | undefined> }
  /** Fila opcional de chips de filtro (por ejemplo, categorías). */
  chips?: OpcionListado[]
  /** Texto a la izquierda de la fila de orden (por ejemplo, «12 productos»). */
  resumen: string
  /** Opciones de orden; si no hay, la fila solo muestra el resumen. */
  orden?: OpcionListado[]
  /** Paginación (desde 1). */
  pagina: number
  totalPaginas: number
  enlacePagina: (pagina: number) => string
  /** Mensaje cuando no hay resultados. */
  vacio: { titulo: string; texto: string; enlace: string; etiquetaEnlace: string }
  hayResultados: boolean
  children: React.ReactNode
}

/**
 * Estructura común de las listas del mercado (productos y tiendas): título, panel de búsqueda y filtros, contenido y paginación.
 * Las dos pantallas la comparten; solo cambia lo que se pone dentro.
 */
export function ListadoMercado({ titulo, descripcion, buscador, chips, resumen, orden, pagina, totalPaginas, enlacePagina, vacio, hayResultados, children }: ListadoMercadoProps) {
  return (
    <div className={cn(claseContenedor, "py-10 sm:py-14")}>
      <h1 className="text-[34px] font-extrabold leading-tight tracking-tight text-foreground sm:text-[44px]">{titulo}</h1>
      <p className="mt-2 max-w-2xl text-[15px] font-medium text-muted-foreground">{descripcion}</p>

      <div className="vidrio mt-8 rounded-3xl p-4 sm:p-5">
        <form action={buscador.accion} method="get" role="search" className="relative">
          {Object.entries(buscador.conservar ?? {}).map(([nombre, valor]) => (valor ? <input key={nombre} type="hidden" name={nombre} value={valor} /> : null))}
          <label className="block">
            <span className="sr-only">{buscador.placeholder}</span>
            <Search aria-hidden="true" className="pointer-events-none absolute left-4 top-1/2 size-[18px] -translate-y-1/2 text-brand-text" />
            <input
              name="q"
              type="search"
              defaultValue={buscador.valor}
              placeholder={buscador.placeholder}
              className="h-12 w-full rounded-2xl border border-white/12 bg-black/25 pl-11 pr-28 text-[15px] font-medium text-foreground outline-none transition-colors placeholder:text-muted-foreground hover:border-white/25 focus:border-primary"
            />
          </label>
          <button
            type="submit"
            className="absolute right-1.5 top-1/2 h-9 -translate-y-1/2 rounded-xl bg-primary px-5 text-[13.5px] font-extrabold text-sobre-marca outline-none transition-all hover:brightness-110"
          >
            Buscar
          </button>
        </form>

        {chips && chips.length > 0 && (
          <div className="mt-4 flex gap-2 overflow-x-auto pb-1 [scrollbar-width:none]" role="group" aria-label="Categorías">
            {chips.map((c) => (
              <Link
                key={c.etiqueta}
                href={c.href}
                aria-current={c.activa ? "true" : undefined}
                className={cn(
                  "shrink-0 rounded-full border px-4 py-2 text-[13.5px] font-semibold outline-none transition-all",
                  c.activa
                    ? "border-transparent bg-primary text-sobre-marca shadow-[0_0_22px_-4px_rgb(0_230_153/0.8)]"
                    : "border-white/12 bg-white/[0.06] text-foreground hover:border-primary hover:bg-primary/10",
                )}
              >
                {c.etiqueta}
              </Link>
            ))}
          </div>
        )}

        <div className="mt-4 flex flex-wrap items-center justify-between gap-x-4 gap-y-2 border-t border-white/10 pt-4">
          <p className="text-[13.5px] font-semibold text-muted-foreground">{resumen}</p>
          {orden && orden.length > 0 && (
            <div className="flex items-center gap-1 rounded-xl bg-black/25 p-1" role="group" aria-label="Ordenar por">
              {orden.map((o) => (
                <Link
                  key={o.etiqueta}
                  href={o.href}
                  aria-current={o.activa ? "true" : undefined}
                  className={cn(
                    "rounded-lg px-3 py-1.5 text-[13px] font-semibold outline-none transition-colors",
                    o.activa ? "bg-primary/15 text-brand-text" : "text-muted-foreground hover:text-foreground",
                  )}
                >
                  {o.etiqueta}
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>

      {hayResultados ? (
        <>
          <div className="mt-8">{children}</div>
          <Paginacion pagina={pagina} totalPaginas={totalPaginas} enlacePagina={enlacePagina} />
        </>
      ) : (
        <div className="vidrio mt-10 flex flex-col items-center rounded-3xl px-6 py-16 text-center">
          <SearchX aria-hidden="true" className="size-10 text-muted-foreground" strokeWidth={1.5} />
          <h2 className="mt-4 text-[20px] font-extrabold tracking-tight text-foreground">{vacio.titulo}</h2>
          <p className="mt-1 max-w-md text-[14px] text-muted-foreground">{vacio.texto}</p>
          <Link href={vacio.enlace} className={cn(claseBotonContorno, "mt-6")}>
            {vacio.etiquetaEnlace}
          </Link>
        </div>
      )}
    </div>
  )
}

/** Páginas visibles: la primera, la última y las vecinas de la actual, con «…» donde se salta. */
function paginasVisibles(actual: number, total: number): (number | "…")[] {
  const set = new Set([1, total, actual - 1, actual, actual + 1].filter((n) => n >= 1 && n <= total))
  const orden = [...set].sort((a, b) => a - b)
  const salida: (number | "…")[] = []
  orden.forEach((n, i) => {
    if (i > 0 && n - orden[i - 1] > 1) salida.push("…")
    salida.push(n)
  })
  return salida
}

/** Paginación numerada: anterior, números y siguiente. La página actual lleva el resalte neón. */
export function Paginacion({ pagina, totalPaginas, enlacePagina }: { pagina: number; totalPaginas: number; enlacePagina: (pagina: number) => string }) {
  if (totalPaginas <= 1) return null
  const base = "flex size-10 items-center justify-center rounded-xl border text-[14px] font-bold outline-none transition-all"
  return (
    <nav aria-label="Paginación" className="mt-10 flex flex-wrap items-center justify-center gap-2">
      {pagina > 1 ? (
        <Link href={enlacePagina(pagina - 1)} aria-label="Página anterior" className={cn(base, "border-white/12 bg-white/[0.06] text-foreground hover:border-primary")}>
          <ChevronLeft aria-hidden="true" className="size-4" />
        </Link>
      ) : (
        <span aria-hidden="true" className={cn(base, "border-white/8 text-muted-foreground/40")}><ChevronLeft className="size-4" /></span>
      )}
      {paginasVisibles(pagina, totalPaginas).map((n, i) =>
        n === "…" ? (
          <span key={`p${i}`} aria-hidden="true" className="px-1 text-muted-foreground">…</span>
        ) : (
          <Link
            key={n}
            href={enlacePagina(n)}
            aria-label={`Página ${n}`}
            aria-current={n === pagina ? "page" : undefined}
            className={cn(base, n === pagina ? "border-transparent bg-primary text-sobre-marca shadow-[0_0_22px_-4px_rgb(0_230_153/0.8)]" : "border-white/12 bg-white/[0.06] text-foreground hover:border-primary")}
          >
            {n}
          </Link>
        ),
      )}
      {pagina < totalPaginas ? (
        <Link href={enlacePagina(pagina + 1)} aria-label="Página siguiente" className={cn(base, "border-white/12 bg-white/[0.06] text-foreground hover:border-primary")}>
          <ChevronRight aria-hidden="true" className="size-4" />
        </Link>
      ) : (
        <span aria-hidden="true" className={cn(base, "border-white/8 text-muted-foreground/40")}><ChevronRight className="size-4" /></span>
      )}
    </nav>
  )
}
