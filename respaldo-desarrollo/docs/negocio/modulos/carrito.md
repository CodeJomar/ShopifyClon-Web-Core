# Módulo: carrito

## Propósito
Persistir la selección del comprador (invitado o registrado) y mostrarle totales estimados antes del checkout.

## Entidades
| Entidad | Campos clave | Restricciones |
|---|---|---|
| `Carritos` | tienda, usuario (opcional), `TokenSesion`, cupón, `Estado` (`ACTIVO`/`CONVERTIDO`), `OrdenId` | token único por tienda; un `ACTIVO` por (tienda, usuario) |
| `ItemsCarrito` | variante, cantidad | variante única por carrito; cantidad 1–99 |

## Reglas de negocio
| ID | Regla | Dónde |
|---|---|---|
| CAR-001 | El token lo genera el **servidor** (aleatorio seguro, 32+ bytes en base64url) al crear el carrito; el cliente lo guarda y lo envía en `X-Carrito-Token`. | servicio |
| CAR-002 | Solo se agregan variantes no eliminadas de productos publicados de la **misma tienda**, en tienda operativa. | servicio |
| CAR-003 | Agregar una variante existente suma cantidades (tope 99). Cantidad 0 = quitar la línea. Máximo 50 líneas. | servicio |
| CAR-004 | Agregar no reserva stock (D-003), pero avisa si la cantidad supera el vendible actual (`advertencias[]` en la respuesta, no error). | servicio |
| CAR-005 | El carrito responde siempre recalculado con precios actuales: líneas (precio actual, total de línea, disponibilidad), subtotal, descuento estimado, impuestos, cupón, total estimado y advertencias. **Cotización con envío (A-003):** `GET /vitrina/{subdominio}/carrito?tarifa_envio_id=<uuid>` suma el envío con `CalculadoraTotales` (misma función que usa el checkout, paso 7): la respuesta agrega `costo_envio` y `total_estimado` pasa a ser **exactamente** el total que acepta el checkout como `total_esperado` (sin `CHK-004`). Sin el parámetro, `costo_envio` no viaja y el total es el de siempre (sin envío). La tarifa debe ser activa y de la tienda (si no, 409 `ENV-001`, como en el checkout); si ninguna línea vendible requiere envío el parámetro se ignora y `costo_envio` es 0. El envío no lleva impuesto (D-012) y aplica ENV-002 (gratis por monto sobre la base después del descuento). | servicio + `CalculadoraTotales` |
| CAR-006 | Líneas cuya variante fue eliminada o despublicada se excluyen del cálculo y aparecen en `advertencias`. | servicio |
| CAR-007 | Fusión al iniciar sesión (D-019). | servicio |
| CAR-008 | Un carrito `CONVERTIDO` no se modifica (409 `CAR-008`); el cliente debe pedir uno nuevo. | servicio |
| CAR-009 | Carrito sin actividad por 30 días se considera abandonado (solo para métricas; no se borra en v1). | consulta |

## Permisos
Cualquiera con el token. Un carrito vinculado a un usuario solo lo opera ese usuario (con sesión) o el token original.

## Operaciones (bajo `/vitrina/{subdominio}/carrito`)
| Operación | Entrada | Salida | Errores | Idempotente |
|---|---|---|---|---|
| Crear / obtener | token opcional | carrito + token | — | sí |
| Agregar / cambiar cantidad / quitar | variante, cantidad | carrito | `CAR-002`, `CAR-003`, `CAR-008` | cambiar cantidad sí |
| Aplicar / quitar cupón | código | carrito | `CUP-003` (422 con motivo) | sí |
| Vincular a usuario | sesión + token | carrito fusionado | — | sí |
