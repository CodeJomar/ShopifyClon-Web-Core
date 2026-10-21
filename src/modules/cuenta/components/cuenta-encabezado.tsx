"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { PESTANAS_CUENTA, pestanaCuentaDe } from "@/shared/constants/navegacion"
import { cn } from "@/shared/utils/cn"

/** Título "Mi cuenta" y pestañas como navegación: cada una es una ruta y en móvil se desplazan en horizontal. */
export function CuentaEncabezado() {
  const pathname = usePathname()
  const activa = pestanaCuentaDe(pathname)

  return (
    <div className="mb-6 space-y-4">
      <h1 className="text-[18px] font-extrabold tracking-tight text-foreground">Mi cuenta</h1>
      <nav aria-label="Secciones de la cuenta" className="-mx-1 overflow-x-auto px-1 pb-1 no-scrollbar">
        <ul className="flex w-max gap-1.5">
          {PESTANAS_CUENTA.map((pestana) => {
            const esActiva = activa?.id === pestana.id
            return (
              <li key={pestana.id}>
                <Link
                  href={pestana.href}
                  aria-current={esActiva ? "page" : undefined}
                  className={cn(
                    "inline-flex h-9 items-center whitespace-nowrap rounded-full px-4 text-[13px] font-bold outline-none transition-colors focus-visible:ring-[3px] focus-visible:ring-ring/25",
                    esActiva
                      ? "bg-primary text-primary-foreground [text-shadow:0_1px_2px_rgb(0_0_0/.14)]"
                      : "text-muted-foreground hover:bg-primary/12 hover:text-brand-text",
                  )}
                >
                  {pestana.label}
                </Link>
              </li>
            )
          })}
        </ul>
      </nav>
    </div>
  )
}
