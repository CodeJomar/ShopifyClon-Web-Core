/**
 * Permisos del sistema. Espejo de los nombres que define la API (NestJS es la autoridad):
 * la API entrega en /auth/me una lista "MODULO:ACCION" (el propietario recibe "*") y la interfaz solo la usa para
 * mostrar u ocultar. Nada de esto autoriza: la API vuelve a comprobar cada petición.
 *
 * Los roles son datos que el propietario configura, así que la interfaz NUNCA decide por nombre de rol:
 * pregunta siempre por permisos.
 */
export const MODULO = {
  USERS: "USERS",
  ROLES: "ROLES",
  MENU: "MENU",
  TABLES: "TABLES",
  ORDERS: "ORDERS",
  KDS: "KDS",
  TRANSACTIONS: "TRANSACTIONS",
  DASHBOARD: "DASHBOARD",
} as const

export const ACCION = {
  LEER: "LEER",
  CREAR: "CREAR",
  EDITAR: "EDITAR",
  ELIMINAR: "ELIMINAR",
  COBRAR: "COBRAR",
  DESPACHAR: "DESPACHAR",
  ARQUEAR: "ARQUEAR",
  DISPONIBILIDAD: "DISPONIBILIDAD",
  AJUSTAR: "AJUSTAR",
  DESCONTAR: "DESCONTAR",
  ANULAR: "ANULAR",
  DEVOLVER: "DEVOLVER",
  CAMBIAR_ESTADO: "CAMBIAR_ESTADO",
} as const

export type Modulo = (typeof MODULO)[keyof typeof MODULO]
export type Accion = (typeof ACCION)[keyof typeof ACCION]

/** Lo que hay que poder hacer para ver una pantalla o usar un botón. */
export interface Requisito {
  modulo: Modulo
  accion: Accion
}

/** Comodín que la API entrega a la cuenta propietaria. */
export const PERMISO_TOTAL = "*"

export const clavePermiso = ({ modulo, accion }: Requisito) => `${modulo}:${accion}`

/** ¿La lista de permisos de la sesión cubre este requisito? Función pura: sirve en servidor, cliente y login. */
export function tienePermiso(permisos: readonly string[], requisito: Requisito): boolean {
  return permisos.includes(PERMISO_TOTAL) || permisos.includes(clavePermiso(requisito))
}

/** Verifica un requisito contra una sesión; es la firma que reciben los helpers de navegación. */
export type Puede = (requisito: Requisito) => boolean

export const puedeCon = (permisos: readonly string[]): Puede => (requisito) => tienePermiso(permisos, requisito)
