// Datos de ejemplo del mercado (rediseño). Tienen la misma forma que el contrato propuesto para el backend (B1) para que el cambio
// a la API real sea sustituir `datos/index.ts`, no tocar las pantallas.
import type { CategoriaMercado, PlanMercado, ProductoMercado, TiendaMercado } from "@/dtos/mercado"

export const TIENDAS: TiendaMercado[] = [
  { id: "t1", nombre: "Café Andino", subdominio: "cafe-andino", descripcion: "Café de especialidad tostado en Chanchamayo, en granos y molido, con envío fresco cada semana.", ciudad: "Lima", tono: 28, total_productos: 0, desde: 2024 },
  { id: "t2", nombre: "Casa Quinua", subdominio: "casa-quinua", descripcion: "Objetos para el hogar hechos a mano: cerámica, textiles y velas de soja.", ciudad: "Arequipa", tono: 168, total_productos: 0, desde: 2023 },
  { id: "t3", nombre: "Taller Textil Cusco", subdominio: "taller-textil-cusco", descripcion: "Ropa y accesorios tejidos por cooperativas de artesanas, en alpaca y algodón pima.", ciudad: "Cusco", tono: 262, total_productos: 0, desde: 2022 },
  { id: "t4", nombre: "Neo Gadgets", subdominio: "neo-gadgets", descripcion: "Tecnología útil para el día a día: audio, carga y accesorios con garantía local.", ciudad: "Lima", tono: 212, total_productos: 0, desde: 2024 },
  { id: "t5", nombre: "Aroma Selva", subdominio: "aroma-selva", descripcion: "Cuidado personal con ingredientes amazónicos: aceites, jabones y bálsamos.", ciudad: "Tarapoto", tono: 142, total_productos: 0, desde: 2023 },
  { id: "t6", nombre: "Papel y Tinta", subdominio: "papel-y-tinta", descripcion: "Papelería, láminas y plantillas digitales de ilustradores peruanos.", ciudad: "Trujillo", tono: 205, total_productos: 0, desde: 2025 },
]

export const CATEGORIAS: CategoriaMercado[] = [
  { id: "cafe", nombre: "Café y té", icono: "cafe", total_productos: 0 },
  { id: "hogar", nombre: "Hogar", icono: "hogar", total_productos: 0 },
  { id: "moda", nombre: "Moda y accesorios", icono: "moda", total_productos: 0 },
  { id: "tecnologia", nombre: "Tecnología", icono: "tecnologia", total_productos: 0 },
  { id: "belleza", nombre: "Belleza y cuidado", icono: "belleza", total_productos: 0 },
  { id: "arte", nombre: "Arte y papelería", icono: "arte", total_productos: 0 },
]

const t = (id: string) => {
  const x = TIENDAS.find((s) => s.id === id)!
  return { id: x.id, nombre: x.nombre, subdominio: x.subdominio, tono: x.tono }
}

function p(
  id: string,
  slug: string,
  titulo: string,
  descripcion: string,
  precio: number,
  categoria_id: string,
  tienda: string,
  extra: Partial<ProductoMercado> = {},
): ProductoMercado {
  const ciudad = TIENDAS.find((s) => s.id === tienda)!.ciudad
  return {
    id,
    slug,
    titulo,
    descripcion,
    precio,
    precio_comparacion: null,
    moneda: "PEN",
    categoria_id,
    es_digital: false,
    disponible: true,
    calificacion: Math.round((4 + (((Number(id.slice(1)) * 37) % 10) / 10)) * 10) / 10,
    resenas: 8 + ((Number(id.slice(1)) * 53) % 190),
    tienda: t(tienda),
    despacha_desde: ciudad,
    ...extra,
  }
}

