# Tablero del frontend

Estados: `pendiente` · `lista` · `en curso` · `en revisión` · `hecha`. Cada tarea se escribe cuando su dependencia está hecha.

## Decisiones del responsable (2026-10-19)
| ID | Pregunta | Decisión |
|---|---|---|
| QW-001 | Identidad y diferenciador (Q-010) | Nombre del producto: **OTemu**. Tono y diferenciador se fijan en W-000 |
| QW-002 | Paleta, tipografía y estilo visual | Plantilla HTML entregada (2026-10-19): marca `#00E699` + blanco, **DM Sans**; componentes elegidos: input outlined cut, botones y variantes, insignias, toast, paginación y estado vacío. Layout actual se mantiene hasta que el responsable proponga su recomposición |
| QW-003 | ¿Temas por tienda? | **No**: misma identidad OTemu para todas las vitrinas (la tienda solo aporta nombre, productos e imágenes; el backend no tiene logo) |
| QW-004 | Imágenes | **Las dos opciones**: pegar URL `https` o subir archivo. Subir depende del ajuste de backend **A-001** (`docs/orquestacion/ajustes/`) |
| QW-005 | Rutas de la vitrina | **Por ruta en todos los entornos**: `/tienda/{subdominio}/…`, un solo juego de páginas con segmento dinámico `[subdominio]` (Railway gratis no da subdominios comodín). El `subdominio` del backend se usa como identificador en la URL |
| QW-006 | Pago en línea | **Simulado** en v1: solo pago manual (el comprador elige el método y el comerciante confirma en el panel). Sin `@stripe/stripe-js` |
| QW-007 | Pruebas end-to-end | Sí, Playwright en W-018, lo implementa un ejecutor |
| QW-008 | Base del proyecto | La plantilla actual (ex "coffly-flow") se conserva en estructura y estándares (`src/modules`, `src/dtos`, `src/shared`, `lib/api` con axios, providers, playground) y se limpia su negocio en W-001 |
| QW-009 | Despliegue | Railway (capa gratuita), con el `Dockerfile` y `railway.json` existentes |
| QW-010 | Texto sobre el verde: blanco da 1.6:1 (no cumple AA) | **Blanco** sobre `#00E699`, excepción a AA aceptada por el responsable; mitigación en `docs/diseno-web.md` §2 |
| QW-011 | Recomposición del layout | Definida por el responsable el 2026-10-22 → **W-007-C1** |

## Hallazgos del análisis de la plantilla (2026-10-19)
- Negocio ajeno a borrar: `modules/` pos, kds, menu, local-equipo, transacciones, dashboard, home; sus `dtos/`, `lib/realtime` (socket.io), `shared/utils/{mesa,categoria}-visual.ts`, `shared/constants/{navegacion,permisos}.ts` (se reescriben luego), `BloqueoMovil` (bloquea el móvil: choca con "móvil primero").
- Se conserva: `shared/components/ui` (shadcn, ~60), `shared/components/composed` (form-panel, estados vacío/error, floating inputs, search…), `ConfirmProvider`, toast, `lib/connection` (aviso de API caída), hooks genéricos (`use-clave-idempotencia`, `useEntityList/Form`…), `dtos/core` (respuesta base, paginación, dinero), `env.ts`, `/playground`, CI de GitHub (lint, tsc, build, audit).
- **Sesión**: la plantilla espera cookies `httpOnly` emitidas por la API (NestJS) y renovación con `/auth/refresh`. Nuestra API (Spring) **devuelve el JWT en el cuerpo de `/auth/login`** y no tiene refresh. Solución sin tocar el backend (W-003): el `/api/*` del mismo origen deja de ser un *rewrite* y pasa a un **route handler proxy de Next** que guarda el JWT en cookie `httpOnly` al hacer login y agrega `Authorization` y `X-Tienda-Id` al reenviar a `/api/v1`. El navegador sigue usando el cliente axios de la plantilla y nunca ve el token.
- `Dockerfile`, `next.config.ts` y `.env` hablan de NestJS (`:4000`) y del WebSocket del KDS: se corrigen a la API Spring (`:8080`, `/api/v1`) y se retira lo del KDS.

