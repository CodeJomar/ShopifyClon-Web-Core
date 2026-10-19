"use client"

import * as React from "react"
import { RefreshCw, UtensilsCrossed, Wifi, WifiOff } from "lucide-react"
import { useCan } from "@/modules/auth"
import { Button } from "@/shared/components/ui/button"
import { BarraPaginacion } from "@/shared/components/ui/pagination"
import { usePaginacionSimple } from "@/shared/hooks/use-paginacion-simple"
import { ACCION, MODULO } from "@/shared/constants/permisos"
import { useAhora } from "@/shared/hooks/use-ahora"
import { cn } from "@/shared/utils/cn"
import { COMANDAS_POR_PAGINA } from "../schema"
import { useTableroKds } from "../hooks/use-tablero-kds"
import { FiltroEstados } from "../components/filtro-estados"
import { KdsSkeleton } from "../components/kds-skeleton"
import { EstadoError } from "@/shared/components/composed/estado-error"
import { EstadoVacio } from "@/shared/components/composed/estado-vacio"
import { ComandaCard } from "../components/comanda-card"
import { DetalleComandaModal } from "../components/detalle-comanda-modal"

/* -------------------------------------------------------------------------- */
/*                          Vista principal del KDS                            */
/* -------------------------------------------------------------------------- */

export function KdsView() {
  const { puede } = useCan()
  // Ver el tablero lo exige la ruta (layout del workspace); aquí solo se decide si se puede despachar.
  const puedeDespachar = puede({ modulo: MODULO.KDS, accion: ACCION.DESPACHAR })

  const {
    tarjetas,
    isLoading,
    error,
    enVivo,
    recargar,
    filtro,
    setFiltro,
    contadores,
    procesando,
    cambiarItem,
    marcarTodoListo,
  } = useTableroKds()

  // Los minutos transcurridos se recalculan en el navegador cada medio minuto.
  const ahora = useAhora(30_000)

  const [idDetalle, setIdDetalle] = React.useState<string | null>(null)
  // El detalle se busca en la lista viva: si el pedido sale de la cola, el modal se cierra solo.
  const detalle = idDetalle ? (tarjetas.find((t) => t.id_pedido === idDetalle) ?? null) : null

  // Al cambiar el filtro la paginación vuelve a la primera página sola (la clave cambia)
  const paginacion = usePaginacionSimple(tarjetas, { porPagina: COMANDAS_POR_PAGINA, clave: String(filtro) })
  const tarjetasPaginadas = paginacion.visibles

  return (
    <div className="flex flex-col gap-5 w-full">
      {/* Encabezado Responsivo */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-col gap-1">
          <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-stone-100">Cocina y Barra</h1>

          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-[#4C0107]/10 dark:bg-[#EDE5E6]/10 px-2.5 py-0.5 text-xs font-semibold text-[#4C0107] dark:text-[#EDE5E6]">
              {enVivo ? <Wifi className="size-3.5 text-emerald-600" /> : <WifiOff className="size-3.5 text-amber-600" />}
              {enVivo ? "En vivo" : "Actualización periódica"}
            </span>
            <span className="text-xs text-slate-400 dark:text-stone-500">·</span>
            <span className="text-xs font-medium text-slate-500 dark:text-stone-400">
              {contadores.todas} {contadores.todas === 1 ? "comanda en cola" : "comandas en cola"}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto shrink-0">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={recargar}
            disabled={isLoading}
            className="rounded-xl h-10 px-4 dark:border-stone-700 dark:text-stone-200 dark:hover:bg-stone-800 cursor-pointer shadow-xs"
          >
            <RefreshCw className={cn("mr-2 size-4", isLoading && "animate-spin")} />
            Actualizar
          </Button>
        </div>
      </div>

      {/* Barra de filtros por estado */}
      <FiltroEstados filtro={filtro} setFiltro={setFiltro} contadores={contadores} />

      {isLoading ? (
        <KdsSkeleton />
      ) : error ? (
        <EstadoError mensaje={error} onReintentar={recargar} />
      ) : tarjetas.length === 0 ? (
        <EstadoVacio
          icono={UtensilsCrossed}
          titulo="Sin comandas"
          descripcion={filtro === "todas" ? "No hay comandas en la cola en este momento." : "No hay comandas con el estado seleccionado."}
          accion={filtro === "todas" ? undefined : { texto: "Limpiar filtro", onClick: () => setFiltro("todas") }}
        />
      ) : (
        <div className="flex flex-col gap-5">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 items-stretch">
            {tarjetasPaginadas.map((tarjeta) => (
              <ComandaCard
                key={tarjeta.id_pedido}
                tarjeta={tarjeta}
                ahora={ahora}
                puedeDespachar={puedeDespachar}
                procesando={procesando}
                onCambiarItem={cambiarItem}
                onMarcarTodoListo={marcarTodoListo}
                onVerDetalle={() => setIdDetalle(tarjeta.id_pedido)}
              />
            ))}
          </div>

          <BarraPaginacion paginacion={paginacion} etiqueta="comandas" />
        </div>
      )}

      {detalle && <DetalleComandaModal tarjeta={detalle} ahora={ahora} onClose={() => setIdDetalle(null)} />}
    </div>
  )
}
