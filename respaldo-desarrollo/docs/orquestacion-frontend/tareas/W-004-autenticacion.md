# W-004 — Autenticación: registro, activación, login y recuperación

| Campo | Valor |
|---|---|
| Modelo | Sonnet |
| Rama | `tarea/W-004-autenticacion` desde `develop` |
| Depende de | W-002-C1, W-003 (mergeadas) |
| Tamaño | M |

## Objetivo
Una persona crea su cuenta, la activa con el código de 6 dígitos que le llega por correo, inicia sesión, recupera su contraseña y cierra sesión, todo contra la API real. Al terminar existe una sesión válida (cookie `httpOnly` de W-003) que usarán las tareas siguientes.

## Contexto (leer solo esto)
- `docs/arquitectura-frontend.md` (reglas 1–7) y `docs/diseno-web.md` §1, §4.1, §4.2, §4.4
- `docs/negocio/modulos/identidad.md` (reglas `USR-001…013` y sus códigos)
- `src/lib/api/` (cliente y `ErrorApi`), `src/lib/sesion/`, `src/app/api/sesion/route.ts`, `src/modules/auth/`, `src/app/(auth)/`, `src/shared/providers/theme-provider.tsx`

## Paso 0 — Cerrar la verificación de W-003 contra la API real
Antes de programar: levantar la API (`docker compose up -d --build api-core` desde `Desarrollo/`, esperar `Started` en `docker logs shfy-api-core`) y ejecutar con la API real los criterios de W-003 que quedaron pendientes: login (cookie `HttpOnly` y cuerpo sin `token`), `GET /api/cuenta/perfil` con y sin cookie, un error real (`USR-004`) llegando intacto como `ErrorApi`. Anotarlo en el reporte en su propia sección. **Si la API no arranca** (Supabase en pausa: `tenant/user … not found`), detenerse y avisar al responsable; no seguir con datos simulados.

## Contrato de la API (verificado por Opus; JSON en `snake_case`)
| Acción | Endpoint | Cuerpo | Respuesta / errores |
|---|---|---|---|
| Registro | `POST /auth/registro` | `correo_electronico`, `contrasena`, `nombres`, `apellidos`, `telefono?` | 201 `{ id }` · 422 `USR-001` (correo ya existe) · 422 `VAL-001` con `validaciones` |
| Activar | `POST /auth/activar` | `correo_electronico`, `codigo` (6 dígitos) | 200 · 422 `USR-012` (código no válido o vencido; 5 intentos) |
| Reenviar código | `POST /auth/reenviar-activacion` | `correo_electronico` | 200 siempre (USR-013) |
| Login | `POST /auth/login` | `correo_electronico`, `contrasena` | 200 (el proxy guarda la cookie y quita el token) · 401 `USR-004` · 409 `USR-003` (cuenta sin activar) |
| Recuperar: pedir código | `POST /auth/recuperar-clave/solicitar` | `correo_electronico` | 200 siempre (USR-005) |
| Recuperar: confirmar | `POST /auth/recuperar-clave/confirmar` | `correo_electronico`, `codigo`, `contrasena_nueva` | 200 · 422 `USR-012` |
| Perfil (sesión) | `GET /cuenta/perfil` | — | 200 · 401 |
| Cerrar sesión | `DELETE /api/sesion` (ruta propia de la web, no de la API) | — | 200 |

Reglas: contraseña de 8 a 72 caracteres con al menos una letra y un número (USR-002); teléfono `^[0-9+ ()-]{6,30}$`; código `^\d{6}$`. Todas estas rutas tienen límite de 10 por minuto (`GEN-429` con `Retry-After`). La API **no** tiene `/auth/me`, `/auth/logout`, `/auth/actividad`, `/auth/verificar-otp` ni refresh.

