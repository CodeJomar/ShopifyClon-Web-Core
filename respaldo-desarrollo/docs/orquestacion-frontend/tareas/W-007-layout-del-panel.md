# W-007 — Layout del panel, navegación por rol, aviso de suscripción e inicio con métricas

| Campo | Valor |
|---|---|
| Modelo | Haiku (sesión ejecutora asignada por Opus) |
| Rama | `tarea/W-007-layout-del-panel` desde `develop` (con W-005 y W-006 mergeadas) |
| Depende de | W-006 |
| Tamaño | M |

## Objetivo
El comerciante entra a `/panel` y ve el layout de la plantilla (barra lateral + encabezado) con **solo** las secciones que su rol permite, el nombre de la tienda activa con un acceso para cambiarla, un aviso si la suscripción no está activa y un inicio con las métricas de la tienda. Reemplaza el marcador `/panel` de W-006. Las demás secciones existen como marcadores que llenarán W-008…W-013.

## Contexto (leer solo esto)
- `docs/arquitectura-frontend.md` (reglas 4, 5, 7, 8) y `docs/diseno-web.md` (§2, §4, §5 Layout)
- `docs/negocio/01-actores-roles-permisos.md` (roles y matriz rol × permiso)
- `docs/negocio/modulos/suscripciones.md` (SUS-017) y `docs/negocio/modulos/balances-y-metricas.md` (MET-001)
- Código: `src/shared/constants/{navegacion,permisos}.ts`, `src/shared/components/layout/{app-sidebar,workspace-header}.tsx`, `src/shared/components/ui/{sidebar,chart}.tsx`, `src/modules/tienda/`, `src/app/panel/`

## Contrato de la API (verificado por Opus; JSON en `snake_case`)
| Acción | Endpoint | Respuesta |
|---|---|---|
| Mis tiendas (rol y estado de la activa) | `GET /cuenta/tiendas` | `[{ tienda_id, nombre, subdominio, rol, esta_activa, operativa }]` |
| Tienda activa | `GET /panel/tienda` | configuración (`nombre`, `subdominio`, `moneda`, `zona_horaria`…; ver Swagger) |
| Métricas | `GET /panel/metricas?desde=AAAA-MM-DD&hasta=AAAA-MM-DD` (opcionales; máximo 366 días; permiso `METRICAS_VER`) | `{ moneda, zona_horaria, desde, hasta, resumen: { ventas_historicas, reembolsado, comisiones, saldo_por_cobrar, … }, por_dia: [{ fecha, ventas_brutas, reembolsos, ventas_netas, … }], top_productos: [{ variante_id, titulo_producto, titulo_variante, importe }] }` (confirmar nombres exactos en Swagger) |

- **SUS-017**: con la suscripción vencida, suspendida o sin suscripción, toda escritura en `/panel/**` responde **409 `SUS-017`** "Tu suscripción no está activa. Paga para seguir operando". Las lecturas siguen funcionando.
- La tienda activa la fija la cookie `otemu_tienda` (W-003/W-006); el rol del usuario en ella sale de `GET /cuenta/tiendas`.

## Alcance
1. **Permisos** (`shared/constants/permisos.ts`): la matriz rol × permiso de `01-actores-roles-permisos.md` con los códigos estables (`TIENDA_CONFIGURAR`, `SUSCRIPCION_GESTIONAR`, `PERSONAL_GESTIONAR`, `CATALOGO_GESTIONAR`, `INVENTARIO_AJUSTAR`, `CUPONES_GESTIONAR`, `ENVIOS_CONFIGURAR`, `ORDENES_VER`, `ORDENES_GESTIONAR`, `ORDENES_CANCELAR`, `REEMBOLSOS_EMITIR`, `METRICAS_VER`, …), reutilizando la mecánica existente (`tienePermiso`, `puedeCon`). Es solo para **ocultar** en la UI: la autoridad es la API (un 403 siempre se maneja).
2. **Navegación** (`shared/constants/navegacion.ts`): `HOME_HREF = "/panel"` y `NAVEGACION` con, en este orden y con su permiso: Inicio (`/panel`, `METRICAS_VER`), Productos (`/panel/productos`), Categorías (`/panel/categorias`), Inventario (`/panel/inventario`), Órdenes (`/panel/ordenes`), Cupones (`/panel/cupones`), Envíos (`/panel/envios`), Personal (`/panel/personal`), Configuración (`/panel/configuracion`), Suscripción (`/panel/suscripcion`). Íconos `lucide`. `PERFIL_HREF = "/cuenta"`.
3. **Layout** `src/app/panel/layout.tsx`: usa `AppSidebar` y `WorkspaceHeader` **tal como están** (solo se les pasan datos por props: navegación filtrada por rol, nombre de la tienda, usuario). En el encabezado o la barra, el nombre de la tienda activa y "Cambiar de tienda" (→ `/cuenta/tiendas`); el usuario con "Mi cuenta" (→ `/cuenta`) y "Cerrar sesión" (`DELETE /api/sesion`).
   - Sin tienda activa o `SEG-001` → `/cuenta/tiendas`.
   - El layout de la plantilla **no se reestructura** (decisión del responsable: la recomposición vendrá después). Si para algo de esta tarea hiciera falta cambiar un componente de `shared/components/layout` o `ui/sidebar`, **no se cambia**: se anota en el reporte.
