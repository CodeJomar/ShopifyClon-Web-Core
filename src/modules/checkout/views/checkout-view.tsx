"use client"

import * as React from "react"
import { Check, ShoppingBag } from "lucide-react"
import { Skeleton } from "@/shared/components/ui/skeleton"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useForm, useWatch } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Alert, AlertDescription, AlertTitle } from "@/shared/components/ui/alert"
import { Button } from "@/shared/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card"
import { EstadoVacio } from "@/shared/components/composed/estado-vacio"
import { FloatingInput } from "@/shared/components/composed/floating-input"
import { SelectorUbicacion } from "@/shared/components/composed/mapa-ubicacion"
import { formatearDinero } from "@/shared/utils/dinero"
import { useClaveIdempotencia } from "@/shared/hooks/use-clave-idempotencia"
import type { Carrito } from "@/dtos/carrito"
import type { CheckoutRequest, TarifaEnvioVitrina, DireccionCheckout } from "@/dtos/checkout"
import type { DireccionDto, PerfilCuentaDto } from "@/dtos/cuenta"
import type { ErrorApi } from "@/lib/api/error-api"
import { avisarCambioCarrito, obtenerCarritoAction } from "@/modules/carrito/actions/carrito.actions"
import { crearOrdenAction, datosDeSesionParaCheckout, tarifasEnvioAction } from "../actions/checkout.actions"
import { crearDatosCheckoutSchema, type DatosCheckoutValues } from "../schema"

interface SesionCheckout {
  perfil: PerfilCuentaDto
  direcciones: DireccionDto[]
}

/**
 * Checkout de la vitrina. Con envío, la tarifa elegida se cotiza en el carrito (la API calcula el envío y el total);
 * ese total es el `total_esperado`. La web no suma ni calcula montos.
 */
