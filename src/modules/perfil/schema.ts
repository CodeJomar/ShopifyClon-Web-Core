import { z } from "zod"
import { MENSAJE_NOMBRE_PERSONA, NOMBRE_PERSONA } from "@/shared/utils/texto"

import { passwordNuevaSchema } from "@/modules/auth"

export const datosPerfilSchema = z.object({
  nombre: z
    .string()
    .trim()
    .min(2, "El nombre debe tener al menos 2 caracteres.")
    .max(100, "El nombre no puede superar los 100 caracteres.")
    .regex(NOMBRE_PERSONA, MENSAJE_NOMBRE_PERSONA),
})

export type DatosPerfilValues = z.infer<typeof datosPerfilSchema>

export const cambiarPasswordSchema = z
  .object({
    passwordActual: z.string().min(1, "Indica tu contraseña actual.").max(72, "La contraseña actual no puede exceder los 72 caracteres."),
    passwordNueva: passwordNuevaSchema,
    confirmar: z.string().min(1, "Confirma la contraseña nueva."),
  })
  .refine((v) => v.passwordNueva === v.confirmar, { path: ["confirmar"], message: "Las contraseñas no coinciden." })
  .refine((v) => v.passwordNueva !== v.passwordActual, { path: ["passwordNueva"], message: "La contraseña nueva debe ser distinta de la actual." })

export type CambiarPasswordValues = z.infer<typeof cambiarPasswordSchema>
