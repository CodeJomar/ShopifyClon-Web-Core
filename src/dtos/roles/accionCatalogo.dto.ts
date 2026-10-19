export type AccionCatalogoDto = {
  accion: string
  /** Texto para mostrar ("Ver", "Cobrar"...). */
  etiqueta: string
  /** Endpoints de la API que habilita este permiso. */
  endpoints: string[]
  /** Presente cuando el permiso se aplica dentro de una regla de negocio y no en un endpoint (ej. descuentos). */
  regla_negocio?: string
}
