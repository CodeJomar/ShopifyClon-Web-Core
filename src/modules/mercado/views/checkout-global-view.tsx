"use client"

import * as React from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Banknote, CreditCard, ShieldCheck, ShoppingBag } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/shared/components/ui/alert"
import { RadioGroup, RadioGroupItem } from "@/shared/components/ui/radio-group"
import { FloatingInput } from "@/shared/components/composed/floating-input"
import { SelectorUbicacion, type Ubicacion } from "@/shared/components/composed/mapa-ubicacion"
import { claseBotonMarca, claseContenedor } from "@/shared/components/marketing/estilos"
import { formatearDinero } from "@/shared/utils/dinero"
import { cn } from "@/shared/utils/cn"
import { agruparPorTienda, useCarritoEjemplo } from "../carrito-mock"
import { calcularEnvio, crearPedido, type MetodoPago } from "../pedidos-mock"
import { AvatarTienda } from "../components/tarjeta-tienda"

type Errores = Partial<Record<"nombre" | "correo" | "direccion" | "punto", string>>

/**
 * Compra con productos de varias tiendas. Con tarjeta se hace UN solo cobro y la plataforma reparte el dinero entre las tiendas;
 * con transferencia o Yape cada tienda confirma el pago de su parte. El envío se cobra por tienda.
 */
