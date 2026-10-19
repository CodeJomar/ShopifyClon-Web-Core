import { z } from "zod"
import { MENSAJE_TEXTO_LIBRE, esTextoLibreValido } from "@/shared/utils/texto"

import type { MetodoPago, TipoMovimiento, TipoMovimientoManual, TurnoActualDto } from "@/dtos/caja"
import type { EstadoPedido } from "@/dtos/pedidos"
import { aCentimos, desdeCentimos } from "@/shared/utils/dinero"

/* -------------------------------------------------------------------------- */
/*                                  Generales                                 */
/* -------------------------------------------------------------------------- */

export const METODO_PAGO_LABELS: Record<MetodoPago, string> = {
  efectivo: "Efectivo",
  tarjeta: "Tarjeta",
  yape: "Yape",
  plin: "Plin",
  transferencia: "Transferencia",
}

// Límite razonable para un movimiento o el fondo de apertura de una cafetería
export const MAX_MONTO_CAJA = 10000

// Cuántos turnos anteriores se traen para el panel de turnos
export const TURNOS_ANTERIORES = 20

// Cuántos pedidos se piden a la API por consulta (máximo que acepta el listado)
export const LIMITE_PEDIDOS = 100

// Refresco automático de la caja mientras la pestaña está visible
export const REFRESCO_CAJA_MS = 20_000

/** Texto → céntimos aceptando coma o punto decimal; NaN si no es un importe. */
export const centimosDeTexto = (valor: string | number | undefined): number => {
  const texto = String(valor ?? "").trim().replace(",", ".")
  if (!/^\d+(\.\d{1,2})?$/.test(texto)) return Number.NaN
  return aCentimos(texto)
}

/* -------------------------------------------------------------------------- */
/*                       Turno de caja: apertura, movimientos, cierre         */
/* -------------------------------------------------------------------------- */

export const TIPO_MOVIMIENTO_LABELS: Record<TipoMovimiento, string> = {
  venta: "Cobro de cuenta",
  ingreso_manual: "Entrada de dinero",
  retiro_manual: "Salida de dinero",
  devolucion: "Devolución",
}

export const TIPOS_MOVIMIENTO_MANUAL: TipoMovimientoManual[] = ["ingreso_manual", "retiro_manual"]

export type ResultadoArqueo = "cuadrado" | "sobrante" | "faltante"

export const RESULTADO_ARQUEO_LABELS: Record<ResultadoArqueo, string> = {
  cuadrado: "Cuadrado",
  sobrante: "Sobrante",
  faltante: "Faltante",
}

export function obtenerResultadoArqueo(diferenciaCentimos: number): ResultadoArqueo {
  if (diferenciaCentimos === 0) return "cuadrado"
  return diferenciaCentimos > 0 ? "sobrante" : "faltante"
}

// Denominaciones en soles para el arqueo físico de caja.
// La clave no usa puntos para que React Hook Form no la interprete como ruta anidada.
export const DENOMINACIONES = [
  { clave: "b200", centimos: 20000, tipo: "billete" },
  { clave: "b100", centimos: 10000, tipo: "billete" },
  { clave: "b50", centimos: 5000, tipo: "billete" },
  { clave: "b20", centimos: 2000, tipo: "billete" },
  { clave: "b10", centimos: 1000, tipo: "billete" },
  { clave: "m5", centimos: 500, tipo: "moneda" },
  { clave: "m2", centimos: 200, tipo: "moneda" },
  { clave: "m1", centimos: 100, tipo: "moneda" },
  { clave: "m050", centimos: 50, tipo: "moneda" },
  { clave: "m020", centimos: 20, tipo: "moneda" },
  { clave: "m010", centimos: 10, tipo: "moneda" },
] as const

/** Total contado (en céntimos) a partir de la cantidad de billetes y monedas de cada denominación. */
export function calcularContadoCentimos(conteo: Record<string, number | string>): number {
  return DENOMINACIONES.reduce((acc, d) => acc + d.centimos * (Number(conteo[d.clave]) || 0), 0)
}

