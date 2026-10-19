/**
 * Menú (API `/menu`): categorías, productos y modificadores (grupos de opciones como leche, endulzante, temperatura).
 * El precio del producto es el precio base; cada opción puede sumar o restar (`price_delta`, con signo).
 */

export * from "./actualizarCategoria.payload"
export * from "./actualizarGrupo.payload"
export * from "./actualizarOpcion.payload"
export * from "./actualizarProducto.payload"
export * from "./asignarGrupos.payload"
export * from "./categoria.dto"
export * from "./categoriaCatalogo.dto"
export * from "./crearCategoria.payload"
export * from "./crearGrupo.payload"
export * from "./crearOpcion.payload"
export * from "./crearProducto.payload"
export * from "./disponibilidad.payload"
export * from "./grupoModificador.dto"
export * from "./listarProductos.query"
export * from "./opcionModificador.dto"
export * from "./producto.dto"
export * from "./productoDetalle.dto"
export * from "./productoListado.dto"
export * from "./productoPos.dto"
export * from "./catalogoActualizadoEvento.dto"
export * from "./reordenar.payload"
