# Análisis de la base de datos (V001) y migración V002

**Veredicto**: el modelo V001 está bien encaminado para un clon de Shopify (multi-tienda, variantes con inventario separado, instantáneas en órdenes, ciclos de pago y preparación desacoplados, soft delete y auditoría uniformes). Le faltaban los **planes de suscripción** (lo que pidió el profesor) y algunas piezas que las reglas de negocio necesitan para ser seguras con dinero, stock y concurrencia. Todo se resuelve en `V002__suscripciones-y-ajustes.sql`.

**Verificado**: V001 + datos de ejemplo + V002 se ejecutaron en PostgreSQL 16 desechable sin errores; se probaron la fórmula del total, la suscripción vigente única, el CHECK de cupones y el mismo SKU en dos tiendas. Supabase usa PostgreSQL 15+; la sintaxis es compatible.

## 1. Planes de suscripción (nuevo)
```text
PlanesSuscripcion 1 ──< SuscripcionesTienda >── 1 Tiendas
                              │ 1
                              └──< CobrosSuscripcion (solo-añadir)
```
- **Plan**: precio mensual/anual, límites (productos, personal), comisión por venta, días de prueba, `EsPublico`.
- **Suscripción**: estado (`PRUEBA`, `ACTIVA`, `VENCIDA`, `CANCELADA`, `SUSPENDIDA`), ciclo, `PrecioPactado` congelado, período actual, cancelación programada. Índice parcial: **una no cancelada por tienda**.
- **Cobro**: un registro por intento de cobro de un período; índice que impide dos cobros aprobados del mismo período (renovación idempotente).
- La comisión del plan se congela en `Ordenes.ComisionPlataforma` al pagar y se acumula en `BalancesTienda.TotalComisiones`.
Reglas completas: `docs/negocio/modulos/suscripciones.md`.

## 2. Problemas encontrados en V001 y su corrección
| # | Problema | Riesgo | Corrección en V002 |
|---|---|---|---|
| 1 | `UqVariantesProductoSKU` es **global**: si la tienda A usa `CAM-001`, la tienda B no puede | Bloquea a tiendas ajenas | Se elimina; unicidad por tienda en servicio (D-013) |
| 2 | Las `UNIQUE` (slugs, cupones, items, relaciones) cuentan filas eliminadas | Un slug borrado no se puede reutilizar | Índices únicos parciales `WHERE "Eliminado" = FALSE` (D-014) |
| 3 | `PersonalTienda` único por (tienda, usuario, **rol**) | Un usuario con varios roles a la vez | Único por (tienda, usuario) (D-004) |
| 4 | No hay numeración de órdenes por tienda | `#1001` duplicado en checkouts simultáneos | `Tiendas.SiguienteNumeroOrden` + `UPDATE … RETURNING` |
| 5 | Sin clave de idempotencia en órdenes ni unicidad en `Pagos.TransaccionId` | Doble orden por doble clic; webhook repetido = doble cobro contable | `Ordenes.ClaveIdempotencia` y `UxPagosPasarelaTransaccion` |
| 6 | `Pagos` sin tipo: no hay cómo registrar reembolsos sin editar | Rompe "lo contable no se edita" | `Tipo` (`CARGO`/`REEMBOLSO`) + `PagoOrigenId` (D-009) |
| 7 | Estados sin `CHECK` y sin estado de orden (cancelada/cerrada) | Valores arbitrarios; no se puede cancelar | `Ordenes.Estado` + CHECK en todos los estados |
| 8 | No hay configuración de impuestos ni de tarifas de envío | `ImpuestosTotal` y `CostoEnvio` sin fuente | `Tiendas.TasaImpuesto/PreciosIncluyenImpuesto` y tabla `TarifasEnvio` |
| 9 | `CantidadReservada` sin regla de vencimiento | Stock bloqueado para siempre | `Ordenes.FechaExpiracionPago` + tarea programada (D-003) |
| 10 | Ajustes de stock sin rastro | Imposible auditar faltantes | `MovimientosInventario` (solo-añadir) |
| 11 | Sin registro de auditoría | Cancelaciones/reembolsos sin trazabilidad | `RegistroAuditoria` |
| 12 | `Carritos` sin estado | El carrito sigue editable tras comprar | `Carritos.Estado` + `OrdenId` |
| 13 | Faltaban instantáneas: cupón, tarifa, tasa de impuesto | El comprobante cambia si cambia la configuración | Columnas de instantánea en `Ordenes` |
| 14 | Sin `CHECK` de fórmula del total ni de línea | Totales incoherentes | `ChkOrdenesFormulaTotal`, `ChkItemsOrdenTotalLinea` |
| 15 | Cupones sin validación de tipo/valor | 150 % de descuento posible | `ChkCuponesValor`, `ChkCuponesUsos`, `ChkCuponesFechas` |
| 16 | Varias direcciones / imágenes "principales" | Ambigüedad en checkout y vitrina | Índices únicos parciales |
| 17 | Sin administrador de plataforma | Nadie puede gestionar planes | `Usuarios.EsAdministradorPlataforma` |
| 18 | Faltaban índices por usuario/propietario y por fecha | Listados lentos | Sección 6 de V002 |

