/**
 * Catálogo estático de permisos para Coffy Flow (Protección granular).
 * Convención de IDs por módulo:
 *   READ (Listar/Ver) = base + 0
 *   CREATE (Crear)    = base + 1
 *   UPDATE (Editar)   = base + 2
 *   DELETE (Eliminar) = base + 3
 */
export const PERMISO = {
  // Módulo: POS / Pedidos (10-13)
  READ_POS: 10,
  CREATE_ORDER: 11,
  UPDATE_ORDER: 12,
  CANCEL_ORDER: 13,

  // Módulo: Menú / Catálogo (20-23)
  READ_MENU: 20,
  CREATE_PRODUCT: 21,
  UPDATE_PRODUCT: 22,
  DELETE_PRODUCT: 23,

  // Módulo: Mesas (30-33)
  READ_TABLES: 30,
  CREATE_TABLE: 31,
  UPDATE_TABLE: 32,
  DELETE_TABLE: 33,

  // Módulo: Personal y Roles (40-43)
  READ_STAFF: 40,
  CREATE_STAFF: 41,
  UPDATE_STAFF: 42,
  DELETE_STAFF: 43,

  // Módulo: Transacciones / Caja (50-53)
  READ_CASH_SHIFT: 50,
  OPEN_CASH_SHIFT: 51,
  CLOSE_CASH_SHIFT: 52,
  VOID_PAYMENT: 53,

  // KDS y Dashboard (Solo lectura/acciones específicas)
  READ_KDS: 60,
  READ_DASHBOARD: 70,
} as const;

export type AccionPermiso = 'LISTAR' | 'CREAR' | 'EDITAR' | 'ELIMINAR';

export const ACCION_OFFSET: Record<AccionPermiso, number> = {
  LISTAR: 0,
  CREAR: 1,
  EDITAR: 2,
  ELIMINAR: 3,
};