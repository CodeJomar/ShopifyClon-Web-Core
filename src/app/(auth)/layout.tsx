import * as React from "react"
import Link from "next/link"
import { ArrowLeft, Store } from "lucide-react"
import { ThemeToggle } from "@/shared/components/theme/theme-toggle"
import { ReciboDividido } from "@/shared/components/marketing/recibo-dividido"

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="otemu-auth-layout grid min-h-screen w-full lg:h-screen grid-cols-12 overflow-hidden bg-background">
      {/* Panel de marca: habla a quien compra primero; vender es un paso posterior (mismo hilo del sitio público). */}
      <aside className="relative hidden h-full overflow-hidden bg-primary/14 lg:col-span-7 lg:flex lg:flex-col lg:justify-between lg:p-10 xl:p-14">
        <div className="absolute -left-24 -top-24 size-96 rounded-full bg-primary/25 blur-3xl" aria-hidden="true" />
        <div className="absolute -bottom-32 right-0 size-[28rem] rounded-full bg-info/12 blur-3xl" aria-hidden="true" />

        <Link href="/" className="relative flex w-fit items-center gap-3 rounded-xl outline-none focus-visible:ring-[3px] focus-visible:ring-ring/40">
          <span className="flex size-11 items-center justify-center rounded-xl bg-primary text-sobre-marca shadow-isla">
            <Store className="size-6" aria-hidden="true" />
          </span>
          <span className="text-2xl font-extrabold tracking-tight text-foreground">OTemu</span>
        </Link>

        <div className="relative max-w-xl space-y-6">
          <div className="space-y-3">
            <h2 className="text-balance text-[36px] font-extrabold leading-[1.05] tracking-tight text-foreground xl:text-[42px]">Compra en muchas tiendas. Paga una sola vez.</h2>
            <p className="text-[16px] font-medium text-muted-foreground [@media(max-height:780px)]:hidden">Tu cuenta sirve para comprar en todo el mercado. Si un día quieres vender, abres tu tienda gratis desde la misma cuenta.</p>
          </div>
          <ReciboDividido />
        </div>
        <p className="relative text-sm font-semibold text-foreground/65">Tiendas independientes, un solo lugar.</p>
      </aside>

      <div className="otemu-auth-form-side relative col-span-12 flex flex-col items-center justify-center gap-8 p-6 [--campo-exterior:var(--background)] sm:p-12 lg:col-span-5">
        <div className="absolute left-5 top-5 z-20 sm:left-7 sm:top-7">
          <Link href="/" className="inline-flex items-center gap-1.5 rounded-lg px-2 py-1.5 text-[13px] font-bold text-muted-foreground outline-none hover:text-foreground focus-visible:ring-[3px] focus-visible:ring-ring/40">
            <ArrowLeft aria-hidden="true" className="size-4" /> Volver al inicio
          </Link>
        </div>
        <div className="absolute right-5 top-5 z-20 sm:right-7 sm:top-7">
          <ThemeToggle />
        </div>
        <Link href="/" className="flex items-center gap-2.5 rounded-xl outline-none focus-visible:ring-[3px] focus-visible:ring-ring/40 lg:hidden">
          <span className="flex size-10 items-center justify-center rounded-xl bg-primary text-sobre-marca">
            <Store className="size-5" aria-hidden="true" />
          </span>
          <span className="text-xl font-extrabold tracking-tight text-foreground">OTemu</span>
        </Link>
        <div className="otemu-auth-card w-full max-w-sm">{children}</div>
      </div>
    </div>
  )
}
