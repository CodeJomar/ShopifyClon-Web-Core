/**
 * Importe en soles como TEXTO con dos decimales ("12.50"). La API nunca envía dinero como número, para evitar
 * errores de coma flotante. Para operar con él, usa utilidades de `shared/utils` (céntimos enteros), no `Number`.
 */
export type Dinero = string
