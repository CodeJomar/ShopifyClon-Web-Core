# T-005 — Reescribir el módulo `tienda`: alta completa, configuración, vitrina básica y personal

| Campo | Valor |
|---|---|
| Modelo sugerido | Sonnet |
| Repositorio | `C:\UTP-Proyectos\Shopify-Clon-Core\Desarrollo\ShopifyClon-Api-Core` |
| Rama | `tarea/T-005-modulo-tienda` desde `develop` |
| Depende de | T-003 y T-004 (mergeadas) |
| Tamaño estimado | L — puntos de control con commit al final de cada uno |

## Objetivo
Reemplazar `modules/tienda` por `modulos/tienda` con la arquitectura por capas y las reglas TIE-* y PER-*: crear una tienda en una sola transacción (personal propietario, balance y suscripción de prueba o pendiente de pago), configurar la tienda, activarla o desactivarla, ver su vitrina pública básica y gestionar el personal con roles.

## Contexto obligatorio (leer solo esto)
- `C:\UTP-Proyectos\Shopify-Clon-Core\Desarrollo\docs\orquestacion\README.md` (reglas del ejecutor; **commits sin `Co-Authored-By`**)
- `C:\UTP-Proyectos\Shopify-Clon-Core\Desarrollo\docs\arquitectura-backend.md`
- `C:\UTP-Proyectos\Shopify-Clon-Core\Desarrollo\docs\negocio\modulos\tiendas-y-personal.md` (**fuente de verdad**: TIE-001…009, PER-001…007, rutas)
- `C:\UTP-Proyectos\Shopify-Clon-Core\Desarrollo\docs\negocio\flujos\alta-de-tienda.md`
- `C:\UTP-Proyectos\Shopify-Clon-Core\Desarrollo\docs\negocio\modulos\suscripciones.md` → solo SUS-001, SUS-015, SUS-016
- `C:\UTP-Proyectos\Shopify-Clon-Core\Desarrollo\docs\negocio\01-actores-roles-permisos.md` (permisos y reglas de propiedad)
- `C:\UTP-Proyectos\Shopify-Clon-Core\Desarrollo\docs\base-de-datos\V004__suscripcion-pendiente-de-pago.sql`
- Código a imitar: `modulos/usuario/**` y `modulos/suscripcion/**` (estructura, DTOs `record`, pruebas). A usar: `comun/seguridad` (`ContextoTienda`, `@RequierePermiso`, `RolTienda`, `SesionActual`), `comun/auditoria/AuditoriaServicio`, `modulos/suscripcion/servicio/SuscripcionServicio`, `modulos/balance/servicio/BalanceServicio`.
- Código a borrar: `modules/tienda/**`.

## Estructura esperada
```text
modulos/tienda/
├── controlador/  TiendaCuentaControlador (/cuenta/tiendas), TiendaPanelControlador (/panel/tienda),
│                 PersonalControlador (/panel/personal), VitrinaTiendaControlador (/vitrina/{subdominio})
├── servicio/     AltaTiendaServicio, TiendaServicio (configuración, activación, esOperativa, mis tiendas, vitrina),
│                 PersonalServicio
├── repositorio/  TiendaRepositorio, PersonalTiendaRepositorio, RolRepositorio
├── entidad/      TiendaEntidad, PersonalTiendaEntidad, RolEntidad
├── dto/request/  CrearTiendaRequest, ActualizarTiendaRequest, CambioEstadoTiendaRequest, AgregarPersonalRequest,
│                 CambiarRolRequest, QuitarPersonalRequest
├── dto/response/ TiendaCreadaResponse, TiendaConfiguracionResponse, MiTiendaResponse, TiendaVitrinaResponse,
│                 MiembroPersonalResponse
├── modelo/       ValidadorSubdominio, UsuarioInvitadoVista, MiembroPersonalVista, MiTiendaVista (proyecciones)
└── mapeador/     TiendaMapeador, PersonalMapeador
```

---

