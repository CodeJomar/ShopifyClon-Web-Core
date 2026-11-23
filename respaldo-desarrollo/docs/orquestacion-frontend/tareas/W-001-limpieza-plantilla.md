# W-001 — Limpieza de la plantilla (de "coffly-flow" a OTemu)

| Campo | Valor |
|---|---|
| Modelo | Haiku |
| Rama | `tarea/W-001-limpieza-plantilla` desde `develop` |
| Depende de | — |
| Tamaño | M (mucho borrado, poco código nuevo) |

## Objetivo
Dejar el repositorio con la **estructura, la arquitectura y los estándares** de la plantilla, sin el negocio de cafetería, compilando y listo para construir OTemu. No se diseña nada ni se crean pantallas nuevas.

## Contexto (leer solo esto)
- `docs/arquitectura-frontend.md` (sección "Estructura de carpetas")
- `docs/orquestacion-frontend/tablero.md`, sección "Hallazgos del análisis de la plantilla"

## Alcance

### 1. Borrar (negocio ajeno)
- `src/modules/`: `pos`, `kds`, `menu`, `local-equipo`, `transacciones`, `dashboard`, `home`, `perfil`.
- `src/app/(workspace)/` completo (las pantallas del panel se rehacen en W-007).
- `src/dtos/`: todo **salvo** `dtos/core` y `dtos/auth`.
- `src/lib/realtime/` y la dependencia `socket.io-client` (`npm uninstall`).
- `src/shared/utils/mesa-visual.ts`, `src/shared/utils/categoria-visual.ts`, `src/shared/components/composed/bloqueo-movil.tsx` y `categoria-chips.tsx`.
- `src/app/api/route.ts` (el `/api` lo ocupará el proxy de W-003).
- `public/`: `file.svg`, `globe.svg`, `next.svg`, `vercel.svg`, `window.svg` y las imágenes de cafetería de `public/images` (si queda vacía, borrar la carpeta y quitar `images` del `matcher` de `src/proxy.ts`).

### 2. Conservar sin cambios de comportamiento
`shared/components/{ui,composed,layout}` (lo que quede), `shared/{hooks,providers,context,utils,constants}`, `lib/{api,connection,validations}`, `dtos/core`, `env.ts`, `modules/auth` y `app/(auth)` (W-004 los adapta), `modules/errors`, `app/playground`, `app/{error,loading,not-found}.tsx`, `.github/`.

### 3. Ajustar
- **Imports rotos**: todo lo que importaba lo borrado se corrige o se elimina. `shared/constants/navegacion.ts` y `permisos.ts` quedan con arreglos vacíos tipados y un `// TODO(W-007)`; `app-sidebar.tsx` debe compilar con la navegación vacía.
- **Nombre**: `package.json` → `"name": "otemu"`; `metadata` de `app/layout.tsx` → título "OTemu", descripción "Crea tu tienda en línea y vende por redes". Sustituir "Coffy Flow", "coffly", "cafetería" en textos visibles de `app/(auth)`, `modules/auth`, `modules/errors` y `app/playground` por OTemu o por un texto neutro. Quitar `BloqueoMovil` de `app/layout.tsx`.
- **Raíz** `app/page.tsx`: deja de redirigir a `/home`; muestra un marcador simple ("OTemu — en construcción") con componentes existentes. Agregar `"/"` a las rutas públicas de `src/proxy.ts` (solo coincidencia exacta).
- **API Spring en vez de NestJS** (solo configuración; el proxy real es W-003):
  - `next.config.ts`: `API_INTERNAL_URL` por defecto `http://localhost:8080`; el *rewrite* pasa a `/api/:path*` → `${API_INTERNAL_URL}/api/v1/:path*`; la API no tiene endpoint de salud (sin actuator): quitar la regla `/estado-api` y hacer que `lib/connection/probar-api.ts` pruebe con `GET /api/planes` (pública); si no es pública, anotarlo y dejar `TODO(W-003)`. Quitar todo lo de `NEXT_PUBLIC_WS_URL` (CSP incluida) y los comentarios de NestJS/KDS.
  - `src/env.ts`: quitar `NEXT_PUBLIC_WS_URL`.
  - `Dockerfile`: quitar el bloque del WebSocket; `API_INTERNAL_URL` por defecto `http://localhost:8080`; comentarios a "API Spring".
  - `.env` local: quitar `NEXT_PUBLIC_WS_URL` y poner `API_INTERNAL_URL=http://localhost:8080` (no copiar valores al reporte). Crear `.env.example` con las variables sin secretos.
  - `.github/DEPLOY.md` y `README.md`: reemplazar referencias a NestJS, KDS y cafetería; el README describe OTemu en 10–20 líneas (qué es, cómo levantar, scripts).
- **`CLAUDE.md`**: conservar `@AGENTS.md` y agregar debajo un bloque corto: proyecto OTemu, leer `../docs/arquitectura-frontend.md` y `../docs/orquestacion-frontend/README.md` antes de programar, comandos `npm run lint` / `npx tsc --noEmit` / `npm run build`.

## Fuera de alcance
- Proxy con cookie del JWT, `ErrorApi`, sesión (W-003). Diseño, colores, fuentes (W-002). Pantallas nuevas.
- Adaptar `modules/auth` a los endpoints de Spring (W-004): solo debe compilar.

## Criterios de aceptación
- [ ] `grep -riE "coffy|coffly|cafeter|kds|mesa|nestjs|socket" src Dockerfile next.config.ts README.md .github` sin resultados (salvo falsos positivos justificados en el reporte).
- [ ] `npm run lint`, `npx tsc --noEmit` y `npm run build` sin errores (pegar la salida real).
- [ ] `npm run dev`: `/` muestra el marcador sin sesión; `/login` y `/playground` cargan a 375 y 1280 px sin errores en consola (capturas).
- [ ] El reporte lista lo borrado por carpeta y cualquier archivo conservado que dependa de algo dudoso.
