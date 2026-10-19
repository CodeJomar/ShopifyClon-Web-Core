"use client"

import { getCategoriaConfig } from "@/shared/utils/categoria-visual"
import * as React from "react"
import { Controller, useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Check } from "lucide-react"
import { Button } from "@/shared/components/ui/button"
import { FormPanel } from "@/shared/components/composed/form-panel"
import { FloatingInput } from "@/shared/components/composed/floating-input"
import { FloatingTextarea } from "@/shared/components/composed/floating-textarea"
import { cn } from "@/shared/utils/cn"
import { productoFormSchema, productoToFormValues, type CategoriaMenu, type GrupoMenu, type ProductoFormValues, type ProductoMenu } from "../schema"
import { errorClass, labelClass, opcionClass } from "./estilos"
import { OpcionSwitch } from "./opcion-switch"

/* -------------------------------------------------------------------------- */
/*                         Alta y edición de productos                        */
/* -------------------------------------------------------------------------- */

interface ProductoFormProps {
  // Producto a editar; si no se envía, el formulario crea uno nuevo
  producto?: ProductoMenu
  categorias: CategoriaMenu[]
  grupos: GrupoMenu[]
  // Devuelve true si se guardó (entonces el panel se cierra)
  onGuardar: (values: ProductoFormValues, producto?: ProductoMenu) => Promise<boolean>
  onClose: () => void
}

/** Panel lateral de alta y edición de productos (React Hook Form + Zod). */
export function ProductoForm({ producto, categorias, grupos, onGuardar, onClose }: ProductoFormProps) {
  const esEdicion = Boolean(producto)
  const formId = React.useId()

  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
  } = useForm<ProductoFormValues>({
    resolver: zodResolver(productoFormSchema),
    defaultValues: productoToFormValues(producto, categorias[0]?.id_categoria),
  })

  const onSubmit = async (values: ProductoFormValues) => {
    if (await onGuardar(values, producto)) onClose()
  }

  return (
    <FormPanel
      open
      onOpenChange={(abierto) => {
        if (!abierto && !isSubmitting) onClose()
      }}
      title={esEdicion ? "Editar producto" : "Nuevo producto"}
      description={
        esEdicion ? "Actualiza los datos que verán los mozos en el POS." : "Agrega una bebida, postre o piqueo a la carta."
      }
      footer={
        <>
          <Button type="button" variant="neutral" size="md" onClick={onClose} disabled={isSubmitting}>
            Cancelar
          </Button>
          <Button type="submit" form={formId} size="md" disabled={isSubmitting}>
            {esEdicion ? "Guardar cambios" : "Agregar producto"}
          </Button>
        </>
      }
    >
      <form id={formId} onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5" noValidate>
        <div className="flex flex-col gap-1.5">
          <FloatingInput
            id="menu-nombre"
            label="Nombre"
            {...register("nombre")}
            maxLength={100}
            autoComplete="off"
            state={errors.nombre ? "error" : "default"}
            aria-invalid={Boolean(errors.nombre)}
          />
          {errors.nombre && <p className={errorClass}>{errors.nombre.message}</p>}
        </div>

        <div className="flex flex-col gap-1.5">
          <FloatingTextarea
            id="menu-descripcion"
            label="Descripción (opcional)"
            {...register("descripcion")}
            maxLength={500}
            rows={2}
            state={errors.descripcion ? "error" : "default"}
            aria-invalid={Boolean(errors.descripcion)}
          />
          {errors.descripcion && <p className={errorClass}>{errors.descripcion.message}</p>}
        </div>

        <div className="flex flex-col gap-1.5">
          <FloatingInput
            id="menu-precio"
            label="Precio de venta S/ (IGV incluido)"
            {...register("precio")}
            inputMode="decimal"
            autoComplete="off"
            state={errors.precio ? "error" : "default"}
            aria-invalid={Boolean(errors.precio)}
          />
          {errors.precio && <p className={errorClass}>{errors.precio.message}</p>}
        </div>

        <div className="flex flex-col gap-1.5">
          <FloatingInput
            id="menu-imagen"
            label="URL de la foto (opcional)"
            {...register("imagenUrl")}
            inputMode="url"
            maxLength={500}
            autoComplete="off"
            state={errors.imagenUrl ? "error" : "default"}
            aria-invalid={Boolean(errors.imagenUrl)}
          />
          {errors.imagenUrl && <p className={errorClass}>{errors.imagenUrl.message}</p>}
        </div>

        {/* Categoría */}
        <div className="flex flex-col gap-1.5">
          <span className={labelClass}>Categoría</span>
          <Controller
            control={control}
            name="categoriaId"
            render={({ field }) => (
              <div role="radiogroup" aria-label="Categoría" className="flex flex-wrap gap-2">
                {categorias.map((c) => {
                  const Icono = getCategoriaConfig(c).icon
                  const activa = field.value === c.id_categoria
                  return (
                    <button
                      key={c.id_categoria}
                      type="button"
                      role="radio"
                      aria-checked={activa}
                      onClick={() => field.onChange(c.id_categoria)}
                      className={cn(
                        "inline-flex h-9 cursor-pointer items-center gap-1.5 rounded-full border px-3.5 text-xs font-semibold transition-colors",
                        opcionClass(activa)
                      )}
                    >
                      <Icono className="size-3.5" />
                      {c.nombre}
                    </button>
                  )
                })}
              </div>
            )}
          />
          {errors.categoriaId && <p className={errorClass}>{errors.categoriaId.message}</p>}
        </div>

        {/* Personalización: grupos de opciones que se ofrecen al pedir el producto */}
        <div className="flex flex-col gap-1.5">
          <span className={labelClass}>
            Personalización <span className="font-normal normal-case tracking-normal">(opcional)</span>
          </span>
          {grupos.length === 0 ? (
            <p className="text-xs text-slate-500 dark:text-stone-400">
              Aún no hay grupos de personalización. Créalos desde el botón «Personalización» del menú.
            </p>
          ) : (
            <Controller
              control={control}
              name="grupos"
              render={({ field }) => (
                <div role="group" aria-label="Grupos de personalización" className="flex flex-wrap gap-2">
                  {grupos.map((g) => {
                    const activa = field.value.includes(g.id_grupo)
                    return (
                      <button
                        key={g.id_grupo}
                        type="button"
                        aria-pressed={activa}
                        onClick={() =>
                          field.onChange(activa ? field.value.filter((id) => id !== g.id_grupo) : [...field.value, g.id_grupo])
                        }
                        className={cn(
                          "inline-flex h-9 cursor-pointer items-center gap-1.5 rounded-full border px-3.5 text-xs font-semibold transition-colors",
                          opcionClass(activa)
                        )}
                      >
                        {activa && <Check className="size-3.5" />}
                        {g.nombre}
                        <span className="font-normal opacity-70">{g.obligatorio ? "· obligatorio" : "· opcional"}</span>
                      </button>
                    )
                  })}
                </div>
              )}
            />
          )}
        </div>

        {/* Disponibilidad */}
        <div className="flex flex-col divide-y divide-slate-100 rounded-2xl border border-slate-100 dark:divide-stone-800 dark:border-stone-800">
          <OpcionSwitch
            control={control}
            titulo="Disponible para la venta"
            descripcion="Si está apagado, el producto aparece como Agotado en el POS."
          />
        </div>
      </form>
    </FormPanel>
  )
}
