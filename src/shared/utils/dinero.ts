import type { Dinero } from "@/dtos/core/dinero"

/**
 * Aritmética de dinero en CÉNTIMOS enteros. La API envía los importes como texto con 2 decimales ("12.50"); sumar o
 * comparar esos textos con `Number` acumula errores de coma flotante, así que siempre se convierte a céntimos primero.
 */

/** "12.50" → 1250. Admite signo ("-0.50" → -50) y valores sin decimales. */
export function aCentimos(dinero: Dinero | null | undefined): number {
  const texto = (dinero ?? "0").trim()
  if (!/^-?\d+(\.\d{1,2})?$/.test(texto)) return 0
  const negativo = texto.startsWith("-")
  const [enteros, decimales = ""] = texto.replace("-", "").split(".")
  const valor = Number(enteros) * 100 + Number(decimales.padEnd(2, "0"))
  return negativo ? -valor : valor
}

/** 1250 → "12.50". */
export function desdeCentimos(centimos: number): Dinero {
  const signo = centimos < 0 ? "-" : ""
  const abs = Math.abs(Math.round(centimos))
  return `${signo}${Math.floor(abs / 100)}.${String(abs % 100).padStart(2, "0")}`
}

/** Convierte lo que escribe el usuario ("12", "12.5", "12,50") en `Dinero`; null si no es un importe válido. */
export function dineroDesdeTexto(texto: string): Dinero | null {
  const limpio = texto.trim().replace(",", ".")
  if (!/^\d+(\.\d{1,2})?$/.test(limpio)) return null
  return desdeCentimos(aCentimos(limpio))
}

/** Céntimos para mostrar en pantalla: "S/ 12.50". */
export function formatearCentimos(centimos: number): string {
  return `S/ ${desdeCentimos(centimos)}`
}

/** `Dinero` para mostrar en pantalla: "S/ 12.50". */
export const formatearDinero = (dinero: Dinero | null | undefined): string => formatearCentimos(aCentimos(dinero))

/** Reparte un total en `partes` iguales sin perder ni inventar céntimos (los sobrantes van a las primeras partes). */
export function repartirCentimos(totalCentimos: number, partes: number): number[] {
  if (partes <= 0) return []
  const base = Math.floor(totalCentimos / partes)
  const resto = totalCentimos - base * partes
  return Array.from({ length: partes }, (_, i) => base + (i < resto ? 1 : 0))
}