// El orden de la lista es el de «más recientes».
export const PRODUCTOS: ProductoMercado[] = [
  p("p1", "cafe-de-altura-250g", "Café de altura en grano 250 g", "Tueste medio, notas de cacao y panela. Cosecha de este año, empacado con válvula para conservar el aroma.", 32.9, "cafe", "t1", { precio_comparacion: 38 }),
  p("p2", "set-ceramica-4-tazas", "Set de 4 tazas de cerámica", "Esmaltado artesanal, apto para microondas y lavavajillas. Cada pieza es ligeramente distinta.", 119, "hogar", "t2"),
  p("p3", "chalina-alpaca-baby", "Chalina de baby alpaca", "Tejida a mano en telar, suave y liviana. Disponible en cuatro colores naturales.", 189, "moda", "t3", { precio_comparacion: 220 }),
  p("p4", "audifonos-bt-neo", "Audífonos inalámbricos Neo", "Bluetooth 5.3, 30 horas de batería y estuche de carga. Garantía de 12 meses en Perú.", 159, "tecnologia", "t4", { precio_comparacion: 199 }),
  p("p5", "aceite-sacha-inchi", "Aceite de sacha inchi 100 ml", "Prensado en frío, rico en omega 3. Para piel, cabello y cocina fría.", 45, "belleza", "t5"),
  p("p6", "lamina-selva-a3", "Lámina «Selva baja» A3", "Ilustración impresa en papel de algodón 300 g, lista para enmarcar.", 58, "arte", "t6"),
  p("p7", "te-hierbaluisa-caja", "Té de hierbaluisa, caja de 20", "Hojas secas al sol de la sierra de Piura. Sin colorantes ni saborizantes.", 18.5, "cafe", "t1"),
  p("p8", "vela-soja-cedro", "Vela de soja aroma cedro", "Cera de soja con mecha de algodón, 45 horas de duración, frasco reutilizable.", 49, "hogar", "t2"),
  p("p9", "poncho-algodon-pima", "Poncho de algodón pima", "Tejido plano, corte amplio, ideal para media estación. Talla única.", 249, "moda", "t3"),
  p("p10", "cargador-gan-65w", "Cargador GaN 65 W doble puerto", "Carga laptop y teléfono a la vez. Compacto, con protección térmica.", 99, "tecnologia", "t4"),
  p("p11", "jabon-copaiba-3x", "Jabón de copaiba, pack de 3", "Jabón artesanal en barra, pH balanceado, sin parabenos.", 36, "belleza", "t5", { precio_comparacion: 42 }),
  p("p12", "plantilla-planner-2027", "Planner digital 2027 (PDF)", "Plantilla editable para tablet e impresión: anual, mensual, semanal y hábitos.", 24, "arte", "t6", { es_digital: true }),
  p("p13", "cafe-molido-filtro-500g", "Café molido para filtro 500 g", "Molienda media, pensado para cafetera de filtro y prensa francesa.", 54, "cafe", "t1"),
  p("p14", "manta-lana-oveja", "Manta de lana de oveja", "Tejida en telar de pedal, 130 × 180 cm, en tonos tierra.", 210, "hogar", "t2", { disponible: false }),
  p("p15", "gorro-chullo-alpaca", "Chullo de alpaca con orejeras", "Forro interior de algodón, tejido tradicional con diseño geométrico.", 79, "moda", "t3"),
  p("p16", "soporte-laptop-alum", "Soporte plegable para laptop", "Aluminio, seis alturas, pesa 280 g y cabe en cualquier mochila.", 89, "tecnologia", "t4"),
  p("p17", "balsamo-labial-camu", "Bálsamo labial de camu camu", "Hidratación con vitamina C natural, en tubo de 8 g.", 14, "belleza", "t5"),
  p("p18", "cuaderno-puntos-a5", "Cuaderno de puntos A5", "Tapa dura, 120 hojas de 100 g que no traspasan, cosido a mano.", 29, "arte", "t6"),
  p("p19", "cafe-en-capsulas", "Cápsulas de café compatibles, caja de 30", "Tres intensidades a elegir, cápsulas compostables.", 59, "cafe", "t1", { precio_comparacion: 65 }),
  p("p20", "cojin-bordado-andino", "Cojín bordado andino 45 cm", "Funda de algodón con bordado a mano; incluye relleno hipoalergénico.", 96, "hogar", "t2"),
  p("p21", "mitones-alpaca", "Mitones de alpaca", "Abrigan sin quitarte la movilidad de los dedos. Talla S, M o L.", 62, "moda", "t3"),
  p("p22", "lampara-escritorio-led", "Lámpara de escritorio LED", "Tres temperaturas de luz, regulación táctil y puerto USB de carga.", 129, "tecnologia", "t4"),
  p("p23", "set-pegatinas-fauna", "Set de pegatinas «Fauna andina»", "Veinte pegatinas resistentes al agua, diseños de ilustradores locales.", 19, "arte", "t6"),
  p("p24", "serum-aguaje", "Sérum facial de aguaje", "Ligero y de rápida absorción, con aceite de aguaje y vitamina E.", 68, "belleza", "t5", { precio_comparacion: 79 }),
]

// Los totales salen de los productos para que nunca se desfasen.
for (const tienda of TIENDAS) tienda.total_productos = PRODUCTOS.filter((x) => x.tienda.id === tienda.id).length
for (const cat of CATEGORIAS) cat.total_productos = PRODUCTOS.filter((x) => x.categoria_id === cat.id).length

export const PLANES: PlanMercado[] = [
  {
    codigo: "GRATIS",
    nombre: "Empieza gratis",
    precio_mensual: 0,
    moneda: "PEN",
    limite_tiendas: 1,
    limite_productos: 20,
    comision: 0.05,
    destacado: true,
    incluye: ["1 tienda con su dirección propia", "Hasta 20 productos", "Pedidos, inventario y envíos", "Cobro con tarjeta y transferencia"],
  },
  {
    codigo: "CRECE",
    nombre: "Crece",
    precio_mensual: 59,
    moneda: "PEN",
    limite_tiendas: 3,
    limite_productos: 200,
    comision: 0.035,
    destacado: false,
    incluye: ["Hasta 3 tiendas", "Hasta 200 productos", "Cupones y rutas de reparto", "Equipo con permisos por rol"],
  },
  {
    codigo: "PRO",
    nombre: "Pro",
    precio_mensual: 149,
    moneda: "PEN",
    limite_tiendas: 10,
    limite_productos: null,
    comision: 0.02,
    destacado: false,
    incluye: ["Hasta 10 tiendas", "Productos sin límite", "Panel general de todas tus tiendas", "Soporte prioritario"],
  },
]
