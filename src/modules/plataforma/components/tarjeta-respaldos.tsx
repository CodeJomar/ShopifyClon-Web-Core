"use client"

import * as React from "react"
import { DatabaseBackup } from "lucide-react"
import { Badge } from "@/shared/components/ui/badge"
import { Button } from "@/shared/components/ui/button"
import { Card, CardContent } from "@/shared/components/ui/card"
import { toast } from "@/shared/components/ui/toast"
import { formatearFecha } from "@/shared/utils/fechas"
import type { EstadoRespaldosDto } from "@/dtos/plataforma"
import { crearRespaldoAction, estadoRespaldosAction } from "../actions/plataforma.actions"

const kilobytes = (bytes: number) => (bytes >= 1048576 ? `${(bytes / 1048576).toFixed(1)} MB` : `${Math.max(1, Math.round(bytes / 1024))} KB`)

/** Respaldos de la base: estado del programado, respaldo manual y lista de archivos. Sin descarga: los archivos se recogen del volumen del servidor. */
export function TarjetaRespaldos() {
  const [estado, setEstado] = React.useState<EstadoRespaldosDto | null>(null)
  const [error, setError] = React.useState<string | null>(null)
  const [creando, setCreando] = React.useState(false)

  const cargar = React.useCallback(async () => {
    const res = await estadoRespaldosAction()
    if (res.ok) {
      setEstado(res.datos)
      setError(null)
    } else setError(res.error.message)
  }, [])

  React.useEffect(() => {
    const t = window.setTimeout(() => void cargar(), 0)
    return () => window.clearTimeout(t)
  }, [cargar])

  const respaldarAhora = async () => {
    setCreando(true)
    const res = await crearRespaldoAction()
    setCreando(false)
    if (res.ok) {
      toast.add({ type: "success", title: "Respaldo creado", description: `${res.datos.nombre} · ${kilobytes(res.datos.bytes)}` })
      await cargar()
    } else toast.add({ type: "error", title: "No se pudo respaldar", description: res.error.message })
  }

  return (
    <Card data-tour="respaldos">
      <CardContent className="space-y-4">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="flex items-center gap-2">
            <DatabaseBackup className="size-5 text-brand-text" aria-hidden="true" />
            <h2 className="text-[16px] font-extrabold tracking-tight text-foreground">Respaldos de la base de datos</h2>
          </div>
          <Button size="sm" onClick={respaldarAhora} loading={creando} disabled={!estado}>
            Respaldar ahora
          </Button>
        </div>

        {error && <p className="text-[13.5px] font-medium text-muted-foreground">{error}</p>}

        {estado && (
          <>
            <div className="flex flex-wrap items-center gap-2 text-[13px]">
              <Badge tono={estado.habilitado ? "exito" : "neutro"}>{estado.habilitado ? "Programado" : "Programación apagada"}</Badge>
              {!estado.directorio_escribible && <Badge tono="peligro">El directorio no es escribible</Badge>}
              {estado.habilitado && (
                <span className="text-muted-foreground">
                  A las {estado.horas.join(", ")} ({estado.zona}) · se conservan {estado.retencion_dias} días
                  {estado.proxima_ejecucion ? ` · próximo: ${formatearFecha(estado.proxima_ejecucion, estado.zona)}` : ""}
                </span>
              )}
            </div>

            {estado.ultimo && (
              <p className="text-[13px] text-muted-foreground">
                Último intento: {formatearFecha(estado.ultimo.creado_en, estado.zona)} ·{" "}
                {estado.ultimo.exito ? `correcto (${estado.ultimo.tablas} tablas, ${estado.ultimo.filas} filas)` : `falló: ${estado.ultimo.error ?? "sin detalle"}`}
              </p>
            )}

            {estado.archivos.length === 0 ? (
              <p className="text-[13.5px] font-medium text-muted-foreground">Todavía no hay respaldos guardados.</p>
            ) : (
              <ul className="divide-y divide-border/60">
                {estado.archivos.map((a) => (
                  <li key={a.nombre} className="flex flex-wrap items-center justify-between gap-2 py-2.5 text-[13px]">
                    <span className="font-semibold text-foreground">{a.nombre}</span>
                    <span className="text-muted-foreground">
                      {kilobytes(a.bytes)} · {formatearFecha(a.fecha, estado.zona)}
                    </span>
                  </li>
                ))}
              </ul>
            )}
            <p className="text-[12.5px] text-muted-foreground">
              Los archivos no se descargan desde la web: contienen todos los datos. Se recogen del volumen del servidor; guarda además una copia fuera de Railway.
            </p>
          </>
        )}
      </CardContent>
    </Card>
  )
}
