"use client"

import * as React from "react"
import { Alert, AlertDescription, AlertTitle } from "@/shared/components/ui/alert"
import { Button } from "@/shared/components/ui/button"
import { FloatingInput } from "@/shared/components/composed/floating-input"
import { toast } from "@/shared/components/ui/toast"
import type { ErrorApi } from "@/lib/api/error-api"
import { agregarItemAction, avisarCambioCarrito, crearCarritoAction } from "../actions/carrito.actions"

const MAX_CANTIDAD = 99

/** Agrega una variante al carrito. Si aún no hay carrito, lo crea primero (CAR-001). */
export function AgregarAlCarrito({
  subdominio,
  varianteId,
  disponible,
}: {
  subdominio: string
  varianteId: string
  disponible: boolean
}) {
  const [cantidad, setCantidad] = React.useState("1")
  const [enCurso, setEnCurso] = React.useState(false)
  const [error, setError] = React.useState<ErrorApi | null>(null)
  const [mensajeCantidad, setMensajeCantidad] = React.useState<string | null>(null)

  const agregar = async () => {
    setError(null)
    const n = Number(cantidad)
    if (!Number.isInteger(n) || n < 1 || n > MAX_CANTIDAD) {
      setMensajeCantidad(`Elige una cantidad entre 1 y ${MAX_CANTIDAD}.`)
      return
    }
    setMensajeCantidad(null)
    setEnCurso(true)
    const carrito = await crearCarritoAction(subdominio)
    if (!carrito.ok) {
      setEnCurso(false)
      return setError(carrito.error)
    }
    const res = await agregarItemAction(subdominio, varianteId, n)
    setEnCurso(false)
    if (!res.ok) return setError(res.error)
    avisarCambioCarrito(subdominio)
    toast.add({ type: "success", title: "Producto agregado al carrito", description: "Puedes verlo en tu carrito." })
  }

  return (
    <div className="space-y-3">
      {error && (
        <Alert variant="destructive">
          <AlertTitle>No pudimos agregar el producto</AlertTitle>
          <AlertDescription>{error.message}</AlertDescription>
        </Alert>
      )}
      <div className="flex items-start gap-3">
        <div className="w-28">
          <FloatingInput
            label="Cantidad"
            inputMode="numeric"
            value={cantidad}
            onChange={(e) => setCantidad(e.target.value)}
            state={mensajeCantidad ? "error" : "default"}
            mensajeError={mensajeCantidad ?? undefined}
            disabled={!disponible}
          />
        </div>
        <Button type="button" size="lg" className="flex-1" disabled={!disponible || enCurso} onClick={agregar}>
          {enCurso ? "Agregando…" : "Agregar al carrito"}
        </Button>
      </div>
    </div>
  )
}
