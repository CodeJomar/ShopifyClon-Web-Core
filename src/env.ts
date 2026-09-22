import { z } from "zod";

const envSchema = z.object({
  DATABASE_URL: z.string().url("Debe ser una URL de conexión PostgreSQL válida"),
  BETTER_AUTH_SECRET: z.string().min(16, "El secreto debe tener al menos 16 caracteres"),
  BETTER_AUTH_URL: z.string().url("URL base de la aplicación"),
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error("❌ Error en las variables de entorno:", parsed.error.flatten().fieldErrors);
  process.exit(1);
}

export const env = parsed.data;