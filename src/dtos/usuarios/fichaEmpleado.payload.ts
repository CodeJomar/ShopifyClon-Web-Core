/** Datos de la ficha del empleado (todos opcionales). */
export type FichaEmpleadoPayload = {
  /** 6 a 15 letras, números o guiones. */
  dni?: string
  /** 6 a 20 caracteres: números, +, espacios, guiones y paréntesis. */
  telefono?: string
  /** YYYY-MM-DD. */
  fecha_ingreso?: string
}