## Punto de control 1 — Migración V4, suscripción pendiente de pago y entidades
1. Copiar `docs/base-de-datos/V004__suscripcion-pendiente-de-pago.sql` tal cual a `src/main/resources/db/migration/V4__suscripcion_pendiente_de_pago.sql`.
2. En `SuscripcionServicio` (módulo `suscripcion`) agregar:
   - `@Transactional(propagation = MANDATORY) SuscripcionVigente crearPendienteDePago(UUID tiendaId, String codigoPlan)`: mismo tratamiento del código de plan y de SUS-015 que `crearPrueba` **pero sin exigir** `DiasPrueba ≥ 1`; mismo chequeo SUS-002. Inserta `Estado = VENCIDA`, `CicloFacturacion = MENSUAL`, `PrecioPactado = PrecioMensual`, `Moneda` del plan, `FechaInicio = InicioPeriodoActual = FinPeriodoActual = FechaVencimiento = ahora`, `FechaFinPrueba = null`, `MotivoEstado = "Prueba gratuita ya utilizada; requiere pago"`.
   - Pruebas en `SuscripcionTest`: crea la fila `VENCIDA` con período vacío; `vigente()` la devuelve con `permiteOperar() = false`; `propietarioYaUsoPrueba` **no** cambia por ella (no tiene `FechaFinPrueba`).
3. Entidades en `modulos/tienda/entidad` (extienden `AuditoriaEntidad`, columnas exactas):
   - `TiendaEntidad`: `PropietarioId`, `Nombre`, `Subdominio`, `DominioPersonalizado`, `Moneda`, `CorreoContacto`, `EstaActiva`, `TasaImpuesto` (BigDecimal, escala 4), `PreciosIncluyenImpuesto`, `ZonaHoraria`, `SiguienteNumeroOrden` (Integer; **`updatable = false`**: lo modificará solo el checkout con un `UPDATE` relativo).
   - `PersonalTiendaEntidad`: `TiendaId`, `UsuarioId`, `RolId` (UUID).
   - `RolEntidad`: `Nombre`, `Codigo`, `Descripcion` (solo lectura en tiempo de ejecución).
4. Commit: `feat(T-005): migracion V4, suscripcion pendiente de pago y entidades de tienda`.

## Punto de control 2 — Alta de tienda y mis tiendas
### `POST /cuenta/tiendas` (autenticado; `@LimitarPeticiones(porMinuto = 10)`)
Request `CrearTiendaRequest`: `nombre` (`@NotBlank @Size(max=100)`), `subdominio` (`@NotBlank @Size(max=63)`; la regla completa la valida el servicio), `correo_contacto` (`@NotBlank @Email @Size(max=255)`), `moneda` (opcional, `^[A-Z]{3}$`, por defecto `USD`), `codigo_plan` (opcional).

`AltaTiendaServicio.crear(request)` con `@Transactional`, siguiendo el flujo `alta-de-tienda.md`:
1. `ValidadorSubdominio.validar(texto)` (clase pura en `modelo/`): normaliza (`trim`, minúsculas), aplica la expresión, longitud 3–63 y lista de reservados de TIE-001; devuelve el subdominio limpio o lanza `ReglaNegocioException("TIE-001", motivo)` con un mensaje distinto por caso ("El subdominio debe tener entre 3 y 63 caracteres", "Usa solo letras minúsculas, números y guiones; no puede empezar ni terminar con guion", "Ese subdominio está reservado", "Ese subdominio ya está en uso").
2. Ocupado (`existsBySubdominio`, **incluye eliminadas**) → `TIE-001` "Ese subdominio ya está en uso".
3. Inserta la tienda con `PropietarioId = SesionActual.usuarioId()`, correo en minúsculas, `EstaActiva = TRUE`, `TasaImpuesto = 0.1800`, `PreciosIncluyenImpuesto = TRUE`, `ZonaHoraria = "America/Lima"`, `SiguienteNumeroOrden = 1001` (en la inserción sí se escribe: usa `insertable = true, updatable = false`). `saveAndFlush`; si la base rechaza el subdominio por carrera, traduce a `TIE-001` (patrón de `AutenticacionServicio.registrar`).
4. Inserta `PersonalTienda` con el rol `PROPIETARIO` (`RolRepositorio.findByCodigoAndEliminadoFalse`).
5. `balanceServicio.crearSiNoExiste(tiendaId)`.
6. Si `app.suscripcion.prueba-una-por-usuario` (propiedad booleana, por defecto `true`; agrégala a `application.properties`) es `true` **y** `suscripcionServicio.propietarioYaUsoPrueba(propietarioId)` → `crearPendienteDePago`; si no → `crearPrueba`. **Consulta `propietarioYaUsoPrueba` antes del paso 3** para no contar la tienda que se está creando.
7. `auditoriaServicio.registrar(tiendaId, TIENDA_CREADA, "Tiendas", tiendaId, null, {subdominio, plan, estado_suscripcion})`.
8. Respuesta 201 `TiendaCreadaResponse`: `id`, `nombre`, `subdominio`, `suscripcion { estado, codigo_plan, fin_periodo_actual }`, `operativa` (boolean).

