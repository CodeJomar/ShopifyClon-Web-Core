# Módulo: rutas de reparto (hoja de ruta y guía de remisión)

## Propósito
Armar una ruta con un chofer, una placa, una fecha y los envíos ordenados que debe visitar, y entregar todo lo necesario para imprimir la **guía de remisión** y la hoja de ruta sin más llamadas (A-004).

## Entidades
| Entidad | Campos clave | Restricciones |
|---|---|---|
| `Rutas` | tienda, `Codigo` (`RT-0001`, correlativo por tienda), `Fecha`, `Chofer`, `Placa`, `Estado` (`BORRADOR`, `EN_CURSO`, `FINALIZADA`), `Nota` | código único por tienda |
| `ParadasRuta` | ruta, envío, `Posicion` | posición única por ruta; un envío una vez por ruta |

## Reglas de negocio
| ID | Regla | Dónde |
|---|---|---|
| RUT-001 | Solo se agregan envíos de la misma tienda en estado `CREADO` o `EN_TRANSITO`. Un envío de otra tienda responde `404 ENV-404`; un estado distinto, `422 RUT-001`. | servicio |
| RUT-002 | Un envío no puede estar en dos rutas no finalizadas → `409 RUT-002` (con `detalles.envio_ids`). | servicio + consulta |
| RUT-003 | Iniciar (`BORRADOR → EN_CURSO`): los envíos `CREADO` pasan a `EN_TRANSITO` con su evento y `FechaDespacho`. Otro estado de origen → `409 RUT-003`. | servicio |
| RUT-004 | Finalizar (`EN_CURSO → FINALIZADA`) cuando el usuario lo pide, aun con paradas pendientes (quedan como están y vuelven a estar disponibles). Otro estado de origen → `409 RUT-004`. | servicio |
| RUT-005 | Solo se edita (chofer, placa, nota, paradas y su orden) en `BORRADOR`; en `EN_CURSO` solo cambian los estados de los envíos. Si no → `409 RUT-005`. | servicio |
| RUT-006 | La fecha no puede ser anterior a hoy (en la zona horaria de la tienda) al crear, ni al cambiarla al editar → `422 VAL-001`. Los `envio_ids` no se repiten. | servicio |

## Operaciones (todas bajo `/panel`, permiso `ORDENES_GESTIONAR`)
| Operación | Ruta | Salida |
|---|---|---|
| Listar | `GET /panel/rutas?pagina&estado&fecha` | página de `{ id, codigo, fecha, chofer, placa, estado, total_paradas, paradas_entregadas }` |
| Crear | `POST /panel/rutas` `{ fecha, chofer, placa, nota?, envio_ids[] }` | 201 detalle |
| Detalle | `GET /panel/rutas/{id}` | `{ id, codigo, fecha, chofer, placa, estado, nota, tienda{nombre, correo_electronico, telefono?, direccion?}, paradas[] }` |
| Editar | `PUT /panel/rutas/{id}` | detalle |
| Iniciar / Finalizar | `POST /panel/rutas/{id}/iniciar` · `/finalizar` | detalle |
| Envíos disponibles | `GET /panel/envios/disponibles-para-ruta` | `[ { envio_id, numero_orden, numero_guia, estado_envio, destinatario, ciudad, direccion_linea1, total_items } ]` |

Cada **parada**: `posicion`, `envio_id`, `orden_id`, `numero_orden`, `numero_guia`, `estado_envio`, `destinatario`, `telefono`, `direccion{direccion_linea1, direccion_linea2, ciudad, estado_provincia, codigo_postal, pais}`, `latitud`, `longitud`, `items[{titulo_producto, titulo_variante, sku, cantidad}]`.

## Notas
- Un usuario de otra tienda recibe `404 RUT-404` en toda ruta ajena.
- La tienda aún no guarda teléfono ni dirección propios: el remitente de la guía muestra nombre y correo de contacto.
- Pruebas asociadas: `RutaTest`, `EventosEnvioTest`, `SeguimientoTest`.
