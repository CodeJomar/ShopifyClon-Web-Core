# Protocolo de orquestación (Opus orquesta, Sonnet/Haiku implementan)

Decisión D-001. Objetivo: que el modelo caro solo piense y revise, y que el código lo escriban modelos más baratos guiados por documentos autosuficientes.

## Roles
| Rol | Modelo | Hace | No hace |
|---|---|---|---|
| **Orquestador** | Opus (esta sesión) | Analiza, decide, escribe tareas, revisa, corrige lo pequeño, mantiene `docs/negocio` y el tablero | Implementar módulos completos |
| **Ejecutor** | Sonnet (por defecto) | Implementa una tarea, verifica y escribe el reporte | Decidir reglas de negocio, salir del alcance |
| **Ejecutor mecánico** | Haiku | Tareas repetitivas con especificación cerrada: CRUD simple, entidades desde SQL dado, DTOs, mapeadores | Concurrencia, dinero, seguridad |
| **Responsable** | Tú | Abres las sesiones, confirmas decisiones, decides merges y pushes | — |

## Ciclo de una tarea
```text
1. Opus      escribe tareas/T-XXX-<slug>.md y la marca "lista" en tablero.md
2. Tú        abres una sesión NUEVA en ShopifyClon-Api-Core con el modelo indicado y pegas el prompt de abajo
3. Ejecutor  crea la rama tarea/T-XXX-<slug> desde develop, implementa, verifica, hace commits locales
             y escribe reportes/T-XXX.reporte.md
4. Tú        vuelves a esta sesión: "revisa T-XXX"
5. Opus      lee el reporte, revisa el diff (git diff develop...tarea/T-XXX-<slug>), compila y corre pruebas
6. Opus      clasifica hallazgos y decide:
               - pocos y pequeños  → los corrige él mismo en la rama (commit "fix(T-XXX): …")
               - muchos o de diseño → escribe tareas/T-XXX-C1-correcciones.md y vuelve al paso 2
7. Tú        apruebas → merge a develop (fast-forward) cuando lo pidas
```

### Umbral para corregir directamente
Opus corrige él mismo si **todas** se cumplen: ≤ 5 hallazgos, cada uno localizado (un archivo o dos), sin cambio de diseño ni de contrato, ≈ 60 líneas o menos en total. Si no, tarea de corrección.

### Clasificación de hallazgos en la revisión
| Clase | Qué es | Acción |
|---|---|---|
| Bloqueante | Rompe una regla de negocio, seguridad, dinero, compila mal o fallan pruebas | Corregir antes del merge |
| Importante | Viola la arquitectura o un estándar del kit | Corregir antes del merge |
| Menor | Nombres, duplicación pequeña, mensaje mejorable | Corregir si es barato o anotar |
| Observación | Fuera de alcance | Anotar en el tablero como tarea futura |

## Prompt para abrir la sesión del ejecutor
Copiar tal cual, cambiando el identificador y el nombre del archivo:

```text
Eres el EJECUTOR de UNA sola tarea: T-XXX del proyecto ShopifyClon. No hagas ninguna otra tarea aunque la veas lista.

Antes de escribir código:
1. Lee C:\UTP-Proyectos\Shopify-Clon-Core\Desarrollo\docs\orquestacion\README.md, sección "Reglas del ejecutor" (son obligatorias).
2. Lee completa C:\UTP-Proyectos\Shopify-Clon-Core\Desarrollo\docs\orquestacion\tareas\T-XXX-<slug>.md.
3. Lee SOLO los documentos y archivos que la tarea lista en "Contexto". No explores el resto del proyecto.

Trabajo (repositorio C:\UTP-Proyectos\Shopify-Clon-Core\Desarrollo\ShopifyClon-Api-Core):
4. Crea la rama tarea/T-XXX-<slug> desde develop. Si otra sesión trabaja en paralelo, usa un worktree en ..\wt\T-XXX (regla 11) y no cambies de rama en la carpeta compartida.
5. Implementa exactamente el alcance y cada criterio de aceptación con su prueba. Nada fuera de alcance: lo que veas va a "Observaciones".
6. Commits pequeños "tipo(T-XXX): descripción", sin Co-Authored-By ni atribución a Claude. No hagas push ni merge.
7. Si algo es ambiguo, aplica la opción conservadora, márcala con TODO(Q-T-XXX) y anótala en "Decisiones tomadas".

Cierre (en este orden, sin saltarte ninguno):
8. Ejecuta mvn clean test dos veces y guarda el resumen REAL ("Tests run: N, Failures: 0 …"). La suite tarda 3–5 minutos: lánzala con timeout de 600000 ms o en segundo plano y espera a que termine; nunca la cortes ni la reemplaces por una parcial. Si falla por "Failed to delete target", es otra sesión o el IDE: repite en tu worktree, no inventes cifras.
9. Escribe el reporte en C:\UTP-Proyectos\Shopify-Clon-Core\Desarrollo\docs\orquestacion\reportes\T-XXX.reporte.md con la plantilla plantilla-reporte.md: commits, cada criterio con la prueba que lo cubre, cifras reales, decisiones, lo no verificado y lo pendiente.
10. Si usaste worktree, bórralo (git -c core.longpaths=true worktree remove ..\wt\T-XXX) y verifica con git worktree list.
11. Responde al usuario en 3 líneas: rama, cifra de pruebas y ruta del reporte.

Sin reporte la tarea no se revisa ni se integra.
```

