# T-004 — Base de los módulos `suscripcion` y `balance`

| Campo | Valor |
|---|---|
| Modelo sugerido | **Haiku** (especificación cerrada; no hay que decidir reglas) |
| Repositorio | `C:\UTP-Proyectos\Shopify-Clon-Core\Desarrollo\ShopifyClon-Api-Core` |
| Rama | `tarea/T-004-base-suscripcion` desde `develop` |
| Depende de | T-003 (mergeada) |
| Tamaño estimado | M |

## Objetivo
Crear las entidades, repositorios y servicios internos de suscripción y balance que necesita el alta de tienda (T-005), más el listado público de planes `GET /planes`. No hay pagos, cambios de plan ni tareas programadas todavía.

## Contexto obligatorio (leer solo esto)
- `C:\UTP-Proyectos\Shopify-Clon-Core\Desarrollo\docs\orquestacion\README.md` (reglas del ejecutor; **commits sin `Co-Authored-By`**)
- `C:\UTP-Proyectos\Shopify-Clon-Core\Desarrollo\docs\arquitectura-backend.md`
- `C:\UTP-Proyectos\Shopify-Clon-Core\Desarrollo\docs\negocio\modulos\suscripciones.md` (entidades, estados y transiciones, SUS-001/002/015/016)
- `C:\UTP-Proyectos\Shopify-Clon-Core\Desarrollo\docs\base-de-datos\V002__suscripciones-y-ajustes.sql` (definición exacta de `PlanesSuscripcion`, `SuscripcionesTienda`, `CobrosSuscripcion` y las columnas nuevas de `BalancesTienda`)
- **Modelo a imitar**: `src/main/java/shopify/api/core/modulos/usuario/**` (estructura, nombres, estilo de DTOs `record`, mapeadores, pruebas en `src/test/java/shopify/api/core/modulos/usuario/`).

## Estructura a crear
```text
modulos/suscripcion/
├── controlador/  PlanControlador
├── servicio/     PlanServicio, SuscripcionServicio
├── repositorio/  PlanSuscripcionRepositorio, SuscripcionTiendaRepositorio, CobroSuscripcionRepositorio
├── entidad/      PlanSuscripcionEntidad, SuscripcionTiendaEntidad, CobroSuscripcionEntidad
├── dto/response/ PlanResponse
├── modelo/       EstadoSuscripcion, CicloFacturacion, EstadoCobro, SuscripcionVigente
└── mapeador/     PlanMapeador
modulos/balance/
├── servicio/     BalanceServicio
├── repositorio/  BalanceTiendaRepositorio
└── entidad/      BalanceTiendaEntidad
```

## Paso 1 — Entidades (extienden `AuditoriaEntidad`; nombres de columna entrecomillados exactos)
| Entidad | Tabla | Campos (columna → tipo Java) |
|---|---|---|
| `PlanSuscripcionEntidad` | `"PlanesSuscripcion"` | `Codigo`→String, `Nombre`→String, `Descripcion`→String, `PrecioMensual`→BigDecimal, `PrecioAnual`→BigDecimal, `Moneda`→String, `LimiteProductos`→Integer (nullable = ilimitado), `LimitePersonal`→Integer, `PorcentajeComision`→BigDecimal, `DiasPrueba`→Integer, `EsPublico`→Boolean, `Orden`→Integer |
| `SuscripcionTiendaEntidad` | `"SuscripcionesTienda"` | `TiendaId`→UUID, `PlanId`→UUID, `Estado`→`EstadoSuscripcion` (`@Enumerated(STRING)`), `EstadoAnterior`→`EstadoSuscripcion` (nullable), `CicloFacturacion`→`CicloFacturacion` (STRING), `PrecioPactado`→BigDecimal, `Moneda`→String, `FechaInicio`→Instant, `FechaFinPrueba`→Instant, `InicioPeriodoActual`→Instant, `FinPeriodoActual`→Instant, `FechaVencimiento`→Instant, `CancelarAlFinalizarPeriodo`→Boolean, `FechaCancelacion`→Instant, `MotivoEstado`→String, `ReferenciaPasarela`→String |
| `CobroSuscripcionEntidad` | `"CobrosSuscripcion"` | `SuscripcionId`→UUID, `PlanId`→UUID, `Monto`→BigDecimal, `Moneda`→String, `InicioPeriodo`→Instant, `FinPeriodo`→Instant, `Estado`→`EstadoCobro` (STRING), `PasarelaPago`→String, `TransaccionId`→String, `Intento`→Integer, `DetallesRespuesta`→`Map<String,Object>` con `@JdbcTypeCode(SqlTypes.JSON)` |
| `BalanceTiendaEntidad` | `"BalancesTienda"` | `TiendaId`→UUID, `TotalVentasHistorico`→BigDecimal, `CantidadOrdenes`→Integer, `SaldoPendienteCobro`→BigDecimal, `TotalReembolsado`→BigDecimal, `TotalComisiones`→BigDecimal |

