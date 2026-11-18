import { TarjetaProducto } from "@/modules/mercado/components/tarjeta-producto"
import { ListadoMercado } from "@/modules/mercado/components/listado-mercado"
import { conDetalleParaTarjeta, listarCategorias, listarProductos } from "@/modules/mercado/datos"
import type { OrdenProductos } from "@/dtos/mercado"

// Datos vivos del mercado: no se prerenderiza al compilar.
export const dynamic = "force-dynamic"

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
  const pagina = Math.max(1, Number(uno(sp.pagina)) || 1)
  const [pagina_, categorias] = await Promise.all([listarProductos({ q, categoria, orden, pagina: pagina - 1, tamano: 12 }), listarCategorias()])
  const resultado = { ...pagina_, datos: await conDetalleParaTarjeta(pagina_.datos) }

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
    <ListadoMercado
      titulo={categoriaActual ? categoriaActual.nombre : q ? `Resultados para «${q}»` : "Mercado"}
      descripcion="Productos de tiendas independientes en un solo lugar. Agrega de varias tiendas y paga una sola vez."
      buscador={{ accion: "/mercado", placeholder: "Buscar productos", valor: q, conservar: { categoria, orden: orden === "recientes" ? undefined : orden } }}
      chips={[{ etiqueta: "Todas", href: enlace({ categoria: undefined, pagina: undefined }), activa: !categoria }, ...categorias.map((c) => ({ etiqueta: c.nombre, href: enlace({ categoria: c.slug, pagina: undefined }), activa: categoria === c.slug }))]}
      resumen={`${resultado.total} ${resultado.total === 1 ? "producto" : "productos"}${hayFiltros ? " con estos filtros" : ""}`}
      orden={ORDENES.map((o) => ({ etiqueta: o.etiqueta, href: enlace({ orden: o.valor === "recientes" ? undefined : o.valor, pagina: undefined }), activa: orden === o.valor }))}
      pagina={pagina}
      totalPaginas={resultado.total_paginas}
      enlacePagina={(n) => enlace({ pagina: n > 1 ? String(n) : undefined })}
      hayResultados={resultado.datos.length > 0}
      vacio={{ titulo: "No encontramos productos con esa búsqueda", texto: "Prueba con otra palabra o quita los filtros para ver todo el mercado.", enlace: "/mercado", etiquetaEnlace: "Ver todo el mercado" }}
    >
      <ul className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {resultado.datos.map((p) => (
          <li key={p.id}>
            <TarjetaProducto producto={p} className="h-full" />
          </li>
        ))}
      </ul>
    </ListadoMercado>
  )
}