export function CheckoutView({ subdominio }: { subdominio: string }) {
  const [carrito, setCarrito] = React.useState<Carrito | null>(null)
  const [tarifas, setTarifas] = React.useState<TarifaEnvioVitrina[]>([])
  const [sesion, setSesion] = React.useState<SesionCheckout | null>(null)
  const [cargando, setCargando] = React.useState(true)
  const [error, setError] = React.useState<ErrorApi | null>(null)
  const [datos, setDatos] = React.useState<DatosCheckoutValues | null>(null)
  const [aviso, setAviso] = React.useState<string | null>(null)
  const [enviando, setEnviando] = React.useState(false)
  // Cotización del carrito con la tarifa elegida (costo de envío y total con envío de la API).
  const [cotizacion, setCotizacion] = React.useState<Carrito | null>(null)
  const [cotizando, setCotizando] = React.useState(false)
  const [errorCotizacion, setErrorCotizacion] = React.useState<ErrorApi | null>(null)
  const { obtener, reiniciar } = useClaveIdempotencia()
  const router = useRouter()

  const cotizar = React.useCallback(
    async (tarifaId: string) => {
      setCotizando(true)
      setErrorCotizacion(null)
      const res = await obtenerCarritoAction(subdominio, tarifaId)
      setCotizando(false)
      if (res.ok) {
        setCotizacion(res.datos)
      } else {
        setCotizacion(null)
        setErrorCotizacion(res.error)
      }
    },
    [subdominio],
  )

  React.useEffect(() => {
    let cancelado = false
    Promise.all([obtenerCarritoAction(subdominio), tarifasEnvioAction(subdominio), datosDeSesionParaCheckout()]).then(
      ([c, t, s]) => {
        if (cancelado) return
        if (c.ok) setCarrito(c.datos)
        if (t.ok) setTarifas(t.datos)
        setSesion(s)
        setCargando(false)
        // Con envío, se cotiza de entrada la primera tarifa activa.
        if (c.ok && c.datos.requiere_envio && t.ok && t.datos.length > 0) void cotizar(t.datos[0].id)
      },
    )
    return () => {
      cancelado = true
    }
  }, [subdominio, cotizar])

  const recargarCarrito = async () => {
    const res = await obtenerCarritoAction(subdominio)
    if (res.ok) setCarrito(res.datos)
  }

  const requiereEnvio = carrito?.requiere_envio ?? false
  // Total que se envía como `total_esperado`: el de la cotización vigente si hay envío; el del carrito si no.
  const totalVigente = requiereEnvio ? cotizacion?.total_estimado : carrito?.total_estimado

  const confirmar = async () => {
    if (!datos || !carrito || totalVigente === undefined) return
    setError(null)
    setAviso(null)
    setEnviando(true)
    const totalEsperado = Number(totalVigente)
    // Misma clave mientras el contenido no cambie (doble clic o reintento); nueva si cambian el total, las líneas o los datos.
    const clave = obtener(JSON.stringify({ total: totalEsperado, lineas: carrito.items.map((l) => [l.variante_id, l.cantidad]), datos }))
    const res = await crearOrdenAction(subdominio, clave, construirPayload(datos, carrito, totalEsperado))
    setEnviando(false)

    if (res.ok) {
      reiniciar()
      avisarCambioCarrito(subdominio)
      router.replace(`/tienda/${subdominio}/orden/${res.datos.token_acceso}`)
      return
    }
    if (res.error.codigo === "CHK-004") {
      // Cambió un precio entre la cotización y la confirmación: se recotiza y se pide confirmar de nuevo (no es el camino normal).
      reiniciar()
      await recargarCarrito()
      if (carrito.requiere_envio && datos.tarifa_envio_id) await cotizar(datos.tarifa_envio_id)
      setAviso("El total cambió. Revisa el nuevo total y confirma de nuevo.")
      return
    }
    setError(res.error)
  }

  if (cargando) {
    return (
      <div className="grid gap-6 lg:grid-cols-[1fr_340px]" aria-busy="true" aria-label="Cargando tu compra">
        <Skeleton className="h-96 rounded-xl" />
        <Skeleton className="h-64 rounded-xl" />
      </div>
    )
  }

  if (!carrito || carrito.items.length === 0) {
    return (
      <Card>
        <CardContent>
          <EstadoVacio icono={ShoppingBag} titulo="Tu carrito está vacío" descripcion="Agrega productos antes de continuar con la compra." />
          <div className="pb-2 text-center">
            <Link href={`/tienda/${subdominio}/productos`} className="text-[13px] font-bold text-brand-text hover:underline">
              Seguir comprando
            </Link>
          </div>
        </CardContent>
      </Card>
    )
  }

  const sinTarifas = requiereEnvio && tarifas.length === 0

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-3">
        <h1 className="text-[22px] font-extrabold tracking-tight text-foreground">
          {datos ? "Confirma tu compra" : "Finaliza tu compra"}
        </h1>
        <Link href={`/tienda/${subdominio}/carrito`} className="text-[12px] font-bold text-brand-text hover:underline">
          Volver al carrito
        </Link>
      </div>

      <ol className="flex items-center gap-3 text-[12.5px] font-bold" aria-label="Pasos de la compra">
        {[["Tus datos", !datos], ["Confirmar", Boolean(datos)]].map(([etiqueta, activo], i) => (
          <li key={String(etiqueta)} className="flex items-center gap-2" aria-current={activo ? "step" : undefined}>
            {i > 0 && <span aria-hidden="true" className="h-px w-8 bg-border" />}
            <span className={`flex size-6 items-center justify-center rounded-full text-[11px] ${activo ? "bg-primary text-primary-foreground" : i === 0 && datos ? "bg-primary/14 text-brand-text" : "bg-muted text-muted-foreground"}`}>
              {i === 0 && datos ? <Check aria-hidden="true" className="size-3.5" /> : i + 1}
            </span>
            <span className={activo ? "text-foreground" : "text-muted-foreground"}>{etiqueta}</span>
          </li>
        ))}
      </ol>

      {error && (
        <Alert variant="destructive">
          <AlertTitle>No pudimos crear tu orden</AlertTitle>
          <AlertDescription>{error.message}</AlertDescription>
        </Alert>
      )}
      {aviso && (
        <Alert>
          <AlertDescription>{aviso}</AlertDescription>
        </Alert>
      )}
      {sinTarifas && (
        <Alert variant="destructive">
          <AlertTitle>No hay envíos disponibles</AlertTitle>
          <AlertDescription>La tienda no tiene tarifas de envío activas. Vuelve más tarde.</AlertDescription>
        </Alert>
      )}

      {!datos ? (
        <div className="grid items-start gap-6 lg:grid-cols-[1fr_340px]">
        <FormularioDatos
          requiereEnvio={requiereEnvio}
          moneda={carrito.moneda}
          tarifas={tarifas}
          sesion={sesion}
          cotizacion={cotizacion}
          cotizando={cotizando}
          errorCotizacion={errorCotizacion}
          deshabilitado={sinTarifas || (requiereEnvio && (cotizando || !cotizacion))}
          onTarifaCambia={(id) => void cotizar(id)}
          onSiguiente={(valores) => {
            setDatos(valores)
            setAviso(null)
          }}
        />
        <Card className="lg:sticky lg:top-24">
          <CardContent className="space-y-4">
            <h2 className="text-[16px] font-extrabold tracking-tight text-foreground">Tu pedido</h2>
            <ul className="divide-y divide-border/60 text-[13px]">
              {carrito.items.map((linea) => (
                <li key={linea.variante_id} className="flex items-start justify-between gap-3 py-2.5 first:pt-0">
                  <div className="min-w-0">
                    <p className="truncate font-bold text-foreground">{linea.titulo_producto}</p>
                    <p className="text-[12px] text-muted-foreground">{linea.titulo_variante ? `${linea.titulo_variante} · ` : ""}{linea.cantidad} u.</p>
                  </div>
                  <span className="shrink-0 font-bold">{formatearDinero(linea.total_linea, carrito.moneda)}</span>
                </li>
              ))}
            </ul>
            <dl className="space-y-1.5 border-t border-border pt-3 text-[13px]">
              <div className="flex justify-between"><dt className="text-muted-foreground">Subtotal</dt><dd className="font-bold">{formatearDinero(carrito.subtotal, carrito.moneda)}</dd></div>
              {requiereEnvio && cotizacion && <div className="flex justify-between"><dt className="text-muted-foreground">Envío</dt><dd className="font-bold">{formatearDinero(cotizacion.costo_envio, carrito.moneda)}</dd></div>}
              <div className="flex justify-between text-[16px] font-extrabold"><dt>Total</dt><dd>{formatearDinero((requiereEnvio && cotizacion ? cotizacion : carrito).total_estimado, carrito.moneda)}</dd></div>
            </dl>
          </CardContent>
        </Card>
        </div>
      ) : (
        <ResumenConfirmacion
          carrito={carrito}
          cotizacion={requiereEnvio ? cotizacion : null}
          datos={datos}
          tarifa={tarifas.find((t) => t.id === datos.tarifa_envio_id) ?? null}
          enviando={enviando}
          onVolver={() => setDatos(null)}
          onConfirmar={confirmar}
        />
      )}
    </div>
  )
}

