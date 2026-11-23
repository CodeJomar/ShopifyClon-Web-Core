# W-006 — Crear tienda y selector de tienda

| Campo | Valor |
|---|---|
| Modelo | Sonnet |
| Rama | `tarea/W-006-crear-tienda` desde `develop` |
| Depende de | W-004 (mergeada) |
| Tamaño | M |

## Objetivo
Una persona con sesión elige un plan (con prueba gratis), crea su tienda con nombre y subdominio, y entra a ella. Quien tiene varias tiendas elige con cuál trabajar. Al terminar, la cookie de tienda activa (`otemu_tienda`, W-003) queda fijada y la persona llega a `/panel`.

## Contexto (leer solo esto)
- `docs/arquitectura-frontend.md` y `docs/diseno-web.md` (§2, §4 completo)
- `docs/negocio/modulos/tiendas-y-personal.md` (TIE-001…004) y `docs/negocio/modulos/suscripciones.md` (SUS-001, SUS-015)
- `docs/negocio/flujos/alta-de-tienda.md`
- Código a imitar: `src/modules/auth/` (vistas, esquemas, acciones con `peticionApi` y `resultado`), `src/app/cuenta/`, `src/app/api/sesion/route.ts`

## Contrato de la API (verificado por Opus; JSON en `snake_case`)
| Acción | Endpoint | Cuerpo / respuesta |
|---|---|---|
| Planes públicos | `GET /planes` (pública) | `[{ codigo, nombre, descripcion, precio_mensual, precio_anual, moneda, limite_productos, limite_personal, porcentaje_comision, dias_prueba }]` |
| Crear tienda | `POST /cuenta/tiendas` | `{ nombre, subdominio, correo_contacto?, moneda, codigo_plan }` → 201 `{ id, nombre, subdominio, suscripcion, operativa }` · 422 `TIE-001` (subdominio inválido, reservado o en uso; el `mensaje` dice el motivo) · 422 `SUS-015` (plan no disponible) · 422 `VAL-001` |
| Mis tiendas | `GET /cuenta/tiendas` | `[{ tienda_id, nombre, subdominio, rol, esta_activa, operativa }]` |
| Fijar tienda activa | `PUT /api/sesion` (ruta propia de la web) | `{ tienda_id }` |
| Datos de la tienda activa | `GET /panel/tienda` (con `X-Tienda-Id` que pone el proxy) | configuración de la tienda |

Regla de subdominio (TIE-001): minúsculas, `^[a-z0-9](-?[a-z0-9])*$`, de 3 a 63 caracteres; reservados: `www`, `api`, `admin`, `app`, `panel`, `vitrina`, `auth`, `plataforma`, `soporte`, `mail`. La web valida lo mismo para avisar antes, pero **la API decide** (único en toda la plataforma).

## Pantallas y flujos
| Ruta | Muestra / permite | Endpoints |
|---|---|---|
| `/cuenta/tiendas/nueva` | **Paso 1 — plan**: tarjetas con los planes de `GET /planes` (nombre, precio mensual con `formatearDinero`, días de prueba, límite de productos y de personal, comisión); `BASICO` preseleccionado si existe. **Paso 2 — datos**: nombre, subdominio (vista previa en vivo `otemu.com/tienda/{subdominio}` y normalización a minúsculas mientras se escribe), correo de contacto (prellenado con el correo del perfil), moneda (`PEN` por defecto, `USD`). "Crear tienda" → crea → `PUT /api/sesion` con el `id` → `/panel` con toast "Tu tienda está lista. Tienes N días de prueba". | planes, crear, sesión |
| `/cuenta/tiendas` | Selector: lista de mis tiendas con nombre, subdominio, rol (insignia `contorno`) y estado (insignia `marca` "Activa" si `operativa`, `aviso` "Requiere atención" si no). Elegir una → `PUT /api/sesion` → `/panel`. Botón "Crear tienda". Sin tiendas: estado vacío "Aún no tienes tiendas" con acción "Crear mi tienda". | mis tiendas, sesión |
| `/panel` | **Marcador mínimo** (W-007 lo reemplaza por el layout del panel): nombre de la tienda activa (`GET /panel/tienda`), enlace "Cambiar de tienda" a `/cuenta/tiendas`. Sin tienda activa (`SEG-001`) → `/cuenta/tiendas`. | tienda |

