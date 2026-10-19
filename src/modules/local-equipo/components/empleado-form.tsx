"use client"

import * as React from "react"
import { Controller, useForm, useWatch } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Info } from "lucide-react"

import { FloatingInput } from "@/shared/components/composed/floating-input"
import { FloatingSelect } from "@/shared/components/composed/floating-select"
import { FormPanel } from "@/shared/components/composed/form-panel"
import { SelectContent, SelectItem } from "@/shared/components/ui/select"

import { empleadoFormSchema, empleadoToFormValues, type Cargo, type Empleado, type EmpleadoFormValues } from "../schema"
import { errorClass } from "./estilos"
import { PieFormulario } from "./pie-formulario"

interface EmpleadoFormProps {
  // Empleado a editar; si no se envía, el formulario registra uno nuevo
  empleado?: Empleado
  cargos: Cargo[]
  // Devuelve true si se guardó (entonces el panel se cierra)
  onGuardar: (values: EmpleadoFormValues, empleado?: Empleado) => Promise<boolean>
  onClose: () => void
}

/** Panel lateral para registrar o actualizar a un empleado: cuenta, cargo y ficha (DNI, teléfono, ingreso). */
export function EmpleadoForm({ empleado, cargos, onGuardar, onClose }: EmpleadoFormProps) {
  const esEdicion = Boolean(empleado)
  const formId = React.useId()

  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
  } = useForm<EmpleadoFormValues>({
    resolver: zodResolver(empleadoFormSchema),
    // Por defecto se propone el primer cargo de la lista
    defaultValues: empleadoToFormValues(empleado, cargos[0]?.id_rol ?? ""),
  })

  const idRol = useWatch({ control, name: "idRol" })
  const cargoSeleccionado = cargos.find((c) => c.id_rol === idRol)

  const onSubmit = async (values: EmpleadoFormValues) => {
    if (await onGuardar(values, empleado)) onClose()
  }

  return (
    <FormPanel
      open
      onOpenChange={(abierto) => {
        if (!abierto && !isSubmitting) onClose()
      }}
      title={esEdicion ? "Actualizar empleado" : "Registrar empleado"}
      description="El cargo define a qué módulos podrá acceder en Coffy Flow."
      footer={
        <PieFormulario
          formId={formId}
          onCancelar={onClose}
          enviando={isSubmitting}
          textoEnviar={esEdicion ? "Guardar cambios" : "Registrar empleado"}
        />
      }
    >
      <form id={formId} onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4" noValidate>
        <div className="flex flex-col gap-1.5">
          <FloatingInput
            id="emp-nombre"
            label="Nombre completo"
            {...register("nombre")}
            autoComplete="off"
            maxLength={100}
            state={errors.nombre ? "error" : "default"}
            aria-invalid={Boolean(errors.nombre)}
          />
          {errors.nombre && <p className={errorClass}>{errors.nombre.message}</p>}
        </div>

        <div className="flex flex-col gap-1.5">
          <FloatingInput
            id="emp-email"
            label="Correo electrónico"
            {...register("email")}
            type="email"
            autoComplete="off"
            maxLength={150}
            state={errors.email ? "error" : "default"}
            aria-invalid={Boolean(errors.email)}
          />
          {errors.email && <p className={errorClass}>{errors.email.message}</p>}
        </div>

        <div className="flex flex-col gap-1.5">
          <Controller
            control={control}
            name="idRol"
            render={({ field }) => (
              <FloatingSelect
                id="emp-rol"
                label="Cargo"
                value={field.value}
                onValueChange={(valor) => field.onChange(String(valor ?? ""))}
                items={cargos.map((c) => ({ value: c.id_rol, label: c.nombre }))}
                state={errors.idRol ? "error" : "default"}
              >
                <SelectContent>
                  {cargos.map((c) => (
                    <SelectItem key={c.id_rol} value={c.id_rol}>
                      {c.nombre}
                    </SelectItem>
                  ))}
                </SelectContent>
              </FloatingSelect>
            )}
          />
          {errors.idRol && <p className={errorClass}>{errors.idRol.message}</p>}
          {cargoSeleccionado?.descripcion && (
            <p className="text-xs text-slate-500 dark:text-stone-400">{cargoSeleccionado.descripcion}</p>
          )}
        </div>

        <p className="pt-1 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-stone-400">
          Ficha del empleado <span className="font-normal normal-case tracking-normal">(opcional)</span>
        </p>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="flex flex-col gap-1.5">
            <FloatingInput
              id="emp-dni"
              label="DNI"
              {...register("dni")}
              autoComplete="off"
              maxLength={15}
              state={errors.dni ? "error" : "default"}
              aria-invalid={Boolean(errors.dni)}
            />
            {errors.dni && <p className={errorClass}>{errors.dni.message}</p>}
          </div>
          <div className="flex flex-col gap-1.5">
            <FloatingInput
              id="emp-telefono"
              label="Teléfono"
              {...register("telefono")}
              type="tel"
              autoComplete="off"
              maxLength={20}
              state={errors.telefono ? "error" : "default"}
              aria-invalid={Boolean(errors.telefono)}
            />
            {errors.telefono && <p className={errorClass}>{errors.telefono.message}</p>}
          </div>
        </div>

        <p className="flex items-start gap-2 rounded-xl bg-slate-50 px-3 py-2 text-xs text-slate-600 dark:bg-stone-950/60 dark:text-stone-300">
          <Info className="mt-0.5 size-3.5 shrink-0" />
          {esEdicion
            ? "Los cambios de cargo se aplican en cuanto el empleado vuelve a la pestaña o inicia sesión."
            : "La cuenta se crea como Pendiente de activación: el empleado recibe un correo para definir su contraseña."}
        </p>
      </form>
    </FormPanel>
  )
}
