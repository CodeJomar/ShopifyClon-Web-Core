import { z } from "zod"

export const tarifaEnvioSchema = z
  .object({
    nombre: z
      .string()
      .trim()
      .min(1, "El nombre de la tarifa es obligatorio.")
      .max(100, "El nombre no puede superar los 100 caracteres."),
    descripcion: z
      .string()
      .trim()
      .max(255, "La descripción no puede superar los 255 caracteres.")
      .optional(),
    precio: z
      .string()
      .trim()
      .min(1, "El precio es obligatorio."),
    monto_minimo_gratis: z.string().trim().optional(),
    orden: z.string().trim().optional(),
    esta_activa: z.boolean(),
  })
  .superRefine((val, ctx) => {
    const precioNum = Number(val.precio)
    if (Number.isNaN(precioNum) || precioNum < 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["precio"],
        message: "El precio no puede ser negativo",
      })
    }

    if (val.monto_minimo_gratis) {
      const gratisNum = Number(val.monto_minimo_gratis)
      if (Number.isNaN(gratisNum) || gratisNum < 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["monto_minimo_gratis"],
          message: "El monto mínimo para envío gratis no puede ser negativo",
        })
      }
    }

    if (val.orden) {
      const ordenNum = Number(val.orden)
      if (Number.isNaN(ordenNum) || !Number.isInteger(ordenNum)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["orden"],
          message: "El orden debe ser un número entero",
        })
      }
    }
  })

export type TarifaEnvioValues = z.infer<typeof tarifaEnvioSchema>