/** Resumen del turno abierto, en céntimos, armado con el resumen por tipo y método que entrega la API. */
export interface ResumenTurno {
  ventasEfectivo: number
  ventasTarjeta: number
  ventasDigitales: number
  ventasTotales: number
  ingresos: number
  retiros: number
  devoluciones: number
  cuentasCobradas: number
  efectivoEsperado: number
}

const DIGITALES: MetodoPago[] = ["yape", "plin", "transferencia"]

export function resumirTurno(actual: TurnoActualDto): ResumenTurno {
  const suma = (filtro: (m: TurnoActualDto["resumen_movimientos"][number]) => boolean) =>
    actual.resumen_movimientos.filter(filtro).reduce((acc, m) => acc + aCentimos(m.total), 0)

  const ventasEfectivo = suma((m) => m.tipo_movimiento === "venta" && m.metodo_pago === "efectivo")
  const ventasTarjeta = suma((m) => m.tipo_movimiento === "venta" && m.metodo_pago === "tarjeta")
  const ventasDigitales = suma((m) => m.tipo_movimiento === "venta" && DIGITALES.includes(m.metodo_pago))

  return {
    ventasEfectivo,
    ventasTarjeta,
    ventasDigitales,
    ventasTotales: ventasEfectivo + ventasTarjeta + ventasDigitales,
    ingresos: suma((m) => m.tipo_movimiento === "ingreso_manual"),
    retiros: suma((m) => m.tipo_movimiento === "retiro_manual"),
    devoluciones: suma((m) => m.tipo_movimiento === "devolucion"),
    cuentasCobradas: actual.resumen_movimientos
      .filter((m) => m.tipo_movimiento === "venta")
      .reduce((acc, m) => acc + m.transacciones, 0),
    // El efectivo esperado lo calcula la API (solo cuenta lo que entra o sale de la gaveta)
    efectivoEsperado: aCentimos(actual.efectivo_esperado),
  }
}

const textoMonto = z.union([z.string(), z.number()])

export const aperturaCajaSchema = z.object({ montoInicial: textoMonto, notaApertura: z.string().trim().max(255, "Máximo 255 caracteres.").optional() }).superRefine((data, ctx) => {
  const monto = centimosDeTexto(data.montoInicial)
  if (Number.isNaN(monto)) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Ingresa el monto inicial en efectivo.", path: ["montoInicial"] })
  } else if (monto > MAX_MONTO_CAJA * 100) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: `El fondo inicial no puede superar S/ ${MAX_MONTO_CAJA.toLocaleString("es-PE")}.`,
      path: ["montoInicial"],
    })
  }
})
export type AperturaCajaValues = z.infer<typeof aperturaCajaSchema>

/** Entradas y salidas de efectivo. Las salidas no pueden superar el efectivo que hay en la gaveta. */
export const crearMovimientoSchema = (efectivoDisponibleCentimos: number) =>
  z
    .object({
      tipo: z.enum(["ingreso_manual", "retiro_manual"]),
      concepto: z
        .string()
        .trim()
        .min(3, "Describe el motivo (mínimo 3 caracteres).")
        .max(255, "Máximo 255 caracteres")
        .refine(esTextoLibreValido, MENSAJE_TEXTO_LIBRE),
      monto: textoMonto,
    })
    .superRefine((data, ctx) => {
      const monto = centimosDeTexto(data.monto)
      if (Number.isNaN(monto) || monto <= 0) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Ingresa un monto mayor a cero.", path: ["monto"] })
      } else if (monto > MAX_MONTO_CAJA * 100) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, message: "El monto excede el límite permitido.", path: ["monto"] })
      } else if (data.tipo === "retiro_manual" && monto > efectivoDisponibleCentimos) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "La salida supera el efectivo disponible en caja.",
          path: ["monto"],
        })
      }
    })
export type MovimientoValues = z.infer<ReturnType<typeof crearMovimientoSchema>>

