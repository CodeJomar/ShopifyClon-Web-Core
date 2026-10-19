import type { EntidadAuditada } from "../core/entidadAuditada"
import type { FechaIso } from "../core/fechaIso"
import type { UUID } from "../core/helpers"
import type { EstadoUsuario } from "./estadoUsuario"
import type { TipoCuenta } from "./tipoCuenta"

export type UsuarioDto = EntidadAuditada & {
  id_usuario: UUID
  tipo_cuenta: TipoCuenta
  id_rol: UUID | null
  /** Nombre del cargo; null en la cuenta propietaria. */
  rol_nombre: string | null
  email: string
  nombre: string
  estado: EstadoUsuario
  email_verificado: boolean
  ultimo_login: FechaIso | null
  /** Documento de identidad (DNI o similar). */
  dni: string | null
  telefono: string | null
  /** Fecha de ingreso (YYYY-MM-DD). */
  fecha_ingreso: string | null
  /** Fecha y motivo de la baja; null si sigue en el equipo. */
  fecha_baja: FechaIso | null
  motivo_baja: string | null
}
