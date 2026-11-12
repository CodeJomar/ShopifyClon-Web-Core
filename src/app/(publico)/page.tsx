import Link from "next/link"
import { ArrowRight, Boxes, PackageCheck, Rocket, Store, Truck, Wallet } from "lucide-react"
import { claseBotonContorno, claseBotonHero, claseBotonMarca, claseContenedor } from "@/shared/components/marketing/estilos"
import { ReciboDividido } from "@/shared/components/marketing/recibo-dividido"
import { TarjetaProducto } from "@/modules/mercado/components/tarjeta-producto"
import { TarjetaTienda } from "@/modules/mercado/components/tarjeta-tienda"
import { listarCategorias, listarPlanes, obtenerDestacados } from "@/modules/mercado/datos"
import { formatearDinero } from "@/shared/utils/dinero"
import { cn } from "@/shared/utils/cn"

export const metadata = {
  title: "OTemu | Compra en muchas tiendas, paga una sola vez",
  description: "Un mercado de tiendas independientes con un solo carrito y un solo pago. Y si quieres vender, abre tu tienda gratis.",
}

const PASOS_VENDER = [
  { icono: Store, titulo: "Crea tu tienda", texto: "Elige el nombre y la dirección de tu tienda. Sin tarjeta y sin pagar para empezar." },
  { icono: Boxes, titulo: "Publica tus productos", texto: "Sube fotos, precios y stock. Tu tienda aparece en el mercado cuando tengas un producto publicado." },
  { icono: Truck, titulo: "Despacha y cobra", texto: "Recibes los pedidos, armas tus rutas de reparto y tu parte de cada venta llega a tu saldo." },
]

