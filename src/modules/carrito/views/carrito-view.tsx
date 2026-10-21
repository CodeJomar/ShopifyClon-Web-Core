"use client"

import * as React from "react"
import Link from "next/link"
import { Alert, AlertDescription, AlertTitle } from "@/shared/components/ui/alert"
import { Button } from "@/shared/components/ui/button"
import { Card, CardContent } from "@/shared/components/ui/card"
import { FloatingInput } from "@/shared/components/composed/floating-input"
import { EstadoVacio } from "@/shared/components/composed/estado-vacio"
import { toast } from "@/shared/components/ui/toast"
import { formatearDinero } from "@/shared/utils/dinero"
import type { Carrito, LineaCarrito } from "@/dtos/carrito"
import type { ErrorApi } from "@/lib/api/error-api"
import {
  aplicarCuponAction,
  avisarCambioCarrito,
  cambiarCantidadAction,
  obtenerCarritoAction,
  quitarCuponAction,
  quitarItemAction,
} from "../actions/carrito.actions"

const MAX_CANTIDAD = 99

/** Página del carrito. Todos los montos son los que devuelve la API. */
export function CarritoView({ subdominio }: { subdominio: string }) {
  const [carrito, setCarrito] = React.useState<Carrito | null>(null)
  const [cargando, setCargando] = React.useState(true)
  const [error, setError] = React.useState<ErrorApi | null>(null)
  const [cantidades, setCantidades] = React.useState<Record<string, string>>({})
  const [cupon, setCupon] = React.useState("")
  const [errorCupon, setErrorCupon] = React.useState<string | null>(null)
  const [errorCantidad, setErrorCantidad] = React.useState<string | null>(null)
  const [ocupado, setOcupado] = React.useState(false)

  // Sin cookie de carrito la API no tiene carrito que mostrar: se trata como carrito vacío.
  const aplicarRespuesta = (c: Carrito) => {
    setCarrito(c)
    setCantidades(Object.fromEntries(c.items.map((l) => [l.variante_id, String(l.cantidad)])))
  }

  React.useEffect(() => {
    let cancelado = false
    obtenerCarritoAction(subdominio).then((res) => {
      if (cancelado) return
      setCargando(false)
      if (res.ok) aplicarRespuesta(res.datos)
      else if (res.error.estado !== 404 && !res.error.codigo.startsWith("CAR-")) setError(res.error)
    })
    return () => {
      cancelado = true
    }
  }, [subdominio])

  /** Ejecuta una acción que devuelve el carrito recalculado y actualiza la página y el icono. */
  const actualizar = async (accion: () => Promise<{ ok: true; datos: Carrito } | { ok: false; error: ErrorApi }>) => {
    setOcupado(true)
    setError(null)
    const res = await accion()
    setOcupado(false)
    if (!res.ok) {
      setError(res.error)
      return false
    }
    aplicarRespuesta(res.datos)
    avisarCambioCarrito(subdominio)
    return true
  }

  const cambiarCantidad = async (linea: LineaCarrito) => {
    const n = Number(cantidades[linea.variante_id])
    if (!Number.isInteger(n) || n < 0 || n > MAX_CANTIDAD) {
      setErrorCantidad(`Elige una cantidad entre 0 y ${MAX_CANTIDAD}. Con 0 se quita el producto.`)
      return
    }
    setErrorCantidad(null)
    const ok = await actualizar(() => cambiarCantidadAction(subdominio, linea.variante_id, n))
    if (ok && n === 0) toast.add({ type: "success", title: "Producto quitado del carrito" })
  }

  const quitar = async (linea: LineaCarrito) => {
    await actualizar(() => quitarItemAction(subdominio, linea.variante_id))
  }

  const aplicarCupon = async () => {
    setErrorCupon(null)
    const codigo = cupon.trim()
    if (!codigo) return setErrorCupon("Escribe el código del cupón.")
    setOcupado(true)
    const res = await aplicarCuponAction(subdominio, codigo)
    setOcupado(false)
    if (!res.ok) return setErrorCupon(res.error.message)
    aplicarRespuesta(res.datos)
    avisarCambioCarrito(subdominio)
    setCupon("")
  }

  const quitarCupon = async () => {
    await actualizar(() => quitarCuponAction(subdominio))
  }

  if (cargando) return <p className="text-[13px] text-muted-foreground">Cargando tu carrito…</p>

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertTitle>No pudimos cargar tu carrito</AlertTitle>
        <AlertDescription>{error.message}</AlertDescription>
      </Alert>
    )
  }

  if (!carrito || carrito.items.length === 0) {
    return (
      <div className="space-y-6">
        <EstadoVacio titulo="Tu carrito está vacío" descripcion="Agrega productos desde el catálogo para verlos aquí." />
        <div className="text-center">
          <Link href={`/tienda/${subdominio}/productos`} className="text-[13px] font-bold text-brand-text hover:underline">
            Seguir comprando
          </Link>
        </div>
      </div>
    )
  }

  const moneda = carrito.moneda
  const hayDescuento = carrito.cupon != null || Number(carrito.descuento_total) > 0

  return (
    <div className="space-y-6">
      <h1 className="text-[18px] font-extrabold tracking-tight text-foreground">Carrito</h1>

      {errorCantidad && (
        <Alert variant="destructive">
          <AlertDescription>{errorCantidad}</AlertDescription>
        </Alert>
      )}

      {carrito.advertencias.length > 0 && (
        <Alert>
          <AlertTitle>Revisa tu carrito</AlertTitle>
          <AlertDescription>
            <ul className="list-disc pl-4">
              {carrito.advertencias.map((a, i) => (
                <li key={`${a.codigo}-${i}`}>{a.mensaje}</li>
              ))}
            </ul>
          </AlertDescription>
        </Alert>
      )}

      <Card>
        <CardContent className="divide-y divide-border">
          {carrito.items.map((linea) => (
            <div key={linea.variante_id} className="grid gap-3 py-4 sm:grid-cols-[1fr_auto] sm:items-center">
              <div className="min-w-0">
                <p className="truncate text-[13px] font-bold">{linea.titulo_producto}</p>
                <p className="text-[12px] text-muted-foreground">{linea.titulo_variante}</p>
                <p className="text-[12px] text-muted-foreground">
                  {formatearDinero(linea.precio_unitario, moneda)} c/u · Total {formatearDinero(linea.total_linea, moneda)}
                </p>
                {!linea.disponible && <p className="text-[12px] font-bold text-destructive-text">No disponible</p>}
              </div>
              <div className="flex flex-wrap items-end gap-2">
                <div className="w-24">
                  <FloatingInput
                    label="Cantidad"
                    inputMode="numeric"
                    value={cantidades[linea.variante_id] ?? ""}
                    onChange={(e) => setCantidades((c) => ({ ...c, [linea.variante_id]: e.target.value }))}
                  />
                </div>
                <Button type="button" variant="neutral" size="sm" disabled={ocupado} onClick={() => cambiarCantidad(linea)}>
                  Actualizar
                </Button>
                <Button type="button" variant="danger-outline" size="sm" disabled={ocupado} onClick={() => quitar(linea)}>
                  Quitar
                </Button>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardContent className="space-y-4">
          {carrito.cupon ? (
            <div className="flex items-center justify-between gap-3">
              <p className="text-[13px]">
                Cupón <span className="font-bold">{carrito.cupon.codigo}</span> aplicado
              </p>
              <Button type="button" variant="neutral" size="sm" disabled={ocupado} onClick={quitarCupon}>
                Quitar cupón
              </Button>
            </div>
          ) : (
            <div className="flex items-start gap-3">
              <div className="flex-1">
                <FloatingInput
                  label="Cupón de descuento"
                  value={cupon}
                  onChange={(e) => setCupon(e.target.value)}
                  state={errorCupon ? "error" : "default"}
                  mensajeError={errorCupon ?? undefined}
                />
              </div>
              <Button type="button" variant="neutral" disabled={ocupado} onClick={aplicarCupon}>
                Aplicar
              </Button>
            </div>
          )}

          <dl className="space-y-2 text-[13px]">
            <div className="flex justify-between">
              <dt>Subtotal</dt>
              <dd>{formatearDinero(carrito.subtotal, moneda)}</dd>
            </div>
            {hayDescuento && (
              <div className="flex justify-between">
                <dt>Descuento</dt>
                <dd>−{formatearDinero(carrito.descuento_total, moneda)}</dd>
              </div>
            )}
            <div className="flex justify-between">
              <dt>Impuestos</dt>
              <dd>{formatearDinero(carrito.impuestos_total, moneda)}</dd>
            </div>
            <div className="flex justify-between border-t border-border pt-2 text-[15px] font-extrabold">
              <dt>Total estimado</dt>
              <dd>{formatearDinero(carrito.total_estimado, moneda)}</dd>
            </div>
          </dl>

          {/* TODO(W-016): Conectar con el checkout */}
          <Button type="button" className="w-full" disabled title="El pago se habilita en la siguiente fase">
            Continuar con la compra
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
