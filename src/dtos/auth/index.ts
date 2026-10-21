// Contrato de identidad de la API (identidad.md). JSON en snake_case, sin conversión.

/** `datos` de POST /auth/login: el token ya lo quita el proxy; aquí solo llega lo que la web muestra. */
export interface LoginDatosDto {
  tipo: string
  expira_en: string
  usuario: { id: string; nombres: string; apellidos: string; correo_electronico: string }
  tiendas: { tienda_id: string; nombre: string; subdominio: string; rol: string }[]
}

/** `datos` de GET /cuenta/perfil. */
export interface PerfilDto {
  id: string
  nombres: string
  apellidos: string
  correo_electronico: string
  telefono?: string
}
