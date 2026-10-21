"use client"

import * as React from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Building2, Globe, Hash, Map as MapIcon, MapPin, Phone, User } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/shared/components/ui/alert"
import { FloatingInput } from "@/shared/components/composed/floating-input"
import { toast } from "@/shared/components/ui/toast"
import { crearDireccionAction, editarDireccionAction } from "../actions/cuenta.actions"
import { direccionSchema, type DireccionValues } from "../schema"
import type { DireccionDto } from "@/dtos/cuenta"
import type { ErrorApi } from "@/lib/api/error-api"

export const FORMULARIO_DIRECCION_ID = "formulario-direccion"

/**
 * Crear o editar una dirección. Vive dentro del panel lateral (FormPanel). Los errores `validaciones` van a cada campo.
 * Todos los campos llevan ícono de referencia (regla de la plantilla: o todos o ninguno dentro del formulario).
 */
export function DireccionForm({
  inicial,
  onGuardado,
}: {
  inicial?: DireccionDto
  onGuardado: (direccion: DireccionDto) => void
}) {
  const [error, setError] = React.useState<ErrorApi | null>(null)
  const form = useForm<DireccionValues>({
    resolver: zodResolver(direccionSchema),
    defaultValues: {
      nombre_contacto: inicial?.nombre_contacto ?? "",
      telefono: inicial?.telefono ?? "",
      direccion_linea1: inicial?.direccion_linea1 ?? "",
      direccion_linea2: inicial?.direccion_linea2 ?? "",
      ciudad: inicial?.ciudad ?? "",
      estado_provincia: inicial?.estado_provincia ?? "",
      codigo_postal: inicial?.codigo_postal ?? "",
      pais: inicial?.pais ?? "PE",
      es_principal: inicial?.es_principal ?? false,
    },
  })

  const guardar = form.handleSubmit(async (valores) => {
    setError(null)
    const datos = { ...valores, telefono: valores.telefono || undefined, direccion_linea2: valores.direccion_linea2 || undefined }
    const res = inicial ? await editarDireccionAction(inicial.id, datos) : await crearDireccionAction(datos)
    if (!res.ok) {
      for (const [campo, mensaje] of Object.entries(res.error.validaciones ?? {})) {
        form.setError(campo as keyof DireccionValues, { message: mensaje })
      }
      return setError(res.error)
    }
    toast.add({ type: "success", title: inicial ? "Dirección actualizada" : "Dirección guardada" })
    onGuardado(res.datos)
  })

  const estado = (campo: keyof DireccionValues) => (form.formState.errors[campo] ? "error" : "default") as "error" | "default"
  const mensaje = (campo: keyof DireccionValues) => form.formState.errors[campo]?.message

  return (
    <form id={FORMULARIO_DIRECCION_ID} onSubmit={guardar} noValidate className="space-y-5">
      {error && (
        <Alert variant="destructive">
          <AlertTitle>No pudimos guardar la dirección</AlertTitle>
          <AlertDescription>{error.message}</AlertDescription>
        </Alert>
      )}
      <FloatingInput label="Nombre de quien recibe" leftIcon={<User className="size-4" aria-hidden="true" />} state={estado("nombre_contacto")} mensajeError={mensaje("nombre_contacto")} {...form.register("nombre_contacto")} />
      <FloatingInput label="Teléfono (opcional)" leftIcon={<Phone className="size-4" aria-hidden="true" />} type="tel" state={estado("telefono")} mensajeError={mensaje("telefono")} {...form.register("telefono")} />
      <FloatingInput label="Dirección" leftIcon={<MapPin className="size-4" aria-hidden="true" />} state={estado("direccion_linea1")} mensajeError={mensaje("direccion_linea1")} {...form.register("direccion_linea1")} />
      <FloatingInput label="Referencia o interior (opcional)" leftIcon={<MapPin className="size-4" aria-hidden="true" />} state={estado("direccion_linea2")} mensajeError={mensaje("direccion_linea2")} {...form.register("direccion_linea2")} />
      <FloatingInput label="Ciudad" leftIcon={<Building2 className="size-4" aria-hidden="true" />} state={estado("ciudad")} mensajeError={mensaje("ciudad")} {...form.register("ciudad")} />
      <FloatingInput label="Departamento o provincia" leftIcon={<MapIcon className="size-4" aria-hidden="true" />} state={estado("estado_provincia")} mensajeError={mensaje("estado_provincia")} {...form.register("estado_provincia")} />
      <FloatingInput label="Código postal" leftIcon={<Hash className="size-4" aria-hidden="true" />} state={estado("codigo_postal")} mensajeError={mensaje("codigo_postal")} {...form.register("codigo_postal")} />
      <FloatingInput label="País" leftIcon={<Globe className="size-4" aria-hidden="true" />} state={estado("pais")} mensajeError={mensaje("pais")} {...form.register("pais")} />
    </form>
  )
}
