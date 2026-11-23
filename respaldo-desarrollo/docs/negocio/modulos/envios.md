# Módulo: envíos (tarifas y despacho)

## Propósito
Configurar las tarifas que ve el comprador y registrar el despacho físico de las órdenes. Es el **único** que escribe `Ordenes.EstadoPreparacion`.

## Entidades
| Entidad | Campos clave | Restricciones |
|---|---|---|
| `TarifasEnvio` (nueva) | tienda, nombre ("Estándar 3–5 días"), precio, `MontoMinimoGratis` (opcional), `EstaActiva`, `Orden` | precio ≥ 0 |
| `Envios` | orden, transportista, guía, URL de seguimiento, `Estado`, fechas de despacho/estimada/real | uno no eliminado por orden (D-010) |
| `EventosEnvio` (A-004) | envío, `Estado` (`CREADO`, `EN_TRANSITO`, `ENTREGADO`, `NO_ENTREGADO`, `DEVUELTO`), nota, foto de entrega, fecha | solo se añaden filas |

## Reglas de negocio
| ID | Regla | Dónde |
|---|---|---|
| ENV-001 | En el checkout el comprador elige una tarifa **activa** de la tienda si alguna línea requiere envío; si no hay tarifas activas y se requiere envío → 409 `ENV-001` ("La tienda no tiene métodos de envío disponibles"). | checkout |
| ENV-002 | Costo de la tarifa = 0 si `MontoMinimoGratis` existe y `Subtotal − Descuento ≥ MontoMinimoGratis`. | `CalculadoraTotales` |
| ENV-003 | Crear envío (preparar): orden `ABIERTA`, pago `PAGADO`, preparación `NO_PREPARADO`, con al menos una línea que requiera envío. → `Envios` `CREADO` y orden `PREPARADO`. | servicio |
| ENV-004 | Transiciones del envío: `CREADO → EN_TRANSITO` (registra `FechaDespacho`) → `ENTREGADO` (registra `FechaEntregaReal`; orden `ENTREGADO`) ; `EN_TRANSITO → DEVUELTO`. | servicio |
| ENV-005 | Al entregar, si el pago no tiene saldo pendiente la orden pasa a `CERRADA` (ORD-004). | servicio |
| ENV-006 | Editar guía/transportista/URL permitido mientras no esté `ENTREGADO`. La URL debe ser `https`. | servicio + DTO |
| ENV-007 | Si alguna línea requiere envío, la dirección de envío del checkout lleva `latitud` (−90…90) y `longitud` (−180…180), marcadas por el comprador en el mapa; si faltan → 422 `ENV-007` "Marca en el mapa el punto de entrega". Van dentro del snapshot `Ordenes.DireccionEnvio`; las órdenes antiguas no las tienen. La libreta de direcciones las guarda opcionales. | checkout + DTO |
| ENV-008 | Cada creación y cada transición del envío (ENV-004) inserta un evento en `EventosEnvio`, incluido `CREADO`. `NO_ENTREGADO` (`POST /panel/envios/{id}/no-entregado`, solo en `EN_TRANSITO`, nota obligatoria de hasta 500) no cambia el estado: deja constancia del intento. Al entregar puede enviarse `foto_url` (https, subida con el almacenamiento de imágenes) y `nota`. | servicio |
| ENV-009 | Al crear un envío sin número de guía se genera `OT-AAAAMMDD-XXXXXX`; una guía manual se respeta. Seguimiento público: `GET /seguimiento/{numero_guia}` (sin sesión, sin dirección ni teléfono; 404 genérico). Las guías manuales no son únicas: gana el envío más reciente. | servicio |

## Permisos
| Acción | Permiso |
|---|---|
| CRUD tarifas | `ENVIOS_CONFIGURAR` |
| Crear y actualizar envíos, entregar, no entregado | `ORDENES_GESTIONAR` |
| Ver los eventos del envío | `ORDENES_VER` |
| Seguimiento por número de guía | público |
| Listar tarifas activas | público (vitrina/checkout) |

## Eventos
- Tras commit: `EnvioDespachadoEvento` (correo al comprador con guía), `EnvioEntregadoEvento`.
