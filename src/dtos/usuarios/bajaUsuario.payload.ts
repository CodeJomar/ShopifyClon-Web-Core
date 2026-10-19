/** Datos opcionales al dar de baja a un empleado (`DELETE /users/:id`). */
export type BajaUsuarioPayload = {
  /** Motivo de la baja (máx. 255 caracteres). */
  motivo?: string
}
