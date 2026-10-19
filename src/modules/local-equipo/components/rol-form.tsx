"use client"

import * as React from "react"
import { Controller, useForm, useWatch } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Trash2 } from "lucide-react"

import { FloatingInput } from "@/shared/components/composed/floating-input"
import { Button } from "@/shared/components/ui/button"
import { BarraPaginacion, GrillaAjustada } from "@/shared/components/ui/pagination"
import { usePaginacionAjustada } from "@/shared/hooks"
import { useConfirm } from "@/shared/providers/confirm-provider"
import { cn } from "@/shared/utils/cn"

import { rolFormSchema, rolToFormValues, todasLasClaves, type ModuloCatalogo, type RolDetalle, type RolFormValues } from "../schema"
import { EncabezadoSeccion, ocultarEnPantallaBaja } from "./encabezado-seccion"
import { botonPrimario as botonPrimarioBase, botonSecundario as botonSecundarioBase, errorClass, panelClass } from "./estilos"
import { TarjetaModulo } from "./tarjeta-modulo"

const botonPrimario = cn(botonPrimarioBase, "px-5")
const botonSecundario = cn(botonSecundarioBase, "px-5")
// Cada acción ocupa una fila: la tarjeta crece con el módulo que más tiene para que ninguna haga scroll interno
const ALTO_BASE_TARJETA_MODULO = 84
const ALTO_FILA_ACCION = 32

