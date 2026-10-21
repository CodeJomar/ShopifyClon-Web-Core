/**
 * Permisos del panel y matriz rol × permiso (docs/negocio/01-actores-roles-permisos.md, D-006).
 *
 * La interfaz solo OCULTA lo que el rol no puede hacer. La autoridad es la API: cada petición vuelve a comprobar el
 * permiso y un 403 siempre se maneja. Por eso la matriz vive aquí como ayuda de navegación, no como seguridad.
 *
 * Los roles son el código de `PersonalTienda` (PROPIETARIO, ADMINISTRADOR, GESTOR_CATALOGO, GESTOR_PEDIDOS).
 * El administrador de plataforma no es un rol de tienda: lo decide `EsAdministradorPlataforma`, no este archivo.
 */

export const ROL = {
  PROPIETARIO: "PROPIETARIO",
  ADMINISTRADOR: "ADMINISTRADOR",
  GESTOR_CATALOGO: "GESTOR_CATALOGO",
  GESTOR_PEDIDOS: "GESTOR_PEDIDOS",
} as const

export const PERMISO = {
  TIENDA_CONFIGURAR: "TIENDA_CONFIGURAR",
  SUSCRIPCION_GESTIONAR: "SUSCRIPCION_GESTIONAR",
  PERSONAL_GESTIONAR: "PERSONAL_GESTIONAR",
  CATALOGO_GESTIONAR: "CATALOGO_GESTIONAR",
  INVENTARIO_AJUSTAR: "INVENTARIO_AJUSTAR",
  CUPONES_GESTIONAR: "CUPONES_GESTIONAR",
  ENVIOS_CONFIGURAR: "ENVIOS_CONFIGURAR",
  ORDENES_VER: "ORDENES_VER",
  ORDENES_GESTIONAR: "ORDENES_GESTIONAR",
  ORDENES_CANCELAR: "ORDENES_CANCELAR",
  REEMBOLSOS_EMITIR: "REEMBOLSOS_EMITIR",
  METRICAS_VER: "METRICAS_VER",
} as const

export type Rol = (typeof ROL)[keyof typeof ROL]
export type Permiso = (typeof PERMISO)[keyof typeof PERMISO]

/** Matriz fija (D-006). Una fila por rol; cada lista son los permisos que ese rol tiene. */
const MATRIZ: Record<Rol, readonly Permiso[]> = {
  PROPIETARIO: Object.values(PERMISO),
  ADMINISTRADOR: [
    PERMISO.TIENDA_CONFIGURAR,
    PERMISO.PERSONAL_GESTIONAR,
    PERMISO.CATALOGO_GESTIONAR,
    PERMISO.INVENTARIO_AJUSTAR,
    PERMISO.CUPONES_GESTIONAR,
    PERMISO.ENVIOS_CONFIGURAR,
    PERMISO.ORDENES_VER,
    PERMISO.ORDENES_GESTIONAR,
    PERMISO.ORDENES_CANCELAR,
    PERMISO.REEMBOLSOS_EMITIR,
    PERMISO.METRICAS_VER,
  ],
  GESTOR_CATALOGO: [PERMISO.CATALOGO_GESTIONAR, PERMISO.INVENTARIO_AJUSTAR],
  GESTOR_PEDIDOS: [PERMISO.ORDENES_VER, PERMISO.ORDENES_GESTIONAR, PERMISO.ORDENES_CANCELAR],
}

/** Permisos de un rol. Un rol desconocido o ausente no tiene ninguno (la interfaz no se abre por defecto). */
export function permisosDeRol(rol: string | undefined): readonly Permiso[] {
  if (!rol || !(rol in MATRIZ)) return []
  return MATRIZ[rol as Rol]
}

/** Firma que reciben los helpers de navegación: ¿este usuario puede hacer esto? */
export type Puede = (permiso: Permiso) => boolean

export const puedeConRol = (rol: string | undefined): Puede => (permiso) => permisosDeRol(rol).includes(permiso)
