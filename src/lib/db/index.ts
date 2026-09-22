import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import * as schema from './schema';

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error('DATABASE_URL no está definido en las variables de entorno');
}

// Patrón Singleton para evitar agotar conexiones en modo desarrollo (HMR de Next.js)
const globalForDb = globalThis as unknown as {
  conn: Pool | undefined;
};

const pool = globalForDb.conn ?? new Pool({
  connectionString: databaseUrl,
  max: 10, // Límite seguro para no saturar la BD
  idleTimeoutMillis: 30000,
});

if (process.env.NODE_ENV !== 'production') {
  globalForDb.conn = pool;
}

export const db = drizzle(pool, { schema, logger: process.env.NODE_ENV === 'development' });