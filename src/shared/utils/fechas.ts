/** Fecha calendario `YYYY-MM-DD` en hora de Lima, que es la que usa la API para "hoy". */
export const fechaLima = (fecha: Date = new Date()): string =>
  new Intl.DateTimeFormat("en-CA", { timeZone: "America/Lima", year: "numeric", month: "2-digit", day: "2-digit" }).format(fecha)

/** Rango de los últimos `dias` días (hoy incluido) para los filtros `fecha_inicio` / `fecha_fin` de la API. */
export function rangoUltimosDias(dias: number): { fecha_inicio: string; fecha_fin: string } {
  const hoy = new Date()
  const inicio = new Date(hoy.getTime() - (Math.max(1, dias) - 1) * 24 * 60 * 60 * 1000)
  return { fecha_inicio: fechaLima(inicio), fecha_fin: fechaLima(hoy) }
}

/** Lima no tiene horario de verano: siempre UTC−5. */
const DESFASE_LIMA = "-05:00"

/**
 * Día calendario `YYYY-MM-DD` (en hora de Lima) de una marca ISO. La API escribe las fechas con hora con el desfase de Lima
 * (`2026-11-11T16:38:02-05:00`, W-022) y antes en UTC (`…Z`): es el mismo instante, y esta función da el mismo día en ambos casos.
 * No hay que recortar la cadena (`slice(0, 10)`): eso depende de cómo venga escrita.
 */
export const diaLima = (iso: string): string => {
  const fecha = new Date(iso)
  return Number.isNaN(fecha.getTime()) ? "" : fechaLima(fecha)
}

/** Valor para un `<input type="datetime-local">` (`YYYY-MM-DDTHH:mm`) en hora de Lima a partir de una marca ISO de la API. */
export function aDatetimeLocalLima(iso?: string | null): string {
  if (!iso) return ""
  const fecha = new Date(iso)
  if (Number.isNaN(fecha.getTime())) return ""
  const partes = Object.fromEntries(
    new Intl.DateTimeFormat("en-CA", {
      timeZone: "America/Lima",
      hourCycle: "h23",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    })
      .formatToParts(fecha)
      .map((p) => [p.type, p.value]),
  )
  return `${partes.year}-${partes.month}-${partes.day}T${partes.hour}:${partes.minute}`
}

/** Marca ISO (UTC) a partir de un `<input type="datetime-local">` interpretado en hora de Lima, no en la del navegador. */
export function datetimeLocalLimaAIso(local?: string | null): string | undefined {
  if (!local || !local.trim()) return undefined
  const fecha = new Date(`${local}:00${DESFASE_LIMA}`)
  return Number.isNaN(fecha.getTime()) ? undefined : fecha.toISOString()
}

/**
 * Fecha y hora para mostrar a partir de la marca ISO que entrega la API (docs/arquitectura-frontend.md, regla 6): con desfase de
 * Lima (`…-05:00`) o en UTC (`…Z`), da igual, es el mismo instante. Por defecto, hora de Lima, para que comprador y panel vean lo
 * mismo aunque el navegador esté en otra zona. Usa Intl porque date-fns no convierte zonas horarias sin una dependencia extra.
 */
export function formatearFecha(isoUtc: string, zonaHoraria: string = "America/Lima"): string {
  const fecha = new Date(isoUtc)
  if (Number.isNaN(fecha.getTime())) return ""
  return new Intl.DateTimeFormat("es-PE", { timeZone: zonaHoraria, dateStyle: "medium", timeStyle: "short" }).format(fecha)
}
