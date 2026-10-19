import type { FechaIso } from "./fechaIso"

/**
 * Campos de auditoría que la API SÍ expone en las entidades. Quién creó o editó (`usuario_creacion`,
 * `usuario_edicion`) y la baja lógica (`eliminado`) se eliminan en el servidor y no llegan al navegador.
 */
export type EntidadAuditada = {
  fecha_creacion: FechaIso
  fecha_edicion: FechaIso
}
