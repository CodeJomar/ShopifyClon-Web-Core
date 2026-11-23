# T-014 — Checkout idempotente (módulos `orden` y `checkout`)

| Campo | Valor |
|---|---|
| Modelo | Sonnet (revisión estricta de Opus) |
| Rama | `tarea/T-014-checkout` desde `develop` |
| Depende de | T-013 |
| Tamaño | L — puntos de control con commit en cada uno |

## Objetivo
`POST /vitrina/{sub}/checkout` convierte un carrito en una orden `PENDIENTE` con stock reservado, número correlativo y cupón consumido, todo en **una** transacción, idempotente por `Idempotency-Key` y sin sobreventa bajo concurrencia.

## Contexto (leer solo esto)
- `docs/orquestacion/README.md` (reglas del ejecutor, commits sin `Co-Authored-By`)
- `docs/negocio/flujos/checkout.md` (**fuente de verdad**: 13 pasos, orden de bloqueo, errores)
- `docs/negocio/modulos/ordenes.md` → entidades, ORD-001/002/003/009/010
- `docs/negocio/04-reglas-de-integridad.md` → "Dinero" (instantáneas) y "Concurrencia"
- `docs/negocio/05-decisiones.md` → D-003, D-012, D-018
- Tablas `Ordenes` e `ItemsOrden`: `database.sql` (V1) + columnas de `docs/base-de-datos/V002__suscripciones-y-ajustes.sql`
- Código a usar: `CarritoServicio`, `CatalogoVentaServicio.variantesParaVenta`, `TarifaEnvioServicio.buscarActiva`, `CuponServicio.evaluarCupon` / `consumirUso`, `InventarioServicio.reservar`, `TiendaServicio.idOperativaPorSubdominio` / `configuracionVenta`, `CalculadoraTotales`, `GeneradorToken`, `Clock`.

## Punto 1 — Módulo `orden` (dueño de `Ordenes` e `ItemsOrden`)
- `OrdenEntidad` con **todas** las columnas reales: `TiendaId`, `UsuarioId`, `NumeroOrden` (texto `"#1001"`), `CorreoCliente`, `NombreCliente`, `TelefonoCliente`, `Subtotal`, `DescuentoTotal`, `CostoEnvio`, `ImpuestosTotal`, `Total`, `Estado`, `EstadoPago`, `EstadoPreparacion` (enums `EstadoOrden`, `EstadoPago`, `EstadoPreparacion` en `modelo/`, valores = CHECK de V2), `DireccionEnvio` y `DireccionFacturacion` (`Map<String,Object>`, `@JdbcTypeCode(SqlTypes.JSON)`), `CuponId`, `CodigoCupon`, `NombreTarifaEnvio`, `PasarelaPago`, `TasaImpuesto`, `PreciosIncluyenImpuesto`, `ComisionPlataforma` (0 al crear), `ClaveIdempotencia` (UUID), `TokenAcceso`, `FechaExpiracionPago`, `FechaCancelacion`, `MotivoCancelacion`, `DetalleCancelacion`, `FechaCierre`.
- `ItemOrdenEntidad`: `OrdenId`, `VarianteId`, `TituloProducto`, `TituloVariante`, `SKU`, `Cantidad`, `PrecioUnitario`, `TotalLinea`, `RequiereEnvio` (inmutable: sin setters públicos de importes tras crear, o sin métodos que los cambien).
- `OrdenServicio` (lo usará checkout y luego pagos/envíos):
  - `@Transactional(MANDATORY) OrdenCreada crear(NuevaOrden datos)` → inserta orden e ítems con `saveAndFlush` y devuelve el id (records `NuevaOrden`, `NuevaLinea`, `OrdenCreada` en `modelo/`).
  - `@Transactional(readOnly) Optional<OrdenResumen> buscarPorClave(UUID tiendaId, UUID clave)`.
  - `OrdenResumen` (record) con lo necesario para la respuesta del checkout.

## Punto 2 — Piezas en otros módulos (públicas, `MANDATORY`, con prueba)
- `tienda`: `String tomarNumeroOrden(UUID tiendaId)` — nativa `UPDATE "Tiendas" SET "SiguienteNumeroOrden" = "SiguienteNumeroOrden" + 1 WHERE "Id" = :id AND "Eliminado" = FALSE RETURNING "SiguienteNumeroOrden" - 1` → `"#" + valor` (la primera orden es `#1001`).
- `carrito`: `CarritoParaCheckout bloquearParaCheckout(UUID tiendaId, String token)` (`PESSIMISTIC_WRITE`; record con `carritoId`, `estado`, `cuponId`, `lineas (varianteId, cantidad)`; `CAR-404` / `CAR-008` como en el carrito) y `void marcarConvertido(UUID carritoId, UUID ordenId)`. Además `Optional<UUID> ordenDe(UUID tiendaId, String token)` para el paso 1.

