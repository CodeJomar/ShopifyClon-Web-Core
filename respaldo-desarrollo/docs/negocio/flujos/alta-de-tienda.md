# Flujo: alta de comerciante y tienda

## Objetivo y actores
Un usuario registrado crea su tienda y queda listo para cargar productos. Actor: futuro propietario.

## Precondiciones
- Usuario registrado y activo (USR-003).

## Pasos
| # | Actor | Acción | Módulo | Resultado | Transacción / efecto posterior |
|---|---|---|---|---|---|
| 1 | Usuario | Lista planes públicos (`GET /planes`) | suscripción | planes | — |
| 2 | Usuario | `POST /cuenta/tiendas` (nombre, subdominio, correo, moneda?, plan?) | tienda | valida TIE-001, plan (SUS-015) | — |
| 3 | Sistema | Inserta `Tiendas` (`SiguienteNumeroOrden = 1001`, impuesto 0.18 incluido, `America/Lima`, moneda `USD` por defecto, Q-003) | tienda | tienda | **T1** |
| 4 | Sistema | Inserta `PersonalTienda` con rol `PROPIETARIO` | tienda | — | T1 |
| 5 | Sistema | `BalanceServicio.crearSiNoExiste` | balance | — | T1 |
| 6a | Sistema | Si el propietario **no** usó su prueba (SUS-016) → `SuscripcionServicio.crearPrueba` | suscripción | `PRUEBA` 14 días | T1 |
| 6b | Sistema | Si **ya** la usó → `SuscripcionServicio.crearPendienteDePago` | suscripción | `VENCIDA`: la tienda existe pero no opera hasta pagar (T-006) | T1 |
| 7 | Sistema | Audita `TIENDA_CREADA` (detalle: subdominio, plan, estado de suscripción) | transversal | — | T1 → commit |

La tarifa de envío inicial ya no se crea en el alta: sin tarifas activas el checkout responde `ENV-001` (T-011).
La propiedad `app.suscripcion.prueba-una-por-usuario` (por defecto `true`, Q-015) permite volver a "una prueba por tienda" sin cambiar código.

## Fallos
| Paso | Fallo | Comportamiento | Reintentar |
|---|---|---|---|
| 2 | Subdominio inválido, reservado u ocupado | 422 `TIE-001` | sí, con otro |
| 2 | Plan inexistente o no público | 422 `SUS-015` | sí |
| 3–7 | Carrera por el subdominio | el índice único falla → 422 `TIE-001` | sí |

## Invariantes
- Toda tienda tiene exactamente un `PROPIETARIO` en personal, un balance y una suscripción no cancelada.

## Pruebas del flujo
- Crear tienda → existen las filas relacionadas y la auditoría; fallo simulado en el paso 6 → no queda ninguna (rollback).
- Segunda tienda del mismo usuario → suscripción `VENCIDA` y la vitrina responde `TIE-404`.
