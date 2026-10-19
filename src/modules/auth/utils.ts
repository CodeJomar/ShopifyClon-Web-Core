import type { SesionUsuarioDto } from "@/dtos/auth"

const ETIQUETAS_CARGO: Record<string, string> = {
  WAITER: "Mozo",
  BARISTA: "Barista",
  CASHIER: "Cajero",
  OPERATOR: "Operador",
}

/** Texto de rol para mostrar en la interfaz: OWNER es "Propietario"; un empleado muestra su cargo. */
export function etiquetaRol(usuario: SesionUsuarioDto): string {
  if (usuario.tipo_cuenta === "OWNER") return "Propietario"
  return (usuario.rol_nombre && ETIQUETAS_CARGO[usuario.rol_nombre]) || usuario.rol_nombre || "Empleado"
}

/** Tipo de cuenta para el encabezado: el propietario es "Dueño"; cualquier otra cuenta es "Empleado". */
export function etiquetaCuenta(usuario: SesionUsuarioDto): string {
  return usuario.tipo_cuenta === "OWNER" ? "Dueño" : "Empleado"
}

export function iniciales(nombre: string): string {
  const partes = nombre.trim().split(/\s+/).filter(Boolean)
  if (partes.length === 0) return "??"
  if (partes.length === 1) return partes[0].slice(0, 2).toUpperCase()
  return (partes[0][0] + partes[partes.length - 1][0]).toUpperCase()
}
