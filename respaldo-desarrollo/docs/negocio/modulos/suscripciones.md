# Módulo: suscripciones (planes de la plataforma)

## Propósito
Cobrar a cada tienda por usar la plataforma, con planes que fijan precio, límites y comisión por venta (modelo Shopify Basic / Shopify / Advanced).

## Entidades
| Entidad | Campos clave | Restricciones |
|---|---|---|
| `PlanesSuscripcion` | `Codigo`, `Nombre`, `PrecioMensual`, `PrecioAnual`, `Moneda`, `LimiteProductos` (NULL = ilimitado), `LimitePersonal`, `PorcentajeComision`, `DiasPrueba`, `EsPublico`, `Orden` | código único; precios ≥ 0; comisión 0–0.10 |
| `SuscripcionesTienda` | tienda, plan, `Estado`, `CicloFacturacion` (`MENSUAL`/`ANUAL`), `PrecioPactado`, `FechaInicio`, `FechaFinPrueba`, `InicioPeriodoActual`, `FinPeriodoActual`, `CancelarAlFinalizarPeriodo`, `FechaCancelacion`, `ReferenciaPasarela` | una no cancelada por tienda |
| `CobrosSuscripcion` | suscripción, monto, moneda, período (inicio–fin), `Estado` (`PENDIENTE`/`APROBADO`/`RECHAZADO`), pasarela, `TransaccionId`, `Intento`, `DetallesRespuesta` | solo-añadir; (pasarela, transacción) único |

## Planes semilla (confirmar precios, Q-007)
| Código | Mensual | Anual | Productos | Personal | Comisión | Prueba |
|---|---|---|---|---|---|---|
| `BASICO` | 29.00 USD | 290.00 | 100 | 2 | 2.0 % | 14 días |
| `ESTANDAR` | 79.00 USD | 790.00 | 1 000 | 5 | 1.0 % | 14 días |
| `AVANZADO` | 299.00 USD | 2 990.00 | ilimitado | 15 | 0.5 % | 14 días |

## Reglas de negocio
| ID | Regla | Dónde |
|---|---|---|
| SUS-001 | Al crear una tienda nace una suscripción `PRUEBA` al plan elegido (por defecto `BASICO`) con `FinPeriodoActual = ahora + DiasPrueba`. | servicio (en TIE-002) |
| SUS-002 | Una sola suscripción no `CANCELADA` por tienda. | índice único parcial |
| SUS-003 | `PrecioPactado` se congela al iniciar cada período con el precio del plan y ciclo; cambiar el precio del plan no afecta períodos en curso. | servicio |
| SUS-004 | Activar (pagar) desde `PRUEBA` o `VENCIDA`: se crea un `CobroSuscripcion`; si se aprueba → `ACTIVA`, período nuevo desde hoy (`+1 mes` o `+1 año`). | servicio |
| SUS-005 | Renovación: una tarea diaria toma las `ACTIVA` con `FinPeriodoActual ≤ ahora`: si `CancelarAlFinalizarPeriodo` → `CANCELADA`; si no, intenta cobrar; aprobado → nuevo período; rechazado → `VENCIDA`. | tarea programada |
| SUS-006 | `PRUEBA` vencida sin pago → `VENCIDA`. | tarea programada |
| SUS-007 | `VENCIDA` por más de 30 días → `Tiendas.EstaActiva = FALSE` (la suscripción sigue `VENCIDA`, se puede reactivar pagando). | tarea programada |
| SUS-008 | Cambiar de plan (D-008): inmediato, período nuevo, sin prorrateo. Bajar de plan exige que productos activos ≤ `LimiteProductos` y personal ≤ `LimitePersonal` del destino; si no, 422 `SUS-008` indicando cuánto sobra. | servicio |
| SUS-009 | Cancelar: marca `CancelarAlFinalizarPeriodo = TRUE`; la tienda sigue operando hasta `FinPeriodoActual`. Se puede revertir antes de esa fecha. En `PRUEBA` la cancelación es inmediata. | servicio |
| SUS-010 | `SUSPENDIDA` la asigna solo el admin de plataforma (con motivo); bloquea como `VENCIDA`. Reactivar vuelve al estado anterior. | servicio |
| SUS-011 | Límites del plan vigente se verifican al **crear** productos (activos no eliminados) y al **agregar** personal. No se borra nada si ya se excedía. | servicio de catálogo / personal (consultan `LimitesPlan`) |
| SUS-012 | La comisión aplicable a una orden es la del plan vigente **al aprobarse el pago** (D-016). | servicio de pagos |
| SUS-013 | Un plan con suscripciones no se elimina; se marca `EsPublico = FALSE` para que no se ofrezca a tiendas nuevas. | servicio |
| SUS-014 | Los cobros son idempotentes por período: no puede haber dos cobros `APROBADO` para el mismo (suscripción, `InicioPeriodo`). | índice único parcial |
| SUS-015 | Solo se puede elegir un plan existente, no eliminado y `EsPublico` con `DiasPrueba ≥ 1` para la prueba; si no → 422 `SUS-015` "El plan elegido no está disponible". | servicio |
| SUS-016 | Prueba gratuita **una por usuario** (D-024): si el propietario ya tuvo una suscripción con `FechaFinPrueba` en cualquiera de sus tiendas (incluidas eliminadas), su nueva tienda no recibe prueba. Cómo se activa esa tienda lo define T-005. | servicio (consulta `propietarioYaUsoPrueba`) |
| SUS-017 | Con la suscripción en `VENCIDA`, `SUSPENDIDA` o sin suscripción vigente, el panel solo permite **lecturas** y las acciones marcadas `@PermitidoSinSuscripcion` (gestionar la suscripción, activar/desactivar la tienda). Cualquier otra escritura en `/panel/**` → 409 `SUS-017` "Tu suscripción no está activa. Paga para seguir operando". | interceptor del módulo suscripción |
| SUS-018 | El token de pago de un cobro aprobado se guarda en `ReferenciaPasarela` (nunca datos de tarjeta) y la renovación automática lo usa. Sin token guardado, la renovación pasa a `VENCIDA`. | servicio |

