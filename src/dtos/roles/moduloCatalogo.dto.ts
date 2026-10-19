import type { AccionCatalogoDto } from "./accionCatalogo.dto"

/** `GET /roles/catalogo-permisos`: todo lo que se puede conceder, agrupado por módulo, para armar la matriz de permisos. */
export type ModuloCatalogoDto = {
  modulo: string
  etiqueta: string
  acciones: AccionCatalogoDto[]
}
