// Apariencia de la vitrina de cada tienda: opciones fijas (el servidor valida los mismos códigos) con sus nombres y muestras.

export type Paleta = "OTEMU" | "OCEANO" | "ATARDECER" | "BOSQUE" | "GRAFITO" | "ROSA"
export type Tipografia = "MODERNA" | "CLASICA" | "REDONDEADA" | "COMPACTA"
export type TamanoLetra = "NORMAL" | "GRANDE" | "MUY_GRANDE"
export type Diseno = "CUADRICULA" | "REVISTA" | "LISTA" | "PORTADA"
export type Modo = "OSCURO" | "CLARO" | "ALTO_CONTRASTE"

export interface AparienciaTienda {
  paleta: Paleta
  tipografia: Tipografia
  tamano_letra: TamanoLetra
  diseno: Diseno
  modo: Modo
  /** Logo de la tienda (URL de una imagen subida con POST /panel/archivos/imagenes); ausente o null = sin logo. */
  logo_url?: string | null
}

export const APARIENCIA_POR_DEFECTO: AparienciaTienda = {
  paleta: "OTEMU",
  tipografia: "MODERNA",
  tamano_letra: "NORMAL",
  diseno: "CUADRICULA",
  modo: "OSCURO",
  logo_url: null,
}

export interface Opcion<T extends string> {
  codigo: T
  nombre: string
  descripcion: string
}

/** `muestra`: color principal de la paleta (para el círculo de vista previa). */
export const PALETAS: (Opcion<Paleta> & { muestra: string })[] = [
  { codigo: "OTEMU", nombre: "OTemu", descripcion: "Verde menta, la identidad de la plataforma.", muestra: "#00E699" },
  { codigo: "OCEANO", nombre: "Océano", descripcion: "Azul cielo, fresco y limpio.", muestra: "#38BDF8" },
  { codigo: "ATARDECER", nombre: "Atardecer", descripcion: "Naranja cálido y cercano.", muestra: "#FB923C" },
  { codigo: "BOSQUE", nombre: "Bosque", descripcion: "Verde lima, natural.", muestra: "#A3E635" },
  { codigo: "GRAFITO", nombre: "Grafito", descripcion: "Gris sobrio, deja hablar al producto.", muestra: "#E5E7EB" },
  { codigo: "ROSA", nombre: "Rosa", descripcion: "Rosa vivo y amable.", muestra: "#F472B6" },
]

export const TIPOGRAFIAS: (Opcion<Tipografia> & { clase: string })[] = [
  { codigo: "MODERNA", nombre: "Moderna", descripcion: "Space Grotesk, la actual de OTemu.", clase: "" },
  { codigo: "CLASICA", nombre: "Clásica", descripcion: "Con serifa, elegante y editorial.", clase: "font-[family-name:var(--font-lora)]" },
  { codigo: "REDONDEADA", nombre: "Redondeada", descripcion: "Letras suaves y amigables.", clase: "font-[family-name:var(--font-nunito)]" },
  { codigo: "COMPACTA", nombre: "Compacta", descripcion: "Sobria y estrecha, cabe más.", clase: "font-[family-name:var(--font-inter)]" },
]

export const TAMANOS: Opcion<TamanoLetra>[] = [
  { codigo: "NORMAL", nombre: "Normal", descripcion: "El tamaño estándar." },
  { codigo: "GRANDE", nombre: "Grande", descripcion: "10 % más grande en toda la vitrina." },
  { codigo: "MUY_GRANDE", nombre: "Muy grande", descripcion: "20 % más grande, para leer mejor." },
]

export const DISENOS: Opcion<Diseno>[] = [
  { codigo: "CUADRICULA", nombre: "Cuadrícula clásica", descripcion: "Productos en filas iguales, de 2 a 4 por fila." },
  { codigo: "REVISTA", nombre: "Revista", descripcion: "El producto más reciente grande y el resto a su lado." },
  { codigo: "LISTA", nombre: "Lista amplia", descripcion: "Pocas columnas y tarjetas grandes, para pocos productos." },
  { codigo: "PORTADA", nombre: "Vitrina con portada", descripcion: "Portada grande centrada y catálogo en tres columnas." },
]

export const MODOS: Opcion<Modo>[] = [
  { codigo: "OSCURO", nombre: "Oscuro", descripcion: "Fondo oscuro, el de OTemu." },
  { codigo: "CLARO", nombre: "Claro", descripcion: "Fondo claro con texto oscuro." },
  { codigo: "ALTO_CONTRASTE", nombre: "Alto contraste", descripcion: "Negro y amarillo, máxima legibilidad." },
]

const valido = <T extends string>(lista: { codigo: T }[], valor: unknown, defecto: T): T =>
  lista.some((o) => o.codigo === valor) ? (valor as T) : defecto

/** Completa con los valores por defecto lo que falte o no sea una opción conocida (tiendas antiguas o un servidor aún sin la función). */
export function normalizarApariencia(a?: Partial<AparienciaTienda> | null): AparienciaTienda {
  return {
    paleta: valido(PALETAS, a?.paleta, APARIENCIA_POR_DEFECTO.paleta),
    tipografia: valido(TIPOGRAFIAS, a?.tipografia, APARIENCIA_POR_DEFECTO.tipografia),
    tamano_letra: valido(TAMANOS, a?.tamano_letra, APARIENCIA_POR_DEFECTO.tamano_letra),
    diseno: valido(DISENOS, a?.diseno, APARIENCIA_POR_DEFECTO.diseno),
    modo: valido(MODOS, a?.modo, APARIENCIA_POR_DEFECTO.modo),
    logo_url: typeof a?.logo_url === "string" && a.logo_url.startsWith("http") ? a.logo_url : null,
  }
}

/** Atributos `data-*` que activan los estilos de `.apariencia-tienda` (ver globals.css). */
export function atributosApariencia(a: AparienciaTienda) {
  return { "data-paleta": a.paleta, "data-tipografia": a.tipografia, "data-tamano": a.tamano_letra, "data-diseno": a.diseno, "data-modo": a.modo } as const
}
