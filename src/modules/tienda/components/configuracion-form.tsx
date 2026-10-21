"use client"

import * as React from "react"
import Link from "next/link"
import { useForm, useWatch } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { ExternalLink } from "lucide-react"
import { Button } from "@/shared/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/shared/components/ui/alert"
import { FloatingInput } from "@/shared/components/composed/floating-input"
import { FloatingSelect } from "@/shared/components/composed/floating-select"
import { SelectContent, SelectItem } from "@/shared/components/ui/select"
import { Switch } from "@/shared/components/ui/switch"
import { toast } from "@/shared/components/ui/toast"
import type { ActualizarTiendaRequest, TiendaActivaDto } from "@/dtos/tienda"
import type { ErrorApi } from "@/lib/api/error-api"
import { actualizarTiendaAction } from "../actions/tienda.actions"
import { configuracionTiendaSchema, type ConfiguracionTiendaValues } from "../schema"

const ZONAS_LATAM = [
  { id: "America/Lima", label: "America/Lima (Perú, UTC-5)" },
  { id: "America/Bogota", label: "America/Bogota (Colombia, UTC-5)" },
  { id: "America/Mexico_City", label: "America/Mexico_City (México, UTC-6)" },
  { id: "America/Santiago", label: "America/Santiago (Chile, UTC-3/-4)" },
  { id: "America/Buenos_Aires", label: "America/Buenos_Aires (Argentina, UTC-3)" },
  { id: "America/Guayaquil", label: "America/Guayaquil (Ecuador, UTC-5)" },
  { id: "America/La_Paz", label: "America/La_Paz (Bolivia, UTC-4)" },
  { id: "America/Caracas", label: "America/Caracas (Venezuela, UTC-4)" },
  { id: "America/Montevideo", label: "America/Montevideo (Uruguay, UTC-3)" },
  { id: "America/Asuncion", label: "America/Asuncion (Paraguay, UTC-3/-4)" },
  { id: "America/Panama", label: "America/Panama (Panamá, UTC-5)" },
  { id: "America/Costa_Rica", label: "America/Costa_Rica (Costa Rica, UTC-6)" },
  { id: "America/Santo_Domingo", label: "America/Santo_Domingo (Rep. Dominicana, UTC-4)" },
  { id: "America/Sao_Paulo", label: "America/Sao_Paulo (Brasil, UTC-3)" },
  { id: "UTC", label: "UTC (Tiempo Universal Coordinado)" },
]

const mapeoCampos: Record<string, keyof ConfiguracionTiendaValues> = {
  nombre: "nombre",
  correoContacto: "correo_contacto",
  correo_contacto: "correo_contacto",
  dominioPersonalizado: "dominio_personalizado",
  dominio_personalizado: "dominio_personalizado",
  moneda: "moneda",
  tasaImpuesto: "tasa_impuesto_porcentaje",
  tasa_impuesto: "tasa_impuesto_porcentaje",
  preciosIncluyenImpuesto: "precios_incluyen_impuesto",
  precios_incluyen_impuesto: "precios_incluyen_impuesto",
  zonaHoraria: "zona_horaria",
  zona_horaria: "zona_horaria",
}

interface ConfiguracionFormProps {
  tienda: TiendaActivaDto
  puedeEditar: boolean
  onActualizado: () => void
}

