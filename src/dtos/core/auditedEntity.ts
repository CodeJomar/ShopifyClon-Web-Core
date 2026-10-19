import type { EntidadAuditada } from "./entidadAuditada";

/**
 * Auditoría que expone la API: solo las fechas. El usuario que creó o editó nunca viaja al navegador.
 * (Alias de `EntidadAuditada`, conservado por compatibilidad.)
 */
export type AuditedEntity = EntidadAuditada;
