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
  precio_mensual: z
    .string()
    .trim()
    .refine((v) => !Number.isNaN(Number(v)) && Number(v) >= 0, "El precio mensual debe ser un número mayor o igual a 0"),
  precio_anual: z
    .string()
    .trim()
    .refine((v) => !Number.isNaN(Number(v)) && Number(v) >= 0, "El precio anual debe ser un número mayor o igual a 0"),
  moneda: z
    .string()
    .trim()
    .regex(/^[A-Z]{3}$/, "La moneda debe ser un código de 3 letras mayúsculas (p. ej. USD)"),
  limite_productos: z
    .string()
    .trim()
    .optional()
    .refine(
      (v) => !v || (!Number.isNaN(Number(v)) && Number.isInteger(Number(v)) && Number(v) >= 1),
      "El límite de productos debe ser un número entero mayor o igual a 1",
    ),
  limite_personal: z
    .string()
    .trim()
    .refine(
      (v) => !Number.isNaN(Number(v)) && Number.isInteger(Number(v)) && Number(v) >= 0,
      "El límite de personal debe ser un número entero mayor o igual a 0",
    ),
  /** Se introduce como porcentaje (0 a 10) y se envía como fracción para la API (0 a 0.10). */
  comision_porcentaje: z
    .string()
    .trim()
    .refine(
      (v) => !Number.isNaN(Number(v)) && Number(v) >= 0 && Number(v) <= 10,
      "La comisión debe ser un porcentaje entre 0 % y 10 %",
    ),
  dias_prueba: z
    .string()
    .trim()
    .refine(
      (v) => !Number.isNaN(Number(v)) && Number.isInteger(Number(v)) && Number(v) >= 0,
      "Los días de prueba deben ser un número entero mayor o igual a 0",
    ),
  es_publico: z.boolean(),
  orden: z
    .string()
    .trim()
    .refine(
      (v) => !Number.isNaN(Number(v)) && Number.isInteger(Number(v)),
      "El orden debe ser un número entero",
    ),
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