4. **Aviso de suscripción**: si la tienda activa no está `operativa`, una franja `Alert` de tipo aviso arriba del contenido: "Tu suscripción no está activa. Puedes ver tu tienda, pero no hacer cambios." con el botón "Pagar suscripción" (→ `/panel/suscripcion`) solo si el rol es `PROPIETARIO`. Además, el cliente de API: ante un **409 `SUS-017`** en cualquier escritura muestra el `mensaje` en un toast de aviso (un manejador global en `lib/api` o en `toast-response`, sin tocar componentes base).
5. **Inicio `/panel`** (`modules/metricas/`): selector de rango (Hoy, 7 días, 30 días; por defecto 30) · 4 tarjetas de resumen (ventas netas del rango, ventas históricas, saldo por cobrar, comisiones) con `formatearDinero` y la moneda de la respuesta · gráfico de ventas por día con `ui/chart` + `recharts` (colores `--chart-*`) · lista "Más vendidos" (top productos) · estado vacío si no hay ventas ("Aún no tienes ventas. Comparte tu tienda: otemu.com/tienda/{subdominio}") con botón copiar enlace. Sin `METRICAS_VER` (no debería pasar con los roles actuales): estado "sin permiso".
6. **Marcadores** para cada sección de la navegación aún no hecha: una página por ruta con `EstadoVacio` ("Esta sección llega pronto") para que el menú no lleve a un 404. Las tareas W-008…W-013 los reemplazan.

## Componentes y diseño
- Solo componentes base existentes. **No** crear ni modificar nada en `src/shared/components/**` ni `globals.css`.
- La **tarjeta de métrica** (título, monto grande, ayuda) es un patrón nuevo: va en `modules/metricas/components/tarjeta-metrica.tsx`, hecha con `Card` y tokens (título 12.5/600 `--muted-foreground`, monto 22/800). Queda para la revisión de diseño del responsable: incluir capturas de detalle en claro y oscuro.
- Contenido del panel en islas (`Card`) separadas por `--float-gap`.

## Estados obligatorios
Cargando (esqueletos) · vacío · error (mensaje de la API) · sin permiso (403).

## Fuera de alcance
- Las secciones en sí (W-008…W-013). Recomponer el layout. Plataforma (W-017).

## Criterios de aceptación (con la API real)
- [ ] Como `PROPIETARIO` se ven las 10 entradas. Agregar personal no es parte de esta tarea: para probar otro rol, simular el rol en el filtrado (prueba unitaria simple o comentario en el reporte con la lista que vería cada rol según la matriz).
- [ ] El nombre de la tienda activa se ve y "Cambiar de tienda" funciona con las dos tiendas de prueba de W-006.
- [ ] Inicio con la tienda de prueba (sin ventas): estado vacío con el enlace copiable; cambio de rango sin errores.
- [ ] Aviso de suscripción: verificar con la respuesta real de `operativa` (las tiendas en prueba son operativas: documentar cómo se ve el aviso forzando `operativa=false` en desarrollo, sin cambiar la base de datos).
- [ ] Todas las entradas del menú abren su página (marcador) sin 404.
- [ ] Responsivo: a 375 px el menú se abre como panel (comportamiento actual del `Sidebar`); capturas de `/panel` a 375, 768 y 1280 px en claro y oscuro, más detalle de la tarjeta de métrica y del aviso de suscripción.
- [ ] `npm run lint`, `npx tsc --noEmit` y `npm run build` sin errores.
- [ ] Al terminar: `docker compose stop api-core`.
