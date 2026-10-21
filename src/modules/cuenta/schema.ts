import { z } from "zod"
import { contrasenaSchema } from "@/modules/auth/schema"

// Reglas de la API (identidad.md, USR-002; DireccionRequest): la API vuelve a validar.
const PATRON_TELEFONO = /^[0-9+ ()-]{6,30}$/
const telefonoOpcional = z
  .string()
  .trim()
  .refine((valor) => valor === "" || PATRON_TELEFONO.test(valor), "El teléfono solo admite números, espacios y + ( ) -.")

export const perfilSchema = z.object({
  nombres: z.string().trim().min(1, "Escribe tus nombres.").max(100, "Máximo 100 caracteres."),
  apellidos: z.string().trim().min(1, "Escribe tus apellidos.").max(100, "Máximo 100 caracteres."),
  telefono: telefonoOpcional,
})

export const cambiarContrasenaSchema = z
  .object({
    contrasena_actual: z.string().min(1, "Escribe tu contraseña actual."),
    contrasena_nueva: contrasenaSchema,
    confirmar: z.string().min(1, "Confirma tu nueva contraseña."),
  })
  .refine((valores) => valores.contrasena_nueva === valores.confirmar, {
    path: ["confirmar"],
    message: "Las contraseñas no coinciden.",
  })

// Límites tomados de DireccionRequest de la API (líneas de 200, no 255 como decía la tarea: la API manda).
export const direccionSchema = z.object({
  nombre_contacto: z.string().trim().min(1, "Escribe el nombre de quien recibe.").max(150, "Máximo 150 caracteres."),
  telefono: telefonoOpcional.refine((valor) => valor.length <= 30, "Máximo 30 caracteres."),
  direccion_linea1: z.string().trim().min(1, "Escribe la dirección.").max(200, "Máximo 200 caracteres."),
  direccion_linea2: z.string().trim().max(200, "Máximo 200 caracteres."),
  ciudad: z.string().trim().min(1, "Escribe la ciudad.").max(100, "Máximo 100 caracteres."),
  estado_provincia: z.string().trim().min(1, "Escribe el departamento o provincia.").max(100, "Máximo 100 caracteres."),
  codigo_postal: z.string().trim().min(1, "Escribe el código postal.").max(20, "Máximo 20 caracteres."),
  pais: z.string().trim().min(1, "Escribe el país.").max(60, "Máximo 60 caracteres."),
  es_principal: z.boolean(),
})

export type PerfilValues = z.infer<typeof perfilSchema>
export type CambiarContrasenaValues = z.infer<typeof cambiarContrasenaSchema>
export type DireccionValues = z.infer<typeof direccionSchema>
