"use client"

import * as React from "react"
import Link from "next/link"

import { useCan } from "@/modules/auth"
import { NAVEGACION, RUTAS, filtrarNavegacion } from "@/shared/constants/navegacion"

import { descripcionTarjeta, tarjetaPerfil, tituloTarjeta } from "./estilos"

/** Pantallas a las que da acceso el cargo (salen del mismo mapa y de los mismos permisos que el menú). */
export function AccesosCard() {
  const { puede } = useCan()

  const pantallas = React.useMemo(() => {
    const visibles = new Set(
      filtrarNavegacion(NAVEGACION, puede).flatMap((item) => (item.hijos ? item.hijos.map((h) => h.id) : [item.id])),
    )
    return RUTAS.filter(({ item }) => visibles.has(item.id))
  }, [puede])

  return (
    <section className={tarjetaPerfil} aria-label="Tus accesos">
      <div className="flex flex-col gap-0.5">
        <h3 className={tituloTarjeta}>Tus accesos</h3>
        <p className={descripcionTarjeta}>
          {pantallas.length} {pantallas.length === 1 ? "pantalla disponible" : "pantallas disponibles"} con tu cargo.
        </p>
      </div>
      <ul className="grid grid-cols-1 gap-2 sm:grid-cols-2">
        {pantallas.map(({ item, grupo }) => (
          <li key={item.id}>
            <Link
              href={item.href!}
              className="flex items-center gap-3 rounded-xl border border-slate-100 p-2.5 text-sm font-medium text-slate-700 transition-colors hover:border-[#4C0107]/30 hover:bg-[#EDE5E6]/50 dark:border-stone-800 dark:text-stone-200 dark:hover:bg-stone-800"
            >
              <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-[#EDE5E6] text-[#4C0107] dark:bg-stone-800 dark:text-[#E7B7BC]">
                <item.icon className="size-4" />
              </span>
              <span className="flex min-w-0 flex-col">
                <span className="truncate">{item.label}</span>
                {grupo && <span className="truncate text-[11px] font-normal text-slate-500 dark:text-stone-400">{grupo.label}</span>}
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  )
}