/** Arqueo de cierre. Si hay diferencia se exige justificarla. */
export const crearCierreCajaSchema = (efectivoEsperadoCentimos: number) =>
  z
    .object({
      conteo: z.record(z.string(), textoMonto),
      observaciones: z.string().trim().max(255, "Máximo 255 caracteres").refine(esTextoLibreValido, MENSAJE_TEXTO_LIBRE).optional(),
    })
    .superRefine((data, ctx) => {
      for (const d of DENOMINACIONES) {
        const valor = data.conteo[d.clave]
        if (valor === "" || valor === undefined) continue
        const cantidad = Number(valor)
        if (!Number.isInteger(cantidad) || cantidad < 0) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: "Usa cantidades enteras no negativas en el conteo.",
            path: ["conteo"],
          })
          return
        }
      }
      const diferencia = calcularContadoCentimos(data.conteo) - efectivoEsperadoCentimos
      if (diferencia !== 0 && (data.observaciones?.length ?? 0) < 5) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Justifica la diferencia del arqueo (mínimo 5 caracteres).",
          path: ["observaciones"],
        })
      }
    })
export type CierreCajaValues = z.infer<ReturnType<typeof crearCierreCajaSchema>>

/* -------------------------------------------------------------------------- */
/*                         Historial de pedidos y devoluciones                */
/* -------------------------------------------------------------------------- */

export type PeriodoPedidos = "hoy" | "semana" | "mes"

export const PERIODO_PEDIDOS_LABELS: Record<PeriodoPedidos, string> = {
  hoy: "Hoy",
  semana: "7 días",
  mes: "30 días",
}

export const DIAS_PERIODO_PEDIDOS: Record<PeriodoPedidos, number> = { hoy: 1, semana: 7, mes: 30 }

/** Agrupa los 5 estados del pedido en los 3 que se filtran en pantalla. */
export type GrupoPedido = "activo" | "pagado" | "anulado"
export type FiltroGrupoPedido = GrupoPedido | "todos"

export const GRUPO_PEDIDO_LABELS: Record<GrupoPedido, string> = {
  activo: "En curso",
  pagado: "Pagados",
  anulado: "Anulados",
}

export const grupoDePedido = (estado: EstadoPedido): GrupoPedido =>
  estado === "pagado" ? "pagado" : estado === "anulado" ? "anulado" : "activo"

export const ESTADO_PEDIDO_LABELS: Record<EstadoPedido, string> = {
  pendiente: "Pendiente",
  en_preparacion: "En preparación",
  listo: "Listo",
  pagado: "Pagado",
  anulado: "Anulado",
}

/** Número legible del pedido (#12), el que se dice en voz alta y se ve en cocina. */
export const numeroPedido = (correlativo: number) => `#${correlativo}`

/** Código corto a partir del id, para los movimientos del libro de caja (que no traen el número del pedido). */
export const codigoCortoPedido = (idPedido: string) => idPedido.slice(0, 8).toUpperCase()

export const anulacionSchema = z.object({
  motivo: z
    .string()
    .trim()
    .min(5, "Indica el motivo de la anulación (mínimo 5 caracteres).")
    .max(255, "Máximo 255 caracteres")
    .refine(esTextoLibreValido, MENSAJE_TEXTO_LIBRE),
})
export type AnulacionValues = z.infer<typeof anulacionSchema>

/** Devolución total o parcial de un cobro: el monto no puede superar lo que aún se puede devolver de ese cobro. */
export const crearDevolucionSchema = (maximoCentimos: number) =>
  z
    .object({
      monto: textoMonto,
      motivo: z
        .string()
        .trim()
        .min(5, "Indica el motivo (mínimo 5 caracteres).")
        .max(255, "Máximo 255 caracteres")
        .refine(esTextoLibreValido, MENSAJE_TEXTO_LIBRE),
    })
    .superRefine((data, ctx) => {
      const monto = centimosDeTexto(data.monto)
      if (Number.isNaN(monto) || monto <= 0) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Ingresa un monto mayor a cero.", path: ["monto"] })
      } else if (monto > maximoCentimos) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: `Solo se pueden devolver hasta S/ ${desdeCentimos(maximoCentimos)} de este cobro.`,
          path: ["monto"],
        })
      }
    })
export type DevolucionValues = z.infer<ReturnType<typeof crearDevolucionSchema>>
