// Contrato de personal de la tienda (tiendas-y-personal.md). JSON en snake_case, sin conversión.

export type RolPersonal = "PROPIETARIO" | "ADMINISTRADOR" | "GESTOR_CATALOGO" | "GESTOR_PEDIDOS"

export interface MiembroPersonalDto {
  usuario_id: string
  correo_electronico: string
  nombres: string
  apellidos: string
  rol: RolPersonal | string
  desde: string
}

export interface AgregarPersonalRequest {
  correo_electronico: string
  rol: "ADMINISTRADOR" | "GESTOR_CATALOGO" | "GESTOR_PEDIDOS"
}

export interface CambiarRolRequest {
  rol: "ADMINISTRADOR" | "GESTOR_CATALOGO" | "GESTOR_PEDIDOS"
  motivo: string
}

export interface QuitarPersonalRequest {
  motivo: string
}
