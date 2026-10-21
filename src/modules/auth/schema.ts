import { z } from "zod"

// Mismas reglas que valida la API (identidad.md, USR-002, USR-010…): la API las vuelve a comprobar.
const MENSAJE_CONTRASENA = "La contraseña debe tener entre 8 y 72 caracteres, con al menos una letra y un número."
const PATRON_TELEFONO = /^[0-9+ ()-]{6,30}$/

export const contrasenaSchema = z
  .string()
  .min(8, MENSAJE_CONTRASENA)
  .max(72, MENSAJE_CONTRASENA)
  .regex(/(?=.*[A-Za-z])(?=.*\d)/, MENSAJE_CONTRASENA)

const correoSchema = z
  .string()
  .trim()
  .min(1, "Escribe tu correo electrónico.")
  .max(255, "El correo no puede superar los 255 caracteres.")
  .email("Ingresa un correo válido.")

const codigoSchema = z.string().regex(/^\d{6}$/, "El código tiene 6 dígitos.")

export const registroSchema = z.object({
  nombres: z.string().trim().min(1, "Escribe tus nombres.").max(100, "Máximo 100 caracteres."),
  apellidos: z.string().trim().min(1, "Escribe tus apellidos.").max(100, "Máximo 100 caracteres."),
  correo_electronico: correoSchema,
  telefono: z
    .string()
    .trim()
    .refine((valor) => valor === "" || PATRON_TELEFONO.test(valor), "El teléfono solo admite números, espacios y + ( ) -."),
  contrasena: contrasenaSchema,
})

export const activarSchema = z.object({
  correo_electronico: correoSchema,
  codigo: codigoSchema,
})

export const loginSchema = z.object({
  correo_electronico: correoSchema,
  contrasena: z.string().min(1, "Escribe tu contraseña."),
})

export const recuperarSolicitarSchema = z.object({
  correo_electronico: correoSchema,
})

export const recuperarConfirmarSchema = z
  .object({
    codigo: codigoSchema,
    contrasena_nueva: contrasenaSchema,
    confirmar: z.string().min(1, "Confirma tu contraseña."),
  })
  .refine((valores) => valores.contrasena_nueva === valores.confirmar, {
    path: ["confirmar"],
    message: "Las contraseñas no coinciden.",
  })

export type RegistroValues = z.infer<typeof registroSchema>
export type ActivarValues = z.infer<typeof activarSchema>
export type LoginValues = z.infer<typeof loginSchema>
export type RecuperarSolicitarValues = z.infer<typeof recuperarSolicitarSchema>
export type RecuperarConfirmarValues = z.infer<typeof recuperarConfirmarSchema>