## Punto 3 — `CheckoutServicio` (módulo `checkout`; orquesta, no tiene tablas)
Sigue **exactamente** los 13 pasos de `checkout.md`:
- Paso 1 fuera de transacción. Pasos 2–12 dentro de **un** `TransactionTemplate` (T1). Paso 13 fuera.
- **Orden de bloqueo** del flujo: carrito (paso 3) → tienda (paso 8) → inventario (paso 10) → cupón (paso 11). No lo cambies.
- **No leas inventario dentro de T1 antes del paso 10** (ni `InventarioServicio.disponibilidad` ni `cantidades`): Hibernate devolvería la entidad ya cargada en vez de la fila recién bloqueada y la validación de stock sería con datos viejos. `reservar` es la única lectura de stock en T1.
- Instantáneas en la orden: títulos, SKU y precio de cada variante; código de cupón; nombre de la tarifa; tasa e indicador de impuesto incluido; direcciones como JSON (`nombre_contacto`, `telefono`, `direccion_linea1`, `direccion_linea2`, `ciudad`, `estado_provincia`, `codigo_postal`, `pais`).
- `FechaExpiracionPago`: ahora + 30 min (`STRIPE`) o + 48 h (`MANUAL`) (D-003). `TokenAcceso = GeneradorToken.tokenUrl()`.
- Paso 7 (`CHK-004`): lanza `ConflictoEstadoException` con `detalles.total_recalculado`; el controlador **no** necesita devolver el carrito completo (el cliente lo vuelve a pedir con `GET …/carrito`).
- Paso 13: si T1 falla por `DataIntegrityViolationException` sobre `UxOrdenesClaveIdempotencia`, relee con `buscarPorClave` y responde como el paso 1.
- `UsuarioId` = `SesionActual.usuarioIdOpcional()`.

## Punto 4 — Controlador y contrato
`POST /vitrina/{subdominio}/checkout` (público, `@LimitarPeticiones(porMinuto = 20)`), encabezados `X-Carrito-Token` e `Idempotency-Key`.
- Request: `correo_cliente` (`@Email`, ≤255), `nombre_cliente` (1–150), `telefono_cliente?` (≤30), `direccion_envio?` y `direccion_facturacion?` (objetos con los campos de arriba; `nombre_contacto`, `direccion_linea1`, `ciudad`, `estado_provincia`, `codigo_postal` y `pais` obligatorios dentro del objeto), `tarifa_envio_id?`, `pasarela` (`MANUAL`|`STRIPE`), `total_esperado` (escala 2).
- Respuesta 201 (200 en repetición idempotente): `orden_id`, `numero_orden`, `estado`, `estado_pago`, `moneda`, `items[]` (título producto/variante, sku, precio unitario, cantidad, total línea), `subtotal`, `descuento_total`, `costo_envio`, `impuestos_total`, `total`, `pasarela`, `token_acceso`, `fecha_expiracion_pago`. **Sin** `comision_plataforma`.
- Errores (todos los de `checkout.md`): `CHK-001`, `CHK-002`, `CHK-004`, `CHK-005`, `CHK-006`, `CHK-007` (400), `CAR-404`, `CAR-008`, `ENV-001`, `INV-002`, `VAL-001`.

## Criterios de aceptación (con pruebas en `modulos/checkout/`)
- [ ] Feliz con 2 líneas, cupón 10 %, tarifa con envío e impuesto incluido → totales iguales a `CalculadoraTotales`; orden `#1001`, ítems con instantáneas, stock **reservado** (no descontado), cupón con un uso, carrito `CONVERTIDO`; la siguiente orden es `#1002`.
- [ ] Impuesto no incluido → total con impuesto sumado.
- [ ] Misma `Idempotency-Key` dos veces → 200 con la misma orden; una sola reserva y un solo uso de cupón. Misma clave con otro carrito → 409 `CHK-006`. Sin clave → 400 `CHK-007`.
- [ ] **Concurrencia 1**: dos carritos distintos compran la última unidad a la vez → una orden y un 409 `INV-002`.
- [ ] **Concurrencia 2**: la misma petición (misma clave y carrito) enviada por dos hilos a la vez → una sola orden; ambas respuestas tienen el mismo `orden_id`, o la segunda recibe 409 `CAR-008` (documenta cuál pasa).
- [ ] `total_esperado` distinto → 409 `CHK-004` y **nada** creado (ni orden, ni reserva, ni uso de cupón, y `SiguienteNumeroOrden` sin cambiar).
- [ ] Cupón agotado entre el carrito y el checkout → 409 `CHK-005`, nada creado.
- [ ] Todas las líneas despublicadas → 409 `CHK-002`; tienda desactivada → 409 `CHK-001`; carrito ya convertido → 409 `CAR-008`.
- [ ] Producto que requiere envío sin `tarifa_envio_id` o con tarifa inactiva → 409 `ENV-001`; producto digital no exige tarifa ni dirección.
- [ ] Comprador con sesión → `UsuarioId` guardado; invitado → nulo.
- [ ] `mvn test` en verde dos veces; `ArquitecturaTest` pasa (ni `checkout` ni `orden` usan repositorios de otros módulos); commits sin coautor.

## Fuera de alcance
Pagar, vencer, cancelar o listar órdenes (T-015…T-020). El correo de confirmación (solo se publica el evento).
