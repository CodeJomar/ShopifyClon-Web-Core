# W-017 — Panel de plataforma: planes, suscripciones y comisiones (base funcional)

| Campo | Valor |
|---|---|
| Ejecutor | Antigravity (sin navegador), en worktree `Desarrollo/wt/W-017`, puerto 3100 |
| Rama | `tarea/W-017-plataforma` desde `develop` |
| Depende de | W-007-C1, W-013 (mergeadas) |
| Tamaño | M |

## Objetivo
El **administrador de plataforma** (no es un rol de tienda: es la bandera `es_administrador_plataforma` del usuario) gestiona los planes de suscripción, ve las suscripciones de todas las tiendas, suspende y reactiva tiendas con motivo, y consulta las comisiones por tienda. Prioridad: **que funcione e integre con la API**. Sin pulido visual y **sin capturas**.

## Contexto (leer solo esto)
- `docs/arquitectura-frontend.md` y `docs/negocio/01-actores-roles-permisos.md` (administrador de plataforma)
- `docs/negocio/modulos/suscripciones.md` (SUS-010 suspender, SUS-013 eliminar plan) y `docs/negocio/modulos/balances-y-metricas.md` (comisiones)
- Código a imitar: `src/modules/cupones/` (lista + filtros + `FormPanel` + confirmación), `src/modules/suscripcion/` (W-013), el layout compartido del panel y de la cuenta (W-007-C1: `src/app/cuenta/layout.tsx` funciona **sin tienda activa**), `src/shared/constants/navegacion.ts`, `src/proxy.ts` (`/plataforma` ya exige sesión), `src/modules/auth/views/login-view.tsx` (destino tras el login)

## Contrato de la API (verificado por Opus; JSON en `snake_case`; **sin** `X-Tienda-Id`; si el usuario no es administrador de plataforma la API responde **404** (SEG-006))
| Acción | Endpoint | Cuerpo / respuesta |
|---|---|---|
| Planes | `GET /plataforma/planes` | `[{ codigo, nombre, descripcion?, precio_mensual, precio_anual?, moneda, limite_productos?, limite_personal, porcentaje_comision, dias_prueba, es_publico, orden }]` |
| Crear plan | `POST /plataforma/planes` | `{ codigo (^[A-Z_]{3,30}$), nombre, descripcion?, precio_mensual, precio_anual?, moneda (^[A-Z]{3}$), limite_productos? (null = ilimitado), limite_personal, porcentaje_comision (0 a 0.10, fracción), dias_prueba, es_publico?, orden? }` |
| Editar plan | `PUT /plataforma/planes/{codigo}` | igual sin `codigo` |
| Eliminar plan | `DELETE /plataforma/planes/{codigo}` | SUS-013: con suscripciones no se elimina (mostrar el `mensaje`; ofrecer marcarlo no público) |
| Suscripciones | `GET /plataforma/suscripciones?estado=&pagina=0` | `Paginado<{ tienda_id, subdominio, codigo_plan, estado, fin_periodo_actual }>` |
| Suspender / reactivar tienda | `POST /plataforma/tiendas/{tiendaId}/suspender` · `/reactivar` | `{ motivo }` (confirmar límites en Swagger) |
| Comisiones | `GET /plataforma/metricas/comisiones?pagina=0` | `Paginado<ComisionTienda>` (confirmar campos en Swagger) |

La comisión se muestra y se escribe en **porcentaje** (2 ↔ 0.02) y se envía como fracción (como el impuesto en W-012). Montos con `formatearDinero` y la moneda que devuelva la API.

## Pantallas (`src/app/plataforma/…`, módulo `src/modules/plataforma/`)
- **Layout**: el mismo armazón (barra lateral + encabezado) que la cuenta, **sin depender de una tienda activa**. Navegación propia de plataforma: Planes (`/plataforma/planes`), Suscripciones (`/plataforma/suscripciones`), Comisiones (`/plataforma/comisiones`); `/plataforma` redirige a planes. Si el usuario no es administrador de plataforma (`GET /cuenta/perfil` → `es_administrador_plataforma`), mostrar "No tienes acceso" (la API igual responde 404).
- **Acceso**: tras el login, un usuario con `es_administrador_plataforma` y **sin tiendas** va a `/plataforma` (ajustar el destino en `login-view.tsx` sin cambiar los demás casos). Si tiene tiendas, sigue el destino actual; se llega a plataforma desde un enlace "Plataforma" en la barra lateral, visible solo para administradores de plataforma.
- **Planes**: lista (código, nombre, precio, límites, comisión, días de prueba, público/oculto, orden); crear y editar en `FormPanel` (el código solo al crear); eliminar con confirmación.
- **Suscripciones**: filtro por estado (Prueba, Activa, Vencida, Cancelada, Suspendida), tabla con subdominio (enlace a la vitrina), plan, estado (insignia) y fin del periodo; acciones "Suspender" (si no está suspendida) y "Reactivar" (si está suspendida), ambas con confirmación y motivo; `BarraPaginacion`.
- **Comisiones**: tabla paginada con lo que devuelva la API.
- Errores: `mensaje` de la API en `Alert`/toast; `validaciones` en los campos. Botones del pie de `FormPanel` directos, sin `div`. No crear ni modificar nada en `src/shared/components/**` ni `globals.css`.

## Verificación sin navegador
Iniciar sesión **a través de la web** con `curl` (guardando la cookie) con la cuenta **`admin.prueba@otemu.test`** (contraseña en `docs/orquestacion-frontend/datos-de-prueba.md`) y probar por el proxy `http://localhost:3100/api/…`. Para el caso "sin acceso", iniciar sesión con la cuenta principal (que no es administrador de plataforma). Borrar el archivo de cookies al terminar; nunca copiar la contraseña ni la cookie al reporte.

**Datos compartidos**: Haiku trabaja en paralelo con "Tienda W006 Prueba". **Suspender y reactivar solo "Tienda W006 Dos"** (`39daf672-c629-4403-a368-b462dd9ee252`) y dejarla reactivada. **No editar los planes existentes** (BASICO, ESTANDAR, AVANZADO): crear un plan de prueba `PRUEBA_W017`, editarlo y eliminarlo.

## Criterios de aceptación (con la API real)
- [ ] Login de `admin.prueba@otemu.test` → destino `/plataforma`; las páginas `/plataforma/planes`, `/suscripciones` y `/comisiones` responden 200 con la cookie.
- [ ] Con la cuenta principal (no administradora), `GET /api/plataforma/planes` → 404 y la página muestra "No tienes acceso".
- [ ] Crear `PRUEBA_W017` (comisión 3 % → 0.03), editarlo (nombre y precio), marcarlo no público y eliminarlo. Código inválido (`prueba`) → error; comisión 15 % → error.
- [ ] Intentar eliminar `BASICO` (tiene suscripciones) → el mensaje de SUS-013, sin borrar nada.
- [ ] Suscripciones: listar y filtrar por estado; suspender "Tienda W006 Dos" con motivo → estado SUSPENDIDA; reactivarla → vuelve al estado anterior (anotar ambos).
- [ ] Comisiones: la lista responde sin errores.
- [ ] `npm run lint`, `npx tsc --noEmit` y `npm run build` sin errores.
- [ ] Reporte con la tabla de peticiones y su resultado (**sin capturas**) y el estado final de "Tienda W006 Dos".
- [ ] **No detener la API** al terminar.