### `GET /cuenta/tiendas` (autenticado)
Lista `MiTiendaResponse`: `tienda_id`, `nombre`, `subdominio`, `rol`, `esta_activa`, `operativa`. Consulta nativa de solo lectura en `TiendaRepositorio` con la misma lógica de roles que el login (propietario o personal con rol `ADMINISTRADOR`/`GESTOR_*`, tienda no eliminada), ordenada por nombre; `operativa` se calcula con `TiendaServicio.esOperativa`.

### `TiendaServicio.esOperativa(UUID tiendaId)` — TIE-004
`true` si la tienda existe, no está eliminada, `EstaActiva` y `suscripcionServicio.vigente(tiendaId)` está presente con `permiteOperar()`. Método público: lo usarán vitrina, catálogo y checkout.

Commit: `feat(T-005): alta de tienda y mis tiendas`.

## Punto de control 3 — Configuración, activación y vitrina
| Método y ruta | Seguridad | Request | Respuesta | Reglas |
|---|---|---|---|---|
| `GET /panel/tienda` | parámetro `ContextoTienda` (cualquier miembro) | — | `TiendaConfiguracionResponse` | — |
| `PUT /panel/tienda` | `@RequierePermiso(TIENDA_CONFIGURAR)` | `nombre`, `correo_contacto`, `dominio_personalizado?` (≤150), `moneda` (`^[A-Z]{3}$`), `tasa_impuesto` (`@DecimalMin("0") @DecimalMax("0.50")`, escala ≤ 4), `precios_incluyen_impuesto`, `zona_horaria` | `TiendaConfiguracionResponse` | TIE-005, TIE-006 |
| `POST /panel/tienda/activar` | `ContextoTienda` + `esPropietario()` o 403 `SEG-002` | `motivo?` | `TiendaConfiguracionResponse` | TIE-008; audita `TIENDA_ACTIVADA` |
| `POST /panel/tienda/desactivar` | ídem | `motivo?` | ídem | TIE-008; audita `TIENDA_DESACTIVADA` |
| `GET /vitrina/{subdominio}` | público | — | `TiendaVitrinaResponse` | TIE-009 |

- `TiendaConfiguracionResponse`: `id`, `nombre`, `subdominio`, `dominio_personalizado`, `moneda`, `correo_contacto`, `tasa_impuesto`, `precios_incluyen_impuesto`, `zona_horaria`, `esta_activa`, `operativa`, `suscripcion { estado, codigo_plan, fin_periodo_actual }` (vacío si no hay), `fecha_creacion`. **No** expone `siguiente_numero_orden`.
- TIE-005: "tiene órdenes" = `SELECT EXISTS (SELECT 1 FROM "Ordenes" WHERE "TiendaId" = :id)` (consulta nativa en `TiendaRepositorio`). Solo se valida si la moneda **cambia**.
- `zona_horaria` inválida → 422 `TIE-006` "La zona horaria no es válida".
- Activar una tienda ya activa (o desactivar una inactiva) → 200 sin auditoría.
- `TiendaVitrinaResponse`: `nombre`, `subdominio`, `moneda`, `correo_contacto`, `precios_incluyen_impuesto`. Subdominio inexistente, eliminado o no operativo → 404 `TIE-404`.

Commit: `feat(T-005): configuracion, activacion y vitrina de tienda`.

## Punto de control 4 — Personal
| Método y ruta | Seguridad | Request | Respuesta |
|---|---|---|---|
| `GET /panel/personal` | `@RequierePermiso(PERSONAL_GESTIONAR)` | — | lista `MiembroPersonalResponse` (propietario primero) |
| `POST /panel/personal` | ídem | `correo_electronico`, `rol` | 201 `MiembroPersonalResponse` |
| `PUT /panel/personal/{usuarioId}` | ídem | `rol`, `motivo` | `MiembroPersonalResponse` |
| `DELETE /panel/personal/{usuarioId}` | ídem | cuerpo `{ motivo }` | 200 |

