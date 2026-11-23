# Mapeo por tecnología

Los estándares usan conceptos; esta tabla los traduce. Es orientativa: lo que importa es el concepto, no el nombre.

## Backend

| Concepto | NestJS | Spring Boot | FastAPI | Laravel |
|---|---|---|---|---|
| Módulo por capacidad | `modules/<x>` + `*.module.ts` | paquete `com.app.<x>` | `app/<x>/` con routers | `app/Domain/<X>` o módulos |
| Controlador (transporte) | `@Controller` | `@RestController` | `APIRouter` | `Controller` |
| Servicio (decide) | `@Injectable` service | `@Service` | clase/función de servicio | `Service`/`Action` |
| Repositorio (consulta) | clase con ORM inyectado | `JpaRepository` o repositorio propio | clase con `Session` | `Repository` sobre Eloquent |
| Unidad de trabajo | proveedor que envuelve `db.transaction` | `@Transactional` / `TransactionTemplate` | gestor de contexto sobre la sesión | `DB::transaction` |
| Validación de entrada | DTO + pipe de validación | Bean Validation | modelos Pydantic | `FormRequest` |
| Respuesta de error uniforme | filtro de excepciones global | `@ControllerAdvice` | `exception_handler` | `Handler` de excepciones |
| Autorización por permisos | guard global + decorador | Spring Security + `@PreAuthorize` | dependencia de seguridad | `Gate`/`Policy` + middleware |
| Eventos tras commit | emitir después de `ejecutar` | `@TransactionalEventListener(AFTER_COMMIT)` | tras salir del contexto | `afterCommit` / `DB::afterCommit` |
| Límite de peticiones | throttler | bucket4j / gateway | slowapi / gateway | `RateLimiter` |
| Pruebas con base real | e2e con contenedor | Testcontainers | pytest + contenedor | tests con base desechable |
| Health | endpoints live/ready | Actuator | rutas live/ready | rutas live/ready |

## Frontend

| Concepto | React / Next.js | Vue / Nuxt | Angular |
|---|---|---|---|
| Capa de rutas fina | `app/` o `pages/` | `pages/` | módulos de rutas |
| Módulos de funcionalidad | `modules/<x>` | `modules/<x>` o `features/<x>` | `features/<x>` |
| Compartido sin negocio | `shared/ui`, `shared/composed` | `components/ui`, `components/composed` | `shared/` |
| Estado del servidor | consulta en servidor o librería de caché | composables / Pinia | servicios + RxJS / signals |
| Estado de UI | estado local o store pequeño | `ref` / Pinia | signals / servicios |
| Formularios + esquema | formulario controlado + esquema (Zod) | VeeValidate + esquema | Reactive Forms + validadores |
| Toast / confirmación / panel | proveedor global único | plugin global único | servicio global único |
| Punto de quiebre único | hook de media query + clases | composable + clases | `BreakpointObserver` + clases |
| Estado derivado | cálculo en render | `computed` | `computed` / pipe |

Si la tecnología nueva no está en la tabla, se busca el equivalente de cada fila antes de empezar y se anota en el `CLAUDE.md` del proyecto.
