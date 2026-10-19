import { z } from "zod"

// Misma política que el backend (NestJS la vuelve a validar): 8+ caracteres con letras, números y un símbolo.
export const passwordNuevaSchema = z
  .string()
  .min(8, "La contraseña debe tener al menos 8 caracteres.")
  .max(100, "La contraseña no puede exceder los 100 caracteres.")
  .regex(/(?=.*[A-Za-z])(?=.*\d)(?=.*[^A-Za-z0-9])/, "La contraseña debe incluir letras, números y un símbolo (por ejemplo ! @ # $ . -).")

export const loginSchema = z.object({
  email: z.string().trim().min(1, "El correo es obligatorio.").email("Ingresa un correo válido."),
  password: z.string().min(1, "La contraseña es obligatoria.").max(100),
})

export const recuperarSchema = z.object({
  email: z.string().trim().min(1, "El correo es obligatorio.").email("Ingresa un correo válido."),
})

export const otpSchema = z.object({
  codigo: z.string().regex(/^\d{6}$/, "El código debe tener 6 dígitos."),
})

/** Contraseña nueva + confirmación (activación de cuenta y recuperación). */
export const nuevaPasswordSchema = z
  .object({
    password: passwordNuevaSchema,
    confirmPassword: z.string().min(1, "Confirma tu contraseña."),
  })
  .refine((valores) => valores.password === valores.confirmPassword, {
    path: ["confirmPassword"],
    message: "Las contraseñas no coinciden.",
  })

export type LoginValues = z.infer<typeof loginSchema>
export type RecuperarValues = z.infer<typeof recuperarSchema>
export type OtpValues = z.infer<typeof otpSchema>
export type NuevaPasswordValues = z.infer<typeof nuevaPasswordSchema>