- `MiembroPersonalResponse`: `usuario_id`, `correo_electronico`, `nombres`, `apellidos`, `rol`, `desde` (fecha de alta en el personal).
- `rol` en los request: uno de `ADMINISTRADOR`, `GESTOR_CATALOGO`, `GESTOR_PEDIDOS` (`@Pattern`); `PROPIETARIO` o cualquier otro valor → 422 `PER-003` (para `PROPIETARIO`) o `VAL-001`.
- `motivo`: `@NotBlank @Size(min=5, max=255)`.
- El usuario a agregar se busca con una consulta nativa de solo lectura (`UsuarioInvitadoVista`: id, correo, nombres, apellidos) sobre `"Usuarios"` por `LOWER("CorreoElectronico")`, `"EstaActivo" = TRUE`, `"Eliminado" = FALSE`. No dependas del módulo `usuario`.
- Orden de validación en **agregar**: PER-001 → PER-006 (ya es miembro o es el propietario) → PER-004 (si el actor es `ADMINISTRADOR` y el rol pedido es `ADMINISTRADOR`) → PER-002 (límite con `suscripcionServicio.vigente(tiendaId)`; sin vigente, límite 0) → inserta → audita `PERSONAL_AGREGADO` (detalle: correo, rol).
- **Cambiar rol**: objetivo no encontrado entre el personal activo → 404 `PER-404`; PER-007 (el actor es el objetivo); PER-003 (el objetivo es el propietario); PER-004 (actor `ADMINISTRADOR` y el objetivo **o** el rol nuevo es `ADMINISTRADOR`); mismo rol → 200 sin cambios ni auditoría; si no, actualiza y audita `PERSONAL_ROL_CAMBIADO` (detalle: antes, después; motivo).
- **Quitar**: mismas validaciones (PER-404, PER-007, PER-003, PER-004); eliminación lógica; audita `PERSONAL_QUITADO` con motivo.
- Una carrera que viole `UxPersonalTiendaUsuario` termina en 409 `PER-006`.

Commit: `feat(T-005): gestion de personal`.

## Punto de control 5 — Limpieza y pruebas
1. **Borrar** `src/main/java/shopify/api/core/modules/tienda/**`.
2. En `SecurityConfig`, quitar el bloque `// TEMPORAL … tienda (T-005)`.
3. Rutas en `Rutas`. Pruebas en `src/test/java/shopify/api/core/modulos/tienda/` (crea usuarios y tokens con los helpers de `PruebaIntegracionBase`; crea tiendas **por la API** salvo cuando la prueba necesite un estado imposible por API).

