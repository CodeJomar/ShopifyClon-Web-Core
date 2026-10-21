import { z } from "zod"

// Límites de los *Request de la API (Swagger). Montos como texto en el formulario y se convierten al enviar.
const PATRON_MONTO = /^\d+(\.\d{1,2})?$/
const monto = (obligatorio: boolean, etiqueta: string) => {
  const base = z.string().trim()
  const formato = base.refine((v) => v === "" || PATRON_MONTO.test(v), `${etiqueta}: usa un número con hasta 2 decimales.`)
  return obligatorio
    ? formato.refine((v) => v !== "", `${etiqueta} es obligatorio.`)
    : formato
}

export const categoriaSchema = z.object({
  nombre: z.string().trim().min(1, "Escribe el nombre de la categoría.").max(100, "Máximo 100 caracteres."),
  identificador_url: z.string().trim().max(100, "Máximo 100 caracteres."),
  descripcion: z.string().trim().max(2000, "Máximo 2000 caracteres."),
})

export const productoDatosSchema = z.object({
  titulo: z.string().trim().min(1, "Escribe el título del producto.").max(200, "Máximo 200 caracteres."),
  identificador_url: z.string().trim().max(200, "Máximo 200 caracteres."),
  descripcion: z.string().trim().max(5000, "Máximo 5000 caracteres."),
  proveedor: z.string().trim().max(100, "Máximo 100 caracteres."),
  es_digital: z.boolean(),
})

/** Variante (VarianteRequest). SKU en mayúsculas sin espacios (CAT-003). Precio de comparación > precio (CAT-004). */
export const varianteSchema = z
  .object({
    titulo: z.string().trim().max(150, "Máximo 150 caracteres."),
    sku: z.string().trim().min(1, "Escribe el SKU.").max(80, "Máximo 80 caracteres.").regex(/^[A-Z0-9_-]+$/, "Usa solo letras mayúsculas, números, guiones y guion bajo."),
    codigo_barras: z.string().trim().max(50, "Máximo 50 caracteres."),
    precio: monto(true, "Precio"),
    precio_comparacion: monto(false, "Precio de comparación"),
    costo_unitario: monto(false, "Costo"),
    peso_gramos: monto(false, "Peso"),
    requiere_envio: z.boolean(),
    cantidad_inicial: z.string().trim().regex(/^\d*$/, "Usa un número entero."),
    rastrea_inventario: z.boolean(),
    permitir_venta_sin_stock: z.boolean(),
  })
  .refine((v) => v.precio_comparacion === "" || Number(v.precio_comparacion) > Number(v.precio || 0), {
    path: ["precio_comparacion"],
    message: "El precio de comparación debe ser mayor que el precio.",
  })

export const imagenSchema = z.object({
  url_imagen: z
    .string()
    .trim()
    .min(1, "Pega la dirección de la imagen.")
    .max(2000, "Máximo 2000 caracteres.")
    .regex(/^https:\/\/.+/, "La dirección debe empezar por https://"),
  texto_alternativo: z.string().trim().max(200, "Máximo 200 caracteres."),
})

export type CategoriaValues = z.infer<typeof categoriaSchema>
export type ProductoDatosValues = z.infer<typeof productoDatosSchema>
export type VarianteValues = z.infer<typeof varianteSchema>
export type ImagenValues = z.infer<typeof imagenSchema>

/** Convierte el texto del formulario en el número que espera la API (vacío → omitido). */
export const numeroOpcional = (texto: string) => (texto.trim() === "" ? undefined : Number(texto))

/** SKU normalizado mientras se escribe (CAT-003). */
export const normalizarSku = (texto: string) => texto.toUpperCase().replace(/\s+/g, "")
