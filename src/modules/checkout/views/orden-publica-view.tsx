"use client"

import * as React from "react"
import Link from "next/link"
import { Alert, AlertDescription, AlertTitle } from "@/shared/components/ui/alert"
import { Button } from "@/shared/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card"
import { formatearDinero } from "@/shared/utils/dinero"
import { formatearFecha } from "@/shared/utils/fechas"
import type { OrdenPublica } from "@/dtos/checkout"
import type { ErrorApi } from "@/lib/api/error-api"
import { ordenPublicaAction } from "../actions/checkout.actions"
import { PagoStripe } from "../components/pago-stripe"
import { abrirCanal, type EstadoConexion } from "@/lib/tiempo-real/canal"
import { IndicadorEnVivo } from "@/shared/components/composed/indicador-en-vivo"
import type { NotificacionOrdenComprador } from "@/dtos/tiempo-real"

const ESTADO_PAGO: Record<string, string> = {
  PENDIENTE: "Pago pendiente",
  PAGADO: "Pagado",
  PARCIALMENTE_REEMBOLSADO: "Parcialmente reembolsado",
  REEMBOLSADO: "Reembolsado",
  ANULADO: "Anulado",
}
const ESTADO_PREPARACION: Record<string, string> = {
  NO_PREPARADO: "Por preparar",
  PREPARADO: "Preparado",
  ENTREGADO: "Entregado",
}
const ESTADO_ORDEN: Record<string, string> = { ABIERTA: "Abierta", CERRADA: "Cerrada", CANCELADA: "Cancelada" }

