import { z } from "zod"

export const pagarSuscripcionSchema = z.object({
  ciclo: z.enum(["MENSUAL", "ANUAL"], {
    message: "Selecciona un ciclo de facturación válido",
  }),
  modo_pago: z.enum(["tok_simulado", "tok_rechazar"], {
    message: "Selecciona un modo de pago",
  }),
})

export type PagarSuscripcionValues = z.infer<typeof pagarSuscripcionSchema>

export const cambiarPlanSchema = z.object({
  codigo_plan: z.string().min(1, "Debes seleccionar un plan").max(30),
  ciclo: z.enum(["MENSUAL", "ANUAL"], {
    message: "Selecciona un ciclo de facturación válido",
  }),
  modo_pago: z.enum(["tok_simulado", "tok_rechazar"], {
    message: "Selecciona un modo de pago",
  }),
})

export type CambiarPlanValues = z.infer<typeof cambiarPlanSchema>

export const cancelarSuscripcionSchema = z.object({
  motivo: z
    .string()
    .trim()
    .min(5, "El motivo debe tener entre 5 y 255 caracteres")
    .max(255, "El motivo debe tener entre 5 y 255 caracteres"),
})

export type CancelarSuscripcionValues = z.infer<typeof cancelarSuscripcionSchema>
