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

// Marcas que se reutilizan en las pantallas del panel (ver `data-tour` en EncabezadoPagina y las tablas).
const ENCABEZADO = '[data-tour="encabezado"]'
const ACCIONES = '[data-tour="acciones"], [data-tour="encabezado"]'
const FILTROS = '[data-slot="card"]:has(input[type="search"]), [data-slot="card"]:has([role="group"])'
const TABLA = '[data-slot="table-container"]'
const LISTA = "main ul.grid"
const KPIS = '[data-tour="kpis"]'

const PROPIETARIO: PasoTour[] = [
  { ruta: "/propietario", titulo: "Bienvenido al panel del propietario", texto: "Aquí gestionas tus tiendas. Este recorrido señala qué hace cada zona de cada pantalla; avanza con → y retrocede con ←. Esc cierra el tour." },
  { ruta: "/propietario", titulo: "Tus cifras de un vistazo", texto: "Ventas netas de los últimos 30 días de todas tus tiendas, pedidos y el saldo por cobrar: tu parte después de las comisiones. Los montos van separados por moneda.", selector: KPIS },
  { ruta: "/propietario", titulo: "Qué tienda vende más y qué atender", texto: "A la izquierda, las ventas de cada tienda comparadas. A la derecha, lo pendiente: órdenes por preparar y productos con poco stock, para que sepas por dónde empezar.", selector: '[data-tour="alertas"]' },
  { ruta: "/cuenta/tiendas", titulo: "Mis tiendas", texto: "Cada tarjeta es una tienda donde participas, con tu rol. «Continuar» o «Abrir» la deja como tienda activa y te lleva a su panel. Con «Crear tienda» abres otra.", selector: '[data-tour="tiendas"]' },
  { ruta: "/panel", titulo: "Dashboard de la tienda activa", texto: "Cambia el rango (hoy, 7 o 30 días) y las cifras se recalculan. Abajo, el enlace público de tu tienda: cópialo para compartirlo con tus compradores.", selector: KPIS },
  { ruta: "/panel/productos", titulo: "Catálogo: buscar y filtrar", texto: "Busca por título, filtra por publicados o borradores y por categoría. Un producto nuevo nace como borrador: no se ve en el mercado hasta que lo publiques.", selector: FILTROS },
  { ruta: "/panel/productos", titulo: "Agregar un producto", texto: "Aquí creas un producto con su foto, descripción, variantes (color, talla) y precios. Para publicar hacen falta precio e imagen principal.", selector: ACCIONES },
  { ruta: "/panel/productos", titulo: "Tus productos", texto: "Cada tarjeta muestra la foto, el precio y si está activo en tienda. Ábrela para editar sus variantes, imágenes, categorías o despublicarla.", selector: LISTA },
  { ruta: "/panel/categorias", titulo: "Categorías", texto: "Crea categorías y asígnalas a los productos: los compradores filtran por ellas en tu tienda y en el mercado.", selector: ACCIONES },
  { ruta: "/panel/inventario", titulo: "Inventario", texto: "Elige un producto para ver el stock de cada variante. Ajusta la cantidad indicando un motivo: queda registrado en el historial de movimientos.", selector: ENCABEZADO },
  { ruta: "/panel/ordenes", titulo: "Órdenes: filtros", texto: "Filtra por estado (abiertas, completadas, canceladas), busca por número o correo y abre más filtros por fecha. El indicador «en vivo» avisa cuando entra una orden nueva.", selector: FILTROS },
  { ruta: "/panel/ordenes", titulo: "Órdenes: el listado", texto: "Cada fila muestra cliente, fecha, estado, pago y envío. Ábrela para el detalle: registrar el pago manual, preparar y despachar el envío, cancelar o reembolsar.", selector: TABLA },
  { ruta: "/panel/cupones", titulo: "Cupones", texto: "Crea descuentos por porcentaje o por monto, con vigencia y límite de usos. El comprador los aplica en el carrito.", selector: ACCIONES },
  { ruta: "/panel/envios", titulo: "Tarifas de envío", texto: "Define las tarifas entre las que elige el comprador al pagar. Cada tienda del carrito pide una tarifa.", selector: ACCIONES },
  { ruta: "/panel/rutas", titulo: "Rutas de reparto", texto: "Agrupa envíos en una ruta con chofer y placa. «Iniciar» despacha todos sus envíos; en el detalle marcas cada parada como entregada o no entregada, y «Guía» imprime la guía de remisión.", selector: ACCIONES },
  { ruta: "/panel/personal", titulo: "Personal", texto: "Agrega a una persona con cuenta a tu equipo y elige su rol: administrador, gestor de catálogo o gestor de pedidos. Cada rol ve solo lo que le corresponde.", selector: ACCIONES },
  { ruta: "/panel/configuracion", titulo: "Configuración de la tienda", texto: "Los datos públicos de la tienda y, solo para el propietario, activarla o desactivarla.", selector: ENCABEZADO },
  { ruta: "/panel/suscripcion", titulo: "Suscripción", texto: "Tu plan, cuánto usas frente a los límites (tiendas, productos, personal), el pago y el cambio o la cancelación del plan.", selector: ENCABEZADO },
  { ruta: "/cuenta", titulo: "Tu cuenta", texto: "Tu perfil, tus direcciones, tus órdenes como comprador y la seguridad: contraseña, verificación en dos pasos y cierre de sesiones.", selector: ENCABEZADO },
]