/** Estado de una orden para quien compró, por el enlace con token. Se puede volver a consultar. */
export function OrdenPublicaView({
  subdominio,
  token,
  correoContacto,
}: {
  subdominio: string
  token: string
  correoContacto: string
}) {
  const [orden, setOrden] = React.useState<OrdenPublica | null>(null)
  const [cargando, setCargando] = React.useState(true)
  const [error, setError] = React.useState<ErrorApi | null>(null)

  const cargar = React.useCallback(() => ordenPublicaAction(subdominio, token), [subdominio, token])
  const [estadoEnVivo, setEstadoEnVivo] = React.useState<EstadoConexion>("conectando")
  // Quien espera el pago (esperarPago) se entera por el socket sin esperar a la siguiente consulta.
  const alNotificar = React.useRef<((n: NotificacionOrdenComprador) => void) | null>(null)

  // Tiempo real (W-022): socket anónimo a /topic/ordenes/{token}. Cada evento vuelve a leer la orden por la API (la fuente de
  // verdad) en vez de armarla con el mensaje. Si el socket no conecta, queda la consulta (ver esperarPago).
  React.useEffect(() => {
    const canal = abrirCanal<NotificacionOrdenComprador>({
      destino: `/topic/ordenes/${token}`,
      alCambiarEstado: setEstadoEnVivo,
      alMensaje: (n) => {
        alNotificar.current?.(n)
        void cargar().then((res) => {
          if (res.ok) setOrden(res.datos)
        })
      },
    })
    return () => canal.cerrar()
  }, [token, cargar])

  React.useEffect(() => {
    let cancelado = false
    cargar().then((res) => {
      if (cancelado) return
      setCargando(false)
      if (res.ok) setOrden(res.datos)
      else setError(res.error)
    })
    return () => {
      cancelado = true
    }
  }, [cargar])

  const consultarDeNuevo = async () => {
    setCargando(true)
    const res = await cargar()
    setCargando(false)
    if (res.ok) {
      setError(null)
      setOrden(res.datos)
    } else setError(res.error)
  }

  // Tras pagar con tarjeta, el webhook de la API marca la orden. Se espera el aviso del socket (llega al instante) y, como
  // respaldo por si el socket no conecta o se cae, se consulta cada 5 s hasta unos 60 s.
  const esperarPago = (): Promise<boolean> =>
    new Promise((resolver) => {
      let terminado = false
      const terminar = (pagada: boolean) => {
        if (terminado) return
        terminado = true
        clearInterval(intervalo)
        alNotificar.current = null
        resolver(pagada)
      }
      const consultar = async () => {
        const res = await cargar()
        if (res.ok) {
          setOrden(res.datos)
          if (res.datos.estado_pago !== "PENDIENTE") terminar(true)
        }
      }
      alNotificar.current = (n) => {
        if (n.tipo === "ORDEN_PAGADA") void consultar()
      }
      let intentos = 0
      const intervalo = setInterval(() => {
        if (++intentos >= 12) return terminar(false)
        void consultar()
      }, 5_000)
      void consultar()
    })

  if (cargando && !orden) return <p className="text-[13px] text-muted-foreground">Cargando tu orden…</p>

  if (error || !orden) {
    return (
      <Alert variant="destructive">
        <AlertTitle>No encontramos esta orden</AlertTitle>
        <AlertDescription>{error?.message ?? "Revisa el enlace de tu orden."}</AlertDescription>
      </Alert>
    )
  }

  const moneda = orden.moneda
  const pagoPendiente = orden.estado_pago === "PENDIENTE"

  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center justify-between gap-3">
          <p className="text-[12px] font-bold text-muted-foreground">Orden</p>
          <IndicadorEnVivo estado={estadoEnVivo} />
        </div>
        <h1 className="text-[18px] font-extrabold tracking-tight text-foreground">{orden.numero_orden}</h1>
        <p className="mt-1 text-[13px] text-muted-foreground">Hecha el {formatearFecha(orden.fecha_creacion)}</p>
      </div>

      <Card>
        <CardContent className="space-y-2 pt-6 text-[13px]">
          <p>
            Estado de pago: <span className="font-bold">{ESTADO_PAGO[orden.estado_pago] ?? orden.estado_pago}</span>
          </p>
          <p>
            Preparación: <span className="font-bold">{ESTADO_PREPARACION[orden.estado_preparacion] ?? orden.estado_preparacion}</span>
          </p>
          <p>
            Orden: <span className="font-bold">{ESTADO_ORDEN[orden.estado] ?? orden.estado}</span>
          </p>
          {pagoPendiente && orden.fecha_expiracion_pago && (
            <p>Fecha límite de pago: {formatearFecha(orden.fecha_expiracion_pago)}</p>
          )}
        </CardContent>
      </Card>

      {pagoPendiente && orden.pasarela === "STRIPE" && <PagoStripe subdominio={subdominio} token={token} alPagar={esperarPago} />}

      {pagoPendiente && orden.pasarela !== "STRIPE" && (
        <Alert>
          <AlertTitle>Cómo pagar</AlertTitle>
          <AlertDescription>
            Realiza el pago por transferencia o Yape y escribe a {correoContacto} con el número de orden para confirmarlo.
          </AlertDescription>
        </Alert>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Productos</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <ul className="divide-y divide-border text-[13px]">
            {orden.items.map((i, idx) => (
              <li key={`${i.sku ?? i.titulo_producto}-${idx}`} className="flex justify-between gap-3 py-2">
                <span>
                  {i.titulo_producto} · {i.titulo_variante} × {i.cantidad}
                </span>
                <span>{formatearDinero(i.total_linea, moneda)}</span>
              </li>
            ))}
          </ul>
          <dl className="space-y-2 text-[13px]">
            <div className="flex justify-between">
              <dt>Subtotal</dt>
              <dd>{formatearDinero(orden.subtotal, moneda)}</dd>
            </div>
            {Number(orden.descuento_total) > 0 && (
              <div className="flex justify-between">
                <dt>Descuento</dt>
                <dd>−{formatearDinero(orden.descuento_total, moneda)}</dd>
              </div>
            )}
            <div className="flex justify-between">
              <dt>Envío</dt>
              <dd>{formatearDinero(orden.costo_envio, moneda)}</dd>
            </div>
            <div className="flex justify-between">
              <dt>Impuestos</dt>
              <dd>{formatearDinero(orden.impuestos_total, moneda)}</dd>
            </div>
            <div className="flex justify-between border-t border-border pt-2 text-[15px] font-extrabold">
              <dt>Total</dt>
              <dd>{formatearDinero(orden.total, moneda)}</dd>
            </div>
          </dl>
        </CardContent>
      </Card>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <Button type="button" variant="neutral" disabled={cargando} onClick={consultarDeNuevo}>
          Consultar de nuevo
        </Button>
        <Link href={`/tienda/${subdominio}/productos`} className="text-[13px] font-bold text-brand-text hover:underline">
          Seguir comprando
        </Link>
      </div>
    </div>
  )
}
