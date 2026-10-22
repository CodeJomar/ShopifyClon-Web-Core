"use client"

import * as React from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Alert, AlertDescription, AlertTitle } from "@/shared/components/ui/alert"
import { Button, buttonVariants } from "@/shared/components/ui/button"
import { Card, CardContent } from "@/shared/components/ui/card"
import { FloatingInput } from "@/shared/components/composed/floating-input"
import { Skeleton } from "@/shared/components/ui/skeleton"
import { Minus, Plus, ShoppingBag, Tag, Trash2 } from "lucide-react"
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
  const router = useRouter()
  const [carrito, setCarrito] = React.useState<Carrito | null>(null)
  const [cargando, setCargando] = React.useState(true)
  const [error, setError] = React.useState<ErrorApi | null>(null)
  const [cupon, setCupon] = React.useState("")
  const [errorCupon, setErrorCupon] = React.useState<string | null>(null)
  const [errorCantidad, setErrorCantidad] = React.useState<string | null>(null)
  const [ocupado, setOcupado] = React.useState(false)

  // Sin cookie de carrito la API no tiene carrito que mostrar: se trata como carrito vacío.
  const aplicarRespuesta = (c: Carrito) => {
    setCarrito(c)
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

  const fijarCantidad = async (linea: LineaCarrito, n: number) => {
    if (n < 0 || n > MAX_CANTIDAD) return
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

  if (cargando) {
    return (
      <div className="grid gap-6 lg:grid-cols-3" aria-busy="true" aria-label="Cargando tu carrito">
        <Skeleton className="h-64 rounded-xl lg:col-span-2" />
        <Skeleton className="h-72 rounded-xl" />
      </div>
    )
  }

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
      <Card>
        <CardContent>
          <EstadoVacio
            icono={ShoppingBag}
            titulo="Tu carrito está vacío"
            descripcion="Cuando agregues productos los verás aquí, con su precio y el total de tu compra."
            accion={{ texto: "Ver productos", onClick: () => router.push(`/tienda/${subdominio}/productos`) }}
          />
        </CardContent>
      </Card>
    )
  }

  const moneda = carrito.moneda
  const hayDescuento = carrito.cupon != null || Number(carrito.descuento_total) > 0
  const unidades = carrito.items.reduce((total, l) => total + l.cantidad, 0)

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-[22px] font-extrabold tracking-tight text-foreground">Tu carrito</h1>
        <p className="mt-1 text-[13px] text-muted-foreground">{unidades} {unidades === 1 ? "producto" : "productos"} · revisa las cantidades y continúa cuando estés listo.</p>
      </div>

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

      <div className="grid items-start gap-6 lg:grid-cols-3">
        <Card className="gap-0 py-0 lg:col-span-2">
          <ul className="divide-y divide-border/60">
            {carrito.items.map((linea) => (
              <li key={linea.variante_id} className="flex flex-wrap items-center gap-x-5 gap-y-3 p-5">
                <div className="min-w-0 flex-1 basis-56">
                  <p className="truncate text-[14px] font-extrabold text-foreground">{linea.titulo_producto}</p>
                  {linea.titulo_variante && <p className="text-[12.5px] text-muted-foreground">{linea.titulo_variante}</p>}
                  <p className="mt-1 text-[12.5px] text-muted-foreground">{formatearDinero(linea.precio_unitario, moneda)} c/u</p>
                  {!linea.disponible && <p className="mt-1 text-[12px] font-bold text-destructive-text">No disponible por ahora</p>}
                </div>

                <div className="flex items-center gap-1 rounded-full border-[1.8px] border-border p-0.5" role="group" aria-label={`Cantidad de ${linea.titulo_producto}`}>
                  <button
                    type="button"
                    disabled={ocupado}
                    onClick={() => fijarCantidad(linea, linea.cantidad - 1)}
                    aria-label={linea.cantidad === 1 ? "Quitar del carrito" : "Una unidad menos"}
                    className="flex size-8 cursor-pointer items-center justify-center rounded-full text-foreground outline-none transition-colors hover:bg-primary/12 focus-visible:ring-[3px] focus-visible:ring-ring/25 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {linea.cantidad === 1 ? <Trash2 aria-hidden="true" className="size-3.5" /> : <Minus aria-hidden="true" className="size-3.5" />}
                  </button>
                  <span className="min-w-8 text-center text-[13.5px] font-extrabold" aria-live="polite">{linea.cantidad}</span>
                  <button
                    type="button"
                    disabled={ocupado || linea.cantidad >= MAX_CANTIDAD}
                    onClick={() => fijarCantidad(linea, linea.cantidad + 1)}
                    aria-label="Una unidad más"
                    className="flex size-8 cursor-pointer items-center justify-center rounded-full text-foreground outline-none transition-colors hover:bg-primary/12 focus-visible:ring-[3px] focus-visible:ring-ring/25 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <Plus aria-hidden="true" className="size-3.5" />
                  </button>
                </div>

                <p className="w-24 text-right text-[15px] font-extrabold text-foreground">{formatearDinero(linea.total_linea, moneda)}</p>
                <button
                  type="button"
                  disabled={ocupado}
                  onClick={() => quitar(linea)}
                  className="cursor-pointer text-[12px] font-bold text-destructive-text outline-none hover:underline focus-visible:ring-[3px] focus-visible:ring-ring/25 disabled:opacity-50"
                >
                  Quitar
                </button>
              </li>
            ))}
          </ul>
        </Card>

        <Card className="lg:sticky lg:top-24">
          <CardContent className="space-y-4">
            <h2 className="text-[16px] font-extrabold tracking-tight text-foreground">Resumen</h2>

            {carrito.cupon ? (
              <div className="flex items-center justify-between gap-3 rounded-xl bg-primary/10 px-3.5 py-2.5">
                <p className="flex items-center gap-2 text-[13px]">
                  <Tag aria-hidden="true" className="size-4 text-brand-text" />
                  <span><span className="font-bold">{carrito.cupon.codigo}</span> aplicado</span>
                </p>
                <Button type="button" variant="ghost" size="sm" disabled={ocupado} onClick={quitarCupon}>
                  Quitar
                </Button>
              </div>
            ) : (
              <div className="flex items-start gap-2">
                <div className="min-w-0 flex-1">
                  <FloatingInput
                    label="Cupón de descuento"
                    value={cupon}
                    onChange={(e) => setCupon(e.target.value)}
                    state={errorCupon ? "error" : "default"}
                    mensajeError={errorCupon ?? undefined}
                  />
                </div>
                <Button type="button" variant="soft" className="h-11" disabled={ocupado} onClick={aplicarCupon}>
                  Aplicar
                </Button>
              </div>
            )}

            <dl className="space-y-2 text-[13px]">
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Subtotal</dt>
                <dd className="font-bold">{formatearDinero(carrito.subtotal, moneda)}</dd>
              </div>
              {hayDescuento && (
                <div className="flex justify-between text-brand-text">
                  <dt>Descuento</dt>
                  <dd className="font-bold">−{formatearDinero(carrito.descuento_total, moneda)}</dd>
                </div>
              )}
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Impuestos</dt>
                <dd className="font-bold">{formatearDinero(carrito.impuestos_total, moneda)}</dd>
              </div>
              <div className="flex justify-between border-t border-border pt-3 text-[17px] font-extrabold">
                <dt>Total estimado</dt>
                <dd>{formatearDinero(carrito.total_estimado, moneda)}</dd>
              </div>
            </dl>
            <p className="text-[11.5px] text-muted-foreground">El costo de envío se calcula en el siguiente paso.</p>

            <Link href={`/tienda/${subdominio}/checkout`} className={`${buttonVariants({ size: "lg" })} w-full`}>
              Continuar con la compra
            </Link>
            <Link href={`/tienda/${subdominio}/productos`} className="block text-center text-[12.5px] font-bold text-brand-text hover:underline">
              Seguir comprando
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
