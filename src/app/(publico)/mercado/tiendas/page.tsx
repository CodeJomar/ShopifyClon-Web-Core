import { TarjetaTienda } from "@/modules/mercado/components/tarjeta-tienda"
import { ListadoMercado } from "@/modules/mercado/components/listado-mercado"
import { listarTiendas } from "@/modules/mercado/datos"

// Datos vivos del mercado: no se prerenderiza al compilar.
export const dynamic = "force-dynamic"

export const metadata = { title: "Tiendas | OTemu", description: "Las tiendas independientes que venden en OTemu." }

type Params = { q?: string | string[]; pagina?: string | string[] }
const uno = (v?: string | string[]) => (Array.isArray(v) ? v[0] : v)

export default async function Tiendas({ searchParams }: { searchParams: Promise<Params> }) {
  const sp = await searchParams
  const q = uno(sp.q)?.trim() || undefined
  const pagina = Math.max(1, Number(uno(sp.pagina)) || 1)
  const resultado = await listarTiendas({ q, pagina: pagina - 1, tamano: 12 })

  const enlace = (n?: number) => {
    const p = new URLSearchParams()
    if (q) p.set("q", q)
    if (n && n > 1) p.set("pagina", String(n))
    const texto = p.toString()
    return texto ? `/mercado/tiendas?${texto}` : "/mercado/tiendas"
  }

  return (
    <ListadoMercado
      titulo={q ? `Tiendas para «${q}»` : "Tiendas"}
      descripcion="Cada tienda es independiente: tiene su catálogo, sus precios y despacha sus propios pedidos."
      buscador={{ accion: "/mercado/tiendas", placeholder: "Buscar tiendas", valor: q }}
      resumen={`${resultado.total} ${resultado.total === 1 ? "tienda" : "tiendas"}${q ? " con esta búsqueda" : ""}`}
      pagina={pagina}
      totalPaginas={resultado.total_paginas}
      enlacePagina={(n) => enlace(n)}
      hayResultados={resultado.datos.length > 0}
      vacio={{ titulo: "No encontramos tiendas con esa búsqueda", texto: "Prueba con otro nombre o mira todas las tiendas.", enlace: "/mercado/tiendas", etiquetaEnlace: "Ver todas las tiendas" }}
    >
      <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {resultado.datos.map((t) => (
          <li key={t.subdominio}>
            <TarjetaTienda tienda={t} />
          </li>
        ))}
      </ul>
    </ListadoMercado>
  )
}
