"use client"

import * as React from "react"
import { Check } from "lucide-react"

import type { GrupoModificadorDto } from "@/dtos/menu"
import { FloatingTextarea } from "@/shared/components/composed/floating-textarea"
import { FormPanel } from "@/shared/components/composed/form-panel"
import { Button } from "@/shared/components/ui/button"
import { cn } from "@/shared/utils/cn"
import { aCentimos, formatearCentimos } from "@/shared/utils/dinero"

import { MAX_NOTA_PREPARACION, errorDeSeleccion, grupoExcluyente, grupoObligatorio, precioUnitarioCentimos, type ProductoPos, type SeleccionModificador } from "../schema"
import { type ConfiguracionItem } from "../hooks/use-carrito"
import { etiquetaCampo } from "./modal-marco"
import { opcionClass } from "./estilos"

/* -------------------------------------------------------------------------- */
/*      Panel de personalización: extras en columna, nota y dos botones        */
/* -------------------------------------------------------------------------- */

interface PersonalizarProductoPanelProps {
  producto: ProductoPos
  onClose: () => void
  onConfirmar: (configuracion: ConfiguracionItem) => void
}

/**
 * Panel estándar del proyecto (FormPanel) que se abre al tocar cualquier producto. Los extras son los grupos que asignó el propietario, en una
 * columna; marcar uno no cierra el panel. El producto entra a la comanda solo con «Agregar a la comanda» o con
 * «Sin extras» (que conserva la nota pero descarta lo marcado). «Sin extras» no aparece si el producto no tiene grupos
 * (haría lo mismo que el otro botón) ni si algún grupo es obligatorio.
 */
export function PersonalizarProductoPanel({ producto, onClose, onConfirmar }: PersonalizarProductoPanelProps) {
  const grupos = [...producto.grupos_modificadores].sort((a, b) => a.orden_visual - b.orden_visual)
  // opciones elegidas por grupo (ids)
  const [elegidas, setElegidas] = React.useState<Record<string, string[]>>({})
  const [notas, setNotas] = React.useState("")
  const [intento, setIntento] = React.useState(false)

  const seleccion = (grupo: GrupoModificadorDto) => elegidas[grupo.id_grupo] ?? []

  const alternar = (grupo: GrupoModificadorDto, idOpcion: string) => {
    setElegidas((prev) => {
      const actuales = prev[grupo.id_grupo] ?? []
      if (actuales.includes(idOpcion)) {
        // Un grupo obligatorio excluyente no se "des-elige": se cambia de opción.
        if (grupoExcluyente(grupo) && grupoObligatorio(grupo)) return prev
        return { ...prev, [grupo.id_grupo]: actuales.filter((id) => id !== idOpcion) }
      }
      if (grupoExcluyente(grupo)) return { ...prev, [grupo.id_grupo]: [idOpcion] }
      if (grupo.seleccion_maxima > 0 && actuales.length >= grupo.seleccion_maxima) return prev
      return { ...prev, [grupo.id_grupo]: [...actuales, idOpcion] }
    })
  }

  const modificadores: SeleccionModificador[] = grupos.flatMap((grupo) =>
    seleccion(grupo).flatMap((id) => {
      const opcion = grupo.opciones.find((o) => o.id_opcion === id)
      return opcion
        ? [{ id_grupo: grupo.id_grupo, grupo: grupo.nombre, id_opcion: opcion.id_opcion, opcion: opcion.nombre, price_delta: opcion.price_delta }]
        : []
    }),
  )

  const errores = grupos.map((g) => errorDeSeleccion(g, seleccion(g).length))
  const valido = errores.every((e) => e === null)
  const unitario = precioUnitarioCentimos({ producto, modificadores })
  const notaLimpia = notas.trim() || undefined
  const mostrarSinExtras = grupos.length > 0 && !grupos.some(grupoObligatorio)

  return (
    <FormPanel
      open
      onOpenChange={(abierto) => !abierto && onClose()}
      title={producto.nombre}
      description="Personaliza el producto y agrega notas para cocina"
      footerClassName="flex-col sm:flex-col sm:[&>*]:w-full"
      footer={
        <>
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-500 dark:text-stone-400">Precio por unidad</span>
            <span className="text-lg font-bold tabular-nums text-[#4C0107] dark:text-[#E7B7BC]">{formatearCentimos(unitario)}</span>
          </div>
          <Button
            id="pos-agregar-personalizado"
            type="button"
            size="md"
            onClick={() => {
              setIntento(true)
              if (valido) onConfirmar({ modificadores, notas: notaLimpia })
            }}
          >
            Agregar a la comanda
          </Button>
          {mostrarSinExtras && (
            <Button id="pos-sin-extras" type="button" variant="neutral" size="md" onClick={() => onConfirmar({ modificadores: [], notas: notaLimpia })}>
              Sin extras
            </Button>
          )}
        </>
      }
    >
      <div className="flex flex-col gap-6">
          {grupos.length === 0 && (
            <p className="text-sm text-slate-500 dark:text-stone-400">Este producto no tiene extras: puedes agregar una nota de preparación.</p>
          )}

          {grupos.map((grupo, indice) => (
            <fieldset key={grupo.id_grupo} className="flex flex-col gap-2">
              <legend className={cn(etiquetaCampo, "mb-2")}>
                {grupo.nombre}{" "}
                <span className="font-normal normal-case tracking-normal">
                  {grupoObligatorio(grupo) ? "(obligatorio)" : grupoExcluyente(grupo) ? "(opcional, elige una)" : `(opcional, hasta ${grupo.seleccion_maxima || grupo.opciones.length})`}
                </span>
              </legend>
              <div className="flex flex-col gap-2">
                {[...grupo.opciones]
                  .sort((a, b) => a.orden_visual - b.orden_visual)
                  .map((opcion) => {
                    const activa = seleccion(grupo).includes(opcion.id_opcion)
                    const delta = aCentimos(opcion.price_delta)
                    return (
                      <button
                        key={opcion.id_opcion}
                        type="button"
                        aria-pressed={activa}
                        disabled={!opcion.disponible}
                        onClick={() => alternar(grupo, opcion.id_opcion)}
                        className={cn(
                          "flex min-h-14 w-full cursor-pointer items-center justify-between gap-3 rounded-2xl border px-4 py-3 text-left text-sm font-semibold transition-colors active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-40",
                          opcionClass(activa),
                        )}
                      >
                        <span className="flex min-w-0 items-center gap-2">
                          {activa && <Check className="size-4 shrink-0" />}
                          <span className="truncate">{opcion.nombre}</span>
                        </span>
                        {!opcion.disponible ? (
                          <span className="shrink-0 text-xs font-medium">Agotado</span>
                        ) : (
                          delta !== 0 && (
                            <span className="shrink-0 text-xs font-medium opacity-80">
                              {delta > 0 ? "+" : "-"}
                              {formatearCentimos(Math.abs(delta))}
                            </span>
                          )
                        )}
                      </button>
                    )
                  })}
              </div>
              {intento && errores[indice] && <span className="text-xs font-medium text-red-600 dark:text-red-400">{errores[indice]}</span>}
            </fieldset>
          ))}

          <FloatingTextarea
            id="pos-notas"
            label="Nota de preparación (opcional)"
            value={notas}
            onChange={(e) => setNotas(e.target.value)}
            maxLength={MAX_NOTA_PREPARACION}
            rows={3}
          />
        </div>

    </FormPanel>
  )
}
