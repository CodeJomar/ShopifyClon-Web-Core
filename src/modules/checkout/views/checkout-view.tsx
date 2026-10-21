"use client"

import * as React from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Alert, AlertDescription, AlertTitle } from "@/shared/components/ui/alert"
import { Button } from "@/shared/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card"
import { EstadoVacio } from "@/shared/components/composed/estado-vacio"
import { FloatingInput } from "@/shared/components/composed/floating-input"
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

/** Checkout de la vitrina: datos y envío, confirmación del total de la API y creación idempotente de la orden. */
export function CheckoutView({ subdominio }: { subdominio: string }) {
  const [carrito, setCarrito] = React.useState<Carrito | null>(null)
  const [tarifas, setTarifas] = React.useState<TarifaEnvioVitrina[]>([])
  const [sesion, setSesion] = React.useState<SesionCheckout | null>(null)
  const [cargando, setCargando] = React.useState(true)
  const [error, setError] = React.useState<ErrorApi | null>(null)
  const [datos, setDatos] = React.useState<DatosCheckoutValues | null>(null)
  const [aviso, setAviso] = React.useState<string | null>(null)
  // Total que devolvió la API al rechazar con CHK-004 (incluye el envío, que el carrito no incluye). Null hasta entonces.
  const [totalApi, setTotalApi] = React.useState<number | null>(null)
  const [enviando, setEnviando] = React.useState(false)
  const { obtener, reiniciar } = useClaveIdempotencia()
  const router = useRouter()

  React.useEffect(() => {
    let cancelado = false
    Promise.all([obtenerCarritoAction(subdominio), tarifasEnvioAction(subdominio), datosDeSesionParaCheckout()]).then(
      ([c, t, s]) => {
        if (cancelado) return
        if (c.ok) setCarrito(c.datos)
        if (t.ok) setTarifas(t.datos)
        setSesion(s)
        setCargando(false)
      },
    )
    return () => {
      cancelado = true
    }
  }, [subdominio])

  const recargarCarrito = async () => {
    const res = await obtenerCarritoAction(subdominio)
    if (res.ok) setCarrito(res.datos)
  }

  const confirmar = async () => {
    if (!datos || !carrito) return
    setError(null)
    setAviso(null)
    setEnviando(true)
    const totalEsperado = totalApi ?? Number(carrito.total_estimado)
    // Misma clave mientras el contenido no cambie (doble clic o reintento); nueva si cambió el carrito, el total o los datos.
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
      // El total cambió: la API devuelve el total recalculado en `detalles`. Se muestra ese total y se pide confirmar de nuevo.
      const recalculado = Number(res.error.detalles?.total_recalculado)
      reiniciar()
      await recargarCarrito()
      if (Number.isFinite(recalculado)) {
        setTotalApi(recalculado)
        setAviso("El total cambió. Revisa el nuevo total y confirma de nuevo.")
      } else {
        setTotalApi(null)
        setAviso("El total cambió. Revisa el carrito y confirma de nuevo.")
      }
      return
    }
    setError(res.error)
  }

  if (cargando) return <p className="text-[13px] text-muted-foreground">Cargando tu compra…</p>

  if (!carrito || carrito.items.length === 0) {
    return (
      <div className="space-y-6">
        <EstadoVacio titulo="Tu carrito está vacío" descripcion="Agrega productos antes de continuar con la compra." />
        <div className="text-center">
          <Link href={`/tienda/${subdominio}/productos`} className="text-[13px] font-bold text-brand-text hover:underline">
            Seguir comprando
          </Link>
        </div>
      </div>
    )
  }

  const requiereEnvio = carrito.requiere_envio
  const sinTarifas = requiereEnvio && tarifas.length === 0

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-3">
        <h1 className="text-[18px] font-extrabold tracking-tight text-foreground">
          {datos ? "Confirma tu compra" : "Datos de compra"}
        </h1>
        <Link href={`/tienda/${subdominio}/carrito`} className="text-[12px] font-bold text-brand-text hover:underline">
          Volver al carrito
        </Link>
      </div>

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
        <FormularioDatos
          requiereEnvio={requiereEnvio}
          moneda={carrito.moneda}
          tarifas={tarifas}
          sesion={sesion}
          deshabilitado={sinTarifas}
          onSiguiente={(valores) => {
            setDatos(valores)
            setAviso(null)
          }}
        />
      ) : (
        <ResumenConfirmacion
          carrito={carrito}
          totalMostrado={totalApi ?? carrito.total_estimado}
          incluyeEnvio={totalApi !== null}
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

/** Paso 1: datos del comprador y, si hace falta, dirección y tarifa. Con sesión se prellena y se pueden usar direcciones guardadas. */
function FormularioDatos({
  requiereEnvio,
  moneda,
  tarifas,
  sesion,
  deshabilitado,
  onSiguiente,
}: {
  requiereEnvio: boolean
  moneda: string
  tarifas: TarifaEnvioVitrina[]
  sesion: SesionCheckout | null
  deshabilitado: boolean
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
  }

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

            <label className="block space-y-1.5 text-[13px]">
              <span className="font-bold">Tarifa de envío</span>
              <select className="h-11 w-full rounded-xl border border-border bg-card px-3 text-[13px]" {...form.register("tarifa_envio_id")}>
                {tarifas.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.nombre} · {formatearDinero(t.precio, moneda)}
                  </option>
                ))}
              </select>
              {mensaje("tarifa_envio_id") && <span className="text-[12px] text-destructive-text">{mensaje("tarifa_envio_id")}</span>}
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

/** Paso 2: resumen y confirmación. Todos los montos son los que devolvió la API en el carrito; la web no suma nada. */
function ResumenConfirmacion({
  carrito,
  totalMostrado,
  incluyeEnvio,
  datos,
  tarifa,
  enviando,
  onVolver,
  onConfirmar,
}: {
  carrito: Carrito
  /** Total a mostrar: el del carrito, o el que devolvió la API al recalcular (con envío). */
  totalMostrado: number | string
  incluyeEnvio: boolean
  datos: DatosCheckoutValues
  tarifa: TarifaEnvioVitrina | null
  enviando: boolean
  onVolver: () => void
  onConfirmar: () => void
}) {
  const moneda = carrito.moneda
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
              <dd>{formatearDinero(carrito.subtotal, moneda)}</dd>
            </div>
            {(carrito.cupon != null || Number(carrito.descuento_total) > 0) && (
              <div className="flex justify-between">
                <dt>Descuento{carrito.cupon ? ` (${carrito.cupon.codigo})` : ""}</dt>
                <dd>−{formatearDinero(carrito.descuento_total, moneda)}</dd>
              </div>
            )}
            <div className="flex justify-between">
              <dt>Impuestos</dt>
              <dd>{formatearDinero(carrito.impuestos_total, moneda)}</dd>
            </div>
            {carrito.requiere_envio && (
              <div className="flex justify-between">
                <dt>Envío{tarifa ? ` (${tarifa.nombre})` : ""}</dt>
                <dd>Se calcula al confirmar</dd>
              </div>
            )}
            <div className="flex justify-between border-t border-border pt-2 text-[15px] font-extrabold">
              <dt>{incluyeEnvio ? "Total con envío" : "Total"}</dt>
              <dd>{formatearDinero(totalMostrado, moneda)}</dd>
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

/** Construye el cuerpo de la API a partir del formulario y del carrito. Sin cálculos: solo copia lo que la API devolvió. */
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


