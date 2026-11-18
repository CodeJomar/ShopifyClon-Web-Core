// Variantes de un producto como opciones elegibles (color, talla…). La API guarda cada variante con un título; por convención los valores
// van separados por « / » («Negro / M»; ver docs/rediseno/05-variantes-visibles.md). Aquí se separan y se agrupan.

export interface GrupoOpciones {
  /** «Color», «Talla» u «Opción». */
  nombre: string
  valores: string[]
  /** Todos los valores son colores conocidos: se dibujan como muestras de color en vez de botones con texto. */
  esColor: boolean
}

export const COLORES: Record<string, string> = {
  negro: "#141414", blanco: "#f4f4f2", rojo: "#e53935", azul: "#2563eb", verde: "#22a06b", amarillo: "#f5c518", naranja: "#f57c00",
  rosado: "#f48fb1", rosa: "#f48fb1", morado: "#8e44ad", gris: "#8c8f94", marron: "#6d4c41", marrón: "#6d4c41", beige: "#d9c6a5",
  celeste: "#6ec6ff", turquesa: "#14b8a6", dorado: "#d4af37", plateado: "#c0c4cc", crema: "#f3e9d2", vino: "#7b1e3a", lila: "#c4a1f2",
  cafe: "#6f4e37", café: "#6f4e37", crudo: "#eadfca", mostaza: "#d7a21a", terracota: "#c8643c", oliva: "#6b7a3a", fucsia: "#d6336c",
}
const TALLA = /^(XXS|XS|S|M|L|XL|XXL|XXXL|\d{2}(\.5)?|única|unica)$/i

/** Valores de opción de una variante: «Negro / M» → ["Negro", "M"]. La variante «Predeterminada» no tiene opciones. */
export function valoresDe(titulo: string): string[] {
  const partes = titulo.split("/").map((t) => t.trim()).filter(Boolean)
  return partes.length === 1 && partes[0].toLowerCase() === "predeterminada" ? [] : partes
}

/** Agrupa los valores por posición: el primer valor de cada título es el primer grupo, el segundo es el segundo, etc. */
export function gruposDe(titulos: string[]): GrupoOpciones[] {
  const filas = titulos.map(valoresDe)
  const cantidad = Math.max(0, ...filas.map((f) => f.length))
  const grupos: GrupoOpciones[] = []
  for (let i = 0; i < cantidad; i++) {
    const valores = [...new Set(filas.map((f) => f[i]).filter((v): v is string => Boolean(v)))]
    const sonTallas = valores.every((v) => TALLA.test(v))
    const sonColores = valores.every((v) => v.toLowerCase() in COLORES)
    grupos.push({ nombre: sonTallas ? "Talla" : sonColores ? "Color" : cantidad === 1 ? "Opción" : i === 0 ? "Color" : "Talla", valores, esColor: sonColores })
  }
  return grupos
}
