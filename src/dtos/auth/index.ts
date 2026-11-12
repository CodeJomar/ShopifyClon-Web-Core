// Contrato de identidad de la API (identidad.md). JSON en snake_case, sin conversión.

/** `datos` de una sesión iniciada (login normal o segundo paso): el token ya lo quita el proxy; aquí solo llega lo que la web muestra. */
export interface LoginDatosDto {
  requiere_segundo_factor?: false
  tipo: string
  expira_en: string
  usuario: {
    id: string
    nombres: string
    apellidos: string
    correo_electronico: string
    es_administrador_plataforma?: boolean
    dos_pasos_activo?: boolean
  }
  tiendas: { tienda_id: string; nombre: string; subdominio: string; rol: string }[]
}

/**
 * `datos` de POST /auth/login con dos pasos activo (A-007): el correo ya recibió un código y todavía NO hay sesión
 * (sin token, usuario ni tiendas). Se canjea en POST /auth/login/verificar, que responde como un login normal.
 */
export interface LoginSegundoFactorDto {
  requiere_segundo_factor: true
}

export type LoginRespuestaDto = LoginDatosDto | LoginSegundoFactorDto

/** `datos` de GET /cuenta/perfil. */
export interface PerfilDto {
  id: string
  nombres: string
  apellidos: string
  correo_electronico: string
  telefono?: string
  es_administrador_plataforma?: boolean
  dos_pasos_activo?: boolean
}
