import * as React from "react"
import Link from "next/link"
import { ArrowLeft, Store } from "lucide-react"
import { FondoAurora } from "@/shared/components/marketing/fondo-aurora"
import { ThemeToggle } from "@/shared/components/theme/theme-toggle"

/**
 * Acceso (login, registro, activar, recuperar, desbloquear): el mismo fondo de aurora que la portada, con el formulario en una tarjeta
 * de vidrio centrada. Un solo diseño para todas las pantallas de entrada.
 */
export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="otemu-auth-layout relative flex min-h-screen w-full flex-col items-center justify-center overflow-hidden px-4 py-16 sm:py-20">
      <FondoAurora className="!fixed inset-0 z-0" intensidad={0.95} />

      <div className="absolute left-4 top-4 z-20 sm:left-7 sm:top-6">
        <Link href="/" className="inline-flex items-center gap-1.5 rounded-xl border border-white/12 bg-black/30 px-3 py-2 text-[13px] font-bold text-foreground outline-none backdrop-blur-xl transition-colors hover:bg-white/10">
          <ArrowLeft aria-hidden="true" className="size-4" /> Volver al inicio
        </Link>
      </div>
      <div className="absolute right-4 top-4 z-20 sm:right-7 sm:top-6">
        <ThemeToggle />
      </div>

      <div className="relative z-10 flex w-full max-w-[26rem] flex-col items-center gap-7">
        <Link href="/" className="flex items-center gap-2.5 rounded-xl outline-none">
          <span className="flex size-11 items-center justify-center rounded-xl bg-primary text-sobre-marca shadow-[0_10px_30px_-10px_rgb(0_230_153/0.7)]">
            <Store className="size-6" aria-hidden="true" />
          </span>
          <span className="text-[26px] font-extrabold tracking-tight text-foreground">OTemu</span>
        </Link>

        <div className="otemu-auth-form-side otemu-auth-card vidrio neon-anim w-full rounded-[28px] p-6 sm:p-8">
          {children}
        </div>

        <p className="text-center text-[13px] font-semibold text-muted-foreground">Compra en muchas tiendas. Paga una sola vez.</p>
      </div>
    </div>
  )
}
