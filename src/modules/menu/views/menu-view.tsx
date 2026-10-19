"use client"

import * as React from "react"
import { Plus, RefreshCw, SlidersHorizontal, Tags } from "lucide-react"
import { Button } from "@/shared/components/ui/button"
import { EstadoError } from "@/shared/components/composed/estado-error"
import { EstadoVacio } from "@/shared/components/composed/estado-vacio"
import { BarraPaginacion } from "@/shared/components/ui/pagination"
import { usePaginacionSimple } from "@/shared/hooks/use-paginacion-simple"
import { cn } from "@/shared/utils/cn"
import { useCan } from "@/modules/auth"
import { ACCION, MODULO } from "@/shared/constants/permisos"
import { useConfirm } from "@/shared/providers/confirm-provider"
import { type ProductoMenu } from "../schema"
import { useMenu } from "../hooks/use-menu"
import { ResumenStock } from "../components/resumen-stock"
import { MenuSkeleton } from "../components/menu-skeleton"
import { Filtros } from "../components/filtros-menu"
import { ProductoCard } from "../components/producto-card"
import { ProductoForm } from "../components/producto-form"
import { GruposForm } from "../components/grupos-form"
import { CategoriasForm } from "../components/categorias-form"

type ModalMenu =
  | { modo: "crear" }
  | { modo: "editar"; producto: ProductoMenu }
  | { modo: "categorias" }
  | { modo: "grupos" }
  | null

