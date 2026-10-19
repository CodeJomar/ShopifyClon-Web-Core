/**
 * Usuario autenticado que devuelve la API. Lista blanca: sin identificadores internos (ni usuario ni cargo).
 * Los tokens viajan solo en cookies HttpOnly.
 */
/** Aviso para quien tiene la sesión activa; la API lo entrega una sola vez. */
export type AvisoSesionDto = {
  /** intento_inicio_sesion: alguien con la contraseña intentó entrar mientras esta sesión seguía activa. */
  tipo: string
  fecha: string
  /** Cuántos intentos se juntaron en este aviso. */
  intentos: number
}

/** Respuesta del latido de actividad. */
export type ActividadDto = {
  avisos: AvisoSesionDto[]
}

export type SesionUsuarioDto = {
  nombre: string
  email: string
  tipo_cuenta: "OWNER" | "EMPLOYEE"
  rol_nombre: string | null
  /** Permisos efectivos "MODULO:ACCION"; el propietario recibe ["*"]. Solo ayuda de UX: la API vuelve a autorizar. */
  permisos: string[]
  /** Segundos sin actividad tras los cuales la sesión se cierra sola. */
  inactividad_segundos: number
  /** Avisos pendientes de mostrar (solo traen datos en la consulta de sesión). */
  avisos: AvisoSesionDto[]
}
