export const ESTADOS_USUARIO = ["pendiente_activacion", "activo", "suspendido", "inactivo", "bloqueado"] as const

export type EstadoUsuario = (typeof ESTADOS_USUARIO)[number]

/** Estados que un administrador puede fijar a mano (el resto los fija el sistema). */
export type EstadoUsuarioEditable = Extract<EstadoUsuario, "activo" | "suspendido" | "inactivo">
