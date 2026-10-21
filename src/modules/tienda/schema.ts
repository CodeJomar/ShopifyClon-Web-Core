import { z } from "zod"

// Reglas de TIE-001 (tiendas-y-personal.md). La web avisa antes; la API decide (es única en toda la plataforma).
export const SUBDOMINIOS_RESERVADOS = ["www", "api", "admin", "app", "panel", "vitrina", "auth", "plataforma", "soporte", "mail"]
const PATRON_SUBDOMINIO = /^[a-z0-9](-?[a-z0-9])*$/

export const subdominioSchema = z
  .string()
  .min(1, "Escribe el subdominio de tu tienda.")
  .min(3, "El subdominio tiene entre 3 y 63 caracteres.")
  .max(63, "El subdominio tiene entre 3 y 63 caracteres.")
  .regex(PATRON_SUBDOMINIO, "Usa solo letras minúsculas, números y guiones (sin guiones al inicio, al final ni dobles).")
  .refine((valor) => !SUBDOMINIOS_RESERVADOS.includes(valor), "Ese subdominio está reservado. Elige otro.")

export const crearTiendaSchema = z.object({
  nombre: z.string().trim().min(1, "Escribe el nombre de tu tienda.").max(100, "Máximo 100 caracteres."),
  subdominio: subdominioSchema,
  // TODO(Q-W-006): el contrato lo marca opcional, pero la API responde VAL-001 si falta: se pide siempre (viene del perfil).
  correo_contacto: z.string().trim().min(1, "Escribe un correo de contacto.").email("Ingresa un correo válido."),
  moneda: z.enum(["PEN", "USD"]),
  codigo_plan: z.string().min(1, "Elige un plan."),
})

export type CrearTiendaValues = z.infer<typeof crearTiendaSchema>

/** Configuración de la tienda (W-012, TIE-006). */
export const configuracionTiendaSchema = z
  .object({
    nombre: z
      .string()
      .trim()
      .min(1, "El nombre de la tienda es obligatorio.")
      .max(100, "El nombre no puede superar los 100 caracteres."),
    correo_contacto: z
      .string()
      .trim()
      .min(1, "El correo de contacto es obligatorio.")
      .email("Ingresa un correo electrónico válido.")
      .max(255, "El correo no puede superar los 255 caracteres."),
    dominio_personalizado: z
      .string()
      .trim()
      .max(150, "El dominio no puede superar los 150 caracteres.")
      .optional(),
    moneda: z
      .string()
      .trim()
      .regex(/^[A-Z]{3}$/, "La moneda debe ser un código ISO de 3 letras mayúsculas (ej. PEN, USD)."),
    tasa_impuesto_porcentaje: z.string().trim().min(1, "La tasa de impuesto es obligatoria."),
    precios_incluyen_impuesto: z.boolean(),
    zona_horaria: z
      .string()
      .trim()
      .min(1, "La zona horaria es obligatoria.")
      .max(50, "La zona horaria no puede superar los 50 caracteres."),
  })
  .superRefine((val, ctx) => {
    const num = Number(val.tasa_impuesto_porcentaje)
    if (Number.isNaN(num) || num < 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["tasa_impuesto_porcentaje"],
        message: "La tasa de impuesto no puede ser negativa.",
      })
    } else if (num > 50) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["tasa_impuesto_porcentaje"],
        message: "La tasa de impuesto no puede superar el 50 %.",
      })
    }
  })

export type ConfiguracionTiendaValues = z.infer<typeof configuracionTiendaSchema>

/** Activar / desactivar tienda (TIE-008). */
export const estadoTiendaSchema = z.object({
  motivo: z
    .string()
    .trim()
    .max(255, "El motivo no puede superar los 255 caracteres.")
    .optional(),
})

export type EstadoTiendaValues = z.infer<typeof estadoTiendaSchema>
