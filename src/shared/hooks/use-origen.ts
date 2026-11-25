"use client"

import * as React from "react"

const sinSuscripcion = () => () => undefined

/** Dirección del sitio donde se está (`https://otemu.up.railway.app`). Vacía en el servidor y en la primera pintura del navegador. */
export function useOrigen(): string {
  return React.useSyncExternalStore(sinSuscripcion, () => window.location.origin, () => "")
}

/** Enlace público de una tienda con la dirección real del sitio; `corto` lo deja sin `https://` para mostrarlo. */
export function enlaceDeTienda(origen: string, subdominio: string, corto = false): string {
  const completo = `${origen}/tienda/${subdominio}`
  return corto ? completo.replace(/^https?:\/\//, "") : completo
}
