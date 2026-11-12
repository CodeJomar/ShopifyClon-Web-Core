import { expect, type APIRequestContext } from "@playwright/test"
import { leerCodigo } from "./codigos-de-prueba"

/**
 * Cuentas, tiendas y compras de prueba creadas por la API (mismo proxy `/api` que usa la web) para los e2e que no deben depender de
 * la cuenta principal. El correo es `@otemu.test` y el API local corre con `MAIL_ENABLED=false`, así que no sale ningún correo.
 */
export const CONTRASENA_DE_PRUEBA = "Zorro-Verde-Lago-2026"

export type Cuenta = { correo: string; contrasena: string }

/** Crea y activa una cuenta nueva (lee el código de activación de la base de pruebas). */
export async function crearCuentaActiva(request: APIRequestContext, prefijo = "e2e"): Promise<Cuenta> {
  const correo = `${prefijo}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}@otemu.test`
  const registro = await request.post("/api/auth/registro", {
    data: { correo_electronico: correo, contrasena: CONTRASENA_DE_PRUEBA, nombres: "Prueba", apellidos: "Automatica" },
  })
  expect(registro.status(), "registro").toBe(201)
  const codigo = await leerCodigo(correo, "ACTIVACION_CUENTA")
  const activacion = await request.post("/api/auth/activar", { data: { correo_electronico: correo, codigo } })
  expect(activacion.ok(), "activación").toBeTruthy()
  return { correo, contrasena: CONTRASENA_DE_PRUEBA }
}

export interface TiendaDePrueba {
  tiendaId: string
  subdominio: string
  varianteId: string
}

/**
 * Con la sesión del `request` (hay que haber iniciado sesión antes): crea una tienda con un producto digital publicado y con stock,
 * y la deja como tienda activa. Un producto digital no pide dirección ni tarifa de envío, así que la compra es corta.
 */
export async function crearTiendaConProducto(request: APIRequestContext): Promise<TiendaDePrueba> {
  const sufijo = Date.now().toString(36)
  const planes = await request.get("/api/planes")
  expect(planes.ok(), "planes").toBeTruthy()
  const codigoPlan = ((await planes.json()).datos as { codigo: string }[])[0].codigo

  const subdominio = `e2e-${sufijo}`
  const tienda = await request.post("/api/cuenta/tiendas", {
    data: { nombre: `Tienda E2E ${sufijo}`, subdominio, correo_contacto: `tienda-${sufijo}@otemu.test`, moneda: "PEN", codigo_plan: codigoPlan },
  })
  expect(tienda.status(), "crear tienda: " + (await tienda.text())).toBe(201)
  const tiendaId = (await tienda.json()).datos.tienda_id ?? (await tienda.json()).datos.id
  expect(tiendaId, "id de la tienda").toBeTruthy()
  const activa = await request.put("/api/sesion", { data: { tienda_id: tiendaId } })
  expect(activa.ok(), "tienda activa").toBeTruthy()

  const producto = await request.post("/api/panel/catalogo/productos", {
    data: {
      titulo: `Curso E2E ${sufijo}`,
      es_digital: true,
      categoria_ids: [],
      variantes: [{ titulo: "Predeterminada", sku: `E2E-${sufijo}`.toUpperCase(), precio: 25 }],
    },
  })
  expect(producto.status(), "crear producto: " + (await producto.text())).toBe(201)
  const datos = (await producto.json()).datos as { id: string; variantes: { id: string }[] }
  // CAT-007: para publicar hace falta una imagen principal (basta una URL)
  const imagen = await request.post(`/api/panel/catalogo/productos/${datos.id}/imagenes`, {
    data: { url_imagen: "https://picsum.photos/id/1060/600/600", texto_alternativo: "Producto de prueba", es_principal: true },
  })
  expect(imagen.ok(), "imagen: " + (await imagen.text())).toBeTruthy()
  const publicado = await request.post(`/api/panel/catalogo/productos/${datos.id}/publicar`)
  expect(publicado.ok(), "publicar: " + (await publicado.text())).toBeTruthy()
  // INV-002: sin stock no se puede comprar
  const stock = await request.put(`/api/panel/inventario/variantes/${datos.variantes[0].id}`, {
    data: { nueva_cantidad: 50, motivo: "Stock inicial de prueba" },
  })
  expect(stock.ok(), "stock: " + (await stock.text())).toBeTruthy()
  return { tiendaId, subdominio, varianteId: datos.variantes[0].id }
}

export interface OrdenDePrueba {
  ordenId: string
  numeroOrden: string
  tokenAcceso: string
}

/** Compra de invitado de un producto digital con pago manual (queda con el pago pendiente). `request` debe ser anónimo. */
export async function comprarComoInvitado(request: APIRequestContext, tienda: TiendaDePrueba): Promise<OrdenDePrueba> {
  const base = `/api/vitrina/${tienda.subdominio}`
  const carrito = await request.post(`${base}/carrito`)
  expect(carrito.ok(), "crear carrito").toBeTruthy()
  const agregado = await request.post(`${base}/carrito/items`, { data: { variante_id: tienda.varianteId, cantidad: 1 } })
  expect(agregado.ok(), "agregar al carrito").toBeTruthy()
  const total = (await agregado.json()).datos.total_estimado as number
  const orden = await request.post(`${base}/checkout`, {
    headers: { "Idempotency-Key": crypto.randomUUID() },
    data: {
      correo_cliente: `comprador-${Date.now().toString(36)}@otemu.test`,
      nombre_cliente: "Ana Compradora",
      pasarela: "MANUAL",
      total_esperado: total,
    },
  })
  expect(orden.status(), "checkout: " + (await orden.text())).toBe(201)
  const datos = (await orden.json()).datos as { orden_id: string; numero_orden: string; token_acceso: string }
  return { ordenId: datos.orden_id, numeroOrden: datos.numero_orden, tokenAcceso: datos.token_acceso }
}
