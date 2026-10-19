import { z } from "zod"

/**
 * Variables de entorno del navegador, validadas una sola vez. Se usa desde cualquier lado con `import { env }`.
 *  - NEXT_PUBLIC_API_URL: por defecto "/api" (mismo origen; Next reenvía a NestJS con el rewrite de next.config.ts,
 *    así las cookies de sesión son de primera parte).
 *  - NEXT_PUBLIC_WS_URL: URL pública de la API para el WebSocket del KDS. Opcional hasta que se integre el KDS.
 * Nunca guardes aquí secretos: todo NEXT_PUBLIC_* es visible en el navegador.
 */
const envSchema = z.object({
  NEXT_PUBLIC_API_URL: z.string().min(1).default("/api"),
  NEXT_PUBLIC_WS_URL: z.string().url("NEXT_PUBLIC_WS_URL debe ser una URL (https://...)").optional(),
})

// Next solo sustituye NEXT_PUBLIC_* cuando se leen de forma explícita, no desde un objeto genérico.
const parsed = envSchema.safeParse({
  NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || undefined,
  NEXT_PUBLIC_WS_URL: process.env.NEXT_PUBLIC_WS_URL || undefined,
})

if (!parsed.success) {
  const detalle = Object.entries(parsed.error.flatten().fieldErrors)
    .map(([campo, errores]) => `${campo}: ${errores?.join(", ")}`)
    .join("; ")
  throw new Error(`Variables de entorno inválidas: ${detalle}`)
}

export const env = parsed.data