## Fase 0 — Diseño y fundaciones
| ID | Tarea | Modelo | Depende | Estado |
|---|---|---|---|---|
| W-000 | **Dirección de diseño** OTemu a partir de la plantilla HTML del responsable: tokens, guía de componentes y mapa de pantallas (`docs/diseno-web.md`) | Opus | plantilla HTML | hecha |
| W-001 | Limpieza de la plantilla: borrar el negocio de cafetería (POS, KDS, mesas, menú, cajas, dashboard), socket.io y `BloqueoMovil`; renombrar a OTemu; apuntar config a la API Spring; `CLAUDE.md` de la web | Haiku | — | hecha |
| W-002 | Sistema de diseño OTemu en `shared`: tokens claro/oscuro, DM Sans, botones, campos outlined cut, insignias, toast/alertas, estado vacío, paginación, islas; repintar layout, diálogos y paneles sin cambiar estructura; `/playground` de referencia | Sonnet | W-000, W-001 | hecha |
| W-002-C1 | Ajustes visuales pedidos por el responsable: hover con tintes `#00E699`, ghost, `warning` nuevo, sin `shadow`, select sin gris, etiqueta flotante sin rectángulo, íconos (referencia izquierda / acción derecha, ojo en contraseña) | Sonnet | W-002 | hecha |
| W-003 | Proxy `/api/*` de Next hacia `/api/v1` (JWT en cookie `httpOnly`, `X-Tienda-Id`, `X-Correlacion-Id`), adaptar el cliente axios y `ErrorApi` a `RespuestaApi`, sin refresh (401 → login), tienda activa, `proxy.ts` (rutas protegidas), formato de dinero y fechas | Sonnet | W-001, W-002 | hecha (prueba con la API real al inicio de W-004) |

## Fase 1 — Cuenta
| ID | Tarea | Modelo | Depende | Estado |
|---|---|---|---|---|
| W-004 | Auth: registro, activación por código de 6 dígitos (reenviar), login, recuperar clave, cerrar sesión; marcador `/cuenta`; arranca verificando W-003 con la API real | Sonnet | W-002-C1, W-003 | hecha |
| W-005 | Cuenta: perfil, contraseña, direcciones, "mis órdenes" | Haiku | W-004, W-006 | hecha |
| W-006 | Crear tienda (planes, subdominio, prueba gratis) y selector de tienda | Sonnet | W-004 | hecha |

## Fase 2 — Panel del comerciante
| ID | Tarea | Modelo | Depende | Estado |
|---|---|---|---|---|
| W-007 | Layout del panel: navegación según rol, banner de suscripción vencida (`SUS-017`), inicio con métricas (`/panel/metricas`) | Sonnet | W-006 | hecha |
| W-007-C1 | Recomposición del layout pedida por el responsable: marca = tienda activa (home), "Dashboard", encabezado limpio con menú de usuario (Ver perfil, Configuración, Cerrar sesión), cuenta dentro del layout con pestañas y tema en Preferencias | Sonnet | W-007 | hecha |
| W-008 | Catálogo (base funcional): categorías, productos, variantes, imágenes por URL, categorías del producto, publicar | Haiku | W-007-C1 | hecha |
| W-008-C1 | Subir imagen de producto desde el equipo (usa A-001) | Haiku | W-008, A-001 | hecha |
| W-009 | Inventario: stock por variante, ajuste con motivo, historial | Haiku | W-008 | hecha |
| W-010 | Cupones y tarifas de envío | Antigravity | W-007 | hecha (errores en campo: revisar en pantalla) |
| W-011 | Órdenes: listado con filtros, detalle, pago manual, envío (preparar, despachar, entregar), cancelar, reembolsar | Haiku | W-007 | hecha |
| W-012 | Configuración de tienda y personal (roles, motivo) | Antigravity | W-007 | hecha |
| W-013 | Suscripción: plan actual, uso vs límites, pagar, cambiar plan, cancelar | Antigravity | W-007 | hecha |

## Fase 3 — Vitrina y compra
| ID | Tarea | Modelo | Depende | Estado |
|---|---|---|---|---|
| W-014 | Vitrina en `/tienda/[subdominio]`: portada, catálogo con filtros, detalle de producto con variantes, categorías | Sonnet | W-002, W-003 | hecha |
| W-015 | Carrito: agregar, cantidades, cupón, avisos (`CAR-004/006`), fusión al iniciar sesión | Haiku | W-014 | hecha (vinculación al login: probar con dos carritos) |
| W-016 | Checkout idempotente (datos, dirección, tarifa, total esperado, `CHK-004`), pago manual (simulado, QW-006), página de estado por token | Haiku | W-015 | hecha |
| W-016-C1 | Checkout con la cotización de envío de la API (A-003): sin CHK-004 sistemático | Haiku | W-016, A-003 | hecha |

