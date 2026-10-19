import type { MetodoPago } from "../caja/metodoPago"
import type { Dinero } from "../core/dinero"
import type { FechaHoraLocal } from "../core/fechaHoraLocal"
import type { UUID } from "../core/helpers"
import type { EstadoPedido } from "../pedidos/estadoPedido"
import type { CajaActualDto } from "./cajaActual.dto"
import type { ComparacionPeriodoDto } from "./comparacionPeriodo.dto"
import type { PedidoRecienteDto } from "./pedidoReciente.dto"
import type { SerieVentasDto } from "./serieVentas.dto"
import type { TipoPeriodo } from "./tipoPeriodo"

export type DashboardResumenDto = {
  periodo: {
    tipo: TipoPeriodo
    inicio: FechaHoraLocal
    fin: FechaHoraLocal
  }
  kpis: {
    ventas_totales: Dinero
    /** Total devuelto en el período (ya descontado de `ventas_totales`). */
    devoluciones: Dinero
    /** Pedidos distintos con al menos un cobro. */
    pedidos_atendidos: number
    ticket_promedio: Dinero
    tiempo_promedio_preparacion_minutos: number
  }
  pedidos: {
    /** En vivo, independiente del período: lo que requiere atención ahora. */
    activos: {
      total: number
      pendientes: number
      en_preparacion: number
      listos_sin_cobrar: number
    }
    del_periodo: Record<EstadoPedido, number>
  }
  salon_en_vivo: {
    total_mesas: number
    libres: number
    ocupadas: number
    por_cobrar: number
    por_limpiar: number
    /** Ya formateado ("37.5%"). */
    porcentaje_ocupacion: string
  }
  top_productos: Array<{
    id_producto: UUID
    nombre: string
    /** Categoría del producto; null si ya no existe. */
    categoria: string | null
    unidades_vendidas: number
    total_recaudado: Dinero
  }>
  distribucion_pagos: Array<{
    metodo: MetodoPago
    monto: Dinero
    cobros: number
    /** Ya formateado ("62.5%"). */
    porcentaje: string
  }>
  /** Ventas por tramo (hora, día o semana). */
  serie_ventas: SerieVentasDto
  /** null cuando se consulta un turno (no tiene "anterior"). */
  comparacion: ComparacionPeriodoDto | null
  pedidos_recientes: PedidoRecienteDto[]
  /** null si el usuario no tiene `TRANSACTIONS:LEER`; `{ abierta: false }` si la caja está cerrada. */
  caja_actual: CajaActualDto | null
}