## Pantallas y flujos
| Ruta | Muestra / permite | Endpoints |
|---|---|---|
| `/registro` | nombres, apellidos, correo, teléfono (opcional), contraseña con ojo; al crear → `/activar-cuenta?correo=…` | registro |
| `/activar-cuenta` | correo (prellenado desde la query) y código de 6 dígitos; "Reenviar código" con espera de 60 s; al activar → `/login?correo=…` con toast de éxito | activar, reenviar |
| `/login` | correo y contraseña con ojo; enlaces a registro y recuperar. Éxito → `siguiente` (si es válido) o `/cuenta` | login |
| `/recuperar` | paso 1: correo → paso 2 (misma pantalla): código + contraseña nueva; éxito → `/login` con toast | solicitar, confirmar |
| `/cuenta` | **marcador mínimo** (W-005 la completa): "Hola, {nombres}", correo y botón "Cerrar sesión" | perfil, `DELETE /api/sesion` |

- Renombrar `/forgot-password` a `/recuperar` (y actualizar `src/proxy.ts` y los enlaces).
- `siguiente` solo se usa si empieza con `/` y no con `//` ni `/\` (evita redirecciones abiertas); si no, `/cuenta`.
- `USR-003` en login → mensaje y botón "Activar mi cuenta" que lleva a `/activar-cuenta?correo=…`.
- Mensajes: se muestra `mensaje` de la API tal cual; `validaciones` se pintan en cada campo (mapear `correo_electronico` → campo correo, etc.). `GEN-429` → "Demasiados intentos" con la cuenta regresiva de `Retry-After` y el botón deshabilitado mientras dura.
- Formularios con `react-hook-form` + `zod` (un esquema por formulario en `modules/auth/schema.ts`) con las mismas reglas que la API.

## Limpieza del módulo `auth` (herencia de la plantilla)
- Borrar lo que la API no soporta: `sesion-activa-modal.tsx`, `use-inactividad.ts`, `use-avisos-sesion.tsx`, `use-can.ts`, `can.tsx` y las acciones de `/auth/me`, `/auth/actividad`, `/auth/logout`, `/auth/verificar-otp`, `/auth/activar/validar`, `/auth/restablecer-password`.
- `session-provider.tsx`: obtiene el usuario con `GET /cuenta/perfil` (solo dentro de `/cuenta`, `/panel` y `/plataforma`); sin sesión, el 401 del cliente ya redirige.
- `theme-provider.tsx`: quitar `forcedTheme` en las rutas de auth (deben respetar claro/oscuro).

## Componentes
Usar **solo** los componentes base existentes (`FloatingInput` con el ojo de contraseña, `Button`, toast, `Alert`) y el `otp-input` del propio módulo. **No** crear ni modificar nada en `src/shared/components/**` ni `globals.css`. Si una pantalla necesita un componente nuevo o un cambio visual en uno base, se anota en el reporte como pendiente: el responsable revisa el diseño antes.

## Estados obligatorios por pantalla
Cargando (botón con spinner y deshabilitado) · error (mensaje de la API) · éxito (toast) · validación por campo.

## Fuera de alcance
- Perfil completo, direcciones y "mis órdenes" (W-005). Crear tienda (W-006). Destino `/panel` (W-007).

## Criterios de aceptación
- [ ] Paso 0 documentado con la API real.
- [ ] Flujo real completo: registro → correo con código → activar → login → `/cuenta` muestra el nombre → cerrar sesión → `/cuenta` redirige a login. Usar un correo de prueba **del responsable**: pedirle el código de 6 dígitos que reciba (la API nunca lo registra en logs, USR-007). Anotar en el reporte el correo usado (no la contraseña).
- [ ] Login con contraseña incorrecta: mensaje de `USR-004` en la pantalla, **sin recargar** la página.
- [ ] Login con cuenta sin activar: mensaje de `USR-003` y botón a activar.
- [ ] Recuperación completa con código real (o, si no se puede recibir otro correo, al menos el error `USR-012` con un código inventado).
- [ ] `siguiente=//malo.com` lleva a `/cuenta`, no fuera del sitio.
- [ ] Las pantallas se ven en claro **y** oscuro.
- [ ] Capturas de `/registro`, `/activar-cuenta`, `/login`, `/recuperar` (ambos pasos) y `/cuenta` a 375, 768 y 1280 px en claro y oscuro, más una con error de campo y una con error de API. **Son para la revisión de diseño del responsable**.
- [ ] `npm run lint`, `npx tsc --noEmit` y `npm run build` sin errores.
- [ ] Al terminar: `docker compose stop api-core`.
