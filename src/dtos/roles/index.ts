/**
 * Roles y permisos (API `/roles`). Los roles ("cargos") son datos que el propietario crea y configura; los permisos
 * son pares módulo + acción. Los nombres de módulo y acción válidos salen de `shared/constants/permisos.ts` y del
 * catálogo que entrega la API.
 */

export * from "./accionCatalogo.dto"
export * from "./actualizarRol.payload"
export * from "./crearRol.payload"
export * from "./moduloCatalogo.dto"
export * from "./permiso.dto"
export * from "./reemplazarPermisos.payload"
export * from "./rolDetalle.dto"
export * from "./rolResumen.dto"
