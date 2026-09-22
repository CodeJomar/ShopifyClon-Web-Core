import { sql } from 'drizzle-orm';
import { db } from '../index';
import type { ProcedureName } from './registry';

/**
 * Ejecuta un Stored Procedure de forma segura, previniendo SQL Injection.
 * 
 * @param spName - Nombre del SP proveniente del catálogo DB_PROCEDURES.
 * @param params - Arreglo de parámetros en el orden exacto que espera el SP.
 * @returns El resultado crudo de la ejecución en PostgreSQL.
 */
export async function executeStoredProcedure(
  spName: ProcedureName,
  params: (string | number | boolean | null | Date)[] = []
) {
  // Drizzle ORM se encarga de convertir sql`${param}` en variables vinculadas ($1, $2)
  const placeholders = params.map((_, index) => {
    return index === 0 ? sql`${params[0]}` : sql`, ${params[index]}`;
  });

  // Construcción segura: CALL sp_nombre($1, $2)
  const query = sql`CALL ${sql.identifier(spName)}(${sql.join(placeholders, sql``)})`;

  try {
    return await db.execute(query);
  } catch (error) {
    // Aquí puedes interceptar errores específicos de Postgres (ej. constraints)
    console.error(`Error ejecutando SP [${spName}]:`, error);
    throw error;
  }
}