export function CheckoutGlobalView() {
  const router = useRouter()
  const { lineas, listo, vaciar } = useCarritoEjemplo()
  const [nombre, setNombre] = React.useState("")
  const [correo, setCorreo] = React.useState("")
  const [direccion, setDireccion] = React.useState("")
  const [punto, setPunto] = React.useState<Ubicacion | null>(null)
  const [metodo, setMetodo] = React.useState<MetodoPago>("TARJETA")
  const [errores, setErrores] = React.useState<Errores>({})
  const [enviando, setEnviando] = React.useState(false)

  const grupos = agruparPorTienda(lineas)
  const hayFisicos = lineas.some((l) => !l.producto.es_digital)
  const subtotal = grupos.reduce((s, g) => s + g.subtotal, 0)
  const envio = grupos.reduce((s, g) => s + calcularEnvio(g.lineas), 0)
  const total = subtotal + envio

  if (!listo) return <div className={cn(claseContenedor, "py-14")} aria-busy="true" aria-label="Cargando tu compra" />

  if (lineas.length === 0) {
    return (
      <div className={cn(claseContenedor, "flex flex-col items-center py-24 text-center")}>
        <ShoppingBag aria-hidden="true" className="size-12 text-muted-foreground" strokeWidth={1.4} />
        <h1 className="mt-4 text-[26px] font-extrabold tracking-tight text-foreground">No hay nada que pagar todavía</h1>
        <p className="mt-2 text-[15px] text-muted-foreground">Agrega productos al carrito para continuar con la compra.</p>
        <Link href="/mercado" className={cn(claseBotonMarca, "mt-6")}>Explorar el mercado</Link>
      </div>
    )
  }

  const confirmar = (e: React.FormEvent) => {
    e.preventDefault()
    const nuevos: Errores = {}
    if (!nombre.trim()) nuevos.nombre = "Escribe tu nombre."
    if (!/^\S+@\S+\.\S+$/.test(correo.trim())) nuevos.correo = "Escribe un correo válido."
    if (hayFisicos && !direccion.trim()) nuevos.direccion = "Escribe la dirección de entrega."
    if (hayFisicos && !punto) nuevos.punto = "Marca en el mapa el punto de entrega."
    setErrores(nuevos)
    if (Object.keys(nuevos).length > 0) return
    setEnviando(true)
    const pedido = crearPedido(lineas, { metodo, nombre: nombre.trim(), correo: correo.trim(), direccion: hayFisicos ? direccion.trim() : undefined })
    vaciar()
    router.push(`/mis-pedidos/${pedido.id}`)
  }

  return (
    <div className={cn(claseContenedor, "py-10 sm:py-14")}>
      <h1 className="text-[32px] font-extrabold leading-tight tracking-tight text-foreground sm:text-[40px]">Finalizar compra</h1>

      <form onSubmit={confirmar} noValidate className="mt-8 grid items-start gap-8 lg:grid-cols-[1fr_390px]">
        <div className="space-y-6">
          <section className="space-y-5 rounded-3xl border border-island-border bg-card p-6 shadow-isla" aria-labelledby="contacto-titulo">
            <h2 id="contacto-titulo" className="text-[18px] font-extrabold tracking-tight text-foreground">Tus datos</h2>
            <FloatingInput label="Nombre y apellido" autoComplete="name" value={nombre} onChange={(e) => setNombre(e.target.value)} state={errores.nombre ? "error" : "default"} mensajeError={errores.nombre} />
            <FloatingInput label="Correo electrónico" type="email" autoComplete="email" value={correo} onChange={(e) => setCorreo(e.target.value)} state={errores.correo ? "error" : "default"} mensajeError={errores.correo} ayuda="Aquí te avisamos del avance de cada despacho." />
          </section>

          {hayFisicos && (
            <section className="space-y-5 rounded-3xl border border-island-border bg-card p-6 shadow-isla" aria-labelledby="entrega-titulo">
              <div>
                <h2 id="entrega-titulo" className="text-[18px] font-extrabold tracking-tight text-foreground">Entrega</h2>
                <p className="mt-1 text-[13.5px] text-muted-foreground">Una misma dirección para todas las tiendas; cada una te envía lo suyo.</p>
              </div>
              <FloatingInput label="Dirección" autoComplete="street-address" value={direccion} onChange={(e) => setDireccion(e.target.value)} state={errores.direccion ? "error" : "default"} mensajeError={errores.direccion} />
              <SelectorUbicacion valor={punto} alCambiar={setPunto} error={errores.punto} />
            </section>
          )}

          <section className="rounded-3xl border border-island-border bg-card p-6 shadow-isla" aria-labelledby="pago-titulo">
            <h2 id="pago-titulo" className="text-[18px] font-extrabold tracking-tight text-foreground">Forma de pago</h2>
            <RadioGroup aria-label="Forma de pago" value={metodo} onValueChange={(v) => setMetodo(v as MetodoPago)} className="mt-4">
              <OpcionPago valor="TARJETA" icono={CreditCard} titulo="Tarjeta: un solo pago" detalle={`Se hace un solo cobro de ${formatearDinero(total, "PEN")} y repartimos el dinero entre las ${grupos.length === 1 ? "tienda" : `${grupos.length} tiendas`}.`} />
              <OpcionPago valor="TRANSFERENCIA" icono={Banknote} titulo="Transferencia o Yape" detalle="Cada tienda te dará sus datos y confirmará el pago de su parte por separado." />
            </RadioGroup>
            {metodo === "TRANSFERENCIA" && grupos.length > 1 && (
              <Alert className="mt-4">
                <AlertTitle>Con transferencia pagas a cada tienda</AlertTitle>
                <AlertDescription>Tendrás {grupos.length} pagos, uno por tienda. Si prefieres pagar todo junto, elige tarjeta.</AlertDescription>
              </Alert>
            )}
          </section>
        </div>

        <aside aria-label="Resumen del pedido" className="rounded-3xl bg-primary/60 p-px lg:sticky lg:top-24">
          <div className="rounded-[23px] bg-card p-6">
            <h2 className="text-[18px] font-extrabold tracking-tight text-foreground">Tu pedido</h2>
            <ul className="mt-4 space-y-4">
              {grupos.map((g) => {
                const envioTienda = calcularEnvio(g.lineas)
                return (
                  <li key={g.tienda.id} className="space-y-2">
                    <p className="flex items-center gap-2.5 text-[14px] font-extrabold text-foreground">
                      <AvatarTienda tienda={g.tienda} className="size-8 rounded-lg text-[13px]" />
                      {g.tienda.nombre}
                    </p>
                    <ul className="space-y-1 pl-[42px] text-[13px] text-muted-foreground">
                      {g.lineas.map((l) => (
                        <li key={l.producto.id} className="flex justify-between gap-3">
                          <span className="truncate">{l.cantidad} × {l.producto.titulo}</span>
                          <span className="shrink-0 font-semibold text-foreground">{formatearDinero(l.producto.precio * l.cantidad, "PEN")}</span>
                        </li>
                      ))}
                      <li className="flex justify-between gap-3">
                        <span>Envío</span>
                        <span className="font-semibold text-foreground">{envioTienda === 0 ? "Sin envío" : formatearDinero(envioTienda, "PEN")}</span>
                      </li>
                    </ul>
                  </li>
                )
              })}
            </ul>
            <dl className="mt-5 space-y-2 border-t border-border/60 pt-4 text-[14px]">
              <div className="flex justify-between"><dt className="text-muted-foreground">Productos</dt><dd className="font-semibold">{formatearDinero(subtotal, "PEN")}</dd></div>
              <div className="flex justify-between"><dt className="text-muted-foreground">Envíos</dt><dd className="font-semibold">{formatearDinero(envio, "PEN")}</dd></div>
              <div className="flex items-baseline justify-between pt-1"><dt className="text-[15px] font-bold">Total</dt><dd className="text-[28px] font-extrabold tracking-tight">{formatearDinero(total, "PEN")}</dd></div>
            </dl>
            <button type="submit" disabled={enviando} className={cn(claseBotonMarca, "mt-6 w-full disabled:opacity-60")}>
              {enviando ? "Procesando…" : metodo === "TARJETA" ? `Pagar ${formatearDinero(total, "PEN")}` : "Confirmar pedido"}
            </button>
            <p className="mt-4 flex items-start gap-2 text-[12.5px] font-medium leading-relaxed text-muted-foreground">
              <ShieldCheck aria-hidden="true" className="mt-0.5 size-4 shrink-0 text-brand-text" />
              Pago de demostración: no se hace ningún cobro real.
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
