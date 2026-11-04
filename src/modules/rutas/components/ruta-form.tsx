"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { ArrowDown, ArrowUp, PackageOpen, Plus, X } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/shared/components/ui/alert"
import { Button } from "@/shared/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card"
import { Skeleton } from "@/shared/components/ui/skeleton"
import { toast } from "@/shared/components/ui/toast"
import { EstadoVacio } from "@/shared/components/composed/estado-vacio"
import { FloatingInput } from "@/shared/components/composed/floating-input"
import { FloatingTextarea } from "@/shared/components/composed/floating-textarea"
import type { EnvioDisponible, RutaDetalle } from "@/dtos/ruta"
import type { ErrorApi } from "@/lib/api/error-api"
import { crearRutaAction, editarRutaAction, enviosDisponiblesAction } from "../actions/rutas.actions"

type Campo = "fecha" | "chofer" | "placa" | "nota" | "envio_ids"

/** Las paradas de una ruta ya creada se muestran como si fueran envíos disponibles ya elegidos. */
function aSeleccion(ruta: RutaDetalle): EnvioDisponible[] {
  return ruta.paradas.map((p) => ({
    envio_id: p.envio_id,
    numero_orden: p.numero_orden,
    numero_guia: p.numero_guia,
    estado_envio: p.estado_envio === "EN_TRANSITO" ? "EN_TRANSITO" : "CREADO",
    destinatario: p.destinatario,
    ciudad: p.direccion.ciudad,
    direccion_linea1: p.direccion.direccion_linea1,
    total_items: p.items.reduce((suma, i) => suma + i.cantidad, 0),
  }))
}

