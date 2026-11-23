# W-003 — Proxy de API, sesión en cookie y cliente único

| Campo | Valor |
|---|---|
| Modelo | Sonnet (revisión estricta de Opus: seguridad) |
| Rama | `tarea/W-003-cliente-api-y-sesion` desde `develop` |
| Depende de | W-001, W-002 (mergeadas) |
| Tamaño | M |

## Objetivo
El navegador habla solo con `/api/*` de la propia web. Un proxy de Next reenvía a la API Spring (`/api/v1`), guarda el JWT en una cookie `httpOnly` y agrega las cabeceras que la API exige. El cliente axios de la plantilla desempaqueta `RespuestaApi` y convierte los errores en `ErrorApi`. **Ninguna pantalla nueva**: esta tarea deja la tubería lista para W-004 en adelante.

## Contexto (leer solo esto)
- `docs/arquitectura-frontend.md`, reglas 1–6
- `docs/negocio/modulos/transversal.md`: formato de respuesta, códigos `SEG-*` y cabeceras
- Swagger: `http://localhost:8080/api/v1/swagger-ui/index.html` (secciones Autenticación y Cuenta)
- Código actual: `next.config.ts`, `src/proxy.ts`, `src/env.ts`, `src/lib/api/`, `src/lib/connection/`, `src/dtos/core/`, `src/shared/utils/{dinero,fechas,toast-response}.ts`, `src/shared/hooks/use-clave-idempotencia.ts`

## Contrato real de la API (verificado por Opus)
- Base: `${API_INTERNAL_URL}/api/v1` (`server.servlet.context-path=/api/v1`).
- **JSON en `snake_case`** (`spring.jackson.property-naming-strategy=SNAKE_CASE`), en peticiones **y** respuestas. Los tipos de `src/dtos` reflejan la API tal cual, en `snake_case`; no hay capa de conversión.
- Respuesta única: `{ exito, codigo_estado, codigo?, mensaje?, datos?, detalles?, validaciones?, ruta?, id_correlacion?, marca_tiempo }` (los nulos se omiten).
- Paginado: `datos = { datos: T[], total, pagina_actual, tamano_pagina, total_paginas, tiene_mas_paginas, marca_tiempo }`.
- `POST /auth/login` → `datos = { token, tipo, expira_en, usuario, tiendas: [{ tienda_id, nombre, subdominio, rol }] }`. JWT de 24 h, **sin refresh ni logout** en la API.
- Cabeceras: `Authorization: Bearer`, `X-Tienda-Id` (rutas `/panel/**`), `X-Correlacion-Id`, `Idempotency-Key` (checkout y cobros), `X-Carrito-Token` (vitrina; se usa en W-015).
- Fechas en ISO UTC; montos `BigDecimal` como número JSON.

## Alcance
1. **Proxy** `src/app/api/[...ruta]/route.ts` (GET, POST, PUT, PATCH, DELETE):
   - Reenvía a `${API_INTERNAL_URL}/api/v1/<ruta>?<query>` (variable de servidor, sin `NEXT_PUBLIC_`). Rechaza segmentos `.`/`..` o vacíos (400). Nunca construye la URL de destino con datos que no sean la ruta y la query.
   - Pasa el cuerpo tal cual con su `Content-Type` (debe servir también para `multipart/form-data` de A-001). Copia solo estas cabeceras de la petición: `Content-Type`, `Accept`, `Idempotency-Key`, `X-Carrito-Token`. Agrega `Authorization` desde la cookie de sesión, `X-Tienda-Id` desde la cookie de tienda activa y `X-Correlacion-Id` (el recibido o `crypto.randomUUID()`).
   - Devuelve estado, cuerpo y `Content-Type` de la API, más `X-Correlacion-Id`. No reenvía `Set-Cookie` de la API.
   - **Login**: si la ruta es `auth/login` y la respuesta es 200, guarda `datos.token` en la cookie de sesión y **lo quita del cuerpo** antes de responder. Si `datos.tiendas` tiene exactamente una, fija también la cookie de tienda activa.
   - Si la API responde 401 a una petición que llevaba sesión, borra la cookie de sesión en esa misma respuesta.
   - Timeout de 15 s hacia la API; si no contesta, 502 con un cuerpo `RespuestaApi` de error (`codigo: "WEB-001"`, mensaje "No pudimos conectar con el servidor. Intenta de nuevo.").
