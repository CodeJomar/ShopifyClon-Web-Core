"use client"

import * as React from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Banknote, CreditCard, ShieldCheck, ShoppingBag, Truck } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/shared/components/ui/alert"
import { RadioGroup, RadioGroupItem } from "@/shared/components/ui/radio-group"
import { FloatingInput } from "@/shared/components/composed/floating-input"
import { SelectorUbicacion, type Ubicacion } from "@/shared/components/composed/mapa-ubicacion"
import { claseBotonMarca, claseContenedor } from "@/shared/components/marketing/estilos"
import { peticionApi } from "@/lib/api/client"
import { resultado } from "@/lib/api/resultado"
import type { ErrorApi } from "@/lib/api/error-api"
import { formatearDinero } from "@/shared/utils/dinero"
import { cn } from "@/shared/utils/cn"
import { useCarrito } from "@/modules/carrito-global/carrito"
import type { CarritoGlobalDto, PedidoDto, TarifasDeTiendaDto } from "@/dtos/carrito-global"
import { AvatarTienda } from "../components/tarjeta-tienda"

type MetodoPago = "TARJETA" | "TRANSFERENCIA"
type Campo = "nombre" | "correo" | "direccion" | "ciudad" | "provincia" | "postal" | "punto"
type Errores = Partial<Record<Campo, string>>

const llamar = <T,>(c: Parameters<typeof peticionApi<T>>[0]) => resultado(peticionApi<T>({ ...c, sinRedireccion401: true }))

/**
 * Compra con productos de varias tiendas (B4 a B6). Con tarjeta se hace UN solo cobro y la plataforma reparte el dinero entre las
 * tiendas; con transferencia o Yape cada tienda confirma el pago de su parte. El envío se elige y se cobra por tienda; el total que
 * se muestra es el cotizado por la API y es el mismo que calculará el checkout.
 */