export function MenuView() {
  // Ver el menú lo exige la ruta (MENU:LEER); aquí se decide qué más puede hacer cada cargo
  const { puede } = useCan()
  const puedeCambiarStock = puede({ modulo: MODULO.MENU, accion: ACCION.DISPONIBILIDAD })
  const puedeCrear = puede({ modulo: MODULO.MENU, accion: ACCION.CREAR })
  const puedeEditar = puede({ modulo: MODULO.MENU, accion: ACCION.EDITAR })
  const puedeEliminar = puede({ modulo: MODULO.MENU, accion: ACCION.ELIMINAR })
  const puedeGestionarCategorias = puedeCrear || puedeEditar || puedeEliminar
  const confirm = useConfirm()

  const menu = useMenu()
  const [modal, setModal] = React.useState<ModalMenu>(null)
  const [itemsPorPagina, setItemsPorPagina] = React.useState(6)
  const cerrarModal = React.useCallback(() => setModal(null), [])

  // Ajuste reactivo del tamaño de página para evitar scroll vertical en cualquier dispositivo:
  // Móvil: 3 tarjetas (1 col) | Tablet: 4 tarjetas (2x2 cols) | Escritorio: 6 tarjetas (2x3 cols) | Pantalla ancha: 8 tarjetas (2x4 cols)
  React.useEffect(() => {
    const calcularLimite = () => {
      if (window.innerWidth < 640) {
        setItemsPorPagina(3)
      } else if (window.innerWidth < 1024) {
        setItemsPorPagina(4)
      } else if (window.innerWidth < 1536) {
        setItemsPorPagina(6)
      } else {
        setItemsPorPagina(8)
      }
    }
    calcularLimite()
    window.addEventListener("resize", calcularLimite)
    return () => window.removeEventListener("resize", calcularLimite)
  }, [])

  const { catalogo, productosFiltrados, resumen, isLoading, error, recargar } = menu

  // Al cambiar los filtros la paginación vuelve a la primera página sola (la clave cambia)
  const paginacion = usePaginacionSimple(productosFiltrados, {
    porPagina: itemsPorPagina,
    clave: `${menu.busqueda}|${menu.categoria}|${menu.disponibilidad}`,
  })

  return (
    <div className="flex flex-col gap-6 pb-2 w-full">
      {/* Barra superior integrada: 3 contenedores de conteo de productos y los 3 botones ajustados sin espacio vacío a la izquierda */}
      <div className="grid grid-cols-12 gap-3 sm:gap-4 items-center">
        {/* Contenedores de conteo de productos */}
        <div className="col-span-12 lg:col-span-7 xl:col-span-8">
          <ResumenStock
            resumen={resumen}
            activo={menu.disponibilidad}
            onSeleccionar={menu.setDisponibilidad}
          />
        </div>

        {/* Contenedor de los 3 botones ajustados a la misma fila */}
        <div className="col-span-12 lg:col-span-5 xl:col-span-4 flex flex-wrap items-center gap-2 lg:justify-end">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={recargar}
            disabled={isLoading}
            leftIcon={<RefreshCw className={cn("size-4", isLoading && "animate-spin")} />}
            className="h-10 rounded-xl px-4 dark:border-stone-700 dark:text-stone-200 dark:hover:bg-stone-800 cursor-pointer shadow-xs"
          >
            Actualizar
          </Button>

          {puedeGestionarCategorias && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setModal({ modo: "grupos" })}
              disabled={!catalogo}
              leftIcon={<SlidersHorizontal className="size-4" />}
              className="h-10 rounded-xl px-4 dark:border-stone-700 dark:text-stone-200 dark:hover:bg-stone-800 cursor-pointer shadow-xs"
            >
              Personalización
            </Button>
          )}

          {puedeGestionarCategorias && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setModal({ modo: "categorias" })}
              disabled={!catalogo}
              leftIcon={<Tags className="size-4" />}
              className="h-10 rounded-xl px-4 dark:border-stone-700 dark:text-stone-200 dark:hover:bg-stone-800 cursor-pointer shadow-xs"
            >
              Categorías
            </Button>
          )}

          {puedeCrear && (
            <Button
              type="button"
              size="sm"
              onClick={() => setModal({ modo: "crear" })}
              disabled={!catalogo || catalogo.categorias.length === 0}
              leftIcon={<Plus className="size-4" />}
              className="h-10 rounded-xl bg-[#4C0107] px-4 text-white hover:bg-[#4C0107]/90 dark:bg-stone-100 dark:text-stone-900 dark:hover:bg-stone-200 cursor-pointer shadow-xs"
            >
              Nuevo producto
            </Button>
          )}
        </div>
      </div>

      {error ? (
        <EstadoError mensaje={error} onReintentar={recargar} />
      ) : !catalogo || isLoading ? (
        <MenuSkeleton />
      ) : (
        <>

          {/* Filtros y búsqueda adaptables sin scroll horizontal */}
          <Filtros
            categorias={catalogo.categorias}
            productos={catalogo.productos}
            busqueda={menu.busqueda}
            onBusqueda={menu.setBusqueda}
            categoria={menu.categoria}
            onCategoria={menu.setCategoria}
          />

          {/* Catálogo de productos con regla de 12 columnas y alturas simétricas */}
          {productosFiltrados.length === 0 ? (
            <EstadoVacio
              titulo="Sin resultados"
              descripcion="No hay productos que coincidan con los filtros."
              accion={{ texto: "Limpiar filtros", onClick: menu.limpiarFiltros }}
            />
          ) : (
            <div className="flex flex-col gap-5">
              <ul className="grid grid-cols-12 gap-4 items-stretch list-none p-0 m-0">
                {paginacion.visibles.map((producto) => (
                  <li
                    key={producto.id_producto}
                    className="col-span-12 sm:col-span-6 lg:col-span-4 2xl:col-span-3 flex flex-col"
                  >
                    <ProductoCard
                      producto={producto}
                      categoria={catalogo.categorias.find((c) => c.id_categoria === producto.id_categoria)?.nombre ?? ""}
                      pendiente={menu.pendientes.has(producto.id_producto)}
                      puedeCambiarStock={puedeCambiarStock}
                      puedeEditar={puedeEditar}
                      puedeEliminar={puedeEliminar}
                      onToggle={menu.toggleDisponibilidad}
                      onEditar={(p) => setModal({ modo: "editar", producto: p })}
                      onEliminar={async (p) => {
                        if (await confirm({ variant: "destructive" })) await menu.quitarProducto(p)
                      }}
                    />
                  </li>
                ))}
              </ul>

              <BarraPaginacion paginacion={paginacion} etiqueta="productos" />
            </div>
          )}
        </>
      )}

      {modal && catalogo && (modal.modo === "crear" || modal.modo === "editar") && (
        <ProductoForm
          producto={modal.modo === "editar" ? modal.producto : undefined}
          categorias={catalogo.categorias}
          grupos={menu.grupos}
          onGuardar={menu.guardarProducto}
          onClose={cerrarModal}
        />
      )}

      {modal?.modo === "grupos" && catalogo && (
        <GruposForm
          grupos={menu.grupos}
          puedeCrear={puedeCrear}
          puedeEditar={puedeEditar}
          puedeEliminar={puedeEliminar}
          onGuardarGrupo={menu.guardarGrupo}
          onEliminarGrupo={menu.quitarGrupo}
          onGuardarOpcion={menu.guardarOpcion}
          onAlternarOpcion={menu.alternarOpcion}
          onEliminarOpcion={menu.quitarOpcion}
          onClose={cerrarModal}
        />
      )}

      {modal?.modo === "categorias" && catalogo && (
        <CategoriasForm
          categorias={catalogo.categorias}
          productos={catalogo.productos}
          puedeCrear={puedeCrear}
          puedeEditar={puedeEditar}
          puedeEliminar={puedeEliminar}
          onGuardar={menu.guardarCategoria}
          onEliminar={(c) => menu.quitarCategoria(c.id_categoria, c.nombre)}
          onOrdenar={menu.ordenarCategorias}
          onClose={cerrarModal}
        />
      )}
    </div>
  )
}
