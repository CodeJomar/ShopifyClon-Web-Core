import { z } from "zod"

/** Ajuste de stock: cantidad física entera ≥ 0 y motivo de 5 a 255 caracteres (INV-007). */
export const ajusteSchema = z.object({
  nueva_cantidad: z
    .string()
    .trim()
    .regex(/^\d+$/, "Escribe una cantidad entera, sin signo ni decimales."),
  motivo: z
    .string()
    .trim()
    .min(5, "El motivo debe tener al menos 5 caracteres.")
    .max(255, "El motivo no puede pasar de 255 caracteres."),
})

export type AjusteValues = z.infer<typeof ajusteSchema>