Usa `UUID` para las referencias (sin `@ManyToOne`), igual que `TokenSeguridadEntidad`.

## Paso 2 — Modelos
- `EstadoSuscripcion`: `PRUEBA, ACTIVA, VENCIDA, CANCELADA, SUSPENDIDA`, con:
  - `boolean permiteOperar()` → `true` solo para `PRUEBA` y `ACTIVA`.
  - `boolean puedeTransicionarA(EstadoSuscripcion destino)` con **exactamente** este mapa (tabla "Estados y transiciones" de `suscripciones.md`):
    | Desde | Destinos permitidos |
    |---|---|
    | `PRUEBA` | `ACTIVA`, `VENCIDA`, `CANCELADA`, `SUSPENDIDA` |
    | `ACTIVA` | `ACTIVA`, `VENCIDA`, `CANCELADA`, `SUSPENDIDA` |
    | `VENCIDA` | `ACTIVA`, `SUSPENDIDA` |
    | `SUSPENDIDA` | `PRUEBA`, `ACTIVA`, `VENCIDA` (volver al estado anterior) |
    | `CANCELADA` | ninguno |
- `CicloFacturacion`: `MENSUAL(Period.ofMonths(1))`, `ANUAL(Period.ofYears(1))` con getter `periodo()`.
- `EstadoCobro`: `PENDIENTE, APROBADO, RECHAZADO`.
- `SuscripcionVigente` (record): `UUID suscripcionId`, `UUID tiendaId`, `String codigoPlan`, `EstadoSuscripcion estado`, `Instant finPeriodoActual`, `Integer limiteProductos`, `int limitePersonal`, `BigDecimal porcentajeComision`, con `boolean permiteOperar()` que delega en el estado.

## Paso 3 — Repositorios
- `PlanSuscripcionRepositorio`: `List<PlanSuscripcionEntidad> findByEsPublicoTrueAndEliminadoFalseOrderByOrdenAsc()`, `Optional<PlanSuscripcionEntidad> findByCodigoAndEliminadoFalse(String codigo)`.
- `SuscripcionTiendaRepositorio`:
  - `Optional<SuscripcionTiendaEntidad> buscarNoCanceladaPorTienda(UUID tiendaId)` → JPQL: `Estado <> CANCELADA` y `eliminado = false`.
  - `boolean propietarioYaUsoPrueba(UUID propietarioId)` → consulta **nativa** de solo lectura:
    ```sql
    SELECT EXISTS (
      SELECT 1 FROM "SuscripcionesTienda" s
      JOIN "Tiendas" t ON t."Id" = s."TiendaId"
      WHERE t."PropietarioId" = :propietarioId AND s."FechaFinPrueba" IS NOT NULL
    )
    ```
    (incluye tiendas y suscripciones eliminadas a propósito: SUS-016).
- `CobroSuscripcionRepositorio extends JpaRepository<CobroSuscripcionEntidad, UUID>` sin métodos extra.
- `BalanceTiendaRepositorio`: `boolean existsByTiendaId(UUID tiendaId)`, `Optional<BalanceTiendaEntidad> findByTiendaId(UUID tiendaId)`.

## Paso 4 — Servicios
### `PlanServicio`
- `@Transactional(readOnly = true) List<PlanResponse> listarPublicos()`.

### `SuscripcionServicio` (lo usará el módulo `tienda`)
- `@Transactional(propagation = MANDATORY) SuscripcionVigente crearPrueba(UUID tiendaId, String codigoPlan)`:
  1. `codigoPlan` nulo o en blanco → `"BASICO"`. Se normaliza a mayúsculas.
  2. Plan con `findByCodigoAndEliminadoFalse`; si no existe, no es público o `DiasPrueba < 1` → `ReglaNegocioException("SUS-015", "El plan elegido no está disponible")`.
  3. Si `buscarNoCanceladaPorTienda(tiendaId)` existe → `ConflictoEstadoException("SUS-002", "La tienda ya tiene una suscripción vigente")`.
  4. `ahora = reloj.instant()` (bean `Clock`); `fin = ahora + DiasPrueba días`. Inserta: `Estado = PRUEBA`, `CicloFacturacion = MENSUAL`, `PrecioPactado = PrecioMensual del plan`, `Moneda = Moneda del plan`, `FechaInicio = ahora`, `FechaFinPrueba = fin`, `InicioPeriodoActual = ahora`, `FinPeriodoActual = fin`, `CancelarAlFinalizarPeriodo = false`.
  5. Devuelve `SuscripcionVigente`.
