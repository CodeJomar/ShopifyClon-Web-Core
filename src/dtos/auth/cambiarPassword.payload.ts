/**
 * Exige la contraseña actual. Cierra las demás sesiones del usuario, conserva la actual y avisa por correo.
 * Tras 5 intentos fallidos responde 429 y bloquea el cambio unos minutos.
 */
export type CambiarPasswordPayload = {
  password_actual: string
  password_nueva: string
}
