import { z } from "zod"

export const agregarPersonalSchema = z.object({
  correo_electronico: z
    .string()
    .trim()
    .min(1, "El correo electrónico es obligatorio.")
    .email("Ingresa un correo electrónico válido.")
    .max(255, "El correo no puede superar los 255 caracteres."),
  rol: z.enum(["ADMINISTRADOR", "GESTOR_CATALOGO", "GESTOR_PEDIDOS"], {
    message: "Selecciona un rol válido.",
  }),
})

export type AgregarPersonalValues = z.infer<typeof agregarPersonalSchema>

export const cambiarRolSchema = z.object({
  rol: z.enum(["ADMINISTRADOR", "GESTOR_CATALOGO", "GESTOR_PEDIDOS"], {
    message: "Selecciona un rol válido.",
  }),
  motivo: z
    .string()
    .trim()
    .min(5, "El motivo debe tener al menos 5 caracteres.")
    .max(255, "El motivo no puede superar los 255 caracteres."),
})

export type CambiarRolValues = z.infer<typeof cambiarRolSchema>

export const quitarPersonalSchema = z.object({
  motivo: z
    .string()
    .trim()
    .min(5, "El motivo debe tener al menos 5 caracteres.")
    .max(255, "El motivo no puede superar los 255 caracteres."),
})

export type QuitarPersonalValues = z.infer<typeof quitarPersonalSchema>
