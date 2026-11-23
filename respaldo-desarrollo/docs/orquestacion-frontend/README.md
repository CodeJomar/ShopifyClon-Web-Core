# Orquestación del frontend (Opus planifica y revisa; Sonnet/Haiku implementan)

Mismo modelo que `docs/orquestacion/` del backend (D-001), adaptado a la web. Repositorio: `C:\UTP-Proyectos\Shopify-Clon-Core\Desarrollo\ShopifyClon-Web-Core`.

## Roles
| Rol | Modelo | Hace |
|---|---|---|
| Orquestador | Opus | Diseño (con el responsable), tareas `W-XXX`, revisión visual y de código |
| Ejecutor de base | Haiku | **Base mínima funcional** de cada pantalla (W-XXX): datos reales de la API, estados, permisos y errores, con los componentes existentes |
| Diseñador | Sonnet | **Rediseño UI/UX** de lo que Haiku dejó funcionando (tareas `W-XXX-D`), siguiendo `docs/diseno-web.md`; puede tocar componentes base solo si la tarea lo autoriza, con revisión del responsable |
| Responsable | Tú | Decisiones de diseño, aprobar merges, push |

## Ciclo de una tarea
1. Opus escribe `tareas/W-XXX-<slug>.md` y la marca `lista` en `tablero.md`.
2. Abres una sesión nueva en `ShopifyClon-Web-Core` y pegas el prompt de abajo.
3. El ejecutor trabaja en `tarea/W-XXX-<slug>` desde `develop`, verifica y escribe `reportes/W-XXX.reporte.md` (sin capturas desde 2026-10-21).
4. "revisa W-XXX" → Opus revisa reporte, diff, build y la pantalla en el navegador; corrige lo pequeño o escribe `W-XXX-C1`.
5. Merge a `develop` cuando lo apruebes.

## Prompt para el ejecutor
```text
Eres el EJECUTOR de UNA sola tarea: W-XXX del frontend de ShopifyClon. No hagas ninguna otra.

Antes de escribir código:
1. Lee C:\UTP-Proyectos\Shopify-Clon-Core\Desarrollo\docs\orquestacion-frontend\README.md, sección "Reglas del ejecutor".
2. Lee C:\UTP-Proyectos\Shopify-Clon-Core\Desarrollo\docs\arquitectura-frontend.md.
3. Lee completa C:\UTP-Proyectos\Shopify-Clon-Core\Desarrollo\docs\orquestacion-frontend\tareas\W-XXX-<slug>.md y SOLO lo que lista en "Contexto".
4. Si vas a usar una API de Next.js, lee antes su guía en node_modules/next/dist/docs/ (esta versión tiene cambios).

Trabajo (repositorio C:\UTP-Proyectos\Shopify-Clon-Core\Desarrollo\ShopifyClon-Web-Core):
5. Rama tarea/W-XXX-<slug> desde develop. Commits "tipo(W-XXX): descripción", sin Co-Authored-By. Sin push ni merge.
6. Implementa el alcance y cada criterio de aceptación. Lo ambiguo: opción conservadora, TODO(Q-W-XXX) y anótalo en el reporte.

Cierre (en orden):
7. npm run lint y npm run build sin errores (pega la salida real).
8. Con el backend en http://localhost:8080 y npm run start, prueba cada flujo de la tarea contra la API real. NO se toman capturas de pantalla: se anota cada flujo probado y su resultado.
9. Escribe docs\orquestacion-frontend\reportes\W-XXX.reporte.md con la plantilla: commits, criterios con evidencia (flujo probado y resultado; [x] solo lo probado de verdad), decisiones, no verificado, pendiente.
10. Responde en 3 líneas: rama, resultado de build/lint y ruta del reporte.
Sin reporte la tarea no se revisa.
```

## Reglas del ejecutor
1. **La web no toca la base de datos ni decide negocio**: todo dato sale de la API (`docs/arquitectura-frontend.md`, regla 1). Si falta un endpoint, se anota en el reporte; no se inventa.
2. **El contrato es la API real**: tipos y errores según `RespuestaApi` y los códigos de `docs/negocio/modulos/transversal.md` y de cada módulo. Ante la duda, consultar Swagger (`http://localhost:8080/api/v1/swagger-ui/index.html`).
3. **Reutilizar antes de crear** (kit 02): buscar en `src/shared` y en el módulo ya hecho más cercano; un patrón usado en dos módulos se promueve a `shared`.
4. **Sistema de diseño**: usar solo los tokens y componentes definidos en W-002; nada de colores, sombras ni tamaños sueltos.
5. **Sin dependencias nuevas** salvo las que nombre la tarea, con versión.
6. **Textos en español** para personas, sin nombres internos de campos; montos con la moneda de la tienda.
7. **Secretos**: nunca copiar valores de `.env`; las variables públicas llevan `NEXT_PUBLIC_` y no contienen secretos.
8. **Paralelo**: si otra sesión trabaja a la vez, usa un worktree en `C:\UTP-Proyectos\Shopify-Clon-Core\Desarrollo\wt\W-XXX` y bórralo al terminar.
9. **El reporte es obligatorio** y es el último paso.

## Archivos
| Archivo | Uso |
|---|---|
| `tablero.md` | Hoja de ruta, estado y decisiones pendientes |
| `plantilla-tarea.md` / `plantilla-reporte.md` | Formatos |
| `tareas/`, `reportes/` | Tareas `W-XXX` y sus reportes |

## Modo paralelo (desde 2026-10-21)
Pueden trabajar a la vez **Haiku** (sesión de Claude, en el checkout principal) y **Antigravity** (u otro agente) en un worktree. Reglas:
| Tema | Regla |
|---|---|
| Carpeta | el agente paralelo trabaja en `C:\UTP-Proyectos\Shopify-Clon-Core\Desarrollo\wt\W-XXX` (`git worktree add ..\wt\W-XXX -b tarea/W-XXX-<slug> develop` desde `ShopifyClon-Web-Core`), con su propio `npm ci` y su propio `.env` (copiado de `.env.example`) |
| Puerto | checkout principal: 3000 · worktree: **3100** (`npm run start -- -p 3100`) |
| API | un solo contenedor `api-core` compartido. En modo paralelo **nadie lo detiene** al terminar; lo detiene Opus cuando no quedan tareas activas |
| Tareas | solo se asignan en paralelo tareas que toquen módulos y rutas distintas |
| Merge | lo hace Opus, de a una rama; él resuelve conflictos en archivos comunes |
| Aviso | Antigravity no puede mandar mensajes: al terminar deja su reporte y el responsable le dice a Opus "revisa W-XXX". El worktree se borra después del merge (`git worktree remove`) |
| Prioridad | **funcionalidad e integración con la API**; el diseño lo trabaja el responsable aparte. Sin capturas de pantalla |
