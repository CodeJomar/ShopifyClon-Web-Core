# A-003 — Eliminar mi cuenta y cerrar sesión en otros dispositivos

| Campo | Valor |
|---|---|
| Modelo sugerido | Sonnet (toca seguridad y datos de personas) |
| Repositorio | `ShopifyClon-Api-Core` (y luego la web) |
| Rama | `ajuste/A-003-eliminar-cuenta-y-otras-sesiones` desde `develop` |
| Origen | Revisión de W-007-C1 (2026-10-21): la pantalla `/cuenta` ya muestra los dos botones, **deshabilitados** ("Próximamente"), a la espera de estos endpoints |
| Bloquea | Nada (la web funciona sin ellos) |
| Tamaño estimado | M |

## Problema
En `/cuenta` el usuario no puede (a) cerrar la sesión de sus otros dispositivos si cree que alguien más entró, ni (b) eliminar su cuenta. Ambas son esperables en una cuenta personal y la segunda suele ser un requisito legal de protección de datos. Hoy la API no expone nada para ello.

## Alcance propuesto

### 1. Cerrar sesión en otros dispositivos
- `POST /cuenta/sesiones/cerrar-otras` (autenticado). Invalida todos los JWT emitidos antes de este momento **excepto el de la petición actual**.
- Mecanismo sugerido (sin guardar tokens): columna `tokens_validos_desde` (timestamp) en el usuario. El filtro de autenticación rechaza (`SEG-007`) los tokens con `iat` anterior. La respuesta emite un JWT nuevo (cuerpo, como en `/auth/login`) para que la web reemplace la cookie `httpOnly` de la sesión actual.
- Respuesta `200`, mensaje en español: "Cerramos tus otras sesiones".

### 2. Eliminar mi cuenta
- `DELETE /cuenta` con cuerpo `{ contrasena_actual }` (se vuelve a pedir; error `USR-010` si no coincide).
- Reglas de negocio a decidir con el responsable (por eso la web no inventa nada):
  - Si la persona es **PROPIETARIO de una tienda**: bloquear con un código propio (p. ej. `USR-0xx` "Transfiere o cierra tus tiendas antes de eliminar tu cuenta"), listando las tiendas.
  - Si solo es personal de una tienda: se retira del personal.
  - Las órdenes ya hechas se conservan por obligaciones contables: **anonimizar** nombres, correo y teléfono (no borrar la fila), liberar el correo para un registro futuro.
  - Direcciones y perfil: borrado definitivo. Invalidar todas las sesiones.
- Auditoría: registrar el evento sin datos personales.

## Contrato con la web (lo que ya está hecho)
- `/cuenta` muestra "Cerrar sesión en otros dispositivos" y "Eliminar mi cuenta" como botones **deshabilitados** con la nota "Próximamente" (módulo `cuenta`, `cuenta-view.tsx`).
- Al implementar la API: la web añade las acciones en `modules/cuenta/actions`, un diálogo de confirmación global (`useConfirm`, con contraseña para eliminar) y, tras eliminar, cierra la sesión y lleva a `/login`.

## Fuera de alcance
- Exportar los datos personales (portabilidad), recuperación de una cuenta eliminada.

## Criterios de aceptación (verificables)
- [ ] Prueba: tras `cerrar-otras`, un JWT anterior recibe `SEG-007` y el JWT devuelto sigue funcionando.
- [ ] Prueba: `DELETE /cuenta` con contraseña incorrecta responde `USR-010` y no cambia nada.
- [ ] Prueba: un PROPIETARIO con tienda no puede eliminar su cuenta (código propio documentado en `transversal.md`/`identidad.md`).
- [ ] Prueba: tras eliminar, las órdenes históricas siguen existiendo con datos anonimizados y el correo queda libre.
- [ ] `mvn -q test` en verde.

## Decisión pendiente del responsable
Qué hacer con las tiendas del propietario al eliminar su cuenta (bloquear, transferir o cerrar). Propuesta por defecto: **bloquear**.
