# W-021 · Seguridad de la cuenta (adaptar el frontend a A-007)

**Estado:** pendiente. No urgente: el frontend aún no está desplegado y nada se rompe mientras tanto (ver «Qué pasa si no se hace»).
**Origen:** ajuste de backend A-007 (endurecimiento de seguridad), ya en `develop` y `prod` de `ShopifyClon-Api-Core` (commit `57d2165`) y desplegado en Railway.
**Rama sugerida:** `tarea/W-021-seguridad-de-cuenta` desde `develop` de `ShopifyClon-Web-Core`.

---

## 1. Qué cambió en el backend

### 1.1 Cambios que afectan al contrato

| # | Cambio | Endpoint | Detalle |
|---|---|---|---|
| A | **Login en dos pasos (opcional por usuario)** | `POST /auth/login` | La respuesta trae un campo nuevo `requiere_segundo_factor` (boolean). Si es `true`, **no viene** `token`, `tipo`, `expira_en`, `usuario` ni `tiendas`: el backend envió un código de 6 dígitos al correo (vence en 10 min, 5 intentos). Mensaje: «Te enviamos un código a tu correo para terminar de iniciar sesión». Si es `false`, todo igual que antes. |
| B | Segundo paso del login | `POST /auth/login/verificar` (nuevo, público, 10/min) | Cuerpo `{correo_electronico, codigo}`. Responde **lo mismo que un login normal** (`token`, `usuario`, `tiendas`…). Código malo, vencido o sin haber pasado por la contraseña → 422 `USR-012`. |
| C | Activar/desactivar dos pasos | `PUT /cuenta/dos-pasos` (nuevo, con sesión) | Cuerpo `{activo: boolean, contrasena_actual}`. Devuelve el perfil. Clave incorrecta → 422 `USR-010`. |
| D | Perfil | `GET /cuenta/perfil` y `usuario` del login | Campo nuevo `dos_pasos_activo` (boolean). |
| E | **Bloqueo por intentos fallidos** | `POST /auth/login` | Tras 5 contraseñas incorrectas seguidas la cuenta se bloquea 15 min. El quinto fallo y los intentos siguientes responden **409 `USR-014`** (aunque la clave sea correcta). El dueño recibe un correo con un código de desbloqueo (30 min). |
| F | Desbloquear | `POST /auth/desbloquear` (nuevo, público, 10/min) | Cuerpo `{correo_electronico, codigo}` → 200. Código malo → 422 `USR-012`. Restablecer la contraseña también desbloquea. |
| G | **Cambiar la contraseña cierra todas las sesiones** | `PUT /cuenta/contrasena` | Sigue respondiendo 200, pero el token actual deja de valer: la siguiente petición da 401 `SEG-007`. Mensaje nuevo: «Contraseña actualizada. Vuelve a iniciar sesión». Lo mismo al restablecer la clave. |
| H | Cerrar sesión en el servidor | `POST /cuenta/cerrar-sesiones` (nuevo, con sesión, sin cuerpo) | Invalida **todos** los tokens ya emitidos de la cuenta. |
| I | Contraseñas comunes | registro, cambio y restablecimiento | Se rechazan las demasiado comunes (`Password123`, `Qwerty123`…) y las que contienen el nombre del correo → **422 `USR-015`** (error de negocio, **no** viene en `validaciones`; el texto está en `mensaje`). |

### 1.2 Cambios que no tocan el contrato (solo para saber)

- Límite de peticiones por IP real del visitante en Railway (`PROXY_CABECERA_IP=X-Real-IP`).
- CORS con lista de orígenes (`CORS_ORIGENES_PERMITIDOS`). **Si la web se despliega con dominio propio y el navegador llamara directo a la API, hay que agregar ese origen.** Hoy el navegador habla con el proxy `/api` de Next (servidor a servidor), así que no aplica.
- HSTS, Swagger apagable (`SWAGGER_HABILITADO`), SQL fuera de los logs, se quitó una regla pública sin uso.
- Nuevo `GET /plataforma/diagnostico/red` (solo administrador de plataforma). No hace falta en la web.

Referencia completa: `docs/api/guia-de-endpoints.md` (sección 1) y el laboratorio, página **Cuenta y sesión**.

---

## 2. Qué debe hacer el frontend

### 2.1 Login con segundo paso (A, B)  — obligatorio

- `src/dtos/auth/index.ts`: agregar `requiere_segundo_factor: boolean` a la respuesta del login y hacer opcionales `token`, `tipo`, `expira_en`, `usuario`, `tiendas`. Agregar `dos_pasos_activo: boolean` al perfil.
- `src/modules/auth/actions/auth.actions.ts`: acción `verificarSegundoFactorAction(correo, codigo)` → `POST /auth/login/verificar`.
- `src/app/api/sesion/route.ts` (o donde se guarden las cookies de sesión): **no crear la sesión** si el login devolvió `requiere_segundo_factor: true`; crearla con la respuesta de `/auth/login/verificar`.
- `src/modules/auth/views/login-view.tsx`: si llega `requiere_segundo_factor`, pasar a un paso «Escribe el código que te enviamos por correo» (6 dígitos, mismo componente que la activación si existe), con:
  - error `USR-012`: «El código no es válido o venció»;
  - enlace «Volver» que regresa al formulario de contraseña (para pedir otro código hay que volver a enviar correo + contraseña; no hay endpoint de reenvío).
