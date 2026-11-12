import type { PlanMercado } from "@/dtos/mercado"

/** Lo que incluye un plan, en frases cortas, calculado de los límites reales que entrega la API. */
export function incluyePlan(plan: PlanMercado): string[] {
  const productos = plan.limite_productos == null ? "Productos ilimitados" : `Hasta ${plan.limite_productos} productos`
  const personal = !plan.limite_personal ? "Solo tú administras la tienda" : `Hasta ${plan.limite_personal} personas en tu equipo`
  const pct = (plan.porcentaje_comision * 100).toLocaleString("es-PE", { maximumFractionDigits: 1 })
  return [productos, personal, `Comisión de ${pct} % por venta con tarjeta`, plan.dias_prueba ? `${plan.dias_prueba} días de prueba` : "Sin vencimiento ni tarjeta"].filter(Boolean)
}
