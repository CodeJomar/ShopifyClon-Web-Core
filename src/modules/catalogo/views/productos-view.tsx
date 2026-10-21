"use client"

import * as React from "react"
import Link from "next/link"
import { Badge } from "@/shared/components/ui/badge"
import { buttonVariants } from "@/shared/components/ui/button"
import { Card, CardContent } from "@/shared/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/shared/components/ui/alert"
import { EstadoVacio } from "@/shared/components/composed/estado-vacio"
import { BarraPaginacion } from "@/shared/components/composed/barra-paginacion"
import { FloatingInput } from "@/shared/components/composed/floating-input"
import { FloatingSelect } from "@/shared/components/composed/floating-select"
import { SelectContent, SelectItem } from "@/shared/components/ui/select"
import { formatearDinero } from "@/shared/utils/dinero"
import { usePanel } from "@/modules/panel/hooks/use-panel"
import { PERMISO } from "@/shared/constants/permisos"
import { categoriasAction, productosAction, type FiltrosProductos } from "../actions/catalogo.actions"
import type { CategoriaDto, ProductoListaDto } from "@/dtos/catalogo"
import type { Paginado } from "@/dtos/core/respuesta-api.dto"
import type { ErrorApi } from "@/lib/api/error-api"

const SIN_FILTRO = "todos"

/** Lista de productos con filtros (texto, estado, categoría) y paginación. Página de la API desde 0. */
export function ProductosView() {
  const { tienda, puede } = usePanel()
  const puedeEscribir = puede(PERMISO.CATALOGO_GESTIONAR)
  const moneda = tienda?.moneda ?? "PEN"
  const [pagina, setPagina] = React.useState(0)
  const [texto, setTexto] = React.useState("")
  const [estado, setEstado] = React.useState<string>(SIN_FILTRO)
  const [categoriaId, setCategoriaId] = React.useState<string>(SIN_FILTRO)
  const [categorias, setCategorias] = React.useState<CategoriaDto[]>([])
  const [datos, setDatos] = React.useState<Paginado<ProductoListaDto> | null>(null)
  const [error, setError] = React.useState<ErrorApi | null>(null)

  React.useEffect(() => {
    let cancelado = false
    categoriasAction().then((res) => {
      if (!cancelado && res.ok) setCategorias(res.datos)
    })
    return () => {
      cancelado = true
    }
  }, [])

  const filtros: FiltrosProductos = {
    texto: texto.trim() || undefined,
    publicado: estado === SIN_FILTRO ? undefined : estado === "publicados",
    categoria_id: categoriaId === SIN_FILTRO ? undefined : categoriaId,
  }
  const filtrosClave = JSON.stringify(filtros)

  React.useEffect(() => {
    let cancelado = false
    productosAction(pagina, JSON.parse(filtrosClave) as FiltrosProductos).then((res) => {
      if (cancelado) return
      if (res.ok) {
        setError(null)
        setDatos(res.datos)
      } else setError(res.error)
    })
    return () => {
      cancelado = true
    }
  }, [pagina, filtrosClave])

  const lista = datos?.datos ?? []
  const hayFiltros = texto.trim() !== "" || estado !== SIN_FILTRO || categoriaId !== SIN_FILTRO

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-[18px] font-extrabold tracking-tight text-foreground">Productos</h1>
          <p className="mt-1 text-[13px] text-muted-foreground">Lo que vendes en tu tienda. Los nuevos empiezan como borrador.</p>
        </div>
        {puedeEscribir && (
          <Link href="/panel/productos/nuevo" className={buttonVariants({ variant: "default" })}>
            Agregar producto
          </Link>
        )}
      </div>

      <Card>
        <CardContent className="grid gap-4 sm:grid-cols-3">
          <FloatingInput label="Buscar por título" value={texto} onChange={(e) => { setPagina(0); setTexto(e.target.value) }} />
          <FloatingSelect label="Estado" value={estado} onValueChange={(v) => { setPagina(0); setEstado(String(v)) }}>
            <SelectContent>
              <SelectItem value={SIN_FILTRO}>Todos</SelectItem>
              <SelectItem value="publicados">Publicados</SelectItem>
              <SelectItem value="borradores">Borradores</SelectItem>
            </SelectContent>
          </FloatingSelect>
          <FloatingSelect
            label="Categoría"
            value={categoriaId}
            items={[{ value: SIN_FILTRO, label: "Todas" }, ...categorias.map((c) => ({ value: c.id, label: c.nombre }))]}
            onValueChange={(v) => { setPagina(0); setCategoriaId(String(v)) }}
          >
            <SelectContent>
              <SelectItem value={SIN_FILTRO}>Todas</SelectItem>
              {categorias.map((c) => (
                <SelectItem key={c.id} value={c.id}>{c.nombre}</SelectItem>
              ))}
            </SelectContent>
          </FloatingSelect>
        </CardContent>
      </Card>

      {error && (
        <Alert variant="destructive">
          <AlertTitle>No pudimos cargar los productos</AlertTitle>
          <AlertDescription>{error.message}</AlertDescription>
        </Alert>
      )}

      {!datos && !error && <p className="text-[13px] text-muted-foreground" aria-live="polite">Cargando productos…</p>}

      {datos && lista.length === 0 && (
        <Card>
          <CardContent>
            <EstadoVacio
              titulo={hayFiltros ? "Ningún producto coincide con el filtro" : "Aún no tienes productos"}
              descripcion={hayFiltros ? "Prueba con otro texto o quita los filtros." : "Agrega tu primer producto para empezar a vender."}
            />
          </CardContent>
        </Card>
      )}

      {datos && lista.length > 0 && (
        <>
          <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {lista.map((producto) => (
              <li key={producto.id}>
                <Link href={`/panel/productos/${producto.id}`} className="block h-full">
                  <Card className="h-full">
                    <CardContent className="space-y-3">
                      <div className="flex aspect-[4/3] items-center justify-center overflow-hidden rounded-xl bg-muted text-[12px] text-muted-foreground">
                        {producto.imagen_principal ? (
                          // Miniatura por URL: el dominio lo elige la persona comerciante.
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={producto.imagen_principal} alt="" className="size-full object-cover" />
                        ) : (
                          "Sin imagen"
                        )}
                      </div>
                      <div className="flex items-start justify-between gap-2">
                        <p className="min-w-0 truncate text-[14px] font-bold text-foreground">{producto.titulo}</p>
                        {producto.esta_publicado ? (
                          <Badge variant="estado" tono="marca">Activo en tienda</Badge>
                        ) : (
                          <Badge variant="estado" tono="contorno">Borrador</Badge>
                        )}
                      </div>
                      <p className="text-[12.5px] text-muted-foreground">
                        {producto.precio_minimo != null ? `Desde ${formatearDinero(producto.precio_minimo, moneda)}` : "Sin precio"} · {producto.numero_variantes} variante(s)
                      </p>
                    </CardContent>
                  </Card>
                </Link>
              </li>
            ))}
          </ul>
          <BarraPaginacion
            pagina={datos.pagina_actual + 1}
            totalPaginas={Math.max(1, datos.total_paginas)}
            total={datos.total}
            porPagina={datos.tamano_pagina}
            etiqueta="productos"
            onCambiar={(numero) => setPagina(numero - 1)}
          />
        </>
      )}
    </div>
  )
}
