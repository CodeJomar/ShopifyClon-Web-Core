"use client"

import * as React from "react"
import Link from "next/link"
import { motion, useMotionValue, useReducedMotion, useSpring, useTransform } from "motion/react"
import { ArrowRight, ChevronDown, ShieldCheck, Sparkles, Store, Truck } from "lucide-react"
import { formatearDinero } from "@/shared/utils/dinero"
import { cn } from "@/shared/utils/cn"

const PARTES = [
  { nombre: "Café Andino", inicial: "C", detalle: "2 productos", monto: 65.4, color: "#F59E0B" },
  { nombre: "Casa Quinua", inicial: "C", detalle: "1 producto", monto: 119, color: "#00E699" },
  { nombre: "Taller Textil Cusco", inicial: "T", detalle: "1 producto", monto: 189, color: "#E91E63" },
]

const ease = [0.22, 1, 0.36, 1] as const

/** Héroe inmersivo de la portada: aurora animada, titular grande y un recibo de vidrio en 3D que sigue al cursor. Siempre en tema oscuro. */
export function HeroPortada() {
  const reducido = useReducedMotion()
  const entrada = (retraso: number) =>
    reducido ? {} : { initial: { opacity: 0, y: 26, filter: "blur(8px)" }, animate: { opacity: 1, y: 0, filter: "blur(0px)" }, transition: { duration: 0.9, delay: retraso, ease } }

  return (
    <section className="relative z-10 flex min-h-[100svh] flex-col items-center px-4 pb-20 pt-32 text-foreground sm:pt-36">

      <div className="relative z-10 mx-auto flex w-full max-w-5xl flex-col items-center text-center">
        <motion.p
          {...entrada(0.1)}
          className="inline-flex items-center gap-2 rounded-full border border-black/10 bg-white/55 dark:border-white/15 dark:bg-white/[0.07] px-4 py-1.5 text-[12.5px] font-bold text-foreground backdrop-blur-xl"
        >
          <span className="relative flex size-2">
            <span className="absolute inline-flex size-full animate-ping rounded-full bg-[#00B87C] opacity-70 dark:bg-[#00E699]" />
            <span className="relative inline-flex size-2 rounded-full bg-[#00B87C] dark:bg-[#00E699]" />
          </span>
          Un mercado, un carrito, un solo pago
        </motion.p>

        <motion.h1
          {...entrada(0.25)}
          className="mt-7 text-balance text-[44px] font-extrabold leading-[1.02] tracking-[-0.04em] dark:[text-shadow:0_4px_40px_rgb(0_0_0/0.5)] sm:text-[64px] lg:text-[88px]"
        >
          Compra en muchas tiendas.
          <br />
          <span className="bg-[linear-gradient(95deg,#00805A_10%,#0079A8_90%)] bg-clip-text text-transparent dark:bg-[linear-gradient(95deg,#00E699_10%,#7DF3FF_90%)]">Paga una sola vez.</span>
        </motion.h1>

        <motion.p {...entrada(0.45)} className="mt-6 max-w-2xl text-pretty text-[16px] font-medium leading-relaxed text-muted-foreground sm:text-[18px]">
          Arma un carrito con productos de varias tiendas independientes y paga una vez con tarjeta: nosotros repartimos el dinero y cada tienda te despacha lo suyo.
        </motion.p>

        <motion.div {...entrada(0.6)} className="mt-9 flex flex-wrap items-center justify-center gap-3">
          <Link
            href="/mercado"
            className="inline-flex h-12 items-center justify-center gap-2 rounded-2xl bg-[linear-gradient(95deg,#00E699,#2BD9FF)] px-7 text-[15px] font-extrabold text-[#03130E] shadow-[0_14px_40px_-12px_rgb(0_230_153/0.7)] outline-none transition-all duration-200 hover:-translate-y-0.5 hover:brightness-110"
          >
            Explorar el mercado <ArrowRight aria-hidden="true" className="size-4" />
          </Link>
          <Link
            href="/planes"
            className="inline-flex h-12 items-center justify-center gap-2 rounded-2xl border border-black/15 bg-white/60 px-7 text-[15px] font-bold text-foreground outline-none backdrop-blur-xl transition-all duration-200 hover:-translate-y-0.5 hover:bg-white/80 dark:border-white/20 dark:bg-white/[0.07] dark:hover:bg-white/[0.14]"
          >
            Crear mi tienda gratis
          </Link>
        </motion.div>
      </div>

      <ReciboVidrio />

      <a
        href="#comprar-titulo"
        aria-label="Seguir bajando"
        className="relative z-10 mt-12 flex size-11 items-center justify-center rounded-full border border-black/10 bg-white/55 text-foreground outline-none backdrop-blur-md transition-colors hover:bg-white/80 dark:border-white/15 dark:bg-white/[0.06] dark:hover:bg-white/[0.14]"
      >
        <motion.span animate={reducido ? undefined : { y: [0, 4, 0] }} transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}>
          <ChevronDown aria-hidden="true" className="size-5" />
        </motion.span>
      </a>
    </section>
  )
}

