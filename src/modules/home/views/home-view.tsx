"use client"

import * as React from "react"
import Link from "next/link"

import { etiquetaRol, useCan, useSession } from "@/modules/auth"
import { filtrarNavegacion, NAVEGACION, type NavItem } from "@/shared/constants/navegacion"

interface Acceso {
  item: NavItem
  /** Nombre del grupo al que pertenece (Local y Equipo, Transacciones...). */
  grupo?: string
}

/**
 * Pantalla de inicio: saluda y ofrece accesos directos a lo que el cargo del usuario puede abrir. Se arma desde el
 * mismo mapa de navegación y los mismos permisos que el menú lateral, así nunca muestra algo vedado.
 */
export function HomeView() {
  const usuario = useSession()
  const { puede } = useCan()

  const accesos = React.useMemo<Acceso[]>(
    () =>
      filtrarNavegacion(NAVEGACION, puede).flatMap((item) =>
        item.hijos ? item.hijos.map((hijo) => ({ item: hijo, grupo: item.label })) : [{ item }],
      ),
    [puede],
  )

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-stone-100">Hola, {usuario.nombre}</h1>
        <p className="text-sm text-slate-500 dark:text-stone-400">{etiquetaRol(usuario)} · ¿A dónde quieres ir?</p>
      </div>

      {accesos.length === 0 ? (
        <p className="rounded-2xl border border-slate-100 bg-slate-50 p-6 text-sm text-slate-500 dark:border-stone-800 dark:bg-stone-900 dark:text-stone-400">
          Tu cargo todavía no tiene pantallas asignadas. Pídele al encargado del local que te asigne permisos.
        </p>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {accesos.map(({ item, grupo }) => (
            <Link
              key={item.id}
              href={item.href!}
              className="group flex items-center gap-4 rounded-2xl border border-slate-100 bg-slate-50 p-4 outline-none transition-colors hover:border-[#4C0107]/30 hover:bg-[#EDE5E6]/50 focus-visible:ring-2 focus-visible:ring-[#4C0107]/30 dark:border-stone-800 dark:bg-stone-900 dark:hover:bg-stone-800"
            >
              <span className="flex size-12 shrink-0 items-center justify-center rounded-full bg-white text-[#4C0107] shadow-sm dark:bg-stone-800 dark:text-stone-200">
                <item.icon className="size-6" />
              </span>
              <span className="flex min-w-0 flex-col">
                <span className="truncate text-sm font-semibold text-slate-900 dark:text-stone-100">{item.label}</span>
                {grupo && <span className="truncate text-xs text-slate-500 dark:text-stone-400">{grupo}</span>}
              </span>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
