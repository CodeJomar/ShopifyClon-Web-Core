import { z } from "zod"

export const cuponSchema = z
  .object({
    codigo: z
      .string()
      .trim()
      .min(3, "El código debe tener al menos 3 caracteres.")
      .max(50, "El código no puede superar los 50 caracteres.")
      .regex(/^[A-Z0-9_-]+$/, "El código debe tener de 3 a 50 caracteres: letras, números, guion o guion bajo."),
    tipo_descuento: z.enum(["PORCENTAJE", "MONTO_FIJO", "ENVIO_GRATIS"], {
      message: "Selecciona un tipo de descuento.",
    }),
    valor_descuento: z.string().trim(),
    monto_minimo_compra: z.string().trim().optional(),
    limite_usos_total: z.string().trim().optional(),
    fecha_inicio: z.string().trim().optional(),
    fecha_fin: z.string().trim().optional(),
    esta_activo: z.boolean(),
  })
  .superRefine((val, ctx) => {
    if (val.tipo_descuento === "PORCENTAJE") {
      const num = Number(val.valor_descuento)
      if (!val.valor_descuento || Number.isNaN(num) || num <= 0 || num > 100) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["valor_descuento"],
          message: "El porcentaje debe ser mayor que 0 y no superar 100",
        })
      }
    } else if (val.tipo_descuento === "MONTO_FIJO") {
      const num = Number(val.valor_descuento)
      if (!val.valor_descuento || Number.isNaN(num) || num <= 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["valor_descuento"],
          message: "El monto fijo debe ser mayor que 0",
        })
      }
    }

    if (val.monto_minimo_compra) {
      const num = Number(val.monto_minimo_compra)
      if (Number.isNaN(num) || num < 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["monto_minimo_compra"],
          message: "El monto mínimo no puede ser negativo",
        })
      }
    }

    if (val.limite_usos_total) {
      const num = Number(val.limite_usos_total)
      if (Number.isNaN(num) || !Number.isInteger(num) || num < 1) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["limite_usos_total"],
          message: "El límite de usos debe ser al menos 1",
        })
      }
    }

    if (val.fecha_fin && val.fecha_inicio) {
      const inicio = new Date(val.fecha_inicio)
      const fin = new Date(val.fecha_fin)
      if (!Number.isNaN(inicio.getTime()) && !Number.isNaN(fin.getTime()) && fin <= inicio) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["fecha_fin"],
          message: "La fecha de fin debe ser posterior a la de inicio",
        })
      }
    }
  })

export type CuponValues = z.infer<typeof cuponSchema>