/** Vista «Crear nuevo rol» / «Editar permisos»: datos del cargo y permisos por módulo. */
export function RolForm({
  rol,
  catalogo,
  puedeEditar,
  puedeEliminar,
  empleadosAsignados,
  onGuardar,
  onEliminar,
  onVolver,
}: {
  // Rol a editar; si no se envía, se crea uno nuevo
  rol?: RolDetalle
  catalogo: ModuloCatalogo[]
  puedeEditar: boolean
  puedeEliminar: boolean
  empleadosAsignados: number
  // Devuelven true si la operación terminó bien (entonces se vuelve a la lista)
  onGuardar: (values: RolFormValues, rol?: RolDetalle) => Promise<boolean>
  onEliminar: (rol: RolDetalle) => Promise<boolean>
  onVolver: () => void
}) {
  const esEdicion = Boolean(rol)
  const soloLectura = !puedeEditar
  const confirm = useConfirm()
  const [eliminando, setEliminando] = React.useState(false)

  const {
    register,
    handleSubmit,
    control,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<RolFormValues>({
    resolver: zodResolver(rolFormSchema),
    defaultValues: rolToFormValues(rol),
  })

  const permisos = useWatch({ control, name: "permisos" })
  const todas = React.useMemo(() => todasLasClaves(catalogo), [catalogo])
  const altoTarjeta = ALTO_BASE_TARJETA_MODULO + Math.max(1, ...catalogo.map((m) => m.acciones.length)) * ALTO_FILA_ACCION
  const paginacion = usePaginacionAjustada(catalogo, { altoItem: altoTarjeta, anchoMinimo: 220 })

  const todosSeleccionados = todas.length > 0 && permisos.length === todas.length

  const onSubmit = async (values: RolFormValues) => {
    if (await onGuardar(values, rol)) onVolver()
  }

  const titulo = !esEdicion ? "Crear Nuevo Rol" : soloLectura ? `Permisos de ${rol?.nombre}` : "Editar Permisos"
  const descripcion = !esEdicion
    ? "Configura un nuevo cargo definiendo sus responsabilidades y permisos en el sistema."
    : soloLectura
      ? "Consulta los módulos y acciones habilitados para este cargo."
      : "Actualiza las responsabilidades y los permisos de este cargo."

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="flex h-full min-h-0 flex-col gap-4 overflow-hidden [@media(max-height:700px)]:gap-2"
      noValidate
    >
      <EncabezadoSeccion titulo={titulo} descripcion={descripcion} />

      <div
        className={cn(
          panelClass,
          "flex min-h-0 flex-1 flex-col gap-4 p-4 sm:p-5 [@media(max-height:700px)]:gap-2.5 [@media(max-height:700px)]:p-3"
        )}
      >
        {/* Datos del rol */}
        <div className="grid shrink-0 grid-cols-1 gap-3 md:grid-cols-[minmax(0,1fr)_minmax(0,2fr)] md:gap-4">
          <div className="flex flex-col gap-1.5">
            <FloatingInput
              id="rol-nombre"
              label="Nombre del rol"
              {...register("nombre")}
              maxLength={50}
              autoComplete="off"
              disabled={soloLectura}
              state={errors.nombre ? "error" : "default"}
              aria-invalid={Boolean(errors.nombre)}
            />
            {errors.nombre && <p className={errorClass}>{errors.nombre.message}</p>}
          </div>
          <div className="flex flex-col gap-1.5">
            <FloatingInput
              id="rol-descripcion"
              label="Descripción de las responsabilidades"
              {...register("descripcion")}
              maxLength={255}
              autoComplete="off"
              disabled={soloLectura}
              state={errors.descripcion ? "error" : "default"}
              aria-invalid={Boolean(errors.descripcion)}
            />
            {errors.descripcion && <p className={errorClass}>{errors.descripcion.message}</p>}
          </div>
        </div>

        <div className="h-px shrink-0 bg-slate-200 dark:bg-stone-800" />

        {/* Permisos por módulo */}
        <div className="flex shrink-0 items-end justify-between gap-3">
          <div className="flex min-w-0 flex-col gap-0.5">
            <h2 className="text-base font-bold text-slate-900 sm:text-lg dark:text-stone-100">Permisos por Módulo</h2>
            <p className={cn("line-clamp-1 text-xs text-slate-500 dark:text-stone-400", ocultarEnPantallaBaja)}>
              Selecciona las áreas a las que este cargo tendrá acceso.
            </p>
          </div>
          <div className="flex shrink-0 items-center gap-3">
            <span className="hidden text-xs font-medium text-slate-500 tabular-nums sm:inline dark:text-stone-400">
              {permisos.length} de {todas.length}
            </span>
            {!soloLectura && (
              <button
                type="button"
                onClick={() =>
                  setValue("permisos", todosSeleccionados ? [] : [...todas], {
                    shouldDirty: true,
                    shouldValidate: true,
                  })
                }
                className="cursor-pointer text-xs font-semibold text-[#4C0107] hover:underline dark:text-[#E7B7BC]"
              >
                {todosSeleccionados ? "Quitar todo" : "Seleccionar todo"}
              </button>
            )}
          </div>
        </div>
        {errors.permisos && <p className={cn(errorClass, "-mt-2 shrink-0")}>{errors.permisos.message}</p>}

        <Controller
          control={control}
          name="permisos"
          render={({ field }) => (
            <GrillaAjustada paginacion={paginacion} etiqueta="Permisos por módulo">
              {paginacion.visibles.map((modulo) => (
                <li key={modulo.modulo} className="min-h-0">
                  <TarjetaModulo
                    modulo={modulo}
                    seleccionados={field.value}
                    soloLectura={soloLectura}
                    onChange={(siguientes) => field.onChange(siguientes)}
                  />
                </li>
              ))}
            </GrillaAjustada>
          )}
        />

        <BarraPaginacion paginacion={paginacion} etiqueta="módulos" />

        {/* Acciones */}
        <div className="grid shrink-0 grid-cols-[1fr_auto_1fr] items-center gap-2 border-t border-slate-200 pt-4 dark:border-stone-800 [@media(max-height:700px)]:pt-2.5">
          <div className="min-w-0">
            {esEdicion && !soloLectura && puedeEliminar && rol && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                loading={eliminando}
                onClick={async () => {
                  if (!(await confirm({ variant: "destructive" }))) return
                  setEliminando(true)
                  const eliminado = await onEliminar(rol)
                  setEliminando(false)
                  if (eliminado) onVolver()
                }}
                disabled={empleadosAsignados > 0 || isSubmitting}
                title={empleadosAsignados > 0 ? "Tiene empleados asignados" : undefined}
                leftIcon={<Trash2 className="size-4" />}
                className="h-10 rounded-full px-3 text-red-600 hover:bg-red-50 disabled:opacity-40 dark:text-red-400 dark:hover:bg-red-500/10"
              >
                <span className="hidden sm:inline">Eliminar rol</span>
              </Button>
            )}
          </div>

          <div className="flex items-center justify-center gap-3">
            <Button
              type="button"
              variant="neutral"
              size="sm"
              onClick={onVolver}
              disabled={isSubmitting || eliminando}
              className={cn(botonSecundario, "w-40")}
            >
              {soloLectura ? "Volver" : "Cancelar"}
            </Button>
            {!soloLectura && (
              <Button type="submit" size="sm" disabled={isSubmitting || eliminando} className={cn(botonPrimario, "w-40")}>
                {esEdicion ? "Guardar cambios" : "Crear Rol"}
              </Button>
            )}
          </div>
          <div aria-hidden />
        </div>
      </div>
    </form>
  )
}
