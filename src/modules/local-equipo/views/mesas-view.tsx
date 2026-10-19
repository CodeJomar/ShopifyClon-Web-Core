"use client"

import * as React from "react"
import { Lock, MapPin, Plus, Tags } from "lucide-react"

import { useCan } from "@/modules/auth"
import { EstadoError } from "@/shared/components/composed/estado-error"
import { EstadoVacio } from "@/shared/components/composed/estado-vacio"
import { Button } from "@/shared/components/ui/button"
import { FiltroSelect } from "@/shared/components/composed/filtro-select"
import { BarraPaginacion, GrillaAjustada } from "@/shared/components/ui/pagination"
import { ACCION, MODULO } from "@/shared/constants/permisos"
import { usePaginacionAjustada } from "@/shared/hooks"
import { useConfirm } from "@/shared/providers/confirm-provider"

import {
  AreasForm,
  EncabezadoSeccion,
  GrillaSkeleton,
  MesaCard,
  MesaForm,
  botonPrimario,
  botonSecundario,
} from "../components"
import { usePlanoMesas } from "../hooks"
import { AREA_SIN_ASIGNAR, FILTRO_TODAS_LAS_AREAS, type Mesa } from "../schema"
import { ALTO_MESA, vistaClass } from "./medidas"

type ModalMesas = { modo: "registrar" } | { modo: "editar"; mesa: Mesa } | { modo: "areas" } | null

/** Configuración del plano de mesas. */
export function MesasView() {
  const { puede } = useCan()
  const puedeRegistrar = puede({ modulo: MODULO.TABLES, accion: ACCION.CREAR })
  const puedeEditar = puede({ modulo: MODULO.TABLES, accion: ACCION.EDITAR })
  const puedeEliminar = puede({ modulo: MODULO.TABLES, accion: ACCION.ELIMINAR })
  const confirm = useConfirm()

  const plano = usePlanoMesas()
  const [modal, setModal] = React.useState<ModalMesas>(null)
  const cerrarModal = React.useCallback(() => setModal(null), [])

  const paginacion = usePaginacionAjustada(plano.mesasFiltradas, {
    altoItem: ALTO_MESA,
    anchoMinimo: 190,
    clave: plano.areaFiltro,
  })

  const { mesas, areas, mesasFiltradas, mesasPorArea, resumen, isLoading, error, recargar } = plano
  // «Sin área» no es un área real: no se puede renombrar ni ofrecer al registrar
  const areasReales = areas.filter((a) => a !== AREA_SIN_ASIGNAR)

  return (
    <div className={vistaClass}>
      <EncabezadoSeccion
        titulo="Gestión de Mesas"
        descripcion="Registra, renombra o elimina las mesas del local y asígnalas a un área de atención."
        acciones={
          <>
            {puedeEditar && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setModal({ modo: "areas" })}
                disabled={isLoading || areasReales.length === 0}
                leftIcon={<Tags className="size-4" />}
                aria-label="Administrar áreas"
                className={botonSecundario}
              >
                <span className="hidden sm:inline">Áreas</span>
              </Button>
            )}
            {puedeRegistrar && (
              <Button
                type="button"
                size="sm"
                onClick={() => setModal({ modo: "registrar" })}
                disabled={isLoading}
                leftIcon={<Plus className="size-4" />}
                aria-label="Registrar nueva mesa"
                className={botonPrimario}
              >
                <span className="hidden sm:inline">Nueva Mesa</span>
              </Button>
            )}
          </>
        }
      />

      {/* Filtro por área y resumen */}
      <div className="flex shrink-0 items-center justify-between gap-3">
        <FiltroSelect
          label="Área de atención"
          value={plano.areaFiltro}
          onValueChange={plano.setAreaFiltro}
          disabled={isLoading}
          opciones={[
            { value: FILTRO_TODAS_LAS_AREAS, label: `Todas las áreas (${mesas.length})` },
            ...areas.map((a) => ({ value: a, label: `${a} (${mesasPorArea.get(a) ?? 0})` })),
          ]}
          className="w-full min-w-0 sm:w-60"
        />
        <p className="shrink-0 text-xs text-slate-500 tabular-nums dark:text-stone-400">
          {resumen.mesas} {resumen.mesas === 1 ? "mesa" : "mesas"} · {resumen.capacidad}{" "}
          <span className="hidden sm:inline">personas</span>
          <span className="sm:hidden">pers.</span>
        </p>
      </div>

      {!puedeEditar && (
        <p className="flex shrink-0 items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-600 dark:border-stone-800 dark:bg-stone-950/40 dark:text-stone-300">
          <Lock className="size-3.5 shrink-0" />
          <span className="truncate">Tu cargo no puede modificar el plano de mesas.</span>
        </p>
      )}

      {error ? (
        <EstadoError mensaje={error} onReintentar={recargar} className="min-h-0 flex-1" />
      ) : isLoading ? (
        <GrillaSkeleton />
      ) : mesasFiltradas.length === 0 ? (
        <EstadoVacio
          titulo="Sin mesas"
          descripcion="No hay mesas registradas en esta área."
          icono={MapPin}
          className="min-h-0 flex-1"
        />
      ) : (
        <>
          <GrillaAjustada paginacion={paginacion} etiqueta="Mesas del local">
            {paginacion.visibles.map((mesa) => (
              <li key={mesa.id_mesa} className="min-h-0">
                <MesaCard
                  mesa={mesa}
                  puedeEditar={puedeEditar}
                  puedeEliminar={puedeEliminar}
                  onEditar={(m) => setModal({ modo: "editar", mesa: m })}
                  onEliminar={async (m) => {
                    if (await confirm({ variant: "destructive" })) await plano.quitarMesa(m)
                  }}
                />
              </li>
            ))}
          </GrillaAjustada>
          <BarraPaginacion paginacion={paginacion} etiqueta="mesas" />
        </>
      )}

      {(modal?.modo === "registrar" || modal?.modo === "editar") && (
        <MesaForm
          mesa={modal.modo === "editar" ? modal.mesa : undefined}
          areas={areasReales}
          areaPorDefecto={plano.areaFiltro !== FILTRO_TODAS_LAS_AREAS ? plano.areaFiltro : undefined}
          onGuardar={plano.guardarMesa}
          onClose={cerrarModal}
        />
      )}

      {modal?.modo === "areas" && (
        <AreasForm areas={areasReales} mesasPorArea={mesasPorArea} onRenombrar={plano.cambiarNombreArea} onClose={cerrarModal} />
      )}
    </div>
  )
}
