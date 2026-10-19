/** Mensaje en tiempo real `menu:catalogo-actualizado`: el menú cambió, conviene volver a leerlo. */
export type CatalogoActualizadoEventoDto = {
  recurso: "productos" | "categorias" | "modificadores"
  /** Método HTTP de la escritura (POST, PATCH, PUT, DELETE). */
  accion: string
}
