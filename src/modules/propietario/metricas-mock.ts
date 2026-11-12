// Métricas DE EJEMPLO por tienda para el panel general del propietario (rediseño, semana 3). El backend las entregará en B7
// (`/cuenta/panel-general`); mientras tanto salen de forma determinista del id de la tienda para que cada tienda muestre cifras estables.
export interface MetricasTiendaEjemplo {
  ventas: number
  pedidos: number
  saldo_pendiente: number
  productos: number
  por_despachar: number
  stock_bajo: number
}

function semilla(texto: string): number {
  let h = 0
  for (let i = 0; i < texto.length; i++) h = (h * 31 + texto.charCodeAt(i)) >>> 0
  return h
}

export function metricasEjemplo(tiendaId: string): MetricasTiendaEjemplo {
  const s = semilla(tiendaId)
  const ventas = 800 + (s % 9200)
  const pedidos = 6 + (s % 58)
  return {
    ventas,
    pedidos,
    saldo_pendiente: Math.round(ventas * (0.18 + ((s >> 3) % 20) / 100)),
    productos: 4 + ((s >> 5) % 40),
    por_despachar: (s >> 7) % 7,
    stock_bajo: (s >> 9) % 5,
  }
}
