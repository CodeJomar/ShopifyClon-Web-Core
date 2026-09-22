/**
 * Catálogo centralizado de Stored Procedures y Funciones de Base de Datos.
 * Evita el uso de "magic strings" en la capa de repositorios.
 */
export const DB_PROCEDURES = {
  // Transacciones y Pedidos
  PROCESS_PAYMENT: 'sp_procesar_pago_comanda',
  CANCEL_ORDER: 'sp_anular_comanda_revertir_stock',

  // Turnos de Caja
  OPEN_CASH_SHIFT: 'sp_abrir_turno_caja',
  CLOSE_CASH_SHIFT: 'sp_cerrar_turno_arqueo',

  // Inventario y Menú
  UPDATE_PRODUCT_STOCK_TOGGLE: 'sp_toggle_lista_86_producto',
} as const;

// Extraemos el tipo exacto de las llaves para tipado estricto
export type ProcedureName = typeof DB_PROCEDURES[keyof typeof DB_PROCEDURES];