/** Paso 1: datos del comprador y, si hace falta, dirección y tarifa. Elegir tarifa cotiza el envío en el carrito. */
function FormularioDatos({
  requiereEnvio,
  moneda,
  tarifas,
  sesion,
  cotizacion,
  cotizando,
  errorCotizacion,
  deshabilitado,
  onTarifaCambia,
  onSiguiente,
}: {
  requiereEnvio: boolean
  moneda: string
  tarifas: TarifaEnvioVitrina[]
  sesion: SesionCheckout | null
  cotizacion: Carrito | null
  cotizando: boolean
  errorCotizacion: ErrorApi | null
  deshabilitado: boolean
  onTarifaCambia: (tarifaId: string) => void
  onSiguiente: (valores: DatosCheckoutValues) => void
}) {
  const principal = sesion?.direcciones.find((d) => d.es_principal) ?? sesion?.direcciones[0]
  const form = useForm<DatosCheckoutValues>({
    resolver: zodResolver(crearDatosCheckoutSchema(requiereEnvio)),
    defaultValues: {
      correo_cliente: sesion?.perfil.correo_electronico ?? "",
      nombre_cliente: sesion ? `${sesion.perfil.nombres} ${sesion.perfil.apellidos}`.trim() : "",
      telefono_cliente: sesion?.perfil.telefono ?? "",
      direccion_nombre_contacto: principal?.nombre_contacto ?? "",
      direccion_telefono: principal?.telefono ?? "",
      direccion_linea1: principal?.direccion_linea1 ?? "",
      direccion_linea2: principal?.direccion_linea2 ?? "",
      ciudad: principal?.ciudad ?? "",
      estado_provincia: principal?.estado_provincia ?? "",
      codigo_postal: principal?.codigo_postal ?? "",
      pais: principal?.pais ?? "Perú",
      latitud: principal?.latitud ?? null,
      longitud: principal?.longitud ?? null,
      tarifa_envio_id: tarifas[0]?.id ?? "",
    },
  })
  const errores = form.formState.errors
  const estado = (campo: keyof DatosCheckoutValues) => (errores[campo] ? "error" : "default") as "error" | "default"
  const mensaje = (campo: keyof DatosCheckoutValues) => errores[campo]?.message

  const usarDireccion = (id: string) => {
    const d = sesion?.direcciones.find((x) => x.id === id)
    if (!d) return
    form.setValue("direccion_nombre_contacto", d.nombre_contacto)
    form.setValue("direccion_telefono", d.telefono ?? "")
    form.setValue("direccion_linea1", d.direccion_linea1)
    form.setValue("direccion_linea2", d.direccion_linea2 ?? "")
    form.setValue("ciudad", d.ciudad)
    form.setValue("estado_provincia", d.estado_provincia)
    form.setValue("codigo_postal", d.codigo_postal)
    form.setValue("pais", d.pais)
    form.setValue("latitud", d.latitud ?? null)
    form.setValue("longitud", d.longitud ?? null)
  }

  const latitud = useWatch({ control: form.control, name: "latitud" })
  const longitud = useWatch({ control: form.control, name: "longitud" })
  const punto = latitud !== null && longitud !== null ? { latitud, longitud } : null

  return (
    <form onSubmit={form.handleSubmit(onSiguiente)} noValidate className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Tus datos</CardTitle>
        </CardHeader>
        <CardContent className="space-y-5">
          <FloatingInput label="Correo" inputMode="email" state={estado("correo_cliente")} mensajeError={mensaje("correo_cliente")} {...form.register("correo_cliente")} />
          <FloatingInput label="Nombre y apellido" state={estado("nombre_cliente")} mensajeError={mensaje("nombre_cliente")} {...form.register("nombre_cliente")} />
          <FloatingInput label="Teléfono (opcional)" inputMode="tel" state={estado("telefono_cliente")} mensajeError={mensaje("telefono_cliente")} {...form.register("telefono_cliente")} />
        </CardContent>
      </Card>

      {requiereEnvio && (
        <Card>
          <CardHeader>
            <CardTitle>Envío</CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            {sesion && sesion.direcciones.length > 0 && (
              <label className="block space-y-1.5 text-[13px]">
                <span className="font-bold">Dirección guardada</span>
                <select
                  className="h-11 w-full rounded-xl border border-border bg-card px-3 text-[13px]"
                  defaultValue={principal?.id ?? ""}
                  onChange={(e) => usarDireccion(e.target.value)}
                >
                  <option value="">Escribir otra dirección</option>
                  {sesion.direcciones.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.direccion_linea1}, {d.ciudad}
                    </option>
                  ))}
                </select>
              </label>
            )}
            <FloatingInput label="Quien recibe" state={estado("direccion_nombre_contacto")} mensajeError={mensaje("direccion_nombre_contacto")} {...form.register("direccion_nombre_contacto")} />
            <FloatingInput label="Teléfono de contacto (opcional)" inputMode="tel" state={estado("direccion_telefono")} mensajeError={mensaje("direccion_telefono")} {...form.register("direccion_telefono")} />
            <FloatingInput label="Dirección" state={estado("direccion_linea1")} mensajeError={mensaje("direccion_linea1")} {...form.register("direccion_linea1")} />
            <FloatingInput label="Referencia (opcional)" state={estado("direccion_linea2")} mensajeError={mensaje("direccion_linea2")} {...form.register("direccion_linea2")} />
            <FloatingInput label="Ciudad" state={estado("ciudad")} mensajeError={mensaje("ciudad")} {...form.register("ciudad")} />
            <FloatingInput label="Departamento o provincia" state={estado("estado_provincia")} mensajeError={mensaje("estado_provincia")} {...form.register("estado_provincia")} />
            <FloatingInput label="Código postal" state={estado("codigo_postal")} mensajeError={mensaje("codigo_postal")} {...form.register("codigo_postal")} />
            <FloatingInput label="País" state={estado("pais")} mensajeError={mensaje("pais")} {...form.register("pais")} />
            <SelectorUbicacion
              valor={punto}
              error={mensaje("latitud")}
              alCambiar={(u) => {
                form.setValue("latitud", u.latitud, { shouldValidate: true, shouldDirty: true })
                form.setValue("longitud", u.longitud, { shouldDirty: true })
              }}
            />

            <label className="block space-y-1.5 text-[13px]">
              <span className="font-bold">Tarifa de envío</span>
              <select
                className="h-11 w-full rounded-xl border border-border bg-card px-3 text-[13px]"
                {...form.register("tarifa_envio_id", { onChange: (e) => onTarifaCambia(e.target.value) })}
              >
                {tarifas.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.nombre} · {formatearDinero(t.precio, moneda)}
                  </option>
                ))}
              </select>
              {mensaje("tarifa_envio_id") && <span className="text-[12px] text-destructive-text">{mensaje("tarifa_envio_id")}</span>}
              {cotizando && <span className="text-[12px] text-muted-foreground">Calculando el envío…</span>}
              {!cotizando && cotizacion && (
                <span className="text-[12px] text-muted-foreground">
                  Envío: {formatearDinero(cotizacion.costo_envio ?? 0, moneda)} · Total con envío: {formatearDinero(cotizacion.total_estimado, moneda)}
                </span>
              )}
              {!cotizando && errorCotizacion && <span className="text-[12px] text-destructive-text">{errorCotizacion.message}</span>}
            </label>
          </CardContent>
        </Card>
      )}

      <Button type="submit" className="w-full" disabled={deshabilitado}>
        Continuar
      </Button>
    </form>
  )
}

