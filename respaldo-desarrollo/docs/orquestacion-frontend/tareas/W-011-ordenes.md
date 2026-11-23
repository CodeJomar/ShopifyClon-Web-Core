# W-011 — Órdenes del panel: lista, detalle, pago manual, envío, cancelar y reembolsar (base funcional)

| Campo | Valor |
|---|---|
| Ejecutor | Haiku, en el checkout principal (puerto 3000), con navegador |
| Rama | `tarea/W-011-ordenes` desde `develop` (incluye W-016: ya hay órdenes de prueba) |
| Depende de | W-016 |
| Tamaño | L — **dinero: revisión estricta de Opus** |

## Objetivo
El comerciante ve las órdenes de su tienda, las filtra, abre el detalle y opera el ciclo de vida: registrar el **pago manual**, crear el envío (preparar), despachar, entregar o devolver, **cancelar** con motivo y **reembolsar** total o parcialmente. Prioridad: **que funcione e integre con la API**. Sin pulido visual y **sin capturas**.

## Contexto (leer solo esto)
- `docs/negocio/flujos/ciclo-de-vida-orden.md` (estados y transiciones) y `docs/negocio/modulos/ordenes.md` (ORD-*), `pagos.md` (PAG-004…008), `envios.md` (ENV-003…006)
- `docs/diseno-web.md` §4.3 (tabla de estados → texto y tono de insignia)
- Código a imitar: `src/modules/cupones/` (lista + filtros + `FormPanel` + confirmación), `src/modules/cuenta/views/orden-detalle-view.tsx` (detalle de orden de W-005), `src/modules/panel/hooks/use-panel.tsx` (`puede`), marcador `src/app/panel/ordenes/page.tsx`

## Contrato de la API (verificado por Opus; JSON en `snake_case`; con `X-Tienda-Id`)
| Acción | Endpoint | Permiso | Cuerpo |
|---|---|---|---|
| Listar | `GET /panel/ordenes?pagina=0&estado=&estado_pago=&estado_preparacion=&desde=AAAA-MM-DD&hasta=&texto=` | `ORDENES_VER` | → `Paginado<…>` (ver Swagger) |
| Detalle | `GET /panel/ordenes/{ordenId}` | `ORDENES_VER` | → orden con líneas, totales, direcciones, estados (ver Swagger) |
| Pagos de la orden | `GET /panel/ordenes/{ordenId}/pagos` | `ORDENES_VER` | → lista de transacciones |
| Registrar pago manual | `POST /panel/ordenes/{ordenId}/pagos/manual` | `ORDENES_GESTIONAR` | `{ referencia? (≤ 100) }` (PAG-004: por el total) |
| Envío de la orden | `GET /panel/ordenes/{ordenId}/envio` | `ORDENES_VER` | → envío o 404 si no hay |
| Crear envío (preparar) | `POST /panel/ordenes/{ordenId}/envio` | `ORDENES_GESTIONAR` | `{ empresa_transporte? (≤ 100), numero_guia? (≤ 100), url_seguimiento? (https, ≤ 2000), fecha_entrega_estimada? }` (ENV-003: requiere pago `PAGADO`) |
| Editar envío | `PUT /panel/envios/{envioId}` | `ORDENES_GESTIONAR` | mismos campos (ENV-006: mientras no esté `ENTREGADO`) |
| Despachar / entregar / devolver | `POST /panel/envios/{envioId}/despachar` · `/entregar` · `/devolver` | `ORDENES_GESTIONAR` | ver Swagger si llevan cuerpo |
| Cancelar | `POST /panel/ordenes/{ordenId}/cancelar` | `ORDENES_CANCELAR` (+ `REEMBOLSOS_EMITIR` si está pagada) | `{ motivo: "CLIENTE" \| "FRAUDE" \| "SIN_STOCK" \| "OTRO", detalle? (≤ 255, obligatorio si OTRO), reponer_stock? }` (ORD-007: solo `ABIERTA` y `NO_PREPARADO`) |
| Reembolsar | `POST /panel/ordenes/{ordenId}/reembolsos` | `REEMBOLSOS_EMITIR` | `{ monto, motivo (5–255), reponer?: [{ variante_id, cantidad }] }` (PAG-007: 0 < monto ≤ cobrado − reembolsado) |

**La web nunca calcula montos**: el saldo reembolsable y los totales salen de la API (si el detalle no trae "cobrado" y "reembolsado", mostrar el total y dejar que la API valide el monto).

## Pantallas
| Ruta | Muestra / permite |
|---|---|
| `/panel/ordenes` | Filtros (texto: número o correo; estado; estado de pago; estado de preparación; rango de fechas), tabla con número, fecha (`formatearFecha`), cliente, total (`formatearDinero` con la moneda de la orden) e insignias de pago y preparación (§4.3); `BarraPaginacion`; vacío "Aún no tienes órdenes" |
| `/panel/ordenes/[id]` | Encabezado (número, fecha, insignias), líneas, totales de la API, cliente y direcciones, historial de pagos, envío (si existe) y **acciones según el estado** (mostrar solo las que la API permitiría según los estados y el permiso; la API decide igual): "Registrar pago manual" (con referencia), "Preparar envío" (`FormPanel`), "Editar envío", "Despachar", "Marcar entregada", "Marcar devuelta", "Cancelar orden" (motivo + detalle + reponer stock, con confirmación) y "Reembolsar" (monto + motivo, con confirmación). Tras cada acción, recargar la orden |

- Estados en español con la tabla de §4.3 de `diseno-web.md`.
- Errores: `mensaje` de la API en `Alert`/toast; `validaciones` en los campos. Botones del pie de `FormPanel` directos, sin `div`.
- No crear ni modificar nada en `src/shared/components/**` ni `globals.css`. Código en `src/modules/ordenes/`, `src/dtos/ordenes/` y `src/app/panel/ordenes/`.

## Datos de prueba
Órdenes de W-016 en "Tienda W006 Prueba": #1001…#1004 (pago pendiente). Credenciales en `docs/orquestacion-frontend/datos-de-prueba.md`. Para probar sin acabarlas todas: usar #1001 para el ciclo completo (pagar → preparar → despachar → entregar), #1002 para reembolso parcial y total, #1003 para cancelar sin pago. Si hacen falta más, crear compras desde la vitrina.

## Criterios de aceptación (con la API real)
- [ ] Lista con las órdenes de prueba; cada filtro sin errores.
- [ ] #1001: registrar pago manual con referencia → "Pagada"; preparar envío con transportista y guía → despachar → entregar → la orden queda "Completada" (ENV-005).
- [ ] Intentar preparar envío de una orden sin pagar → mensaje de la API (ENV-003).
- [ ] #1002: pagar; reembolso parcial (por ejemplo la mitad) → "Reembolso parcial"; reembolso por un monto mayor al saldo → error PAG-007; reembolsar el resto → "Reembolsada".
- [ ] #1003: cancelar con motivo CLIENTE y reponer stock → "Cancelada"; el stock vuelve (verificar en `/panel/inventario`).
- [ ] Motivo OTRO sin detalle → error.
- [ ] `npm run lint`, `npx tsc --noEmit` y `npm run build` sin errores.
- [ ] Reporte con cada flujo probado y su resultado (**sin capturas**) y el estado final de cada orden de prueba.
- [ ] **No detener la API** al terminar (Antigravity trabaja en paralelo).
