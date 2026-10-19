/** Fecha calendario `YYYY-MM-DD` en hora de Lima, que es la que usa la API para "hoy". */
export const fechaLima = (fecha: Date = new Date()): string =>
  new Intl.DateTimeFormat("en-CA", { timeZone: "America/Lima", year: "numeric", month: "2-digit", day: "2-digit" }).format(fecha)

/** Rango de los últimos `dias` días (hoy incluido) para los filtros `fecha_inicio` / `fecha_fin` de la API. */
export function rangoUltimosDias(dias: number): { fecha_inicio: string; fecha_fin: string } {
  const hoy = new Date()
  const inicio = new Date(hoy.getTime() - (Math.max(1, dias) - 1) * 24 * 60 * 60 * 1000)
  return { fecha_inicio: fechaLima(inicio), fecha_fin: fechaLima(hoy) }
}
