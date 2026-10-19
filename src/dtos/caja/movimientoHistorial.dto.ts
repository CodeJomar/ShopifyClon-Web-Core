import type { TransaccionCajaDto } from "./transaccionCaja.dto"

/** Fila de `GET /transactions/historial`. `registrado_por` es el nombre de quien la registró. */
export type MovimientoHistorialDto = Omit<TransaccionCajaDto, "fecha_edicion" | "id_transaccion_origen"> & {
  registrado_por: string
}
