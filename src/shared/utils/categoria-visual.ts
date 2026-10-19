import { Coffee, CakeSlice, Croissant, CupSoda, LayoutGrid, Popcorn, Sandwich, Tag, type LucideIcon } from "lucide-react"

/** Texto sin tildes ni mayúsculas, para reconocer nombres que escribe el propietario ("Frías", "FRIAS"). */
const normalizar = (texto: string): string =>
  texto.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().trim()

export interface ConfigCategoria {
  icon: LucideIcon
  className: string
}

const CATEGORIA_TODOS: ConfigCategoria = {
  icon: LayoutGrid,
  className: "bg-[#EDE5E6] text-[#4C0107] dark:bg-stone-800 dark:text-stone-200",
}

// Las categorías las crea el propietario (nombre libre): el ícono y el color se deducen de palabras del nombre.
const CATEGORIAS_CONOCIDAS: Array<{ palabras: string[]; config: ConfigCategoria }> = [
  { palabras: ["caliente", "cafe", "espresso"], config: { icon: Coffee, className: "bg-amber-100 text-amber-800 dark:bg-amber-500/15 dark:text-amber-300" } },
  { palabras: ["fria", "frio", "helad", "frappe"], config: { icon: CupSoda, className: "bg-sky-100 text-sky-800 dark:bg-sky-500/15 dark:text-sky-300" } },
  { palabras: ["panader", "pan ", "croissant"], config: { icon: Croissant, className: "bg-orange-100 text-orange-800 dark:bg-orange-500/15 dark:text-orange-300" } },
  { palabras: ["salad", "sandwich"], config: { icon: Sandwich, className: "bg-emerald-100 text-emerald-800 dark:bg-emerald-500/15 dark:text-emerald-300" } },
  { palabras: ["postre", "torta", "dulce"], config: { icon: CakeSlice, className: "bg-pink-100 text-pink-800 dark:bg-pink-500/15 dark:text-pink-300" } },
  { palabras: ["piqueo", "snack"], config: { icon: Popcorn, className: "bg-violet-100 text-violet-800 dark:bg-violet-500/15 dark:text-violet-300" } },
]

// Estilo neutro para cualquier otra categoría
const CATEGORIA_GENERICA: ConfigCategoria = {
  icon: Tag,
  className: "bg-slate-100 text-slate-700 dark:bg-stone-800 dark:text-stone-200",
}

/** Ícono y acento de una categoría. Para el filtro "todos" se pasa la cadena `"todos"`. */
export function getCategoriaConfig(categoria: { nombre: string } | "todos"): ConfigCategoria {
  if (categoria === "todos") return CATEGORIA_TODOS
  const nombre = normalizar(categoria.nombre)
  return CATEGORIAS_CONOCIDAS.find((c) => c.palabras.some((p) => nombre.includes(p)))?.config ?? CATEGORIA_GENERICA
}
