import { z } from "zod"

export const planBaseSchema = z.object({
  nombre: z
    .string()
    .trim()
    .min(1, "El nombre es obligatorio")
    .max(100, "El nombre no puede superar los 100 caracteres"),
  descripcion: z
    .string()
    .trim()
    .max(500, "La descripción no puede superar los 500 caracteres")
    .optional()
    .or(z.literal("")),
  precio_mensual: z.coerce
    .number({ message: "El precio mensual debe ser un número válido" })
    .min(0, "El precio mensual no puede ser negativo"),
  precio_anual: z.coerce
    .number({ message: "El precio anual debe ser un número válido" })
    .min(0, "El precio anual no puede ser negativo"),
  moneda: z
    .string()
    .trim()
    .regex(/^[A-Z]{3}$/, "La moneda debe ser un código de 3 letras mayúsculas (p. ej. USD)"),
  limite_productos: z
    .string()
    .optional()
    .transform((val) => {
      if (!val || val.trim() === "") return null
      const num = Number(val)
      return isNaN(num) ? null : num
    })
    .pipe(
      z
        .number()
        .min(1, "El límite de productos debe ser al menos 1")
        .nullable(),
    ),
  limite_personal: z.coerce
    .number({ message: "El límite de personal debe ser un número válido" })
    .int("El límite de personal debe ser un número entero")
    .min(0, "El límite de personal no puede ser negativo"),
  /** Se introduce como porcentaje (0 a 10) y se transforma en fracción para la API (0 a 0.10). */
  comision_porcentaje: z.coerce
    .number({ message: "La comisión debe ser un número válido" })
    .min(0, "La comisión no puede ser negativa")
    .max(10, "La comisión no puede superar el 10 %"),
  dias_prueba: z.coerce
    .number({ message: "Los días de prueba deben ser un número válido" })
    .int("Los días de prueba deben ser enteros")
    .min(0, "Los días de prueba no pueden ser negativos"),
  es_publico: z.boolean().default(true),
  orden: z.coerce.number().int("El orden debe ser entero").default(0),
})

export const crearPlanSchema = planBaseSchema.extend({
  codigo: z
    .string()
    .trim()
    .regex(/^[A-Z_]{3,30}$/, "El código debe tener de 3 a 30 letras mayúsculas o guiones bajos (p. ej. PRO_2026)"),
})

export type CrearPlanValues = z.infer<typeof crearPlanSchema>
export type ActualizarPlanValues = z.infer<typeof planBaseSchema>

export const motivoTiendaSchema = z.object({
  motivo: z
    .string()
    .trim()
    .min(5, "El motivo debe tener entre 5 y 255 caracteres")
    .max(255, "El motivo no puede superar los 255 caracteres"),
})

export type MotivoTiendaValues = z.infer<typeof motivoTiendaSchema>
