# Módulo: cupones

## Propósito
Descuentos por código aplicables al carrito/orden de una tienda.

## Entidades
| Entidad | Campos clave | Restricciones |
|---|---|---|
| `Cupones` | código, tipo (`PORCENTAJE`, `MONTO_FIJO`, `ENVIO_GRATIS`), valor, monto mínimo, límite de usos, usos actuales, vigencia, `EstaActivo` | código único por tienda (mayúsculas, no eliminados) |

## Reglas de negocio
| ID | Regla | Dónde |
|---|---|---|
| CUP-001 | Código: mayúsculas, `^[A-Z0-9_-]{3,50}$`, único por tienda. La búsqueda ignora mayúsculas. | servicio + índice parcial |
| CUP-002 | `PORCENTAJE`: 0 < valor ≤ 100. `MONTO_FIJO`: valor > 0. `ENVIO_GRATIS`: valor = 0. | DTO + CHECK |
| CUP-003 | Es **aplicable** si: activo, no eliminado, `FechaInicio ≤ ahora`, (`FechaFin` nulo o `> ahora`), usos < límite (o sin límite) y `Subtotal ≥ MontoMinimoCompra`. | componente `ValidadorCupon` |
| CUP-004 | Descuento: `PORCENTAJE` → `Subtotal × valor / 100` redondeado; `MONTO_FIJO` → `min(valor, Subtotal)`; `ENVIO_GRATIS` → descuento 0 y `CostoEnvio = 0`. | `CalculadoraTotales` |
| CUP-005 | Un cupón por carrito. Aplicar otro reemplaza al anterior. | servicio de carrito |
| CUP-006 | Aplicar al carrito valida CUP-003 y responde el motivo concreto si no aplica ("El cupón venció el 10/10/2026", "Compra mínima S/ 100.00"). En el checkout se **revalida**: si dejó de aplicar → 409 `CHK-005`. | carrito + checkout |
| CUP-007 | El uso se consume al crear la orden con `UPDATE` condicional (ver integridad). Se devuelve si la orden se **anula** por falta de pago (D-020). | servicio |
| CUP-008 | Un cupón con usos no se elimina físicamente; se desactiva o elimina lógicamente. No se puede cambiar su tipo ni valor si ya tiene usos (se crea otro). | servicio |
| CUP-009 | `FechaFin`, si existe, > `FechaInicio`. | DTO + CHECK |

## Permisos
| Acción | Permiso |
|---|---|
| CRUD cupones, ver usos | `CUPONES_GESTIONAR` |
| Aplicar / quitar en carrito | quien tenga el token del carrito |

## Pruebas asociadas
| Regla | Prueba |
|---|---|
| CUP-007 | Cupón con límite 1 y dos checkouts simultáneos → solo uno lo consume; el otro 409 `CHK-005` |
| CUP-004 | `MONTO_FIJO` 50 sobre subtotal 30 → descuento 30, total no negativo |

## Preguntas abiertas
- Q-011: ¿límite de un uso por cliente (correo)? Requeriría contar órdenes por correo; fuera de v1 salvo que se pida.