- **Destino tras el login** (`modules/auth`, sin `siguiente`): 0 tiendas → `/cuenta/tiendas/nueva`; 1 tienda → `/panel` (el proxy ya fija la cookie con una sola tienda); varias → `/cuenta/tiendas`.
- `/cuenta` (marcador de W-004) agrega un enlace a "Mis tiendas".
- Errores de la API: `TIE-001` se pinta **en el campo subdominio** con el `mensaje` de la API; los demás, en la alerta de la pantalla.
- Formularios con `react-hook-form` + `zod` en `modules/tienda/schema.ts`. Tipos en `src/dtos/tienda/`. Acciones en `modules/tienda/actions/`.

## Componentes y revisión de diseño
- Solo componentes base existentes (`Card`, `Badge` con `tono`, `Button`, `FloatingInput`, `FloatingSelect`, `EstadoVacio`, `Alert`, toast). **No** crear ni modificar nada en `src/shared/components/**` ni `globals.css`.
- La **tarjeta de plan seleccionable** es un patrón visual nuevo: se construye **dentro del módulo** (`modules/tienda/components/tarjeta-plan.tsx`) solo con `Card` y tokens. Seleccionada: borde 1.8 `--primary` y anillo `--primary` 18 % (como el foco de los campos); en reposo, borde de isla. Es un `radio` accesible (`role="radio"`, flechas para moverse, `aria-checked`). **El responsable revisa su diseño antes del merge**: capturas de detalle en reposo, hover, seleccionada y foco de teclado, en claro y oscuro.
- Los campos del paso 2 siguen la regla de íconos de §4.2 (`Store` para el nombre, `Link` para el subdominio, `Mail` para el correo) y van dentro de una isla (`Card`); si alguno queda sobre el lienzo, fijar `[--campo-exterior:var(--background)]` en su contenedor (lección de W-004).

## Estados obligatorios por pantalla
Cargando (esqueleto o spinner) · vacío · error (mensaje de la API) · éxito (toast).

## Fuera de alcance
- Layout del panel, navegación y métricas (W-007). Pago de suscripción (W-013). Editar la tienda (W-012).

## Criterios de aceptación (con la API real)
- [ ] Crear una tienda de prueba de punta a punta: plan → datos → `/panel` muestra su nombre; `document.cookie` no muestra `otemu_tienda` (es `httpOnly`), pero `GET /api/panel/tienda` responde 200.
- [ ] Subdominio reservado (`admin`) y repetido (el de la tienda recién creada): error `TIE-001` en el campo, con el mensaje de la API.
- [ ] Con dos tiendas, el login sin `siguiente` lleva a `/cuenta/tiendas`; elegir la otra cambia el nombre en `/panel`.
- [ ] La tarjeta de plan se opera con teclado (Tab para entrar, flechas para cambiar).
- [ ] Capturas de `/cuenta/tiendas/nueva` (ambos pasos), `/cuenta/tiendas` (con tiendas y vacío) y `/panel` a 375, 768 y 1280 px en claro y oscuro, más las de detalle de la tarjeta de plan y una con error `TIE-001`. **Son para la revisión de diseño del responsable.**
- [ ] `npm run lint`, `npx tsc --noEmit` y `npm run build` sin errores.
- [ ] Datos de prueba: anotar en el reporte el nombre y el subdominio de las tiendas creadas (para borrarlas después si el responsable lo pide). No borrar nada de la base de datos.
- [ ] Al terminar: `docker compose stop api-core`.