## Fase 4 — Plataforma y calidad
| ID | Tarea | Modelo | Depende | Estado |
|---|---|---|---|---|
| W-017 | Panel de plataforma: planes, suscripciones, suspender/reactivar, comisiones | Antigravity | W-007 | hecha |
| W-018 | Calidad: pruebas end-to-end de los flujos críticos (alta de tienda, compra completa), accesibilidad y revisión responsiva final | Antigravity | todas | hecha |

## Revisión de diseño pendiente del responsable
> Desde 2026-10-21 la prioridad es funcionalidad e integración; esta lista es material para cuando el responsable trabaje el diseño.
Patrones visuales nuevos creados **dentro de un módulo** y mergeados mientras el responsable está ausente (desde 2026-10-21). Revisarlos con sus capturas; si algo no gusta, se corrige en una tarea `-C`.

| Patrón | Dónde | Tarea | Capturas |
|---|---|---|---|
| Tarjeta de plan seleccionable (radio con teclado; seleccionada: borde y anillo `#00E699`, check e insignia "Recomendado") | `modules/tienda/components/tarjeta-plan.tsx` | W-006 | `reportes/W-006/tarjeta-{reposo,hover,seleccionada,foco}-{claro,oscuro}.png`, `nueva-paso1-*.png`. Nota de Opus: en la tarjeta seleccionada, la insignia y el check comparten fila con el título y lo hacen saltar de línea en 1280 px |
| **Componente base** `ui/panel.tsx` (`PanelFooter`): la línea superior del pie del panel lateral es verde (`border-brand-strong`, herencia del repintado de W-002). ¿Debería ser el borde neutro `--border`? No se tocó: es componente base | `shared/components/ui/panel.tsx` | W-005 | `reportes/W-005/panel-direccion-error-1280-claro.png` |
| Tarjeta de métrica (título 12.5, monto 22/800, ícono y ayuda) | `modules/metricas/components/tarjeta-metrica.tsx` | W-007 | `reportes/W-007/tarjeta-metrica-reposo-{claro,oscuro}.png`, `inicio-*.png` |
| Aviso de suscripción no activa (`Alert` de aviso con botón "Pagar suscripción" para el propietario). Ya se ve en pantalla (Tienda W006 Dos no está operativa) | `modules/panel/components/panel-shell.tsx` | W-007 | `reportes/W-007-C1/cuenta-1280-claro.png` |
| Encabezado de la plantilla en el panel: insignia del rol como botón verde "Propietario" y "CERRAR SESIÓN" en mayúsculas (herencia de `workspace-header`, no se tocó) | `shared/components/layout/workspace-header.tsx` | W-007 | `reportes/W-007/inicio-1280-claro.png` |
| **Componente base** `composed/floating-input.tsx`: la etiqueta no se recorta cuando hay ícono de acción a la derecha; en columnas angostas "Confirma la contraseña nueva" pasa por debajo del ojo. Debería truncarse antes del ícono (`max-w` con el padding derecho) | `shared/components/composed/floating-input.tsx` | W-007-C1 | `reportes/W-007-C1/cuenta-1280-claro.png` |

## Observaciones para tareas futuras
- **W-004**: validar `siguiente` del login antes de redirigir (solo rutas internas: empieza con `/` y no con `//` ni `/\`), para evitar redirecciones abiertas. Primer paso de W-004: ejecutar con la API real los criterios pendientes de W-003 (login, perfil con y sin cookie, `ErrorApi` con códigos reales).
- **Componentes base cerrados (2026-10-20)**: crear o modificar un componente de `shared/components` exige avisar al responsable para que revise el diseño **antes** del merge. Cada tarea W-XXX dice en "Fuera de alcance" que no se tocan componentes base, o nombra el componente nuevo y pide capturas de detalle.
- W-004: `ThemeProvider` fuerza tema claro en las rutas de login (`forcedTheme`, herencia de la plantilla); quitarlo para que auth respete claro/oscuro.
- Logo de OTemu: provisional el ícono `Store` de lucide hasta que el responsable entregue uno.
- Ilustraciones de error: provisionales (`IlustracionTienda`).
- `next dev` reescribe el encabezado de `AGENTS.md`: no incluir ese cambio en los commits.

## Paralelo posible
Tras W-003: W-004 y W-014 en paralelo. Tras W-007: W-008, W-010, W-011, W-012 y W-013 en paralelo (con worktrees).
