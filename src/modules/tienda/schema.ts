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
  correo_contacto: z
    .string()
    .trim()
    .refine((valor) => valor === "" || z.string().email().safeParse(valor).success, "Ingresa un correo válido."),
  moneda: z.enum(["PEN", "USD"]),
  codigo_plan: z.string().min(1, "Elige un plan."),
})

export type CrearTiendaValues = z.infer<typeof crearTiendaSchema>
