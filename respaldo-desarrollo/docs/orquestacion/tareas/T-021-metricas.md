# T-021 — Métricas del panel y comisiones de la plataforma

| Campo | Valor |
|---|---|
| Modelo | **Haiku** (solo lectura) |
| Rama | `tarea/T-021-metricas` desde `develop` |
| Depende de | T-019 |
| Tamaño | S/M |

## Objetivo
Cifras del panel del comerciante (MET-001) y el total de comisiones por tienda para el administrador de plataforma. Solo lectura, sin cambios de esquema.

## Contexto (leer solo esto)
- `docs/orquestacion/README.md` (reglas del ejecutor, commits sin `Co-Authored-By`)
- `docs/negocio/modulos/balances-y-metricas.md` (MET-001, BAL-*, permisos)
- Código: `modulos/balance/**` (agrega aquí `MetricasServicio`, `MetricasRepositorio` con consultas **nativas de solo lectura** sobre `Pagos`, `Ordenes` e `ItemsOrden`, y `MetricasControlador`), `TiendaServicio.configuracionVenta` (para la moneda) y la zona horaria de la tienda.

## Alcance
1. `GET /panel/metricas?desde=AAAA-MM-DD&hasta=AAAA-MM-DD` con `@RequierePermiso(METRICAS_VER)`:
   - Por defecto los últimos 30 días; rango máximo 366 días (si no → 422 `MET-001`); `desde > hasta` → 422.
   - Días en la **zona horaria de la tienda** (`Tiendas.ZonaHoraria`), agrupando con `AT TIME ZONE`.
   - Respuesta: `moneda`; `resumen` (del balance: ventas históricas, reembolsado, comisiones, saldo por cobrar, órdenes pagadas); `por_dia[]` con `fecha`, `ventas_brutas` (cargos `APROBADO`), `reembolsos` (reembolsos `APROBADO`), `ventas_netas`, `ordenes_pagadas`, `ticket_promedio` (brutas / órdenes; 0 si no hay) — incluye los días sin ventas con ceros; `top_productos[]` (5 por unidades vendidas en el rango, sobre órdenes pagadas no canceladas: título, unidades, importe); `ordenes_por_preparar` (`ABIERTA` + `PAGADO` + `NO_PREPARADO` con alguna línea que requiera envío).
   - Se cuentan los cargos por la fecha del pago aprobado (`Pagos.FechaCreacion`), no por la fecha de la orden.
2. `GET /plataforma/metricas/comisiones?pagina=` con `@SoloAdministradorPlataforma`: por tienda (nombre, subdominio, plan vigente, `TotalComisiones`, `TotalVentasHistorico`), ordenado por comisiones descendente, paginado de a 20.

## Criterios de aceptación (con pruebas; órdenes creadas con checkout y pagadas con el pago manual)
- [ ] Dos órdenes pagadas hoy y un reembolso parcial → `por_dia` de hoy con brutas, reembolsos, netas y ticket correctos; el resumen coincide con `BalancesTienda`.
- [ ] Un pago a las 23:30 hora de Lima cae en ese día de Lima (no en el siguiente en UTC).
- [ ] Rango de 400 días → 422 `MET-001`; días sin ventas aparecen con ceros.
- [ ] Top de productos ordenado por unidades; una orden cancelada no cuenta.
- [ ] `GESTOR_PEDIDOS` → 403 en `/panel/metricas`; no administrador → 404 `SEG-006` en `/plataforma/metricas/**`.
- [ ] Ninguna consulta escribe; `mvn clean test` en verde; `ArquitecturaTest` pasa; commits sin coautor.