| Prueba | Esperado |
|---|---|
| alta válida | 201; existen tienda (impuesto 0.18, `America/Lima`, `SiguienteNumeroOrden = 1001`), personal `PROPIETARIO`, balance en 0, suscripción `PRUEBA` de `BASICO` y auditoría `TIENDA_CREADA` |
| alta con `codigo_plan = "ESTANDAR"` | suscripción del plan `ESTANDAR` |
| alta con plan inexistente | 422 `SUS-015` y **ninguna** fila creada |
| subdominios inválidos: `ab` (corto), `-tienda`, `tienda-`, `mi--tienda` (guiones dobles), `mi tienda` (espacio), `admin` (reservado), uno ya usado, uno de una tienda eliminada | 422 `TIE-001` con el mensaje de cada caso |
| subdominio válido `mi-tienda-2` | 201 |
| `MI-TIENDA` | se guarda `mi-tienda` |
| segunda tienda del mismo usuario | suscripción `VENCIDA`, `operativa = false`, `GET /vitrina/{sub}` → 404 `TIE-404` |
| con `app.suscripcion.prueba-una-por-usuario=false` (`@TestPropertySource`) la segunda tienda recibe `PRUEBA` | ✔ |
| `GET /cuenta/tiendas`: propietario de A, `GESTOR_PEDIDOS` en B; no aparece una tienda eliminada | ✔ con roles y `operativa` |
| `GET /panel/tienda` como `GESTOR_CATALOGO` | 200 |
| `PUT /panel/tienda` como `GESTOR_CATALOGO` | 403 `SEG-002` |
| `PUT /panel/tienda` como `ADMINISTRADOR`: cambia nombre, impuesto 0.10, `precios_incluyen_impuesto = false`, zona `America/Bogota` | 200 y persistido |
| tasa 0.51 / zona `Marte/Olimpo` | 422 (`VAL-001` / `TIE-006`) |
| cambiar moneda con una orden existente (insértala con `jdbc`) | 409 `TIE-005`; sin órdenes, el cambio pasa |
| desactivar como `ADMINISTRADOR` | 403 `SEG-002` |
| desactivar como propietario | 200, auditoría `TIENDA_DESACTIVADA`, vitrina 404; el panel sigue respondiendo; activar la vuelve operativa |
| `GET /vitrina/{sub}` sin token | 200 con los 5 campos públicos y nada más |
| agregar personal: usuario activo → 201 + auditoría; correo inexistente o inactivo → 422 `PER-001`; repetido o el propietario → 409 `PER-006` | ✔ |
| límite: plan `BASICO` (`LimitePersonal = 2`): el tercer miembro → 422 `PER-002` | ✔ |
| `ADMINISTRADOR` intenta agregar o quitar a otro `ADMINISTRADOR` → 403 `PER-004`; puede agregar y quitar `GESTOR_PEDIDOS` | ✔ |
| quitar o cambiar al propietario → 422 `PER-003`; cambiarse a sí mismo → 422 `PER-007` | ✔ |
| quitar sin motivo → 422 `VAL-001`; con motivo → eliminación lógica, auditoría, y el usuario deja de entrar a la tienda (`GET /panel/tienda` → 404 `SEG-001`) | ✔ |
| volver a agregar a alguien quitado | 201 (nueva fila) |
| ninguna ruta `/tiendas/**` responde | 404 `GEN-404` |

4. `ArquitecturaTest` pasa con el módulo incluido (en particular: `tienda` no importa repositorios ni entidades de `suscripcion`, `balance` ni `usuario`).
5. Commit: `test(T-005): pruebas del modulo tienda` (puede ir junto con la limpieza: `refactor(T-005): eliminar modulo tienda anterior`).

---

## Fuera de alcance
- Pagar la suscripción, cambiar de plan, cancelar, suspender (T-006); tareas programadas (T-007).
- Correo de bienvenida y de "te agregaron a una tienda" (se harán al reescribir `notificacion`).
- Transferir la propiedad (Q-004), invitar a personas sin cuenta (Q-006), tarifas de envío (T-011).
- Cambiar dependencias del `pom.xml`.

## Criterios de aceptación
- [ ] No existe `modules/tienda`; `git grep -n "modules.tienda" -- src` vacío.
- [ ] El alta es atómica: si cualquier paso falla no queda ninguna fila (prueba con plan inexistente).
- [ ] Toda acción de personal y de activación queda auditada con motivo cuando corresponde.
- [ ] El módulo `tienda` solo usa `SuscripcionServicio`, `BalanceServicio` y `AuditoriaServicio` de otros módulos (nada de sus repositorios o entidades).
- [ ] `mvn test` en verde dos veces; `ArquitecturaTest` incluido.
- [ ] Commits sin `Co-Authored-By`.

## Verificación (ejecutar y pegar resumen en el reporte)
```bash
mvn -q -DskipTests compile
mvn test
mvn test
git grep -n "modules.tienda\|\"/tiendas" -- src
git log --format='%h %s%n%b' develop..HEAD | grep -ci "co-authored"
```
(El `git grep` debe salir vacío —salvo la prueba que verifica el 404, si la escribes con la ruta partida como en T-003— y el conteo final `0`.)

## Riesgos y notas
- **No arranques la app contra Supabase** (Flyway aplicaría V4).
- El módulo `catalogo` viejo sigue usando `TenantContextHolder`: no lo toques.
- Las pruebas que insertan planes o tiendas extra deben limpiar lo que rompa a otras pruebas (como hizo T-004 con los planes).
- Si un punto de control no cabe, detente con commit y pruebas en verde y repórtalo como parcial.