## Estados y transiciones
| De | A | Quién | Condición | Efecto |
|---|---|---|---|---|
| — | `PRUEBA` | sistema | alta de tienda | período de prueba |
| `PRUEBA` | `ACTIVA` | propietario | cobro aprobado | período pagado |
| `PRUEBA` | `VENCIDA` | tarea | fin de prueba sin pago | vitrina cerrada |
| `PRUEBA` | `CANCELADA` | propietario | cancelar | tienda inactiva |
| `ACTIVA` | `ACTIVA` | tarea / propietario | renovación aprobada o cambio de plan | período nuevo |
| `ACTIVA` | `VENCIDA` | tarea | cobro rechazado | vitrina cerrada |
| `ACTIVA` | `CANCELADA` | tarea | fin de período con cancelación programada | tienda inactiva |
| `VENCIDA` | `ACTIVA` | propietario | cobro aprobado | período nuevo |
| `PRUEBA`/`ACTIVA`/`VENCIDA` | `SUSPENDIDA` | admin plataforma | motivo | vitrina cerrada |
| `SUSPENDIDA` | estado previo | admin plataforma | motivo | — |

## Permisos
| Acción | Permiso |
|---|---|
| Ver planes públicos | público |
| Ver / pagar / cambiar / cancelar suscripción | `SUSCRIPCION_GESTIONAR` (propietario) |
| CRUD de planes, suspender/reactivar, listar suscripciones | admin de plataforma |

## Operaciones
| Operación | Entrada | Salida | Errores | Idempotente |
|---|---|---|---|---|
| Listar planes | — | planes públicos | — | sí |
| Ver mi suscripción | contexto tienda | estado, plan, período, uso vs límites | — | sí |
| Pagar / activar | ciclo, método (token pasarela) | cobro + estado | `SUS-004` | sí (por período) |
| Cambiar plan | código plan, ciclo | suscripción | `SUS-008` | — |
| Cancelar / revertir cancelación | — | suscripción | 409 si ya cancelada | sí |
| Admin: CRUD planes, suspender | datos / motivo | — | `SUS-013` | — |

## Eventos y auditoría
- Auditar: cambio de plan, cancelación, suspensión, reactivación, cambio de precio de un plan.
- Emitir tras commit: `SuscripcionVencidaEvento` (correo al propietario), `SuscripcionRenovadaEvento`.

## Concurrencia
- La tarea de renovación bloquea cada suscripción con `FOR UPDATE SKIP LOCKED` para que dos instancias no cobren dos veces.

## Pruebas asociadas
| Regla | Prueba |
|---|---|
| SUS-001 | Crear tienda → suscripción `PRUEBA` con fin = hoy + 14 |
| SUS-008 | Tienda con 150 productos no puede bajar a `BASICO` |
| SUS-011 | Plan `BASICO` con 100 productos → crear el 101 da 422 |
| SUS-005/014 | Ejecutar renovación dos veces el mismo día → un solo cobro |
| TIE-004 | Suscripción `VENCIDA` → vitrina 404 y checkout 409 |

## Preguntas abiertas
- Q-007 precios definitivos; Q-008 ¿cobro real con Stripe Billing o simulado?