export function ConfiguracionForm({ tienda, puedeEditar, onActualizado }: ConfiguracionFormProps) {
  const [error, setError] = React.useState<ErrorApi | null>(null)

  // La tasa de impuesto se almacena como fracción (ej. 0.18) y se edita como porcentaje (ej. 18)
  const tasaPorcentajeInicial = String(Math.round((tienda.tasa_impuesto ?? 0) * 10000) / 100)

  const form = useForm<ConfiguracionTiendaValues>({
    resolver: zodResolver(configuracionTiendaSchema),
    defaultValues: {
      nombre: tienda.nombre,
      correo_contacto: tienda.correo_contacto,
      dominio_personalizado: tienda.dominio_personalizado ?? "",
      moneda: tienda.moneda ?? "PEN",
      tasa_impuesto_porcentaje: tasaPorcentajeInicial,
      precios_incluyen_impuesto: tienda.precios_incluyen_impuesto ?? false,
      zona_horaria: tienda.zona_horaria || "America/Lima",
    },
  })

  const preciosIncluyen = useWatch({ control: form.control, name: "precios_incluyen_impuesto" })
  const moneda = useWatch({ control: form.control, name: "moneda" })

  const guardar = form.handleSubmit(async (valores) => {
    setError(null)
    const datos: ActualizarTiendaRequest = {
      nombre: valores.nombre.trim(),
      correo_contacto: valores.correo_contacto.trim(),
      dominio_personalizado: valores.dominio_personalizado?.trim() || undefined,
      moneda: valores.moneda.trim().toUpperCase(),
      tasa_impuesto: Number(valores.tasa_impuesto_porcentaje) / 100,
      precios_incluyen_impuesto: valores.precios_incluyen_impuesto,
      zona_horaria: valores.zona_horaria.trim(),
    }

    const res = await actualizarTiendaAction(datos)
    if (!res.ok) {
      const validaciones = res.error.validaciones ?? {}
      for (const [campo, mensaje] of Object.entries(validaciones)) {
        const campoMapeado = mapeoCampos[campo]
        if (campoMapeado) {
          form.setError(campoMapeado, { message: mensaje })
        }
      }
      if (res.error.codigo === "TIE-006") {
        form.setError("zona_horaria", { message: res.error.message })
      } else if (res.error.codigo === "TIE-005") {
        form.setError("moneda", { message: res.error.message })
      }
      return setError(res.error)
    }

    toast.add({ type: "success", title: "Configuración actualizada" })
    onActualizado()
  })

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-[16px]">Datos de la tienda</CardTitle>
        <CardDescription className="text-[13px]">
          Información básica, contacto, moneda e impuestos que rigen tu comercio.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={guardar} noValidate className="space-y-5">
          {error && (
            <Alert variant="destructive">
              <AlertTitle>No pudimos guardar los cambios</AlertTitle>
              <AlertDescription>{error.message}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-1.5">
            <FloatingInput
              label="Subdominio (solo lectura)"
              value={tienda.subdominio}
              readOnly
              disabled
              ayuda="El subdominio asignado no se puede modificar."
            />
            <div className="pt-1">
              <Link
                href={`/tienda/${tienda.subdominio}`}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 text-[12px] font-medium text-primary hover:underline"
              >
                <span>Ver vitrina pública</span>
                <ExternalLink className="size-3.5" aria-hidden="true" />
              </Link>
            </div>
          </div>

          <FloatingInput
            label="Nombre de la tienda"
            state={form.formState.errors.nombre ? "error" : "default"}
            mensajeError={form.formState.errors.nombre?.message}
            disabled={!puedeEditar}
            {...form.register("nombre")}
          />

          <FloatingInput
            label="Correo de contacto"
            type="email"
            state={form.formState.errors.correo_contacto ? "error" : "default"}
            mensajeError={form.formState.errors.correo_contacto?.message}
            ayuda="Correo al que llegarán consultas y notificaciones de clientes."
            disabled={!puedeEditar}
            {...form.register("correo_contacto")}
          />

          <FloatingInput
            label="Dominio personalizado (opcional)"
            state={form.formState.errors.dominio_personalizado ? "error" : "default"}
            mensajeError={form.formState.errors.dominio_personalizado?.message}
            ayuda="Ej: mitienda.com (debe apuntar a nuestra plataforma por CNAME)."
            disabled={!puedeEditar}
            {...form.register("dominio_personalizado")}
          />

          <FloatingSelect
            label="Moneda principal"
            value={moneda}
            onValueChange={(val) => form.setValue("moneda", String(val), { shouldValidate: true })}
            disabled={!puedeEditar}
          >
            <SelectContent>
              <SelectItem value="PEN">PEN — Sol peruano (S/)</SelectItem>
              <SelectItem value="USD">USD — Dólar estadounidense ($)</SelectItem>
            </SelectContent>
          </FloatingSelect>
          {form.formState.errors.moneda && (
            <p className="text-[11px] font-bold text-destructive-text">
              {form.formState.errors.moneda.message}
            </p>
          )}

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <FloatingInput
                label="Tasa de impuesto (%)"
                type="number"
                step="0.01"
                state={form.formState.errors.tasa_impuesto_porcentaje ? "error" : "default"}
                mensajeError={form.formState.errors.tasa_impuesto_porcentaje?.message}
                ayuda="Ej. 18 para 18 % de IGV o IVA (máximo 50 %)."
                disabled={!puedeEditar}
                {...form.register("tasa_impuesto_porcentaje")}
              />
            </div>

            <div>
              <FloatingInput
                label="Zona horaria (id IANA)"
                list="zonas-latam-list"
                state={form.formState.errors.zona_horaria ? "error" : "default"}
                mensajeError={form.formState.errors.zona_horaria?.message}
                ayuda="Escribe o selecciona un id IANA (ej. America/Lima)."
                disabled={!puedeEditar}
                {...form.register("zona_horaria")}
              />
              <datalist id="zonas-latam-list">
                {ZONAS_LATAM.map((z) => (
                  <option key={z.id} value={z.id}>
                    {z.label}
                  </option>
                ))}
              </datalist>
            </div>
          </div>

          <div className="flex items-center justify-between gap-3 rounded-xl border border-input p-3">
            <div className="space-y-0.5">
              <p className="text-[13px] font-medium text-foreground">Los precios ya incluyen impuesto</p>
              <p className="text-[11px] text-muted-foreground">
                Si está activado, el impuesto se desglosa del total; si no, se agrega al subtotal en el checkout.
              </p>
            </div>
            <Switch
              checked={preciosIncluyen}
              disabled={!puedeEditar}
              onCheckedChange={(checked) =>
                form.setValue("precios_incluyen_impuesto", checked, { shouldValidate: true })
              }
            />
          </div>

          {puedeEditar && (
            <div className="flex justify-end pt-2">
              <Button type="submit">Guardar cambios</Button>
            </div>
          )}
        </form>
      </CardContent>
    </Card>
  )
}
