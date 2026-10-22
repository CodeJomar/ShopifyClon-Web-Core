"use client"

import * as React from "react"
import Link from "next/link"
import { Badge } from "@/shared/components/ui/badge"
import { buttonVariants } from "@/shared/components/ui/button"
import { Card, CardContent } from "@/shared/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/shared/components/ui/alert"
import { EstadoVacio } from "@/shared/components/composed/estado-vacio"
import { BarraPaginacion } from "@/shared/components/composed/barra-paginacion"
import { EncabezadoPagina } from "@/shared/components/composed/encabezado-pagina"
import { ControlSegmentado } from "@/shared/components/composed/control-segmentado"
import { SearchInput } from "@/shared/components/composed/search-input"
import { Skeleton } from "@/shared/components/ui/skeleton"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/shared/components/ui/table"
import { useRouter } from "next/navigation"
import { ImageOff, LayoutGrid, List, Package, Plus, X } from "lucide-react"
import { Button } from "@/shared/components/ui/button"
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
  const router = useRouter()
  const { tienda, puede } = usePanel()
  const [vista, setVista] = React.useState<"cuadricula" | "lista">("cuadricula")
  const puedeEscribir = puede(PERMISO.CATALOGO_GESTIONAR)
  const moneda = tienda?.moneda ?? "PEN"
  const [pagina, setPagina] = React.useState(0)
  const [texto, setTexto] = React.useState("")
  const [textoAplicado, setTextoAplicado] = React.useState("")
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

  // La búsqueda espera a que termines de escribir
  React.useEffect(() => {
    const t = setTimeout(() => {
      setPagina(0)
      setTextoAplicado(texto)
    }, 350)
    return () => clearTimeout(t)
  }, [texto])

  const filtros: FiltrosProductos = {
    texto: textoAplicado.trim() || undefined,
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
  const limpiar = () => {
    setTexto("")
    setTextoAplicado("")
    setEstado(SIN_FILTRO)
    setCategoriaId(SIN_FILTRO)
    setPagina(0)
  }
  const estadoPublicacion = (publicado: boolean) =>
    publicado ? <Badge variant="estado" tono="marca">Activo en tienda</Badge> : <Badge variant="estado" tono="contorno">Borrador</Badge>
  const precio = (p: ProductoListaDto) => (p.precio_minimo != null ? `Desde ${formatearDinero(p.precio_minimo, moneda)}` : "Sin precio")
  const miniatura = (p: ProductoListaDto, clase: string) =>
    p.imagen_principal ? (
      // Miniatura por URL: el dominio lo elige la persona comerciante.
      // eslint-disable-next-line @next/next/no-img-element
      <img src={p.imagen_principal} alt="" className={clase} />
    ) : (
      <span className="flex size-full items-center justify-center text-muted-foreground" aria-label="Sin imagen">
        <ImageOff className="size-5" aria-hidden="true" />
      </span>
    )

  return (
    <div className="space-y-5">
      <EncabezadoPagina
        titulo="Productos"
        descripcion={datos ? `${datos.total} ${datos.total === 1 ? "producto" : "productos"}. Los nuevos empiezan como borrador.` : "Lo que vendes en tu tienda. Los nuevos empiezan como borrador."}
        acciones={
          puedeEscribir && (
            <Link href="/panel/productos/nuevo" className={buttonVariants({ variant: "default" })}>
              <Plus aria-hidden="true" />
              Agregar producto
            </Link>
          )
        }
      />

      <Card>
        <CardContent className="space-y-4">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <ControlSegmentado
              aria-label="Estado del producto"
              valor={estado}
              onCambiar={(v) => { setPagina(0); setEstado(v) }}
              opciones={[{ valor: SIN_FILTRO, etiqueta: "Todos" }, { valor: "publicados", etiqueta: "Publicados" }, { valor: "borradores", etiqueta: "Borradores" }]}
            />
            <div className="flex flex-1 flex-wrap items-center gap-2 lg:max-w-2xl lg:justify-end">
              <div className="min-w-[200px] flex-1">
                <SearchInput value={texto} onValueChange={setTexto} placeholder="Buscar por título" />
              </div>
              <label className="sr-only" htmlFor="filtro-categoria">Categoría</label>
              <select
                id="filtro-categoria"
                value={categoriaId}
                onChange={(e) => { setPagina(0); setCategoriaId(e.target.value) }}
                className="h-11 w-full cursor-pointer rounded-xl border-[1.8px] border-input bg-transparent px-3 text-[13px] font-medium text-foreground outline-none hover:border-border-hover focus-visible:border-primary focus-visible:ring-[3.5px] focus-visible:ring-primary/18 sm:w-48"
              >
                <option value={SIN_FILTRO}>Todas las categorías</option>
                {categorias.map((c) => (
                  <option key={c.id} value={c.id}>{c.nombre}</option>
                ))}
              </select>
              <ControlSegmentado
                aria-label="Vista"
                valor={vista}
                onCambiar={setVista}
                opciones={[{ valor: "cuadricula", etiqueta: <LayoutGrid className="size-4" aria-label="Cuadrícula" /> }, { valor: "lista", etiqueta: <List className="size-4" aria-label="Lista" /> }]}
              />
            </div>
          </div>
          {hayFiltros && (
            <div className="flex items-center justify-between gap-3 border-t border-border/60 pt-3">
              <p className="text-[12.5px] text-muted-foreground">Estás viendo una lista filtrada.</p>
              <Button variant="ghost" size="sm" onClick={limpiar} leftIcon={<X aria-hidden="true" />}>Limpiar filtros</Button>
            </div>
          )}
        </CardContent>
      </Card>

      {error && (
        <Alert variant="destructive">
          <AlertTitle>No pudimos cargar los productos</AlertTitle>
          <AlertDescription>{error.message}</AlertDescription>
        </Alert>
      )}

      {!datos && !error && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4" aria-busy="true" aria-label="Cargando productos">
          {Array.from({ length: 8 }, (_, i) => (
            <Skeleton key={i} className="h-64 rounded-xl" />
          ))}
        </div>
      )}

      {datos && lista.length === 0 && (
        <Card>
          <CardContent>
            <EstadoVacio
              icono={Package}
              titulo={hayFiltros ? "Ningún producto coincide con el filtro" : "Aún no tienes productos"}
              descripcion={hayFiltros ? "Prueba con otro texto o quita los filtros." : "Agrega tu primer producto con fotos, precio y stock para empezar a vender."}
              accion={hayFiltros ? { texto: "Limpiar filtros", onClick: limpiar } : puedeEscribir ? { texto: "Agregar producto", onClick: () => router.push("/panel/productos/nuevo") } : undefined}
            />
          </CardContent>
        </Card>
      )}

      {datos && lista.length > 0 && (
        <>
          {vista === "cuadricula" ? (
            <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {lista.map((producto) => (
                <li key={producto.id}>
                  <Link href={`/panel/productos/${producto.id}`} className="group block h-full rounded-xl outline-none focus-visible:ring-[3px] focus-visible:ring-ring/25">
                    <Card className="h-full gap-0 py-0 transition-all group-hover:-translate-y-px group-hover:border-primary/60">
                      <div className="aspect-[4/3] overflow-hidden bg-muted">{miniatura(producto, "size-full object-cover transition-transform duration-300 group-hover:scale-[1.03]")}</div>
                      <CardContent className="space-y-2 py-4">
                        <div className="flex items-start justify-between gap-2">
                          <p className="min-w-0 truncate text-[14px] font-bold text-foreground">{producto.titulo}</p>
                          {estadoPublicacion(producto.esta_publicado)}
                        </div>
                        <p className="text-[12.5px] text-muted-foreground">
                          <span className="font-bold text-foreground">{precio(producto)}</span> · {producto.numero_variantes} {producto.numero_variantes === 1 ? "variante" : "variantes"}
                        </p>
                      </CardContent>
                    </Card>
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <Card className="py-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="pl-6">Producto</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead>Variantes</TableHead>
                    <TableHead className="pr-6 text-right">Precio</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {lista.map((producto) => (
                    <TableRow key={producto.id} className="cursor-pointer" onClick={() => router.push(`/panel/productos/${producto.id}`)}>
                      <TableCell className="pl-6">
                        <div className="flex items-center gap-3">
                          <span className="block size-11 shrink-0 overflow-hidden rounded-lg bg-muted">{miniatura(producto, "size-full object-cover")}</span>
                          <Link href={`/panel/productos/${producto.id}`} className="max-w-[320px] truncate text-[13.5px] font-bold text-foreground hover:text-brand-text" onClick={(e) => e.stopPropagation()}>
                            {producto.titulo}
                          </Link>
                        </div>
                      </TableCell>
                      <TableCell>{estadoPublicacion(producto.esta_publicado)}</TableCell>
                      <TableCell className="text-[13px] text-muted-foreground">{producto.numero_variantes}</TableCell>
                      <TableCell className="pr-6 text-right text-[13.5px] font-extrabold">{precio(producto)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Card>
          )}
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