const ADMINISTRADOR: PasoTour[] = [
  { ruta: "/plataforma", titulo: "Bienvenido a la administración", texto: "Control de toda la plataforma. Este recorrido señala qué hace cada zona de cada pantalla; avanza con → y retrocede con ←. Esc cierra el tour." },
  { ruta: "/plataforma", titulo: "La plataforma de un vistazo", texto: "Cuántas tiendas, tiendas suspendidas, usuarios y pedidos hay. Debajo, las tiendas que necesitan atención y la actividad reciente.", selector: "main .grid" },
  { ruta: "/plataforma/tiendas", titulo: "Tiendas: buscar y filtrar", texto: "Busca una tienda por nombre y filtra por estado (activas, suspendidas).", selector: FILTROS },
  { ruta: "/plataforma/tiendas", titulo: "Tiendas: el listado", texto: "Dueño, plan, estado y pedidos de cada tienda. La acción de la derecha suspende o reactiva la tienda; suspendida, deja de vender.", selector: TABLA },
  { ruta: "/plataforma/usuarios", titulo: "Usuarios: filtros", texto: "Busca por nombre o correo y filtra por activos, bloqueados o sin activar.", selector: FILTROS },
  { ruta: "/plataforma/usuarios", titulo: "Usuarios: acciones", texto: "«Hacer administrador» le da un rol de administración a esa persona; «Cerrar sesiones» la saca de todos sus dispositivos; «Bloquear» impide que inicie sesión.", selector: TABLA },
  { ruta: "/plataforma/administradores", titulo: "Administradores", texto: "Quién administra la plataforma y con qué permisos. «Nuevo administrador» busca a una persona con cuenta y le asigna un rol. Nadie cambia ni quita su propia cuenta.", selector: ACCIONES },
  { ruta: "/plataforma/administradores", titulo: "Roles y permisos", texto: "Cada administrador tiene un rol con permisos concretos; los menús se ajustan a lo que cada uno puede hacer. Crea roles propios solo con permisos que tú tienes.", selector: LISTA },
  { ruta: "/plataforma/planes", titulo: "Planes de suscripción", texto: "Crea y edita los planes que ven los propietarios: precio, límites de productos y personal, comisión. Un plan se retira del catálogo, nunca se borra.", selector: ACCIONES },
  { ruta: "/plataforma/campanas", titulo: "Campañas", texto: "Elige la campaña vigente (Día de la Madre, Día del Padre, Halloween, Navidad o Black Friday) y todos los productos reciben un descuento automático: 10 % bajo 100, 20 % desde 100, 25 % desde 500 y 30 % desde 1000. Los compradores lo ven en una franja y en los precios tachados.", selector: '[data-tour="campanas"]' },
  { ruta: "/plataforma/suscripciones", titulo: "Suscripciones", texto: "El estado de la suscripción de cada tienda. Puedes suspender o reactivar una tienda desde aquí.", selector: TABLA },
  { ruta: "/plataforma/comisiones", titulo: "Comisiones", texto: "Lo que gana la plataforma por las ventas de cada tienda, según el plan que tiene.", selector: TABLA },
  { ruta: "/plataforma/auditoria", titulo: "Auditoría", texto: "Registro de solo lectura de las acciones sensibles: quién hizo qué y cuándo. Filtra por seguridad o negocio.", selector: FILTROS },
  { ruta: "/plataforma/seguridad", titulo: "Seguridad", texto: "Cuentas bloqueadas ahora, eventos de seguridad y personas con cuenta.", selector: "main .grid" },
  { ruta: "/plataforma/seguridad", titulo: "Respaldos de la base de datos", texto: "Estado del respaldo programado, próxima hora y último intento. «Respaldar ahora» crea uno al instante y queda auditado. Los archivos no se descargan desde la web: se recogen del servidor.", selector: '[data-tour="respaldos"]' },
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