/** Paso 2: resumen y confirmación. Con envío, los montos son los de la cotización de la API; la web no suma nada. */
function ResumenConfirmacion({
  carrito,
  cotizacion,
  datos,
  tarifa,
  enviando,
  onVolver,
  onConfirmar,
}: {
  carrito: Carrito
  cotizacion: Carrito | null
  datos: DatosCheckoutValues
  tarifa: TarifaEnvioVitrina | null
  enviando: boolean
  onVolver: () => void
  onConfirmar: () => void
}) {
  const moneda = carrito.moneda
  const vista = cotizacion ?? carrito
  const conEnvio = cotizacion !== null
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Resumen</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <ul className="divide-y divide-border text-[13px]">
            {carrito.items.map((l) => (
              <li key={l.variante_id} className="flex justify-between gap-3 py-2">
                <span>
                  {l.titulo_producto} · {l.titulo_variante} × {l.cantidad}
                </span>
                <span>{formatearDinero(l.total_linea, moneda)}</span>
              </li>
            ))}
          </ul>
          <dl className="space-y-2 text-[13px]">
            <div className="flex justify-between">
              <dt>Subtotal</dt>
              <dd>{formatearDinero(vista.subtotal, moneda)}</dd>
            </div>
            {(vista.cupon != null || Number(vista.descuento_total) > 0) && (
              <div className="flex justify-between">
                <dt>Descuento{vista.cupon ? ` (${vista.cupon.codigo})` : ""}</dt>
                <dd>−{formatearDinero(vista.descuento_total, moneda)}</dd>
              </div>
            )}
            {conEnvio && (
              <div className="flex justify-between">
                <dt>Envío{tarifa ? ` (${tarifa.nombre})` : ""}</dt>
                <dd>{formatearDinero(vista.costo_envio ?? 0, moneda)}</dd>
              </div>
            )}
            <div className="flex justify-between">
              <dt>Impuestos</dt>
              <dd>{formatearDinero(vista.impuestos_total, moneda)}</dd>
            </div>
            <div className="flex justify-between border-t border-border pt-2 text-[15px] font-extrabold">
              <dt>Total</dt>
              <dd>{formatearDinero(vista.total_estimado, moneda)}</dd>
            </div>
          </dl>
          <p className="text-[12px] text-muted-foreground">
            Pago manual (transferencia o Yape). Verás cómo pagar en la página de tu orden.
          </p>
          {datos.correo_cliente && <p className="text-[12px] text-muted-foreground">Enviaremos la información a {datos.correo_cliente}.</p>}
        </CardContent>
      </Card>

      <div className="flex gap-3">
        <Button type="button" variant="neutral" className="flex-1" disabled={enviando} onClick={onVolver}>
          Volver
        </Button>
        <Button type="button" className="flex-1" disabled={enviando} onClick={onConfirmar}>
          {enviando ? "Creando tu orden…" : "Confirmar compra"}
        </Button>
      </div>
    </div>
  )
}

/** Construye el cuerpo de la API a partir del formulario y del carrito. Sin cálculos: el total viene de la API. */
function construirPayload(datos: DatosCheckoutValues, carrito: Carrito, totalEsperado: number): CheckoutRequest {
  const direccion: DireccionCheckout | undefined = carrito.requiere_envio
    ? {
        nombre_contacto: datos.direccion_nombre_contacto,
        telefono: datos.direccion_telefono || undefined,
        direccion_linea1: datos.direccion_linea1,
        direccion_linea2: datos.direccion_linea2 || undefined,
        ciudad: datos.ciudad,
        estado_provincia: datos.estado_provincia,
        codigo_postal: datos.codigo_postal,
        pais: datos.pais,
        latitud: datos.latitud ?? undefined,
        longitud: datos.longitud ?? undefined,
      }
    : undefined
  return {
    correo_cliente: datos.correo_cliente,
    nombre_cliente: datos.nombre_cliente,
    telefono_cliente: datos.telefono_cliente || undefined,
    direccion_envio: direccion,
    tarifa_envio_id: carrito.requiere_envio ? datos.tarifa_envio_id : undefined,
    pasarela: "MANUAL",
    total_esperado: totalEsperado,
  }
}
