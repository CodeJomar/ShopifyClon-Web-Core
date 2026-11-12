import Link from "next/link"
import { Check } from "lucide-react"
import { listarPlanes } from "@/modules/mercado/datos"
import { claseBotonContorno, claseBotonMarca, claseContenedor } from "@/shared/components/marketing/estilos"
import { formatearDinero } from "@/shared/utils/dinero"
import { cn } from "@/shared/utils/cn"

export const metadata = { title: "Planes para vender | OTemu", description: "Abre tu tienda gratis y mejora tu plan cuando crezcas." }

const PREGUNTAS = [
  { p: "¿Necesito tarjeta para abrir mi tienda gratis?", r: "No. El plan gratuito no vence y no pide tarjeta. Solo pagas si decides pasar a un plan con más capacidad." },
  { p: "¿Qué pasa si ya compré en OTemu?", r: "Usas la misma cuenta. Al crear tu primera tienda pasas a ser propietario y sigues pudiendo comprar en otras tiendas." },
  { p: "¿Cómo recibo el dinero de mis ventas?", r: "Con tarjeta, el pago se reparte automáticamente y tu parte, menos la comisión del plan, se suma a tu saldo. Con transferencia o Yape cobras tú directamente." },
  { p: "¿Puedo tener más de una tienda?", r: "Sí. Cada tienda adicional lleva su propio plan, y el plan gratuito incluye una tienda por persona." },
]

export default async function Planes() {
  const planes = await listarPlanes()
  return (
    <div className={cn(claseContenedor, "py-10 sm:py-14")}>
      <header className="max-w-2xl">
        <h1 className="text-[36px] font-extrabold leading-[1.05] tracking-tight text-foreground sm:text-[48px]">Empieza gratis y crece a tu ritmo</h1>
        <p className="mt-4 text-[16px] font-medium leading-relaxed text-muted-foreground">
          Tu primera tienda no cuesta nada. Cuando necesites más productos, más tiendas o un equipo, cambias de plan sin perder nada de lo que ya publicaste.
        </p>
      </header>

      <ul className="mt-10 grid gap-5 lg:grid-cols-3">
        {planes.map((plan) => (
          <li key={plan.codigo} className={cn("rounded-[28px] p-px", plan.destacado ? "bg-primary" : "bg-island-border")}>
            <div className="flex h-full flex-col rounded-[27px] bg-card p-7">
              <div className="flex items-center justify-between gap-3">
                <h2 className="text-[20px] font-extrabold tracking-tight text-foreground">{plan.nombre}</h2>
                {plan.destacado && <span className="rounded-full bg-primary/15 px-3 py-1 text-[12px] font-extrabold text-brand-text">Sin costo</span>}
              </div>
              <p className="mt-5 text-[40px] font-extrabold leading-none tracking-tight text-foreground">
                {formatearDinero(plan.precio_mensual, plan.moneda)}
                <span className="ml-1.5 text-[14px] font-semibold text-muted-foreground">{plan.precio_mensual === 0 ? "siempre" : "al mes"}</span>
              </p>
              <p className="mt-2 text-[13.5px] font-medium text-muted-foreground">
                Comisión por venta: {(plan.comision * 100).toLocaleString("es-PE", { maximumFractionDigits: 1 })} %
              </p>
              <ul className="mt-6 flex-1 space-y-3">
                {plan.incluye.map((x) => (
                  <li key={x} className="flex items-start gap-2.5 text-[14px] font-medium text-foreground">
                    <Check aria-hidden="true" className="mt-0.5 size-4 shrink-0 text-brand-text" strokeWidth={3} />
                    {x}
                  </li>
                ))}
              </ul>
              <Link href={`/registro?plan=${plan.codigo}`} className={cn(plan.destacado ? claseBotonMarca : claseBotonContorno, "mt-8 w-full")}>
                {plan.precio_mensual === 0 ? "Crear mi tienda gratis" : `Elegir ${plan.nombre}`}
              </Link>
            </div>
          </li>
        ))}
      </ul>

      <section className="mt-20 max-w-3xl" aria-labelledby="faq-titulo">
        <h2 id="faq-titulo" className="text-[28px] font-extrabold tracking-tight text-foreground">Preguntas frecuentes</h2>
        <div className="mt-6 divide-y divide-border/60 rounded-3xl border border-island-border bg-card shadow-isla">
          {PREGUNTAS.map((q) => (
            <details key={q.p} className="group px-6 py-5">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 rounded text-[15.5px] font-bold text-foreground outline-none focus-visible:ring-[3px] focus-visible:ring-ring/40 [&::-webkit-details-marker]:hidden">
                {q.p}
                <span aria-hidden="true" className="text-[20px] font-medium text-muted-foreground transition-transform group-open:rotate-45">+</span>
              </summary>
              <p className="mt-3 text-[14.5px] leading-relaxed text-muted-foreground">{q.r}</p>
            </details>
          ))}
        </div>
      </section>
    </div>
  )
}
