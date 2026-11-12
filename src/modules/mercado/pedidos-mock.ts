// Pedidos DE EJEMPLO (rediseño, semana 2): se guardan en el navegador para recorrer el flujo «carrito → pago único → pedido con
// despacho por tienda» mientras el backend construye B5 y B6 (`/checkout`, `/cuenta/pedidos`). Tienen la forma del contrato propuesto:
// un pedido (padre) con una orden por tienda (hijas), cada una con su envío y su estado.
import type { LineaCarrito } from "./carrito-mock"
import { agruparPorTienda } from "./carrito-mock"
import type { ProductoMercado } from "@/dtos/mercado"

export type MetodoPago = "TARJETA" | "TRANSFERENCIA"
export type EstadoOrdenTienda = "PREPARANDO" | "EN_CAMINO" | "ENTREGADO"

export interface OrdenTienda {
  tienda: ProductoMercado["tienda"]
  lineas: { titulo: string; cantidad: number; precio: number; es_digital: boolean }[]
  subtotal: number
  envio: number
  total: number
  estado: EstadoOrdenTienda
  numero_guia?: string
  transportista?: string
}

export interface PedidoEjemplo {
  id: string
  numero: string
  creado_en: string
  metodo: MetodoPago
  /** Con tarjeta el pago es uno solo y está pagado; con transferencia cada tienda confirma el suyo. */
  pagado: boolean
  total: number
  ordenes: OrdenTienda[]
  contacto: { nombre: string; correo: string }
  direccion?: string
}

const CLAVE = "otemu-pedidos-ejemplo"
/** Costo de envío de ejemplo por tienda con productos físicos (el real saldrá de las tarifas de cada tienda). */
export const ENVIO_POR_TIENDA = 12

function leer(): PedidoEjemplo[] {
  try {
    const crudo = window.localStorage.getItem(CLAVE)
    return crudo ? (JSON.parse(crudo) as PedidoEjemplo[]) : []
  } catch {
    return []
  }
}

export function listarPedidos(): PedidoEjemplo[] {
  return leer().sort((a, b) => b.creado_en.localeCompare(a.creado_en))
}

export function obtenerPedido(id: string): PedidoEjemplo | null {
  return leer().find((p) => p.id === id) ?? null
}

export function calcularEnvio(lineas: LineaCarrito[]): number {
  return lineas.some((l) => !l.producto.es_digital) ? ENVIO_POR_TIENDA : 0
}

export function crearPedido(
  lineas: LineaCarrito[],
  datos: { metodo: MetodoPago; nombre: string; correo: string; direccion?: string },
): PedidoEjemplo {
  const todos = leer()
  const numero = `#${2000 + todos.length + 1}`
  const ordenes: OrdenTienda[] = agruparPorTienda(lineas).map((g, i) => {
    const envio = calcularEnvio(g.lineas)
    return {
      tienda: g.tienda,
      lineas: g.lineas.map((l) => ({ titulo: l.producto.titulo, cantidad: l.cantidad, precio: l.producto.precio, es_digital: l.producto.es_digital })),
      subtotal: g.subtotal,
      envio,
      total: g.subtotal + envio,
      // Solo para poder ver estados distintos en la demostración: la primera tienda ya despachó.
      estado: i === 0 && datos.metodo === "TARJETA" ? "EN_CAMINO" : "PREPARANDO",
      ...(i === 0 && datos.metodo === "TARJETA" ? { numero_guia: `OT-${new Date().getFullYear()}${String(2000 + todos.length + 1)}-${(i + 1).toString().padStart(6, "0")}`, transportista: "Olva Courier" } : {}),
    }
  })
  const pedido: PedidoEjemplo = {
    id: crypto.randomUUID(),
    numero,
    creado_en: new Date().toISOString(),
    metodo: datos.metodo,
    pagado: datos.metodo === "TARJETA",
    total: ordenes.reduce((s, o) => s + o.total, 0),
    ordenes,
    contacto: { nombre: datos.nombre, correo: datos.correo },
    direccion: datos.direccion,
  }
  window.localStorage.setItem(CLAVE, JSON.stringify([pedido, ...todos]))
  return pedido
}