export default async function Portada() {
  const [{ productos, tiendas }, categorias, planes] = await Promise.all([obtenerDestacados(), listarCategorias(), listarPlanes()])
  const gratis = planes.find((p) => p.limite_tiendas === 1 && p.precio_mensual === 0) ?? planes[0]

  return (
    <>
      {/* Héroe: lo que distingue a OTemu es el pago único repartido entre tiendas */}
      <section className="relative isolate overflow-hidden">
        <div aria-hidden="true" className="absolute inset-0 -z-10 bg-grad-halo" />
        <div className={cn(claseContenedor, "grid items-center gap-12 pb-16 pt-14 lg:grid-cols-[1.05fr_0.95fr] lg:gap-16 lg:pb-20 lg:pt-20")}>
          <div>
            <h1 className="max-w-2xl text-[40px] font-extrabold leading-[1.04] tracking-[-0.035em] text-foreground sm:text-[56px] lg:text-[64px]">
              Compra en muchas tiendas. Paga una sola vez.
            </h1>
            <p className="mt-6 max-w-xl text-[17px] font-medium leading-relaxed text-muted-foreground">
              OTemu reúne tiendas independientes en un solo lugar. Arma un carrito con productos de varias tiendas y paga una vez con tarjeta: cada
              tienda recibe su parte y te despacha lo suyo.
            </p>
            <div className="mt-9 flex flex-wrap gap-3">
              <Link href="/mercado" className={claseBotonHero}>
                Explorar el mercado <ArrowRight aria-hidden="true" />
              </Link>
              <Link href="/planes" className={claseBotonContorno}>
                Crear mi tienda gratis
              </Link>
            </div>
            <p className="mt-6 text-[13.5px] font-medium text-muted-foreground">
              Tu primera tienda es gratis y no necesitas tarjeta para abrirla.
            </p>
          </div>
          <ReciboDividido className="mx-auto w-full max-w-md lg:mx-0 lg:ml-auto" />
        </div>
      </section>

      {/* Para quien compra: tres razones, no tres tarjetas iguales */}
      <section className={cn(claseContenedor, "py-10")} aria-labelledby="comprar-titulo">
        <h2 id="comprar-titulo" className="max-w-2xl text-[30px] font-extrabold leading-tight tracking-tight text-foreground sm:text-[36px]">
          Comprar a varias tiendas deja de ser un trámite
        </h2>
        <div className="mt-8 grid gap-4 lg:grid-cols-[1.35fr_1fr]">
          <div className="rounded-3xl bg-primary p-8 text-sobre-marca sm:p-10">
            <PackageCheck aria-hidden="true" className="size-9" strokeWidth={1.6} />
            <h3 className="mt-5 max-w-md text-[24px] font-extrabold leading-snug tracking-tight sm:text-[28px]">Un carrito para todas las tiendas</h3>
            <p className="mt-3 max-w-md text-[15px] font-semibold leading-relaxed">
              Agrega café de una tienda, una chalina de otra y un cargador de una tercera. Ves el total de todo junto y confirmas una sola vez.
            </p>
          </div>
          <div className="grid gap-4">
            <div className="rounded-3xl border border-island-border bg-primary/10 p-7">
              <Wallet aria-hidden="true" className="size-7 text-brand-text" strokeWidth={1.7} />
              <h3 className="mt-3 text-[18px] font-extrabold tracking-tight text-foreground">Pagas una vez, sin dividir nada</h3>
              <p className="mt-1.5 text-[14px] leading-relaxed text-muted-foreground">Con tarjeta se hace un solo cobro; nosotros repartimos el dinero entre las tiendas.</p>
            </div>
            <div className="rounded-3xl border border-island-border bg-card p-7 shadow-isla">
              <Truck aria-hidden="true" className="size-7 text-brand-text" strokeWidth={1.7} />
              <h3 className="mt-3 text-[18px] font-extrabold tracking-tight text-foreground">Sigues cada despacho</h3>
              <p className="mt-1.5 text-[14px] leading-relaxed text-muted-foreground">Cada tienda despacha lo suyo y tú ves el avance de todo en un solo pedido.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Mercado: categorías y productos recientes */}
      <section className={cn(claseContenedor, "pt-16")} aria-labelledby="mercado-titulo">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <h2 id="mercado-titulo" className="text-[30px] font-extrabold leading-tight tracking-tight text-foreground sm:text-[36px]">
            Recién llegado al mercado
          </h2>
          <Link href="/mercado" className="inline-flex items-center gap-1.5 rounded text-[14px] font-bold text-brand-text outline-none hover:underline focus-visible:ring-[3px] focus-visible:ring-ring/40">
            Ver todo el mercado <ArrowRight aria-hidden="true" className="size-4" />
          </Link>
        </div>
        <ul className="mt-5 flex flex-wrap gap-2" aria-label="Categorías">
          {categorias.map((c) => (
            <li key={c.id}>
              <Link
                href={`/mercado?categoria=${c.id}`}
                className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-4 py-2 text-[13.5px] font-semibold text-foreground outline-none transition-colors hover:border-primary hover:bg-primary/10 focus-visible:ring-[3px] focus-visible:ring-ring/40"
              >
                {c.nombre}
                <span className="text-[12px] font-medium text-muted-foreground">{c.total_productos}</span>
              </Link>
            </li>
          ))}
        </ul>
        <ul className="mt-7 grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-4">
          {productos.map((p) => (
            <li key={p.id}>
              <TarjetaProducto producto={p} className="h-full" />
            </li>
          ))}
        </ul>
      </section>

      {/* Tiendas */}
      <section className={cn(claseContenedor, "pt-20")} aria-labelledby="tiendas-titulo">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <h2 id="tiendas-titulo" className="max-w-xl text-[30px] font-extrabold leading-tight tracking-tight text-foreground sm:text-[36px]">
            Tiendas que ya venden en OTemu
          </h2>
          <Link href="/mercado/tiendas" className="inline-flex items-center gap-1.5 rounded text-[14px] font-bold text-brand-text outline-none hover:underline focus-visible:ring-[3px] focus-visible:ring-ring/40">
            Ver todas las tiendas <ArrowRight aria-hidden="true" className="size-4" />
          </Link>
        </div>
        <ul className="mt-7 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {tiendas.map((t) => (
            <li key={t.id}>
              <TarjetaTienda tienda={t} />
            </li>
          ))}
        </ul>
      </section>

      {/* Vender */}
      <section className={cn(claseContenedor, "pt-24")} aria-labelledby="vender-titulo">
        <div className="grid items-start gap-10 rounded-[32px] border border-island-border bg-card p-7 shadow-isla sm:p-10 lg:grid-cols-[1.1fr_0.9fr] lg:gap-14 lg:p-14">
          <div>
            <h2 id="vender-titulo" className="max-w-lg text-[30px] font-extrabold leading-tight tracking-tight text-foreground sm:text-[38px]">
              Abre tu tienda sin pagar nada
            </h2>
            <p className="mt-4 max-w-lg text-[16px] font-medium leading-relaxed text-muted-foreground">
              Si ya compras en OTemu, ya tienes la cuenta. Solo falta elegir un plan y ponerle nombre a tu tienda.
            </p>
            <ol className="mt-8 space-y-6">
              {PASOS_VENDER.map((paso, i) => (
                <li key={paso.titulo} className="flex gap-4">
                  <span className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-primary/14 text-brand-text" aria-hidden="true">
                    <paso.icono className="size-5" strokeWidth={1.8} />
                  </span>
                  <div>
                    <p className="text-[16px] font-extrabold tracking-tight text-foreground">
                      <span className="sr-only">Paso {i + 1}: </span>
                      {paso.titulo}
                    </p>
                    <p className="mt-0.5 max-w-md text-[14px] leading-relaxed text-muted-foreground">{paso.texto}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>

          <div className="rounded-3xl bg-primary p-0.5">
            <div className="rounded-[22px] bg-card p-7">
              <p className="inline-flex items-center gap-1.5 rounded-full bg-primary/15 px-3 py-1 text-[12px] font-extrabold text-brand-text">
                <Rocket aria-hidden="true" className="size-3.5" /> {gratis.nombre}
              </p>
              <p className="mt-4 text-[44px] font-extrabold leading-none tracking-tight text-foreground">
                {formatearDinero(0, gratis.moneda)}
                <span className="ml-1.5 text-[15px] font-semibold text-muted-foreground">al mes, sin vencimiento</span>
              </p>
              <ul className="mt-6 space-y-2.5">
                {gratis.incluye.map((x) => (
                  <li key={x} className="flex items-start gap-2.5 text-[14px] font-medium text-foreground">
                    <span aria-hidden="true" className="mt-1.5 size-2 shrink-0 rounded-full bg-primary" />
                    {x}
                  </li>
                ))}
              </ul>
              <div className="mt-7 flex flex-wrap gap-3">
                <Link href="/registro" className={claseBotonMarca}>
                  Crear mi tienda
                </Link>
                <Link href="/planes" className={claseBotonContorno}>
                  Ver los planes
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Cierre */}
      <section className={cn(claseContenedor, "pt-24")}>
        <div className="relative overflow-hidden rounded-[32px] bg-grad-tinta px-7 py-14 text-center text-white sm:px-12 sm:py-20">
          <h2 className="relative mx-auto max-w-2xl text-[30px] font-extrabold leading-tight tracking-tight sm:text-[40px]">
            Tu próxima compra o tu primera venta empieza aquí
          </h2>
          <div className="relative mt-8 flex flex-wrap justify-center gap-3">
            <Link href="/mercado" className={claseBotonMarca}>
              Explorar el mercado
            </Link>
            <Link href="/registro" className="inline-flex h-11 items-center justify-center rounded-xl border-[1.8px] border-white/40 px-5 text-[14px] font-bold text-white outline-none transition-colors hover:bg-white/10 focus-visible:ring-[3px] focus-visible:ring-white/50">
              Crear mi cuenta
            </Link>
          </div>
        </div>
      </section>
    </>
  )
}