## Reglas del ejecutor
1. **Rama**: `git switch develop && git switch -c tarea/T-XXX-<slug>`. Commits pequeños con mensaje `tipo(T-XXX): descripción` (`feat`, `fix`, `refactor`, `test`, `chore`, `docs`). Sin push, sin merge. **Sin `Co-Authored-By` ni otra atribución a Claude**: el autor es solo el usuario.
2. **Alcance**: solo lo que pide la tarea. Lo que veas fuera de alcance va a "Observaciones" del reporte, no al código.
3. **No inventes reglas de negocio**. Si la tarea y `docs/negocio` no lo cubren, aplica la opción más conservadora, márcala con `// TODO(Q-T-XXX): …` y explícala en "Decisiones tomadas" del reporte.
4. **No cambies** `docs/negocio`, `docs/arquitectura-backend.md`, ni el esquema de base de datos salvo que la tarea lo pida expresamente.
5. **No actualices ni agregues dependencias** salvo las que la tarea nombre (con su versión).
6. **Arquitectura**: `docs/arquitectura-backend.md` es obligatoria. Imita el código ya migrado más cercano.
7. **Verifica de verdad**: ejecuta cada comando de "Verificación" y pega el resumen real de la salida en el reporte. Nunca declares "listo" algo que no ejecutaste; si no pudiste ejecutar algo, dilo y por qué.
8. **Secretos**: nunca leas ni copies valores de `.env` al reporte o al código. Usa variables de entorno.
9. Compila con `mvn` (JDK 17). El wrapper `./mvnw` puede fallar en este equipo.
10. Si la tarea es demasiado grande para terminarla, detente en un punto que compile con pruebas en verde, haz commit y documenta en el reporte qué falta.
11. **Tareas en paralelo**: si otra sesión trabaja a la vez, no cambies de rama en la carpeta compartida `ShopifyClon-Api-Core`. Desde esa carpeta crea un worktree con `git -c core.longpaths=true worktree add ../wt/T-XXX -b tarea/T-XXX-<slug> develop`, trabaja y prueba ahí, y **al terminar, después del reporte**, bórralo con `git -c core.longpaths=true worktree remove ../wt/T-XXX`. No dejes worktrees ni carpetas temporales en `Desarrollo/`.
12. **El reporte es el último paso y es obligatorio**, con las cifras reales de tu última ejecución de `mvn clean test` (tarda 3–5 min: usa timeout de 600000 ms o segundo plano). Haz commit **antes** de correr la suite final. Sin reporte la tarea no se revisa.

## Archivos
| Archivo | Uso |
|---|---|
| `plantilla-tarea.md` | Formato de cada tarea (lo usa Opus) |
| `plantilla-reporte.md` | Formato del reporte (lo usa el ejecutor) |
| `tablero.md` | Hoja de ruta y estado de cada tarea |
| `tareas/` | Tareas `T-XXX-<slug>.md` y correcciones `T-XXX-C1-….md` |
| `reportes/` | `T-XXX.reporte.md` escritos por el ejecutor; Opus agrega al final "Revisión" |