## 3. No se cambia (y por qué)
- `EstadoPreparacion` mantiene `ENTREGADO` aunque `Envios` también tenga estado: se acepta como proyección con **un solo escritor** (módulo de envíos, D-010).
- `TokensSeguridad.CodigoToken` sigue `VARCHAR(100)`: cabe el hash SHA-256 en hex (64); el cambio es de código (USR-007).
- No se añade `TiendaId` a `VariantesProducto` por ahora (D-013).
- Opciones estructuradas de producto (Talla × Color) quedan para el futuro.

## 4. Cómo aplicarla
1. Respaldo (o rama de Supabase).
2. Ejecutar `V002__suscripciones-y-ajustes.sql` completo (va en una transacción).
3. Copiar el contenido al final de `database.sql` **o** mantener los archivos versionados (`V001`, `V002`…) — recomendado: adoptar Flyway en el backend (tarea T-001) para no aplicar scripts a mano.
4. Promover el administrador de plataforma con el `UPDATE` comentado al final del script.
5. Las entidades JPA deben agregar las columnas nuevas antes de arrancar (`ddl-auto=validate` falla si una entidad mapea una columna inexistente, no al revés: las columnas nuevas con valor por defecto no rompen el arranque).

## 5. Hallazgos en el código actual (no son de BD, se corrigen en tareas)
| Severidad | Hallazgo | Tarea |
|---|---|---|
| **Crítica** | `X-Tienda-Id` se acepta sin verificar que el usuario pertenezca a la tienda: cualquier usuario autenticado puede crear productos, categorías o ajustar stock en tiendas ajenas. `CrearProducto` además acepta `idTienda` del cuerpo. | T-002 (núcleo) + cada módulo al reescribirse |
| **Crítica** | `GET /catalogo/productos` es público y sin tienda lista productos de **todas** las tiendas, incluidos no publicados (y potencialmente costos). | T-008 |
| Alta | El registro deja que el cliente elija su rol (`ADMIN_TIENDA`) y el rol ni siquiera se persiste en `Usuarios`. | T-003 |
| Alta | `ObtenerProductoPorId`, `AjustarStock`, editar/eliminar no filtran por tienda. | T-008 |
| Alta | Crear tienda no crea personal propietario, balance ni suscripción. | T-005 |
| Media | Errores de permiso devuelven 400 (`ReglaNegocioException`) en lugar de 401/403/404; no hay códigos de error estables. | T-002 |
| Media | El token de activación se escribe en los logs y los correos se envían con `@EventListener` (antes del commit, aunque la transacción falle). | T-002, T-003 |
| — | Arquitectura semi-hexagonal inconsistente (catálogo ya usaba JPA directo) | reescritura a capas, D-021 y D-022 |