- `@Transactional(readOnly = true) boolean propietarioYaUsoPrueba(UUID propietarioId)`.
- `@Transactional(readOnly = true) Optional<SuscripcionVigente> vigente(UUID tiendaId)`: suscripción no cancelada de la tienda + datos de su plan.

### `BalanceServicio` (lo usará el módulo `tienda`)
- `@Transactional(propagation = MANDATORY) void crearSiNoExiste(UUID tiendaId)`: si no existe, inserta con todos los importes en `0.00` y `CantidadOrdenes = 0`. Si ya existe, no hace nada.

## Paso 5 — Endpoint público
- `PlanControlador`: `GET /planes` → `RespuestaApi.ok(lista, "Planes disponibles")`. Ya está permitido sin sesión en `SecurityConfig` (no lo toques).
- `PlanResponse` (record, JSON snake_case): `codigo`, `nombre`, `descripcion`, `precio_mensual`, `precio_anual`, `moneda`, `limite_productos` (null = ilimitado), `limite_personal`, `porcentaje_comision`, `dias_prueba`. **No** expone `id`, `es_publico` ni `orden`.

## Paso 6 — Pruebas
En `src/test/java/shopify/api/core/modulos/suscripcion/` y `.../modulos/balance/`, extendiendo `PruebaIntegracionBase`. Para llamar a métodos `MANDATORY` usa `TransactionTemplate` (inyéctalo con `@Autowired`). Para crear tiendas usa el helper `crearTienda(propietarioId)` de la base. Agrega las rutas a `Rutas`.

| Prueba | Esperado |
|---|---|
| `GET /planes` sin token | 200; 3 planes en orden `BASICO`, `ESTANDAR`, `AVANZADO`; `AVANZADO.limite_productos` ausente/null; `porcentaje_comision` de `BASICO` = 0.02; sin campo `id` |
| plan insertado con `EsPublico = FALSE` (jdbc) | no aparece en `GET /planes` |
| plan con `Eliminado = TRUE` (jdbc) | no aparece |
| `crearPrueba(tienda, null)` en transacción | fila con `Estado = PRUEBA`, plan `BASICO`, `PrecioPactado = 29.00`, `FinPeriodoActual` = inicio + 14 días (exacto, usa el `Clock`) |
| `crearPrueba(tienda, "estandar")` | plan `ESTANDAR` (normaliza mayúsculas) |
| `crearPrueba` con código inexistente / plan no público | `SUS-015` |
| `crearPrueba` dos veces para la misma tienda | la segunda `SUS-002` |
| `crearPrueba` fuera de transacción | `IllegalTransactionStateException` |
| `propietarioYaUsoPrueba`: usuario sin tiendas → false; tras `crearPrueba` en su tienda → true; si esa tienda se marca eliminada → sigue true | ✔ |
| `vigente(tienda)` tras `crearPrueba` | estado `PRUEBA`, límites del plan, `permiteOperar() = true` |
| `crearSiNoExiste` dos veces | una sola fila en `"BalancesTienda"`, todo en 0 |
| `crearSiNoExiste` fuera de transacción | `IllegalTransactionStateException` |
| `EstadoSuscripcionTest` (unitaria) | las 25 combinaciones origen × destino según el mapa del paso 2; `permiteOperar` por estado |

## Fuera de alcance
- Pagar, cambiar plan, cancelar, suspender, tareas programadas, límites aplicados a catálogo o personal (T-006, T-007).
- Tocar `modules/tienda` (lo reescribe T-005).
- Cambiar dependencias, `SecurityConfig` o migraciones (no hace falta ninguna migración nueva).

## Criterios de aceptación
- [ ] La app arranca en pruebas con `ddl-auto=validate` (las entidades coinciden con V2).
- [ ] `GET /planes` funciona sin sesión y no expone datos internos.
- [ ] `crearPrueba` y `crearSiNoExiste` fallan fuera de una transacción.
- [ ] `mvn test` en verde dos veces; `ArquitecturaTest` pasa.
- [ ] Commits sin `Co-Authored-By`.

## Verificación (ejecutar y pegar resumen en el reporte)
```bash
mvn -q -DskipTests compile
mvn test
mvn test
git log --format='%h %s%n%b' develop..HEAD | grep -ci "co-authored"
```

## Notas
- No arranques la app contra Supabase.
- Commits sugeridos: `feat(T-004): entidades y modelos de suscripcion y balance`, `feat(T-004): servicios internos y GET /planes`, `test(T-004): pruebas de suscripcion y balance`.
