# T-006 — Gestión de la suscripción (propietario) y de planes (plataforma)

| Campo | Valor |
|---|---|
| Modelo | Sonnet |
| Rama | `tarea/T-006-gestion-suscripcion` desde `develop` |
| Depende de | T-005 |
| Tamaño | L |

## Objetivo
El propietario ve su suscripción, la paga (cobro simulado), cambia de plan y la cancela; el administrador de plataforma gestiona planes y suspende/reactiva tiendas.

## Contexto (leer solo esto)
- `docs/orquestacion/README.md` (reglas del ejecutor, commits sin `Co-Authored-By`)
- `docs/arquitectura-backend.md`
- `docs/negocio/modulos/suscripciones.md` (**fuente de verdad**: SUS-002…016, tabla de transiciones)
- `docs/negocio/05-decisiones.md` → D-007, D-008, D-024
- Imitar: `modulos/suscripcion/**`, `modulos/tienda/**` (controladores de panel, auditoría, pruebas).

## Alcance
### 1. Pasarela simulada (Q-008)
`modulos/suscripcion/pasarela/PasarelaSuscripcion` (interfaz: `ResultadoCobro cobrar(UUID suscripcionId, BigDecimal monto, String moneda, String tokenPago)`) y `PasarelaSimulada` (`@Component`): aprueba siempre salvo `tokenPago = "tok_rechazar"`; devuelve `TransaccionId = "sim_" + UUID`. Así se cambia por Stripe después sin tocar el servicio.

### 2. Cobro de un período (patrón obligatorio, PAG-010)
`CobroSuscripcionServicio.cobrarPeriodo(...)`: **T1** (`TransactionTemplate`) bloquea la suscripción (`PESSIMISTIC_WRITE`), valida e inserta `CobrosSuscripcion` `PENDIENTE`; **fuera de transacción** llama a la pasarela; **T2** marca el cobro `APROBADO`/`RECHAZADO` y, si aprobó, aplica el efecto (período nuevo desde `ahora`: `InicioPeriodoActual = ahora`, `FinPeriodoActual = ahora + ciclo`, `PrecioPactado` = precio del plan y ciclo, `Estado = ACTIVA`, `FechaVencimiento = null`). Rechazo → 422 `SUS-004` "El pago fue rechazado". Usa siempre `EstadoSuscripcion.puedeTransicionarA`.

### 3. Endpoints del propietario (`@RequierePermiso(SUSCRIPCION_GESTIONAR)`)
| Ruta | Request | Regla |
|---|---|---|
| `GET /panel/suscripcion` | — | estado, plan, ciclo, precio pactado, período, `cancelar_al_finalizar_periodo`, `uso { productos, personal }` vs límites (cuentas con consultas nativas de solo lectura: productos no eliminados de la tienda; personal no eliminado sin el propietario) |
| `POST /panel/suscripcion/pagar` | `ciclo`, `token_pago`, `codigo_plan?` | SUS-004: desde `PRUEBA`, `VENCIDA` o **sin suscripción vigente** (crea una nueva `ACTIVA`); desde `ACTIVA` → 409 `SUS-004` "Tu suscripción ya está activa" |
| `POST /panel/suscripcion/cambiar-plan` | `codigo_plan`, `ciclo`, `token_pago` | SUS-008. En `PRUEBA`: cambia plan y precio sin cobrar, conserva las fechas de prueba. En `ACTIVA`: cobra el plan nuevo y abre período nuevo. Mismo plan y ciclo → 409 `SUS-008`. Bajar de plan con uso mayor al límite → 422 `SUS-008` diciendo cuánto sobra. Otros estados → 409. Audita `PLAN_CAMBIADO` |
| `POST /panel/suscripcion/cancelar` | `motivo` (5–255) | SUS-009: `PRUEBA` → `CANCELADA` inmediata; `ACTIVA` → `CancelarAlFinalizarPeriodo = TRUE`. Audita `SUSCRIPCION_CANCELADA` |
| `POST /panel/suscripcion/revertir-cancelacion` | — | solo `ACTIVA` con cancelación programada; si no → 409 |

### 4. Endpoints de plataforma (`@SoloAdministradorPlataforma`, rutas `/plataforma/**`)
| Ruta | Regla |
|---|---|
| `GET /plataforma/planes` | todos los no eliminados, incluidos no públicos |
| `POST /plataforma/planes` | crear; validaciones = CHECKs de V2; código `^[A-Z_]{3,30}$` único |
| `PUT /plataforma/planes/{codigo}` | el código no cambia; si cambia algún precio audita `PLAN_PRECIO_CAMBIADO` (SUS-003: no afecta períodos en curso) |
| `DELETE /plataforma/planes/{codigo}` | SUS-013: `EsPublico = FALSE` (nunca borra) |
| `GET /plataforma/suscripciones?estado=&pagina=` | paginado (tienda, subdominio, plan, estado, fin de período) |
| `POST /plataforma/tiendas/{tiendaId}/suspender` · `/reactivar` | `motivo`; SUS-010 con `EstadoAnterior`; audita `TIENDA_SUSPENDIDA`/`TIENDA_REACTIVADA` |

## Fuera de alcance
Renovación automática y vencimientos (T-007), Stripe real, comisiones, prorrateo.

## Criterios de aceptación (con pruebas)
- [ ] Pagar desde `PRUEBA` y desde `VENCIDA` deja `ACTIVA` con período de 1 mes / 1 año y un cobro `APROBADO`; con `tok_rechazar` el estado no cambia y queda un cobro `RECHAZADO`.
- [ ] La segunda tienda de un usuario (nace `VENCIDA`, D-024) se vuelve operativa al pagar (`GET /vitrina/{sub}` pasa de 404 a 200).
- [ ] Cambiar plan en `PRUEBA` no cobra; en `ACTIVA` cobra; bajar con exceso de uso → 422 `SUS-008`.
- [ ] Cancelar en prueba es inmediato (vitrina 404); en activa solo programa; revertir funciona.
- [ ] `GESTOR_*` y `ADMINISTRADOR` reciben 403 en `/panel/suscripcion/**` (solo `PROPIETARIO`).
- [ ] Suspender y reactivar restauran el estado anterior; un no administrador recibe 404 `SEG-006` en `/plataforma/**`.
- [ ] Ningún cobro de pasarela ocurre dentro de una transacción con la suscripción bloqueada (revisable en el código).
- [ ] `mvn test` en verde dos veces; `ArquitecturaTest` pasa; commits sin coautor.

## Verificación
```bash
mvn test
git log --format='%b' develop..HEAD | grep -ci "co-authored"
```
