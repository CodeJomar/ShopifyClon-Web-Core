// Pasos del tour virtual. Cada paso lleva a una pantalla (`ruta`), puede resaltar una zona (`selector`) y explica en pocas palabras qué hay ahí.
// Las pantallas de propietario y de administración solo entran al tour si la persona tiene esa sesión iniciada (ver `armarPasos`).

export interface PasoTour {
  /** Ruta de la pantalla. «@producto» se reemplaza al iniciar por el producto de ejemplo con más variantes. */
  ruta: string
  titulo: string
  texto: string
  /** Zona de la pantalla que se resalta (selector CSS). Sin selector, solo se muestra el texto. */
  selector?: string
}

export interface ContextoTour {
  autenticado: boolean
  esPropietario: boolean
  esAdministrador: boolean
  /** Ruta del producto de ejemplo para el detalle (null si no hay productos). */
  rutaProducto: string | null
}

const PUBLICOS_INICIO: PasoTour[] = [
  { ruta: "/", titulo: "Bienvenido a OTemu", texto: "Una plataforma para crear tiendas en línea y comprar en varias a la vez. Este recorrido muestra las pantallas principales; avanza con la flecha → y retrocede con ←." },
  { ruta: "/", titulo: "Una navegación para todo", texto: "La barra flotante lleva al mercado, a las tiendas y a la venta. A la derecha, el icono de acceso abre el inicio de sesión sin salir de la página.", selector: "header" },
  { ruta: "/", titulo: "Comprar", texto: "Cualquier persona puede explorar y comprar: un solo carrito reúne productos de distintas tiendas y se paga una vez.", selector: 'section[aria-labelledby="comprar-titulo"]' },
  { ruta: "/", titulo: "Productos destacados", texto: "Las tarjetas muestran la foto, el precio, la calificación y las variantes de cada producto.", selector: 'section[aria-labelledby="mercado-titulo"]' },
  { ruta: "/", titulo: "Tiendas independientes", texto: "Cada propietario tiene su tienda con su propia identidad.", selector: 'section[aria-labelledby="tiendas-titulo"]' },
  { ruta: "/", titulo: "Vender en OTemu", texto: "Quien quiere vender abre su tienda gratis y la administra desde su panel.", selector: 'section[aria-labelledby="vender-titulo"]' },
  { ruta: "/mercado", titulo: "El mercado", texto: "Busca por nombre, filtra por categoría y ordena por precio o novedad. Los resultados se paginan.", selector: '[data-tour="filtros"]' },
  { ruta: "/mercado", titulo: "Tarjetas de producto", texto: "Foto completa, nombre, descripción corta, calificación y, a la derecha, las variantes disponibles.", selector: '[data-tour="cuadricula"]' },
  { ruta: "/mercado/tiendas", titulo: "Las tiendas", texto: "Mismo formato que el mercado: buscador, orden y paginación numerada.", selector: '[data-tour="filtros"]' },
]

const PUBLICOS_PRODUCTO: PasoTour[] = [
  { ruta: "@producto", titulo: "Detalle de producto: galería", texto: "Las fotos del producto con miniaturas. Si una variante tiene su propia foto, se muestra al elegirla.", selector: '[data-tour="galeria"]' },
  { ruta: "@producto", titulo: "Variantes y compra", texto: "Colores y tallas definidos por el propietario. Al elegir una opción cambian el precio y la disponibilidad.", selector: '[data-tour="opciones"], [data-tour="compra"]' },
  { ruta: "@producto", titulo: "Reseñas", texto: "Quienes compraron pueden calificar el producto y dejar su opinión.", selector: "section:has(#resenas-titulo)" },
]

const PUBLICOS_FIN: PasoTour[] = [
  { ruta: "/carrito", titulo: "El carrito", texto: "Un solo carrito para todas las tiendas, con cupones y cálculo del envío antes de pagar." },
  { ruta: "/planes", titulo: "Planes para vender", texto: "Hay un plan gratuito para empezar y planes de pago con más productos y personal." },
]

const PROPIETARIO: PasoTour[] = [
  { ruta: "/propietario", titulo: "Panel general del propietario", texto: "Un resumen de todas sus tiendas: ventas, pedidos y estado, por moneda." },
  { ruta: "/panel/productos", titulo: "Catálogo", texto: "Alta de productos con fotos, variantes (color, talla), precios e inventario." },
  { ruta: "/panel/ordenes", titulo: "Órdenes", texto: "Pedidos de la tienda: pago, envío, cancelaciones y reembolsos." },
]

const ADMINISTRADOR: PasoTour[] = [
  { ruta: "/plataforma", titulo: "Administración de la plataforma", texto: "Control de tiendas, usuarios, planes, comisiones y suscripciones." },
  { ruta: "/plataforma/auditoria", titulo: "Auditoría", texto: "Registro de las acciones sensibles realizadas en la plataforma." },
]

const CIERRE: PasoTour = { ruta: "/", titulo: "Fin del tour", texto: "Gracias por recorrer OTemu. Pulsa Esc para cerrar; puedes repetir el tour desde el botón de la barra." }

const SIN_SESION: PasoTour = {
  ruta: "/mercado",
  titulo: "Paneles de propietario y de administración",
  texto: "Estas pantallas se recorren con sesión iniciada: entra con una cuenta de propietario o de administrador y vuelve a lanzar el tour para verlas.",
}

/** Arma la lista de pasos según quién navega. */
export function armarPasos(ctx: ContextoTour): PasoTour[] {
  const producto = ctx.rutaProducto ? PUBLICOS_PRODUCTO.map((p) => ({ ...p, ruta: ctx.rutaProducto as string })) : []
  const roles = [...(ctx.esPropietario ? PROPIETARIO : []), ...(ctx.esAdministrador ? ADMINISTRADOR : [])]
  return [...PUBLICOS_INICIO, ...producto, ...PUBLICOS_FIN, ...(roles.length ? roles : [SIN_SESION]), CIERRE]
}