- No guardar la contraseña en estado más de lo necesario; el segundo paso solo necesita el correo.

### 2.2 Cuenta bloqueada (E, F) — obligatorio

- En el login, tratar **409 `USR-014`** con un mensaje propio: «Tu cuenta está bloqueada temporalmente por varios intentos fallidos. Revisa tu correo para desbloquearla o inténtalo en 15 minutos», y un enlace **«Tengo un código de desbloqueo»**.
- Pantalla o diálogo de desbloqueo: correo + código → `POST /auth/desbloquear`. En éxito, volver al login con aviso «Cuenta desbloqueada, ya puedes iniciar sesión».
- Ruta sugerida: `/desbloquear` dentro de `(auth)`.

### 2.3 Cambio de contraseña (G) — obligatorio

- `src/modules/cuenta/components/contrasena-form.tsx`: tras el 200, **cerrar la sesión de la web** (borrar cookies con la acción existente `cerrarSesionAction`) y llevar al login con el aviso «Contraseña actualizada. Vuelve a iniciar sesión». Sin esto, el usuario verá un 401 inesperado en la siguiente acción.
- Avisar antes de enviar: «Al cambiarla se cerrará tu sesión en todos los dispositivos».
- Mostrar el error `USR-015` (contraseña común) como error del campo «Nueva contraseña» aunque no venga en `validaciones`.

### 2.4 Cerrar sesión de verdad (H) — recomendado

- `cerrarSesionAction` hoy solo borra cookies («La API no tiene logout»). Cambiar a: llamar primero `POST /cuenta/cerrar-sesiones` y luego borrar cookies; si la llamada falla (401, red), borrar cookies igual.
- Ojo: esto cierra **todas** las sesiones de la cuenta, no solo la de este navegador. Si se prefiere, dejar el botón normal como está y agregar en «Mi cuenta» uno aparte: **«Cerrar sesión en todos los dispositivos»**.

### 2.5 Verificación en dos pasos en «Mi cuenta» (C, D) — obligatorio para que el 2FA sea usable

- `src/modules/cuenta/views/cuenta-view.tsx`: sección «Verificación en dos pasos» con el estado (`dos_pasos_activo`) y un interruptor. Al cambiarlo pedir la contraseña actual y llamar `PUT /cuenta/dos-pasos`.
- Texto de ayuda: «Al iniciar sesión te pediremos además un código que enviamos a tu correo».

### 2.6 Registro y recuperación (I) — obligatorio

- `registro-view.tsx` y `recuperar-view.tsx`: mostrar `USR-015` junto al campo de contraseña. Opcional: validar en `zod` una lista corta local para avisar antes de enviar (la fuente de verdad es el backend).

### 2.7 Pruebas

- e2e (Playwright): login con dos pasos (el código hay que leerlo del correo o de la base: coordinar con el backend una cuenta de prueba), cuenta bloqueada tras 5 fallos y desbloqueo, cambio de contraseña que lleva al login.
- **Cuidado con los e2e existentes:** cualquier prueba que falle el login varias veces contra la misma cuenta puede bloquearla 15 min. Un login correcto reinicia el contador.
- `npm run lint`, `npx tsc --noEmit`, `npm run build`.

---

## 3. Qué pasa si no se hace (estado actual de la web)

| Situación | Efecto hoy |
|---|---|
| Usuario sin dos pasos (todas las cuentas actuales) | Login funciona igual; el campo nuevo se ignora. |
| Alguien activa dos pasos por la API o el laboratorio | **No podrá entrar por la web**: el login no trae token y la web no tiene el segundo paso. |
| Cambiar la contraseña desde la web | Funciona, pero la siguiente acción da 401 y la web lo mandará al login sin explicación. |
| Cuenta bloqueada por 5 fallos | La web mostrará el mensaje genérico de error del 409; no hay dónde poner el código de desbloqueo (se puede esperar 15 min o usar el laboratorio). |
| Contraseña común en registro | El backend responde 422 `USR-015`; depende de si la vista muestra `mensaje` de errores de negocio. |

## 4. Datos útiles para probar

- API local: `http://localhost:8080/api/v1` · producción: `https://otemu-api-core-production.up.railway.app/api/v1`.
- Laboratorio → **Cuenta y sesión**: casos listos de login en dos pasos, desbloqueo, dos pasos y cerrar sesiones.
- Los códigos llegan por correo (Brevo en producción). En local dependen del SMTP configurado en el `.env` de la API.
- Pruebas del backend que documentan el comportamiento: `SeguridadCuentaTest` (13 casos).

## 5. Criterios de aceptación

1. Con dos pasos activo, el login pide el código y solo entonces entra al panel.
2. Con dos pasos inactivo, el login no cambia.
3. Tras 5 fallos se ve el mensaje de cuenta bloqueada y se puede desbloquear con el código.
4. Cambiar la contraseña termina en el login con un aviso claro.
5. «Mi cuenta» permite activar y desactivar los dos pasos.
6. Una contraseña común muestra el motivo junto al campo.
7. lint, tsc y build sin errores; e2e nuevos en verde.