2. **Cookies** (`src/lib/sesion/cookies.ts`, solo servidor): `otemu_sesion` (JWT) y `otemu_tienda` (UUID). Ambas `httpOnly`, `SameSite=Lax`, `Path=/`, `Secure` en producción. La de sesión expira en `expira_en`; la de tienda, a los 30 días.
3. **Rutas propias de sesión** `src/app/api/sesion/route.ts` (tienen prioridad sobre el catch-all; no van a la API): `DELETE` cierra sesión (borra ambas cookies); `PUT { tienda_id }` fija la tienda activa (valida formato UUID; la API valida la pertenencia en cada uso con `SEG-001`).
4. **Retirar** el *rewrite* `/api/:path*` de `next.config.ts` y su `TODO(W-003)`.
5. **Cliente** (`src/lib/api/client.ts`): axios hacia `/api`. Se quitan la renovación por `/auth/refresh` y `sesion-reemplazada.ts` (la API no tiene nada de eso). Funciones tipadas que devuelven `datos` ya desempaquetados. Los errores se lanzan como `ErrorApi`.
   - Clase `ErrorApi` en `src/lib/api/error-api.ts`: `{ estado, codigo, mensaje, validaciones, detalles, idCorrelacion }`. Si no hay respuesta, `codigo: "WEB-001"`.
   - Ante un 401 fuera de `auth/*`, va a `/login?siguiente=<ruta actual>`.
   - Mantener el aviso de conexión (`lib/connection`).
6. **Tipos** (`src/dtos/core`): `RespuestaApi<T>`, `Paginado<T>` y `ErrorApi`, con el contrato de arriba. Lo que ya no se use del núcleo de la plantilla (`BaseResponse`, `paginator`, `createResponse`…) se adapta o se borra, y se corrigen sus usos (`toast-response.ts`, hooks `useEntity*`).
7. **`src/proxy.ts`** (guard de navegación): cookie `otemu_sesion`. Se invierte la lógica: **solo** `/panel`, `/cuenta` y `/plataforma` exigen sesión (sin ella, `/login?siguiente=…`); lo demás es público (`/`, `/tienda/*`, `/login`, `/registro`, `/activar-cuenta`, `/forgot-password`, `/playground`).
8. **Formato** (`src/shared/utils/dinero.ts`, `fechas.ts`): `formatearDinero(monto, moneda)` con `Intl.NumberFormat("es-PE", { style: "currency", currency })` y `formatearFecha(isoUtc, zonaHoraria?)` con `date-fns`; por defecto `America/Lima`. Se quita lo que fuera de la cafetería.
9. **`.env.example`**: `API_INTERNAL_URL=http://localhost:8080`. `env.ts` ya no expone la URL de la API al navegador si nada la usa.

## Fuera de alcance
- Pantallas de login, registro y panel (W-004 y siguientes). `modules/auth` solo se ajusta para compilar con el cliente nuevo.
- Token del carrito (W-015) y pruebas e2e (W-018).
- **Componentes visuales** (`src/shared/components/**`, `globals.css`, `/playground`): están cerrados y aprobados por el responsable. No se modifican ni se crean; si hiciera falta uno, se anota en el reporte como pendiente.

## Criterios de aceptación (con la API levantada: `docker compose up -d --build api-core` desde `Desarrollo/`)
- [ ] `curl -i -X POST localhost:3000/api/auth/login` con un usuario de prueba activo creado por la API (anotar cómo se creó; no usar cuentas reales): 200, `Set-Cookie: otemu_sesion=…; HttpOnly; SameSite=Lax` y **sin `token` en el cuerpo**.
- [ ] Con esa cookie, `GET /api/cuenta/perfil` → 200; sin ella → 401 con `RespuestaApi` y `codigo`.
- [ ] `GET /api/planes` (pública) → 200 sin cookie; un error de validación devuelve `validaciones` intacto.
- [ ] `GET /api/..%2F..%2Fetc` y similares → 400; la petición no llega a la API.
- [ ] Con la API detenida: 502 con `codigo: "WEB-001"`, y el aviso de conexión aparece en `/playground`.
- [ ] `DELETE /api/sesion` borra las cookies; `PUT /api/sesion` con un UUID inválido → 400.
- [ ] Navegador: `/panel` sin sesión redirige a `/login?siguiente=%2Fpanel`; `/`, `/tienda/x` y `/playground` cargan sin sesión.
- [ ] En DevTools, `document.cookie` **no** muestra `otemu_sesion`.
- [ ] `npm run lint`, `npx tsc --noEmit` y `npm run build` sin errores.
- [ ] Reporte: tabla de las peticiones probadas con estado y fragmento de respuesta (sin pegar el JWT).

## Riesgos y notas para el ejecutor
- No registrar el JWT ni el cuerpo del login en consola ni en el reporte.
- `route.ts` del catch-all corre en el runtime de Node (no Edge) para poder usar `fetch` con timeout y el cuerpo binario.
- Next 16: revisar en `node_modules/next/dist/docs/` cómo se leen y escriben cookies en route handlers (`cookies()` es asíncrono) y cómo se tipan los `params` (también asíncronos).
