# W-013 — Suscripción de la tienda (base funcional)

| Campo | Valor |
|---|---|
| Ejecutor | Antigravity (sin navegador), en worktree `Desarrollo/wt/W-013`, puerto 3100 |
| Rama | `tarea/W-013-suscripcion` desde `develop` |
| Depende de | W-007-C1 (mergeada) |
| Tamaño | M |

## Objetivo
El **propietario** ve su plan actual, el estado de la suscripción, el periodo, el uso frente a los límites del plan (productos y personal), y puede pagar o reactivar, cambiar de plan, cancelar y revertir la cancelación. El pago usa la **pasarela simulada** de la API. Prioridad: **que funcione e integre con la API**. Sin pulido visual y **sin capturas**.

## Contexto (leer solo esto)
- `docs/arquitectura-frontend.md` y `docs/negocio/modulos/suscripciones.md` (SUS-001…018, en especial SUS-004, SUS-008, SUS-009, SUS-017)
- Código a imitar: `src/modules/tienda/` (configuración de W-012: formulario y confirmación con motivo), `src/modules/tienda/components/tarjeta-plan.tsx` (planes, W-006), `src/modules/panel/hooks/use-panel.tsx` (`rol`, `tienda`), marcador `src/app/panel/suscripcion/page.tsx`, aviso de suscripción en `src/modules/panel/components/panel-shell.tsx`

## Contrato de la API (verificado por Opus; JSON en `snake_case`; con `X-Tienda-Id`; permiso `SUSCRIPCION_GESTIONAR` = solo `PROPIETARIO`)
| Acción | Endpoint | Cuerpo / respuesta |
|---|---|---|
| Ver | `GET /panel/suscripcion` | `{ estado, codigo_plan, nombre_plan, ciclo, precio_pactado, moneda, inicio_periodo, fin_periodo, fecha_fin_prueba?, cancelar_al_finalizar_periodo, uso: { productos, personal }, limites: { productos?, personal } }` (límite `null` = ilimitado; confirmar nombres en Swagger) |
| Planes | `GET /planes` (pública) | como en W-006 |
| Pagar / reactivar | `POST /panel/suscripcion/pagar` | `{ token_pago, codigo_plan? }` (+ ciclo si el DTO lo pide: confirmar en Swagger) |
| Cambiar de plan | `POST /panel/suscripcion/cambiar-plan` | `{ codigo_plan, token_pago? }` · SUS-008: bajar de plan exige no superar los límites del destino |
| Cancelar | `POST /panel/suscripcion/cancelar` | `{ motivo }` · SUS-009: en `ACTIVA` se cancela al fin del periodo; en `PRUEBA`, inmediato |
| Revertir cancelación | `POST /panel/suscripcion/revertir-cancelacion` | — |

**Pasarela simulada**: aprueba cualquier `token_pago` salvo **`tok_rechazar`**. La web no pide datos de tarjeta: un selector "Pago simulado: aprobar / rechazar" que envía `tok_simulado` o `tok_rechazar`, con el texto "Modo de prueba: no se cobra dinero real". Estos endpoints están permitidos aunque la suscripción esté vencida (SUS-017).

## Pantalla `/panel/suscripcion`
- **Resumen**: plan (nombre y precio pactado con `formatearDinero`), estado en español con insignia (Prueba gratis, Activa, Vencida, Cancelada, Suspendida), ciclo, inicio y fin del periodo (`formatearFecha`), fin de la prueba si aplica y el aviso "Se cancelará el {fecha}" si `cancelar_al_finalizar_periodo`.
- **Uso del plan**: productos `uso/límite` (o "ilimitados") y personal `uso/límite`.
- **Acciones** (solo el propietario; los demás roles ven el resumen en solo lectura):
  - "Pagar suscripción" / "Reactivar" cuando el estado es `PRUEBA`, `VENCIDA` (y donde la API lo permita), con el pago simulado.
  - "Cambiar de plan": lista de planes (reusar `TarjetaPlan`), confirmación y pago simulado si la API lo pide; mostrar el `mensaje` si la API rechaza la bajada (límites).
  - "Cancelar suscripción" con confirmación y motivo; "Revertir cancelación" si `cancelar_al_finalizar_periodo`.
- Tras cada acción, recargar la suscripción **y** el estado de la tienda del panel (el aviso de suscripción no activa debe desaparecer o aparecer según `operativa`).
- Errores: `mensaje` de la API en `Alert`/toast; `validaciones` en los campos.
- No crear ni modificar nada en `src/shared/components/**` ni `globals.css`.

## Verificación sin navegador
Igual que W-012: iniciar sesión **a través de la web** con `curl` guardando la cookie y probar por el proxy `http://localhost:3100/api/…`. **Todas las pruebas en "Tienda W006 Dos"** (`39daf672-c629-4403-a368-b462dd9ee252`), fijándola con `PUT /api/sesion`. **Nunca** en "Tienda W006 Prueba" (`826d8c0c-…`): Haiku hace compras de prueba en esa vitrina en paralelo y cancelar o cambiar su plan podría dejarla no operativa. Borrar el archivo de cookies al terminar; nunca copiar la contraseña ni la cookie al reporte.

## Fuera de alcance
- Panel de plataforma (W-017). Stripe real. Pulido visual.

## Criterios de aceptación (con la API real, en "Tienda W006 Dos")
- [ ] `GET /panel/suscripcion` responde y la página `/panel/suscripcion` responde 200 con la cookie; anotar el estado inicial.
- [ ] Pago simulado rechazado (`tok_rechazar`) → el mensaje de la API; pago aprobado → estado `ACTIVA` y la tienda pasa a `operativa: true` en `GET /panel/tienda`.
- [ ] Cambiar de plan (por ejemplo a ESTANDAR o BASICO) → el plan cambia; si la API rechaza una bajada, se muestra su mensaje.
- [ ] Cancelar con motivo → `cancelar_al_finalizar_periodo: true`; revertir → `false`.
- [ ] `npm run lint`, `npx tsc --noEmit` y `npm run build` sin errores.
- [ ] Reporte con la tabla de peticiones y su resultado (**sin capturas**) y el estado final de la suscripción de "Tienda W006 Dos" (queda pagada y activa: anotarlo).
- [ ] **No detener la API** al terminar (Haiku trabaja en paralelo).
