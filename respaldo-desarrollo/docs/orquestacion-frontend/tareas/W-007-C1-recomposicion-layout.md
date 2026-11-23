# W-007-C1 — Recomposición del layout del panel y de la cuenta

| Campo | Valor |
|---|---|
| Modelo | Sonnet |
| Rama | `tarea/W-007-C1-recomposicion-layout` desde `develop` |
| Depende de | W-007 (mergeada) |
| Origen | Pedido del responsable (2026-10-22), QW-011 |
| Tamaño | M |

## Objetivo
Rediseñar el layout del panel según el responsable: encabezado limpio (solo plegar barra + migas a la izquierda y el menú del usuario a la derecha), marca con el nombre de la tienda, "Inicio" pasa a "Dashboard", "Configuración" sale de la barra lateral y la cuenta (`/cuenta/**`) vive dentro del mismo layout con una organización nueva.

**Esta tarea SÍ autoriza modificar** `src/shared/components/layout/{app-sidebar,workspace-header}.tsx` y `src/shared/components/composed/user-profile.tsx` (pedido explícito del responsable). Ningún otro componente de `src/shared/components/**` ni `globals.css` se toca; si hace falta, se anota en el reporte.

## Contexto (leer solo esto)
- `docs/arquitectura-frontend.md` y `docs/diseno-web.md` (§2, §4, §5)
- `src/shared/components/layout/`, `src/shared/components/composed/user-profile.tsx`, `src/shared/components/ui/{sidebar,dropdown-menu,tabs,switch}.tsx`
- `src/shared/constants/navegacion.ts`, `src/modules/panel/` (`panel-shell.tsx`, `use-panel.tsx`), `src/app/panel/layout.tsx`
- `src/app/cuenta/**`, `src/modules/cuenta/`, `src/modules/tienda/views/mis-tiendas-view.tsx`

## Cambios pedidos
### 1. Marca = Home
- El bloque de marca de la barra lateral (hoy "OTemu / Tu tienda en línea") muestra el **nombre de la tienda activa**; sin tienda activa, "OTemu". Es un enlace al home del panel: `/panel`.
- Debajo del nombre, en lugar del lema, un enlace pequeño "Cambiar de tienda" (→ `/cuenta/tiendas`). Se quita la franja "Tienda: … / Cambiar de tienda" que hoy está sobre el contenido (queda duplicada).
- Con la barra plegada, se ve solo el ícono de la marca.

### 2. Navegación
- "Inicio" pasa a llamarse **"Dashboard"** (misma ruta `/panel`, mismo ícono de gráfico).
- **Se quita "Configuración"** de la barra lateral (pasa al menú del usuario). La ruta `/panel/configuracion` sigue existiendo y conserva su permiso (`TIENDA_CONFIGURAR`).
- Migas: deben decir la sección real (hoy dice "Tienda > Suscripción"); usar "Panel > {sección}" o el `migas` de cada entrada de `NAVEGACION`, y "Mi cuenta > {pestaña}" en `/cuenta/**`.

### 3. Encabezado
- Izquierda: botón para plegar la barra + migas (sin cambios).
- **Se quitan** la insignia del rol ("Propietario"), el interruptor claro/oscuro y el botón "Cerrar sesión".
- Derecha: **menú del usuario** (se mueve desde el pie de la barra lateral, que queda sin perfil): avatar con iniciales, nombre y rol en texto pequeño, y un **`ChevronDown`** que deja claro que es un desplegable (rota al abrir). En móvil (< 640 px) solo avatar + chevron.
- Al abrir (`ui/dropdown-menu`), tres opciones con ícono:
  1. **Ver perfil** (`User`) → `/cuenta`
  2. **Configuración** (`Settings`) → `/panel/configuracion`; se oculta si el rol no tiene `TIENDA_CONFIGURAR` o no hay tienda activa
  3. separador · **Cerrar sesión** (`LogOut`, color de peligro) → `DELETE /api/sesion` y `/login`
- Operable con teclado (Enter/Espacio abre, flechas, Escape cierra), con `aria-label` "Menú de la cuenta".

### 4. La cuenta dentro del layout del panel
- `/cuenta/**` usa el **mismo layout** (barra lateral + encabezado). Hay que extraer el layout a un componente compartido por `app/panel/layout.tsx` y un nuevo `app/cuenta/layout.tsx`.
- **Sin tienda activa** (comprador sin tienda, o antes de elegir), el layout de `/cuenta/**` se muestra igual, con la marca "OTemu" y la barra lateral sin secciones de tienda: solo un acceso "Crear mi tienda" (→ `/cuenta/tiendas/nueva`). **No** debe redirigir (hoy el panel manda a `/cuenta/tiendas` sin tienda: evitar el bucle).
- `/panel/**` sigue exigiendo tienda activa como hoy.

### 5. Reorganización UI/UX de la cuenta
Encabezado de página "Mi cuenta" y **pestañas como navegación** (`ui/tabs` o enlaces con el mismo estilo; cada pestaña es una ruta para que el enlace se pueda compartir y el botón atrás funcione):

| Pestaña | Ruta | Contenido |
|---|---|---|
| Perfil | `/cuenta` | isla "Datos personales" (correo de solo lectura con copiar, nombres, apellidos, teléfono) · isla **"Preferencias"** con el interruptor de **tema claro/oscuro** (se mueve aquí desde el encabezado; usar `next-themes` como hoy) |
| Seguridad | `/cuenta/seguridad` | cambiar contraseña (lo que hoy está en la isla "Seguridad") |
| Direcciones | `/cuenta/direcciones` | lo actual |
| Mis compras | `/cuenta/ordenes` (y su detalle) | lo actual, con el título "Mis compras" |
| Mis tiendas | `/cuenta/tiendas` (y `/nueva`) | lo actual |

- Se quita la isla "Accesos" y el botón "Cerrar sesión" de la página (ya están en las pestañas y en el menú del usuario).
- En móvil las pestañas se desplazan en horizontal sin desbordar la página.
- Contenido en islas, ancho máximo cómodo de lectura (no estirar formularios a 1280 px: máx. ~720 px por isla de formulario).

## Fuera de alcance
- Lógica de negocio nueva, otras pantallas del panel.

## Criterios de aceptación (con la API real)
- [ ] Encabezado: solo plegar + migas a la izquierda y el menú del usuario a la derecha; sin rol, sin tema, sin "Cerrar sesión" sueltos.
- [ ] Menú del usuario: chevron visible; las 3 opciones funcionan; "Configuración" oculta para un rol sin `TIENDA_CONFIGURAR` (probar con la matriz) y sin tienda activa; cerrar sesión lleva a `/login`. Teclado completo.
- [ ] Barra lateral: marca con el nombre de la tienda activa (y "OTemu" sin tienda); "Dashboard" en lugar de "Inicio"; sin "Configuración"; sin perfil al pie.
- [ ] `/cuenta/**` con el layout del panel, con y sin tienda activa, sin bucles de redirección.
- [ ] Pestañas de la cuenta: cada una es una ruta; el tema se cambia desde Perfil > Preferencias.
- [ ] Capturas para la **revisión de diseño del responsable**: `/panel` y `/cuenta` (cada pestaña) a 375, 768 y 1280 px en claro y oscuro; detalle del menú del usuario abierto y cerrado; barra lateral plegada; `/cuenta` sin tienda activa.
- [ ] `npm run lint`, `npx tsc --noEmit` y `npm run build` sin errores.
- [ ] Al terminar: `docker compose stop api-core`.
