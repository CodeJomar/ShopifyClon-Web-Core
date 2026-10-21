"use client"

import * as React from "react"
import { useForm, useWatch } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { FloatingInput } from "@/shared/components/composed/floating-input"
import { FloatingTextarea } from "@/shared/components/composed/floating-textarea"
import { Switch } from "@/shared/components/ui/switch"
import { productoDatosSchema, type ProductoDatosValues } from "../schema"
import type { CategoriaDto } from "@/dtos/catalogo"

/** Datos del producto: título, slug, descripción, proveedor y digital. Sin íconos. */
export function ProductoDatosForm({
  inicial,
  formId,
  onEnviar,
}: {
  inicial?: Partial<ProductoDatosValues>
  formId: string
  onEnviar: (valores: ProductoDatosValues) => void
}) {
  const form = useForm<ProductoDatosValues>({
    resolver: zodResolver(productoDatosSchema),
    defaultValues: {
      titulo: inicial?.titulo ?? "",
      identificador_url: inicial?.identificador_url ?? "",
      descripcion: inicial?.descripcion ?? "",
      proveedor: inicial?.proveedor ?? "",
      es_digital: inicial?.es_digital ?? false,
    },
  })
  const estado = (campo: keyof ProductoDatosValues) => (form.formState.errors[campo] ? "error" : "default") as "error" | "default"
  const mensaje = (campo: keyof ProductoDatosValues) => form.formState.errors[campo]?.message
  const digital = useWatch({ control: form.control, name: "es_digital" })

  return (
    <form id={formId} onSubmit={form.handleSubmit(onEnviar)} noValidate className="space-y-5">
      <FloatingInput label="Título" state={estado("titulo")} mensajeError={mensaje("titulo")} {...form.register("titulo")} />
      <FloatingInput label="Identificador en la tienda (opcional)" state={estado("identificador_url")} mensajeError={mensaje("identificador_url")} ayuda="Si lo dejas vacío, se genera del título." {...form.register("identificador_url")} />
      <FloatingTextarea label="Descripción (opcional)" rows={4} state={estado("descripcion")} {...form.register("descripcion")} />
      {mensaje("descripcion") && <p className="text-[11px] font-bold text-destructive-text">{mensaje("descripcion")}</p>}
      <FloatingInput label="Proveedor (opcional)" state={estado("proveedor")} mensajeError={mensaje("proveedor")} {...form.register("proveedor")} />
      <label className="flex items-center justify-between gap-3 text-[13px]">
        <span>Es un producto digital (sin envío)</span>
        <Switch checked={digital} onCheckedChange={(v) => form.setValue("es_digital", v)} />
      </label>
    </form>
  )
}

/** Casillas de categorías del producto (en lugar de un selector múltiple, que no existe en la base). */
export function CategoriasCheck({
  categorias,
  seleccionadas,
  onCambiar,
}: {
  categorias: CategoriaDto[]
  seleccionadas: string[]
  onCambiar: (ids: string[]) => void
}) {
  if (categorias.length === 0) {
    return <p className="text-[13px] text-muted-foreground">Aún no tienes categorías. Créalas en la sección Categorías.</p>
  }
  return (
    <ul className="grid gap-2 sm:grid-cols-2">
      {categorias.map((categoria) => {
        const marcada = seleccionadas.includes(categoria.id)
        return (
          <li key={categoria.id}>
            <label className="flex items-center gap-3 text-[13px]">
              <input
                type="checkbox"
                className="size-4 accent-primary"
                checked={marcada}
                onChange={() => onCambiar(marcada ? seleccionadas.filter((id) => id !== categoria.id) : [...seleccionadas, categoria.id])}
              />
              {categoria.nombre}
            </label>
          </li>
        )
      })}
    </ul>
  )
}
