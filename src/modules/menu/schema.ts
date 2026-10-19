import { z } from "zod"

import type { CategoriaCatalogoDto, GrupoModificadorDto, OpcionModificadorDto, ProductoPosDto } from "@/dtos/menu"
import { aCentimos } from "@/shared/utils/dinero"

// El catálogo del menú sale del mismo endpoint que consume el POS: categorías con productos y modificadores
export type ProductoMenu = ProductoPosDto
export type GrupoMenu = GrupoModificadorDto
export type OpcionMenu = OpcionModificadorDto

/** Categoría del menú tal como la entrega el catálogo (incluye sus productos). */
export type CategoriaMenu = CategoriaCatalogoDto

export interface CatalogoMenu {
  categorias: CategoriaMenu[]
  productos: ProductoMenu[]
}

export const FILTRO_TODOS = "todos" as const
export type FiltroCategoria = typeof FILTRO_TODOS | string

/* -------------------------------------------------------------------------- */
/*              Control rápido de disponibilidad / stock                      */
/* -------------------------------------------------------------------------- */

export const filtroDisponibilidadSchema = z.enum(["todos", "disponibles", "agotados"])
export type FiltroDisponibilidad = z.infer<typeof filtroDisponibilidadSchema>

export const FILTRO_DISPONIBILIDAD_LABELS: Record<FiltroDisponibilidad, string> = {
  todos: "Todos",
  disponibles: "Disponibles",
  agotados: "Agotados",
}

export interface ResumenMenu {
  total: number
  disponibles: number
  agotados: number
}

/* -------------------------------------------------------------------------- */
/*                       Formulario de alta / edición                         */
/* -------------------------------------------------------------------------- */

export const PRECIO_MAXIMO = 999

export const productoFormSchema = z.object({
  nombre: z
    .string()
    .trim()
    .min(2, "El nombre debe tener al menos 2 caracteres.")
    .max(100, "El nombre no puede superar los 100 caracteres."),
  descripcion: z.string().trim().max(500, "La descripción no puede superar los 500 caracteres."),
  // Se maneja como texto en el input; la API recibe el precio como texto con 2 decimales
  precio: z
    .string()
    .trim()
    .min(1, "Ingresa el precio de venta.")
    .refine((v) => /^\d+([.,]\d{1,2})?$/.test(v), "Usa un monto válido con hasta 2 decimales.")
    .refine((v) => aCentimos(v.replace(",", ".")) > 0, "El precio debe ser mayor a 0.")
    .refine((v) => aCentimos(v.replace(",", ".")) <= PRECIO_MAXIMO * 100, `El precio no puede superar S/ ${PRECIO_MAXIMO}.`),
  categoriaId: z.string().min(1, "Selecciona una categoría."),
  disponible: z.boolean(),
  // Foto del producto (URL opcional)
  imagenUrl: z
    .string()
    .trim()
    .max(500, "La URL no puede superar los 500 caracteres.")
    .refine((v) => v === "" || /^https:\/\//i.test(v), "Usa una dirección que empiece con https://."),
  // Grupos de personalización (leche, endulzante...) que se ofrecen al pedir este producto
  grupos: z.array(z.string()),
})

export type ProductoFormValues = z.infer<typeof productoFormSchema>

export const productoToFormValues = (producto?: ProductoMenu, categoriaPorDefecto = ""): ProductoFormValues => ({
  nombre: producto?.nombre ?? "",
  descripcion: producto?.descripcion ?? "",
  precio: producto?.precio ?? "",
  categoriaId: producto?.id_categoria ?? categoriaPorDefecto,
  disponible: producto?.disponible ?? true,
  imagenUrl: producto?.imagen_url ?? "",
  grupos: producto?.grupos_modificadores.map((g) => g.id_grupo) ?? [],
})

/* -------------------------------------------------------------------------- */
/*                 Administración de categorías del menú                      */
/* -------------------------------------------------------------------------- */

export const categoriaFormSchema = z.object({
  nombre: z
    .string()
    .trim()
    .min(2, "El nombre debe tener al menos 2 caracteres.")
    .max(50, "El nombre no puede superar los 50 caracteres."),
})

export type CategoriaFormValues = z.infer<typeof categoriaFormSchema>

/* -------------------------------------------------------------------------- */
/*             Grupos de personalización (modificadores) y opciones           */
/* -------------------------------------------------------------------------- */

const entero = (min: number, max: number, mensaje: string) =>
  z
    .string()
    .trim()
    .refine((v) => /^\d+$/.test(v) && Number(v) >= min && Number(v) <= max, mensaje)

export const grupoFormSchema = z
  .object({
    nombre: z
      .string()
      .trim()
      .min(2, "El nombre debe tener al menos 2 caracteres.")
      .max(60, "El nombre no puede superar los 60 caracteres."),
    seleccionMinima: entero(0, 20, "Indica un número entre 0 y 20 (0 = opcional)."),
    seleccionMaxima: entero(1, 20, "Indica un número entre 1 y 20."),
  })
  .refine((v) => Number(v.seleccionMinima) <= Number(v.seleccionMaxima), {
    message: "El mínimo no puede ser mayor que el máximo.",
    path: ["seleccionMinima"],
  })

export type GrupoFormValues = z.infer<typeof grupoFormSchema>

export const opcionFormSchema = z.object({
  nombre: z
    .string()
    .trim()
    .min(1, "Escribe el nombre de la opción.")
    .max(60, "El nombre no puede superar los 60 caracteres."),
  // Variación sobre el precio base; admite signo ("1.50", "-0.50"). Vacío = sin cambio.
  precioDelta: z
    .string()
    .trim()
    .refine((v) => v === "" || /^-?\d+([.,]\d{1,2})?$/.test(v), "Usa un monto válido (por ejemplo 1.50 o -0.50)."),
})

export type OpcionFormValues = z.infer<typeof opcionFormSchema>

/** Texto del input → `Dinero` con signo para la API ("" → "0.00", "1,5" → "1.50"). */
export const deltaDesdeTexto = (texto: string): string => {
  const limpio = texto.trim().replace(",", ".")
  if (limpio === "") return "0.00"
  const negativo = limpio.startsWith("-")
  const centimos = aCentimos(limpio.replace("-", ""))
  const valor = `${Math.floor(centimos / 100)}.${String(centimos % 100).padStart(2, "0")}`
  return negativo && centimos > 0 ? `-${valor}` : valor
}

/** "+ S/ 1.50", "− S/ 0.50" o "sin costo" para mostrar junto a una opción. */
export const etiquetaDelta = (delta: string): string => {
  const centimos = aCentimos(delta)
  if (centimos === 0) return "sin costo"
  const valor = `S/ ${Math.floor(Math.abs(centimos) / 100)}.${String(Math.abs(centimos) % 100).padStart(2, "0")}`
  return centimos > 0 ? `+ ${valor}` : `− ${valor}`
}
