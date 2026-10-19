/** Acuse de los eventos que envía el cliente. Los errores controlados llegan como `ERROR`, no como excepción. */
export type AcuseSocketDto<T = unknown> =
  | { status: "OK"; data?: T }
  | { status: "ERROR"; message: string }
