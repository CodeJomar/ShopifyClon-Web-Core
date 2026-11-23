# T-010 — Módulo `cupon`

| Campo | Valor |
|---|---|
| Modelo | **Haiku** |
| Rama | `tarea/T-010-cupones` desde `develop` |
| Depende de | T-005 |
| Tamaño | M |

## Objetivo
CRUD de cupones en el panel y las operaciones internas que usarán carrito y checkout.

## Contexto (leer solo esto)
- `docs/orquestacion/README.md` (reglas del ejecutor, commits sin `Co-Authored-By`)
- `docs/negocio/modulos/cupones.md` (**fuente de verdad**: CUP-001…009)
- Tabla `"Cupones"` en `database.sql` (V1) y sus CHECK/índice en `docs/base-de-datos/V002__suscripciones-y-ajustes.sql`
- Imitar **exactamente**: `modulos/tienda/**` (estructura, controlador de panel con `@RequierePermiso`, DTOs `record`, mapeador, pruebas).

## Alcance
1. `modulos/cupon/` con `CuponEntidad`, `TipoDescuento` (enum), `CuponRepositorio`, `CuponServicio`, `CuponControlador`, DTOs y mapeador.
2. Endpoints con `@RequierePermiso(CUPONES_GESTIONAR)`:
   - `GET /panel/cupones?pagina=&texto=&activo=` (paginado), `GET /panel/cupones/{id}`, `POST /panel/cupones`, `PUT /panel/cupones/{id}`, `DELETE /panel/cupones/{id}` (eliminación lógica).
   - Request: `codigo`, `tipo_descuento`, `valor_descuento`, `monto_minimo_compra?`, `limite_usos_total?`, `fecha_inicio?` (por defecto ahora), `fecha_fin?`, `esta_activo?`.
   - Errores: CUP-001 (formato y duplicado → 422), CUP-002 y CUP-009 (→ 422 `VAL-001` o el código de la regla), CUP-008 (cambiar tipo o valor con usos → 409 `CUP-008`), otra tienda → 404 `CUP-404`.
3. `ValidadorCupon` (clase pura en `modelo/`): `Optional<String> motivoNoAplicable(CuponEntidad c, BigDecimal subtotal, Instant ahora)` con los mensajes concretos de CUP-006; y `BigDecimal descuento(CuponEntidad c, BigDecimal subtotal)` según CUP-004 (usa `comun/util/Dinero`).
4. Métodos internos en `CuponServicio` para T-013/T-014:
   - `CuponAplicable evaluar(UUID tiendaId, String codigo, BigDecimal subtotal)`: devuelve el record `CuponAplicable(id, codigo, tipo, valor)` o lanza `ReglaNegocioException("CUP-003", motivo)` si no aplica (motivo de `ValidadorCupon`).
   - `@Transactional(propagation = MANDATORY) void consumirUso(UUID cuponId)`: `UPDATE` condicional de CUP-007 (`@Modifying`); 0 filas → `ConflictoEstadoException("CHK-005", "El cupón ya no está disponible")`.
   - `@Transactional(propagation = MANDATORY) void devolverUso(UUID cuponId)`: `CantidadUsosActual - 1` sin bajar de 0.

## Criterios de aceptación (con pruebas)
- [ ] Código en minúsculas se guarda en mayúsculas; duplicado en la misma tienda → 422; mismo código en otra tienda → OK.
- [ ] `PORCENTAJE` 0 o 101, `MONTO_FIJO` 0, `ENVIO_GRATIS` con valor ≠ 0, `fecha_fin ≤ fecha_inicio` → 422.
- [ ] `ValidadorCupon` (unitaria): inactivo, no iniciado, vencido, agotado, bajo el mínimo, y descuentos de los tres tipos (incluido `MONTO_FIJO` mayor al subtotal → tope en el subtotal).
- [ ] `consumirUso` con `LimiteUsosTotal = 1` llamado dos veces → la segunda `CHK-005`; `devolverUso` repone.
- [ ] `GESTOR_CATALOGO` → 403; cupón de otra tienda → 404.
- [ ] `mvn test` en verde; `ArquitecturaTest` pasa; commits sin coautor.
