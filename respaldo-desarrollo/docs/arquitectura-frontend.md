# Arquitectura del frontend (objetivo)

Una sola aplicación Next.js (`ShopifyClon-Web-Core`) que **solo consume la API** del backend (`/api/v1`). Aplica `kit-claude-estandares-universales/frontend/` (01–11). El backend decide dinero, estado y permisos; la web solo ayuda (principio 1).

## Stack (se conserva lo instalado)
- Next.js 16 (App Router, React 19, Server Components). **Antes de escribir código de Next, leer la guía en `node_modules/next/dist/docs/`** (ver `AGENTS.md` del proyecto: esta versión trae cambios de API).
- Tailwind CSS 4 + componentes shadcn (`base-nova`) en `src/shared/components/ui`; íconos `lucide-react`.
- Formularios: `react-hook-form` + `zod` (un esquema por formulario, kit 04). Estado de UI pequeño: `zustand`. Gráficos: `recharts`. Fechas: `date-fns`. HTTP: `axios` (un solo cliente, `lib/api/client.ts`).
- Base: la plantilla del repositorio (ex "coffly-flow") se conserva en estructura y estándares; W-001 retira su negocio de cafetería y `socket.io-client` (QW-008).
- Despliegue: Railway, `Dockerfile` *standalone* + `railway.json` (QW-009).

## Cuatro superficies en la misma app
| Superficie | Quién | Rutas (App Router) | Acceso a la API |
|---|---|---|---|
| **Vitrina** | compradores | `app/(vitrina)/tienda/[subdominio]/…` (por ruta en todos los entornos, QW-005) | `/vitrina/{sub}/…` públicas + carrito por cookie |
| **Panel** | propietario y personal | `app/(panel)/panel/…` | `/panel/…` con `X-Tienda-Id` |
| **Cuenta** | cualquier usuario | `app/(cuenta)/…` y `app/(auth)/…` | `/auth/…`, `/cuenta/…` |
| **Plataforma** | administrador | `app/(plataforma)/plataforma/…` | `/plataforma/…` |

## Estructura de carpetas (la de la plantilla)
```text
src/
├── app/                      # solo rutas, layouts y composición (kit 01: capa de rutas fina)
│   └── api/[...ruta]/route.ts# proxy de mismo origen hacia la API Spring (W-003)
├── modules/<modulo>/         # una carpeta por capacidad: auth, cuenta, tienda, catalogo, inventario, cupones,
│   ├── views/                #   envios, ordenes, personal, suscripcion, metricas, vitrina, carrito, checkout,
│   ├── components/           #   plataforma, errors
│   ├── hooks/                # estado y llamadas del módulo (usan lib/api)
│   ├── actions/              # llamadas a la API del módulo
│   └── schema.ts             # zod de los formularios
├── dtos/<modulo>/            # tipos de request/response de la API; dtos/core: respuesta base, paginación, dinero
├── shared/                   # sin negocio: components/{ui,composed,layout}, hooks, providers, utils, constants
├── lib/
│   ├── api/                  # cliente axios único hacia /api (mismo origen)
│   ├── connection/           # aviso de API caída
│   └── validations/          # validaciones zod reutilizables
├── env.ts                    # variables NEXT_PUBLIC_ validadas
└── proxy.ts                  # guard de navegación (no es autorización)
```

## Reglas siempre vigentes
1. **Un solo cliente de API** (`lib/api`, axios hacia `/api` del mismo origen): agrega `Idempotency-Key` cuando corresponde; desempaqueta `RespuestaApi`; convierte errores en `ErrorApi { codigo, mensaje, validaciones, detalles, estado }`. Ningún componente llama a `fetch` ni a axios directo.
2. **El JWT nunca llega al JavaScript del navegador**: la API Spring lo devuelve en el cuerpo de `/auth/login`; el proxy `app/api/[...ruta]` lo intercepta, lo guarda en cookie `httpOnly`, `Secure`, `SameSite=Lax` y lo quita de la respuesta. En cada reenvío el proxy agrega `Authorization`, `X-Tienda-Id` (cookie de tienda activa) y `X-Correlacion-Id`. Sin refresh: un 401 lleva al login.
3. **Carrito**: el token del carrito vive en una cookie por subdominio; `Idempotency-Key` del checkout se genera una vez por intento de compra y se reutiliza en los reintentos.
4. **Errores**: `codigo` decide el comportamiento (p. ej. `CHK-004` → recargar carrito; `SEG-007` → ir a login; `SUS-017` → banner "paga tu suscripción"); `mensaje` se muestra tal cual en la notificación; `validaciones` se pintan en los campos (kit 04 y 06).
5. **Permisos en la UI**: se ocultan acciones según el rol de `GET /cuenta/tiendas`, pero **la autoridad es la API** (un 403 siempre se maneja).
5b. **JSON en `snake_case`**: la API serializa peticiones y respuestas en `snake_case`; los tipos de `src/dtos` lo reflejan tal cual (sin capa de conversión).
6. **Dinero**: nunca se calcula en la web; se muestran los montos que devuelve la API con la moneda de la tienda (`lib/formato`).
7. **Feedback** (kit 06): una notificación global, una confirmación global y un panel lateral estándar para formularios y detalles; nada de modales centrados con formularios.
8. **Responsivo y táctil** (kit 05): un único punto de quiebre que decide la navegación; la vitrina es móvil primero.
9. **Accesibilidad** (kit 09): semántica, foco visible, contraste AA, todo operable con teclado.

## Verificación (cada tarea)
`npm run build` y `npm run lint` sin errores, y revisión en navegador real a **375, 768 y 1280 px** contra el backend local (Testcontainers no aplica aquí: se usa la API levantada en `localhost:8080`). Lo no verificado se declara en el reporte.