/** Recibo de vidrio con inclinación 3D según el cursor, flotando, con tres chips que se mueven con más profundidad. */
function ReciboVidrio() {
  const reducido = useReducedMotion()
  const x = useMotionValue(0)
  const y = useMotionValue(0)
  const sx = useSpring(x, { stiffness: 110, damping: 16 })
  const sy = useSpring(y, { stiffness: 110, damping: 16 })
  const rotarY = useTransform(sx, [-0.5, 0.5], [-9, 9])
  const rotarX = useTransform(sy, [-0.5, 0.5], [7, -7])
  const chipX = useTransform(sx, [-0.5, 0.5], [-18, 18])
  const chipY = useTransform(sy, [-0.5, 0.5], [-12, 12])
  const total = PARTES.reduce((s, p) => s + p.monto, 0)

  const alMover = (e: React.PointerEvent<HTMLDivElement>) => {
    if (reducido) return
    const r = e.currentTarget.getBoundingClientRect()
    x.set((e.clientX - r.left) / r.width - 0.5)
    y.set((e.clientY - r.top) / r.height - 0.5)
  }
  const alSalir = () => {
    x.set(0)
    y.set(0)
  }

  return (
    <motion.div
      initial={reducido ? false : { opacity: 0, y: 60, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 1.1, delay: 0.75, ease }}
      className="relative z-10 mt-14 w-full max-w-md [perspective:1100px]"
      onPointerMove={alMover}
      onPointerLeave={alSalir}
    >
      <motion.div animate={reducido ? undefined : { y: [0, -10, 0] }} transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}>
        <motion.figure
          style={{ rotateX: rotarX, rotateY: rotarY, transformStyle: "preserve-3d" }}
          aria-label="Ejemplo de un pedido con productos de tres tiendas y un solo pago"
          className="relative rounded-[28px] border border-black/10 bg-white/60 p-6 text-left shadow-[0_30px_80px_-24px_rgb(15_40_60/0.35),inset_0_1px_0_rgb(255_255_255/0.8)] backdrop-blur-2xl dark:border-white/15 dark:bg-white/[0.07] dark:shadow-[0_30px_80px_-20px_rgb(0_0_0/0.7),inset_0_1px_0_rgb(255_255_255/0.18)] sm:p-7"
        >
          {/* Reflejo de vidrio */}
          <span aria-hidden="true" className="pointer-events-none absolute inset-0 rounded-[28px] bg-[linear-gradient(125deg,rgb(255_255_255/0.5),transparent_38%)] dark:bg-[linear-gradient(125deg,rgb(255_255_255/0.16),transparent_38%)]" />

          <div className="relative flex items-start justify-between gap-4">
            <div>
              <p className="text-[13px] font-semibold text-muted-foreground">Tu pedido</p>
              <p className="mt-0.5 text-[40px] font-extrabold leading-none tracking-tight">{formatearDinero(total, "PEN")}</p>
            </div>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/15 px-3 py-1.5 text-[12px] font-extrabold text-brand-text">
              <ShieldCheck aria-hidden="true" className="size-3.5" /> Un solo pago
            </span>
          </div>

          <div className="relative mt-6 flex h-2.5 gap-1 overflow-hidden rounded-full" role="img" aria-label={`Reparto: ${PARTES.map((p) => `${p.nombre} ${formatearDinero(p.monto, "PEN")}`).join(", ")}`}>
            {PARTES.map((p, i) => (
              <motion.span
                key={p.nombre}
                className="h-full rounded-full"
                style={{ background: p.color, flexGrow: p.monto }}
                initial={reducido ? false : { scaleX: 0, originX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ duration: 0.9, delay: 1.3 + i * 0.15, ease }}
              />
            ))}
          </div>

          <ul className="relative mt-5 divide-y divide-border">
            {PARTES.map((p) => (
              <li key={p.nombre} className="flex items-center gap-3 py-3">
                <span className="flex size-9 shrink-0 items-center justify-center rounded-xl text-[14px] font-extrabold text-[#03130E]" style={{ background: p.color }} aria-hidden="true">
                  {p.inicial}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-[14px] font-bold">{p.nombre}</span>
                  <span className="block text-[12px] text-muted-foreground">{p.detalle}, despacha por separado</span>
                </span>
                <span className="text-[14px] font-extrabold">{formatearDinero(p.monto, "PEN")}</span>
              </li>
            ))}
          </ul>
          <p className="relative mt-3 flex items-center gap-2 rounded-xl bg-foreground/[0.06] px-3.5 py-2.5 text-[12.5px] font-medium text-muted-foreground">
            <Sparkles aria-hidden="true" className="size-4 shrink-0 text-brand-text" /> Cada tienda recibe automáticamente su parte.
          </p>
        </motion.figure>

        {/* Chips con más profundidad: se mueven más que el recibo */}
        <motion.span
          aria-hidden="true"
          style={{ x: chipX, y: chipY }}
          className="absolute -left-6 top-10 hidden items-center gap-2 rounded-2xl border border-black/10 bg-white/70 px-3.5 py-2 text-[12.5px] font-bold text-foreground shadow-[0_12px_30px_-10px_rgb(15_40_60/0.3)] backdrop-blur-xl dark:border-white/15 dark:bg-white/[0.09] dark:shadow-[0_12px_30px_-10px_rgb(0_0_0/0.6)] md:flex lg:-left-24"
        >
          <Store className="size-4 text-brand-text" /> 3 tiendas
        </motion.span>
        <motion.span
          aria-hidden="true"
          style={{ x: chipX, y: chipY }}
          className={cn("absolute -right-4 top-1/3 hidden items-center gap-2 rounded-2xl border border-black/10 bg-white/70 px-3.5 py-2 text-[12.5px] font-bold text-foreground shadow-[0_12px_30px_-10px_rgb(15_40_60/0.3)] backdrop-blur-xl dark:border-white/15 dark:bg-white/[0.09] dark:shadow-[0_12px_30px_-10px_rgb(0_0_0/0.6)] md:flex lg:-right-28")}
        >
          <ShieldCheck className="size-4 text-[#E91E63]" /> 1 solo cobro
        </motion.span>
        <motion.span
          aria-hidden="true"
          style={{ x: chipX, y: chipY }}
          className="absolute -bottom-4 left-10 hidden items-center gap-2 rounded-2xl border border-black/10 bg-white/70 px-3.5 py-2 text-[12.5px] font-bold text-foreground shadow-[0_12px_30px_-10px_rgb(15_40_60/0.3)] backdrop-blur-xl dark:border-white/15 dark:bg-white/[0.09] dark:shadow-[0_12px_30px_-10px_rgb(0_0_0/0.6)] md:flex lg:-left-16"
        >
          <Truck className="size-4 text-[#0079A8] dark:text-[#7DF3FF]" /> Envío por tienda
        </motion.span>
      </motion.div>
    </motion.div>
  )
}
