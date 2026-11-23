# W-018 — Pruebas end-to-end de los flujos críticos (Playwright)

| Campo | Valor |
|---|---|
| Ejecutor | Antigravity, en worktree `Desarrollo/wt/W-018`, puerto 3100 (Playwright corre el navegador en modo *headless*: no hace falta mirar la pantalla) |
| Rama | `tarea/W-018-pruebas-e2e` desde `develop` |
| Depende de | W-004…W-017 (mergeadas). W-016-C1 (checkout con cotización) puede llegar después: ver "Checkout" |
| Tamaño | M |

## Objetivo
Una suite de pruebas end-to-end que recorra en un navegador real los flujos críticos de OTemu contra la API real, para detectar regresiones con un solo comando. Decisión QW-007: Playwright, solo flujos críticos.

## Contexto (leer solo esto)
- `docs/arquitectura-frontend.md` y `docs/orquestacion-frontend/README.md` (Modo paralelo)
- Las tareas de los flujos que se prueban: `W-004-autenticacion.md`, `W-006-crear-tienda.md`, `W-008-catalogo.md`, `W-014-vitrina.md`, `W-015-carrito.md`, `W-016-checkout.md`, `W-011-ordenes.md`
- Credenciales y tiendas: `docs/orquestacion-frontend/datos-de-prueba.md`

## Alcance
1. **Dependencia nueva autorizada**: `@playwright/test` (versión exacta, en `devDependencies`) y el navegador Chromium (`npx playwright install chromium`). Ninguna otra.
2. `playwright.config.ts` en la raíz: `testDir: "e2e"`, `baseURL` desde `E2E_BASE_URL` (por defecto `http://localhost:3100`), solo Chromium, `workers: 1` (los flujos comparten datos), reintentos 0, `trace: "retain-on-failure"`. **Sin** `webServer` automático: el servidor se arranca a mano (`npm run start -- -p 3100`).
3. Credenciales **por variables de entorno** (`E2E_CORREO`, `E2E_CONTRASENA`), nunca en el código; si faltan, las pruebas que las necesitan se saltan con un mensaje claro. Agregar las variables (sin valores) a `.env.example`.
4. Script `"e2e": "playwright test"` en `package.json`. Carpetas de resultados (`test-results/`, `playwright-report/`) en `.gitignore`.
5. Pruebas en `e2e/` (selectores por rol y texto visible, `getByRole`/`getByLabel`; nada de clases CSS):
   - **auth.spec.ts**: login con credenciales incorrectas → mensaje `USR-004` sin recargar; login correcto → llega al panel o a la cuenta; cerrar sesión → `/cuenta` redirige a `/login`.
   - **vitrina.spec.ts**: `/tienda/tienda-w006-prueba` muestra un producto publicado; el detalle muestra precio y "Agregar al carrito"; `/tienda/no-existe` muestra "no está disponible".
   - **compra.spec.ts** (el flujo crítico): como invitado, agregar "Plato W008 UI" al carrito → carrito con total → checkout con datos y dirección → elegir tarifa → confirmar → página de la orden con número y "Pago pendiente". Guardar el número de orden en la salida de la prueba.
   - **panel.spec.ts**: con sesión, `/panel` (Dashboard) carga; la orden recién creada aparece en `/panel/ordenes`; registrar su pago manual → "Pagada".
6. **Checkout**: si W-016-C1 todavía no está en `develop`, la primera confirmación con envío recibe `CHK-004` ("El total cambió") y se confirma una segunda vez. La prueba debe aceptar **ambos** caminos (con o sin ese aviso) para no romperse cuando llegue W-016-C1, y dejar un comentario `TODO(W-016-C1)` para quitar el segundo camino.
7. `README.md` del repo web: sección corta "Pruebas end-to-end" (requisitos, variables, comandos).

## Reglas
- No crear ni modificar nada en `src/` (salvo que una prueba destape un **bug** real: no lo arregles, anótalo en el reporte). No tocar `src/shared/components/**` ni `globals.css`.
- Datos: las pruebas **crean** órdenes de prueba en "Tienda W006 Prueba" (es lo esperado; anotar cuántas). No cancelar ni modificar otras órdenes, tiendas, planes ni suscripciones. No tocar la base de datos.
- API compartida: si no responde, `docker compose up -d api-core` desde `Desarrollo/`; **nunca** detenerla, reiniciarla ni reconstruirla.

## Criterios de aceptación
- [ ] `npm run e2e` (con el servidor en 3100 y las variables puestas) pasa las 4 suites; pegar la salida real.
- [ ] Sin las variables de credenciales, las pruebas que las necesitan se saltan sin fallar.
- [ ] `npm run lint`, `npx tsc --noEmit` y `npm run build` sin errores (el config y las pruebas en TypeScript compilan).
- [ ] Reporte (**sin capturas**) con la salida de Playwright, las órdenes creadas, los bugs encontrados y lo no cubierto.
