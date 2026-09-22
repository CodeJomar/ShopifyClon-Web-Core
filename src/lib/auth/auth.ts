import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db } from "../db"; // Pool singleton
import * as authSchema from "../db/schema/auth";

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "pg",
    schema: {
      user: authSchema.user,
      session: authSchema.session,
      account: authSchema.account,
      verification: authSchema.verification,
    },
  }),
  emailAndPassword: {
    enabled: true,
    autoSignIn: true,
  },
  session: {
    expiresIn: 60 * 60 * 12, // 12 horas (turno normal de cafetería)
    updateAge: 60 * 60 * 2, // Renovar sesión cada 2 horas de actividad
  },
  user: {
    additionalFields: {
      role: {
        type: "string",
        required: true,
        defaultValue: "Operario",
      },
    },
  },
});