/** Crear o editar una ruta (solo en borrador): datos del reparto y paradas en el orden de visita. */
export function RutaForm({ inicial }: { inicial?: RutaDetalle }) {
  const router = useRouter()
  const [fecha, setFecha] = React.useState(() => inicial?.fecha ?? new Date().toLocaleDateString("sv-SE"))
  const [chofer, setChofer] = React.useState(inicial?.chofer ?? "")
  const [placa, setPlaca] = React.useState(inicial?.placa ?? "")
  const [nota, setNota] = React.useState(inicial?.nota ?? "")
  const [seleccion, setSeleccion] = React.useState<EnvioDisponible[]>(() => (inicial ? aSeleccion(inicial) : []))
  const [disponibles, setDisponibles] = React.useState<EnvioDisponible[] | null>(null)
  const [errores, setErrores] = React.useState<Partial<Record<Campo, string>>>({})
  const [errorApi, setErrorApi] = React.useState<ErrorApi | null>(null)
  const [guardando, setGuardando] = React.useState(false)

  React.useEffect(() => {
    let cancelado = false
    enviosDisponiblesAction().then((res) => {
      if (cancelado) return
      if (res.ok) setDisponibles(res.datos)
      else setErrorApi(res.error)
    })
    return () => {
      cancelado = true
    }
  }, [])

  const elegidos = new Set(seleccion.map((e) => e.envio_id))
  const porAgregar = (disponibles ?? []).filter((e) => !elegidos.has(e.envio_id))

  const mover = (indice: number, delta: -1 | 1) =>
    setSeleccion((actual) => {
      const destino = indice + delta
      if (destino < 0 || destino >= actual.length) return actual
      const copia = [...actual]
      ;[copia[indice], copia[destino]] = [copia[destino], copia[indice]]
      return copia
    })

  const guardar = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorApi(null)
    const nuevos: Partial<Record<Campo, string>> = {}
    if (!fecha) nuevos.fecha = "Elige el día del reparto."
    if (!chofer.trim()) nuevos.chofer = "Escribe el nombre del chofer."
    else if (chofer.trim().length > 150) nuevos.chofer = "Máximo 150 caracteres."
    if (!placa.trim()) nuevos.placa = "Escribe la placa del vehículo."
    else if (placa.trim().length > 20) nuevos.placa = "Máximo 20 caracteres."
    if (nota.trim().length > 500) nuevos.nota = "Máximo 500 caracteres."
    if (seleccion.length === 0) nuevos.envio_ids = "Agrega al menos un envío a la ruta."
    setErrores(nuevos)
    if (Object.keys(nuevos).length > 0) return

    setGuardando(true)
    const datos = {
      fecha,
      chofer: chofer.trim(),
      placa: placa.trim().toUpperCase(),
      nota: nota.trim() || undefined,
      envio_ids: seleccion.map((s) => s.envio_id),
    }
    const res = inicial ? await editarRutaAction(inicial.id, datos) : await crearRutaAction(datos)
    setGuardando(false)
    if (!res.ok) {
      const deApi: Partial<Record<Campo, string>> = {}
      for (const [campo, mensaje] of Object.entries(res.error.validaciones ?? {})) deApi[campo as Campo] = mensaje
      setErrores(deApi)
      return setErrorApi(res.error)
    }
    toast.add({ type: "success", title: inicial ? "Ruta actualizada" : "Ruta creada" })
    router.push(`/panel/rutas/${res.datos.id}`)
  }

  const estado = (campo: Campo) => (errores[campo] ? "error" : "default") as "error" | "default"

  return (
    <form onSubmit={guardar} noValidate className="space-y-5">
      {errorApi && (
        <Alert variant="destructive">
          <AlertTitle>No pudimos guardar la ruta</AlertTitle>
          <AlertDescription>{errorApi.message}</AlertDescription>
        </Alert>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Datos del reparto</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-5 sm:grid-cols-2">
          <label className="block space-y-1.5 text-[12px]">
            <span className="font-bold text-muted-foreground">Día del reparto</span>
            <input
              type="date"
              value={fecha}
              onChange={(e) => setFecha(e.target.value)}
              aria-invalid={errores.fecha ? true : undefined}
              className="h-11 w-full rounded-xl border-[1.8px] border-input bg-transparent px-3 text-[13px] font-medium text-foreground outline-none hover:border-border-hover focus-visible:border-primary focus-visible:ring-[3.5px] focus-visible:ring-primary/18 aria-invalid:border-destructive"
            />
            {errores.fecha && <span className="text-[12px] text-destructive-text">{errores.fecha}</span>}
          </label>
          <FloatingInput label="Placa del vehículo" value={placa} onChange={(e) => setPlaca(e.target.value)} state={estado("placa")} mensajeError={errores.placa} />
          <div className="sm:col-span-2">
            <FloatingInput label="Chofer" value={chofer} onChange={(e) => setChofer(e.target.value)} state={estado("chofer")} mensajeError={errores.chofer} />
          </div>
          <div className="sm:col-span-2">
            <FloatingTextarea label="Nota para el chofer (opcional)" value={nota} onChange={(e) => setNota(e.target.value)} state={estado("nota")} />
            {errores.nota && <span className="text-[12px] text-destructive-text">{errores.nota}</span>}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Paradas ({seleccion.length})</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {errores.envio_ids && (
            <p className="text-[12.5px] font-semibold text-destructive-text" role="alert">
              {errores.envio_ids}
            </p>
          )}
          {seleccion.length === 0 ? (
            <p className="text-[13px] text-muted-foreground">Agrega envíos de la lista de abajo. El orden de esta lista es el orden de visita.</p>
          ) : (
            <ol className="space-y-2">
              {seleccion.map((e, i) => (
                <li key={e.envio_id} className="flex items-center gap-3 rounded-xl border border-border bg-secondary/50 px-3 py-2.5">
                  <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-primary text-[12px] font-extrabold text-primary-foreground" aria-hidden="true">
                    {i + 1}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[13px] font-bold text-foreground">
                      <span className="font-mono text-brand-text">{e.numero_orden}</span> · {e.destinatario}
                    </p>
                    <p className="truncate text-[12px] text-muted-foreground">
                      {e.direccion_linea1}, {e.ciudad} · {e.total_items} {e.total_items === 1 ? "unidad" : "unidades"}
                    </p>
                  </div>
                  <div className="flex shrink-0 items-center gap-0.5">
                    <Button type="button" variant="ghost" size="sm" aria-label={`Subir la parada ${i + 1}`} disabled={i === 0} onClick={() => mover(i, -1)}>
                      <ArrowUp aria-hidden="true" />
                    </Button>
                    <Button type="button" variant="ghost" size="sm" aria-label={`Bajar la parada ${i + 1}`} disabled={i === seleccion.length - 1} onClick={() => mover(i, 1)}>
                      <ArrowDown aria-hidden="true" />
                    </Button>
                    <Button type="button" variant="ghost" size="sm" aria-label={`Quitar la parada ${i + 1}`} onClick={() => setSeleccion((s) => s.filter((x) => x.envio_id !== e.envio_id))}>
                      <X aria-hidden="true" />
                    </Button>
                  </div>
                </li>
              ))}
            </ol>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Envíos disponibles</CardTitle>
        </CardHeader>
        <CardContent>
          {!disponibles && !errorApi && (
            <div className="space-y-2" aria-busy="true" aria-label="Cargando envíos">
              <Skeleton className="h-14 rounded-xl" />
              <Skeleton className="h-14 rounded-xl" />
            </div>
          )}
          {disponibles && porAgregar.length === 0 && (
            <EstadoVacio
              icono={PackageOpen}
              titulo="No hay más envíos para agregar"
              descripcion="Aquí aparecen los envíos creados o en camino que todavía no están en una ruta. Prepara una orden pagada para crear su envío."
            />
          )}
          {porAgregar.length > 0 && (
            <ul className="space-y-2">
              {porAgregar.map((e) => (
                <li key={e.envio_id} className="flex items-center gap-3 rounded-xl border border-border px-3 py-2.5">
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[13px] font-bold text-foreground">
                      <span className="font-mono text-brand-text">{e.numero_orden}</span> · {e.destinatario}
                    </p>
                    <p className="truncate text-[12px] text-muted-foreground">
                      {e.direccion_linea1}, {e.ciudad} · {e.total_items} {e.total_items === 1 ? "unidad" : "unidades"}
                    </p>
                  </div>
                  <Button type="button" variant="soft" size="sm" onClick={() => setSeleccion((s) => [...s, e])} leftIcon={<Plus aria-hidden="true" />}>
                    Agregar
                  </Button>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>

      <div className="flex justify-end gap-2">
        <Button type="button" variant="ghost" onClick={() => router.push(inicial ? `/panel/rutas/${inicial.id}` : "/panel/rutas")}>
          Cancelar
        </Button>
        <Button type="submit" loading={guardando}>
          {inicial ? "Guardar cambios" : "Crear ruta"}
        </Button>
      </div>
    </form>
  )
}
