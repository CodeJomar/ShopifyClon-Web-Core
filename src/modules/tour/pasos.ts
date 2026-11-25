// Pasos del tour virtual. Cada paso lleva a una pantalla (`ruta`), puede resaltar una zona (`selector`) y explica en pocas palabras qué hay ahí.
// Hay tres recorridos: el público, el del propietario y el de la administración; cada uno se lanza desde el botón «Tour» de su zona.

export interface PasoTour {
  /** Ruta de la pantalla. «@producto» se reemplaza al iniciar por el producto de ejemplo con más variantes. */
  ruta: string
  titulo: string
  texto: string
  /** Zona de la pantalla que se resalta (selector CSS). Sin selector, solo se muestra el texto. */
  selector?: string
}

export interface ContextoTour {
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
  { ruta: "/propietario", titulo: "Bienvenido al panel del propietario", texto: "Aquí gestionas tus tiendas. Este recorrido muestra cada pantalla; avanza con → y retrocede con ←. Esc cierra el tour." },
  { ruta: "/propietario", titulo: "Panel general", texto: "Un resumen de todas tus tiendas: ventas, saldo, suscripción y alertas (órdenes por preparar, stock bajo), con totales por moneda." },
  { ruta: "/cuenta/tiendas", titulo: "Mis tiendas", texto: "La lista de las tiendas donde participas y tu rol en cada una. Desde aquí eliges la tienda activa para entrar a su panel." },
  { ruta: "/panel", titulo: "Dashboard de la tienda", texto: "Métricas de la tienda activa: ventas por día, órdenes y productos más vendidos." },
  { ruta: "/panel/productos", titulo: "Catálogo", texto: "Alta de productos con fotos, variantes (color, talla), precios y publicación. Publicar exige precio e imagen principal." },
  { ruta: "/panel/categorias", titulo: "Categorías", texto: "Organiza el catálogo en categorías para que los compradores filtren en el mercado y en tu tienda." },
  { ruta: "/panel/inventario", titulo: "Inventario", texto: "Stock por variante, ajustes con motivo y el historial de movimientos." },
  { ruta: "/panel/ordenes", titulo: "Órdenes", texto: "Pedidos de la tienda con filtros. En el detalle: pago manual, preparar y despachar el envío, cancelar y reembolsar." },
  { ruta: "/panel/cupones", titulo: "Cupones", texto: "Descuentos por porcentaje o monto, con vigencia y límite de usos." },
  { ruta: "/panel/envios", titulo: "Tarifas de envío", texto: "Las tarifas entre las que elige el comprador al pagar, una por tienda." },
  { ruta: "/panel/rutas", titulo: "Rutas de reparto", texto: "Agrupa envíos en rutas, inícialas, finalízalas y genera la guía de remisión." },
  { ruta: "/panel/personal", titulo: "Personal", texto: "Agrega personas a tu equipo con un rol: administrador, gestor de catálogo o gestor de pedidos." },
  { ruta: "/panel/configuracion", titulo: "Configuración de la tienda", texto: "Datos de la tienda y activación o desactivación (solo el propietario)." },
  { ruta: "/panel/suscripcion", titulo: "Suscripción", texto: "Tu plan, el uso frente a los límites, el pago, el cambio de plan y la cancelación." },
  { ruta: "/cuenta", titulo: "Tu cuenta", texto: "Perfil, direcciones, órdenes como comprador y seguridad (contraseña, verificación en dos pasos y sesiones)." },
]

const ADMINISTRADOR: PasoTour[] = [
  { ruta: "/plataforma", titulo: "Bienvenido a la administración", texto: "Control de toda la plataforma. Este recorrido muestra cada pantalla; avanza con → y retrocede con ←. Esc cierra el tour." },
  { ruta: "/plataforma", titulo: "Resumen de la plataforma", texto: "Tiendas, usuarios y pedidos de un vistazo, con las tiendas que necesitan atención y la actividad reciente." },
  { ruta: "/plataforma/tiendas", titulo: "Tiendas", texto: "Todas las tiendas con su dueño, equipo, suscripción y balance. Se pueden suspender y reactivar." },
  { ruta: "/plataforma/usuarios", titulo: "Usuarios", texto: "Listado de personas con cuenta: bloquear o desbloquear y cerrar sus sesiones." },
  { ruta: "/plataforma/administradores", titulo: "Administradores y roles", texto: "Quién administra la plataforma y con qué rol y permisos. Los menús se ajustan a los permisos de cada persona." },
  { ruta: "/plataforma/planes", titulo: "Planes", texto: "Crea y edita los planes de suscripción. Los planes se retiran del catálogo, nunca se borran." },
  { ruta: "/plataforma/suscripciones", titulo: "Suscripciones", texto: "Estado de la suscripción de cada tienda: activa, vencida o cancelada." },
  { ruta: "/plataforma/comisiones", titulo: "Comisiones", texto: "Lo que gana la plataforma por las ventas de cada tienda." },
  { ruta: "/plataforma/auditoria", titulo: "Auditoría", texto: "Registro de solo lectura de las acciones sensibles, con filtros." },
  { ruta: "/plataforma/seguridad", titulo: "Seguridad y respaldos", texto: "Cuentas bloqueadas, eventos de seguridad y los respaldos de la base de datos: estado, respaldar ahora y archivos guardados." },
]

const CIERRE: PasoTour = { ruta: "/", titulo: "Fin del tour", texto: "Gracias por recorrer OTemu. Pulsa Esc para cerrar; puedes repetir el tour desde el botón de la barra." }
const CIERRE_PROPIETARIO: PasoTour = { ruta: "/propietario", titulo: "Fin del recorrido", texto: "Eso es todo del panel del propietario. Pulsa Esc para cerrar; puedes repetirlo con el botón Tour de la barra superior." }
const CIERRE_ADMINISTRADOR: PasoTour = { ruta: "/plataforma", titulo: "Fin del recorrido", texto: "Eso es todo de la administración. Pulsa Esc para cerrar; puedes repetirlo con el botón Tour de la barra superior." }

/** Recorrido: lo que ve cualquier persona (público), el panel del propietario o la administración de la plataforma. */
export type ZonaTour = "publico" | "propietario" | "administrador"

/** Zona a la que pertenece una ruta (para el botón «Tour» de cada barra). */
export function zonaDeRuta(pathname: string): ZonaTour {
  if (pathname.startsWith("/plataforma")) return "administrador"
  if (pathname.startsWith("/propietario") || pathname.startsWith("/panel") || pathname.startsWith("/cuenta")) return "propietario"
  return "publico"
}

/** Arma la lista de pasos del recorrido pedido. */
export function armarPasos(ctx: ContextoTour, zona: ZonaTour = "publico"): PasoTour[] {
  if (zona === "propietario") return [...PROPIETARIO, CIERRE_PROPIETARIO]
  if (zona === "administrador") return [...ADMINISTRADOR, CIERRE_ADMINISTRADOR]
  const producto = ctx.rutaProducto ? PUBLICOS_PRODUCTO.map((p) => ({ ...p, ruta: ctx.rutaProducto as string })) : []
  return [...PUBLICOS_INICIO, ...producto, ...PUBLICOS_FIN, CIERRE]
}