export function CheckoutGlobalView() {
  const router = useRouter()
  const { carrito, listo, reemplazar } = useCarrito()
  const [nombre, setNombre] = React.useState("")
  const [correo, setCorreo] = React.useState("")
  const [telefono, setTelefono] = React.useState("")
  const [direccion, setDireccion] = React.useState("")
  const [ciudad, setCiudad] = React.useState("")
  const [provincia, setProvincia] = React.useState("")
  const [postal, setPostal] = React.useState("")
  const [punto, setPunto] = React.useState<Ubicacion | null>(null)
  const [metodo, setMetodo] = React.useState<MetodoPago>("TARJETA")
  const [tarifas, setTarifas] = React.useState<TarifasDeTiendaDto[] | null>(null)
  const [elegidas, setElegidas] = React.useState<Record<string, string>>({})
  const [errores, setErrores] = React.useState<Errores>({})
  const [error, setError] = React.useState<ErrorApi | null>(null)
  const [enviando, setEnviando] = React.useState(false)
  // Misma clave para reintentos del mismo envío: si la red falla tras crear el pedido, repetir no lo duplica.
  const claveIdempotencia = React.useRef<string>(typeof crypto !== "undefined" ? crypto.randomUUID() : "")

  const tiendasConEnvio = React.useMemo(() => (carrito?.tiendas ?? []).filter((t) => t.requiere_envio), [carrito])
  const hayFisicos = tiendasConEnvio.length > 0

  // Tarifas de envío por tienda, una vez que hay carrito con productos físicos.
  const hayCarrito = Boolean(carrito)
  React.useEffect(() => {
    if (!hayCarrito || !hayFisicos) return
    let cancelado = false
    void llamar<TarifasDeTiendaDto[]>({ method: "GET", url: "/carrito/tarifas" }).then((res) => {
      if (cancelado || !res.ok) return
      setTarifas(res.datos)
      // Por defecto, la primera tarifa de cada tienda.
      setElegidas((actual) => {
        const siguiente = { ...actual }
        for (const t of res.datos) if (!siguiente[t.tienda.id] && t.tarifas[0]) siguiente[t.tienda.id] = t.tarifas[0].id
        return siguiente
      })
    })
    return () => {
      cancelado = true
    }
  }, [hayCarrito, hayFisicos])

  const envios = React.useMemo(
    () => tiendasConEnvio.filter((t) => elegidas[t.tienda.id]).map((t) => ({ tienda_id: t.tienda.id, tarifa_envio_id: elegidas[t.tienda.id] })),
    [tiendasConEnvio, elegidas],
  )
  const clave = envios.map((e) => `${e.tienda_id}:${e.tarifa_envio_id}`).join("|")

  // Cotiza con las tarifas elegidas: así el total mostrado es el que cobrará el checkout.
  const [cotizado, setCotizado] = React.useState<CarritoGlobalDto | null>(null)
  // Elección de envío a la que corresponde `cotizado`: mientras no coincida con la actual, el total no es el definitivo.
  const [claveCotizada, setClaveCotizada] = React.useState<string | null>(null)
  React.useEffect(() => {
    if (!hayCarrito || (hayFisicos && envios.length < tiendasConEnvio.length)) return
    let cancelado = false
    void llamar<CarritoGlobalDto>({ method: "POST", url: "/carrito/cotizar", data: { envios } }).then((res) => {
      if (cancelado || !res.ok) return
      setCotizado(res.datos)
      setClaveCotizada(clave)
    })
    return () => {
      cancelado = true
    }
    // `clave` representa a `envios`; el efecto solo depende de la elección y de que haya carrito.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hayCarrito, hayFisicos, clave, tiendasConEnvio.length])

  if (!listo) return <div className={cn(claseContenedor, "py-14")} aria-busy="true" aria-label="Cargando tu compra" />

  if (!carrito) {
    return (
      <div className={cn(claseContenedor, "flex flex-col items-center py-24 text-center")}>
        <ShoppingBag aria-hidden="true" className="size-12 text-muted-foreground" strokeWidth={1.4} />
        <h1 className="mt-4 text-[26px] font-extrabold tracking-tight text-foreground">No hay nada que pagar todavía</h1>
        <p className="mt-2 text-[15px] text-muted-foreground">Agrega productos al carrito para continuar con la compra.</p>
        <Link href="/mercado" className={cn(claseBotonMarca, "mt-6")}>Explorar el mercado</Link>
      </div>
    )
  }

  const cotizando = hayFisicos && (envios.length < tiendasConEnvio.length || claveCotizada !== clave)
  const vista = cotizado ?? carrito
  const moneda = vista.moneda
  const porTienda = new Map(vista.tiendas.map((t) => [t.tienda.id, t]))

  const confirmar = async (e: React.FormEvent) => {
    e.preventDefault()
    if (cotizando) return
    setError(null)
    const nuevos: Errores = {}
    if (!nombre.trim()) nuevos.nombre = "Escribe tu nombre."
    if (!/^\S+@\S+\.\S+$/.test(correo.trim())) nuevos.correo = "Escribe un correo válido."
    if (hayFisicos) {
      if (!direccion.trim()) nuevos.direccion = "Escribe la dirección de entrega."
      if (!ciudad.trim()) nuevos.ciudad = "Escribe la ciudad."
      if (!provincia.trim()) nuevos.provincia = "Escribe el departamento o provincia."
      if (!postal.trim()) nuevos.postal = "Escribe el código postal."
      if (!punto) nuevos.punto = "Marca en el mapa el punto de entrega."
    }
    setErrores(nuevos)
    if (Object.keys(nuevos).length > 0) return
    setEnviando(true)
    const res = await llamar<PedidoDto>({
      method: "POST",
      url: "/checkout",
      headers: { "Idempotency-Key": claveIdempotencia.current },
      data: {
        correo_cliente: correo.trim(),
        nombre_cliente: nombre.trim(),
        telefono_cliente: telefono.trim() || undefined,
        direccion_envio: hayFisicos
          ? {
              nombre_contacto: nombre.trim(),
              telefono: telefono.trim() || undefined,
              direccion_linea1: direccion.trim(),
              ciudad: ciudad.trim(),
              estado_provincia: provincia.trim(),
              codigo_postal: postal.trim(),
              pais: "PE",
              latitud: punto?.latitud,
              longitud: punto?.longitud,
            }
          : undefined,
        envios,
        pasarela: metodo === "TARJETA" ? "STRIPE" : "MANUAL",
        total_esperado: vista.total_general,
      },
    })
    setEnviando(false)
    if (!res.ok) {
      // CHK-004: el total cambió (precio, stock, cupón): se vuelve a cotizar y se pide confirmar de nuevo.
      claveIdempotencia.current = crypto.randomUUID()
      setError(res.error)
      return
    }
    reemplazar(null)
    router.push(`/mis-pedidos/${encodeURIComponent(res.datos.token_acceso)}`)
  }

  return (
    <div className={cn(claseContenedor, "py-10 sm:py-14")}>
      <h1 className="text-[32px] font-extrabold leading-tight tracking-tight text-foreground sm:text-[40px]">Finalizar compra</h1>

      {error && (
        <Alert variant="destructive" className="mt-6">
          <AlertTitle>No pudimos crear tu pedido</AlertTitle>
          <AlertDescription>{error.message}</AlertDescription>
        </Alert>
      )}

      <form onSubmit={confirmar} noValidate className="mt-8 grid items-start gap-8 lg:grid-cols-[1fr_390px]">
        <div className="space-y-6">
          <section className="space-y-5 rounded-3xl vidrio p-6" aria-labelledby="contacto-titulo">
            <h2 id="contacto-titulo" className="text-[18px] font-extrabold tracking-tight text-foreground">Tus datos</h2>
            <FloatingInput label="Nombre y apellido" autoComplete="name" value={nombre} onChange={(e) => setNombre(e.target.value)} state={errores.nombre ? "error" : "default"} mensajeError={errores.nombre} />
            <FloatingInput label="Correo electrónico" type="email" autoComplete="email" value={correo} onChange={(e) => setCorreo(e.target.value)} state={errores.correo ? "error" : "default"} mensajeError={errores.correo} ayuda="Aquí te avisamos del avance de cada despacho." />
            <FloatingInput label="Teléfono (opcional)" type="tel" autoComplete="tel" value={telefono} onChange={(e) => setTelefono(e.target.value)} />
          </section>

          {hayFisicos && (
            <section className="space-y-5 rounded-3xl vidrio p-6" aria-labelledby="entrega-titulo">
              <div>
                <h2 id="entrega-titulo" className="text-[18px] font-extrabold tracking-tight text-foreground">Entrega</h2>
                <p className="mt-1 text-[13.5px] text-muted-foreground">Una misma dirección para todas las tiendas; cada una te envía lo suyo.</p>
              </div>
              <FloatingInput label="Dirección" autoComplete="street-address" value={direccion} onChange={(e) => setDireccion(e.target.value)} state={errores.direccion ? "error" : "default"} mensajeError={errores.direccion} />
              <div className="grid gap-5 sm:grid-cols-2">
                <FloatingInput label="Ciudad" autoComplete="address-level2" value={ciudad} onChange={(e) => setCiudad(e.target.value)} state={errores.ciudad ? "error" : "default"} mensajeError={errores.ciudad} />
                <FloatingInput label="Departamento o provincia" autoComplete="address-level1" value={provincia} onChange={(e) => setProvincia(e.target.value)} state={errores.provincia ? "error" : "default"} mensajeError={errores.provincia} />
              </div>
              <FloatingInput label="Código postal" autoComplete="postal-code" value={postal} onChange={(e) => setPostal(e.target.value)} state={errores.postal ? "error" : "default"} mensajeError={errores.postal} />
              <SelectorUbicacion valor={punto} alCambiar={setPunto} error={errores.punto} />
            </section>
          )}

          {hayFisicos && (
            <section className="space-y-5 rounded-3xl vidrio p-6" aria-labelledby="envio-titulo">
              <h2 id="envio-titulo" className="flex items-center gap-2 text-[18px] font-extrabold tracking-tight text-foreground">
                <Truck aria-hidden="true" className="size-5 text-brand-text" /> Envío de cada tienda
              </h2>
              {tarifas === null ? (
                <p className="text-[13.5px] text-muted-foreground" aria-live="polite">Buscando las tarifas de envío…</p>
              ) : (
                tiendasConEnvio.map((t) => {
                  const opciones = tarifas.find((x) => x.tienda.id === t.tienda.id)?.tarifas ?? []
                  return (
                    <fieldset key={t.tienda.id} className="space-y-2">
                      <legend className="mb-1 text-[14px] font-extrabold text-foreground">{t.tienda.nombre}</legend>
                      {opciones.length === 0 ? (
                        <p className="text-[13.5px] font-medium text-destructive-text">Esta tienda aún no tiene envíos configurados. Quita sus productos físicos para continuar.</p>
                      ) : (
                        <RadioGroup aria-label={`Envío de ${t.tienda.nombre}`} value={elegidas[t.tienda.id] ?? ""} onValueChange={(v) => setElegidas((a) => ({ ...a, [t.tienda.id]: v as string }))}>
                          {opciones.map((o) => (
                            <label key={o.id} className="flex cursor-pointer items-center gap-3 rounded-xl border-[1.8px] border-input p-3.5 transition-colors hover:border-border-hover has-data-checked:border-primary has-data-checked:bg-primary/8">
                              <RadioGroupItem value={o.id} />
                              <span className="min-w-0 flex-1">
                                <span className="block text-[14px] font-bold text-foreground">{o.nombre}</span>
                                {o.descripcion && <span className="block text-[12.5px] text-muted-foreground">{o.descripcion}</span>}
                              </span>
                              <span className="text-[14px] font-extrabold text-foreground">{Number(o.precio) === 0 ? "Gratis" : formatearDinero(Number(o.precio), t.moneda)}</span>
                            </label>
                          ))}
                        </RadioGroup>
                      )}
                    </fieldset>
                  )
                })
              )}
            </section>
          )}

          <section className="rounded-3xl vidrio p-6" aria-labelledby="pago-titulo">
            <h2 id="pago-titulo" className="text-[18px] font-extrabold tracking-tight text-foreground">Forma de pago</h2>
            <RadioGroup aria-label="Forma de pago" value={metodo} onValueChange={(v) => setMetodo(v as MetodoPago)} className="mt-4">
              <OpcionPago valor="TARJETA" icono={CreditCard} titulo="Tarjeta: un solo pago" detalle={`Se hace un solo cobro de ${formatearDinero(vista.total_general, moneda)} y repartimos el dinero entre las ${vista.tiendas.length === 1 ? "tienda" : `${vista.tiendas.length} tiendas`}.`} />
              <OpcionPago valor="TRANSFERENCIA" icono={Banknote} titulo="Transferencia o Yape" detalle="Cada tienda te dará sus datos y confirmará el pago de su parte por separado." />
            </RadioGroup>
            {metodo === "TRANSFERENCIA" && vista.tiendas.length > 1 && (
              <Alert className="mt-4">
                <AlertTitle>Con transferencia pagas a cada tienda</AlertTitle>
                <AlertDescription>Tendrás {vista.tiendas.length} pagos, uno por tienda. Si prefieres pagar todo junto, elige tarjeta.</AlertDescription>
              </Alert>
            )}
          </section>
        </div>

        <aside aria-label="Resumen del pedido" className="lg:sticky lg:top-24">
          <div className="vidrio neon-anim rounded-3xl p-6">
            <h2 className="text-[18px] font-extrabold tracking-tight text-foreground">Tu pedido</h2>
            <ul className="mt-4 space-y-4">
              {carrito.tiendas.map((g) => {
                const t = porTienda.get(g.tienda.id) ?? g
                return (
                  <li key={g.tienda.id} className="space-y-2">
                    <p className="flex items-center gap-2.5 text-[14px] font-extrabold text-foreground">
                      <AvatarTienda tienda={g.tienda} className="size-8 rounded-lg text-[13px]" />
                      {g.tienda.nombre}
                    </p>
                    <ul className="space-y-1 pl-[42px] text-[13px] text-muted-foreground">
                      {g.lineas.map((l) => (
                        <li key={l.variante_id} className="flex justify-between gap-3">
                          <span className="truncate">{l.cantidad} × {l.titulo_producto}</span>
                          <span className="shrink-0 font-semibold text-foreground">{formatearDinero(l.total_linea, g.moneda)}</span>
                        </li>
                      ))}
                      {t.descuento_total > 0 && (
                        <li className="flex justify-between gap-3"><span>Descuento</span><span className="font-semibold text-brand-text">-{formatearDinero(t.descuento_total, g.moneda)}</span></li>
                      )}
                      {g.requiere_envio && (
                        <li className="flex justify-between gap-3">
                          <span>Envío</span>
                          <span className="font-semibold text-foreground">{t.costo_envio == null ? "Elige un envío" : t.costo_envio === 0 ? "Gratis" : formatearDinero(t.costo_envio, g.moneda)}</span>
                        </li>
                      )}
                    </ul>
                  </li>
                )
              })}
            </ul>
            <dl className="mt-5 border-t border-border/60 pt-4 text-[14px]">
              <div className="flex items-baseline justify-between pt-1"><dt className="text-[15px] font-bold">Total</dt><dd className="text-[28px] font-extrabold tracking-tight">{formatearDinero(vista.total_general, moneda)}</dd></div>
            </dl>
            <button type="submit" disabled={enviando || cotizando} className={cn(claseBotonMarca, "mt-6 w-full disabled:opacity-60")}>
              {enviando ? "Procesando…" : cotizando ? "Calculando el envío…" : metodo === "TARJETA" ? `Continuar al pago de ${formatearDinero(vista.total_general, moneda)}` : "Confirmar pedido"}
            </button>
            <p className="mt-4 flex items-start gap-2 text-[12.5px] font-medium leading-relaxed text-muted-foreground">
              <ShieldCheck aria-hidden="true" className="mt-0.5 size-4 shrink-0 text-brand-text" />
              {metodo === "TARJETA" ? "Primero creamos tu pedido y en el siguiente paso pagas con tarjeta." : "Creamos tu pedido y cada tienda te escribe con sus datos de pago."}
            </p>
          </div>
        </aside>
      </form>
    </div>
  )
}

function OpcionPago({ valor, icono: Icono, titulo, detalle }: { valor: MetodoPago; icono: React.ComponentType<{ className?: string; "aria-hidden"?: boolean }>; titulo: string; detalle: string }) {
  return (
    <label className="flex cursor-pointer items-start gap-3.5 rounded-2xl border-[1.8px] border-input p-4 transition-colors hover:border-border-hover has-data-checked:border-primary has-data-checked:bg-primary/8">
      <RadioGroupItem value={valor} className="mt-1" />
      <Icono aria-hidden className="mt-0.5 size-5 shrink-0 text-brand-text" />
      <span>
        <span className="block text-[14.5px] font-bold text-foreground">{titulo}</span>
        <span className="mt-0.5 block text-[13.5px] leading-relaxed text-muted-foreground">{detalle}</span>
      </span>
    </label>
  )
}
