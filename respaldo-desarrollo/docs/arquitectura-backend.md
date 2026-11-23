# Arquitectura del backend (objetivo)

Arquitectura **por capas dentro de cada módulo de negocio** (D-021): controlador → servicio → repositorio, con entidades, DTOs, modelos y mapeadores. Reemplaza a la semi-hexagonal (dominio puro + puertos + adaptadores + casos de uso atómicos). Aplica `kit-claude-estandares-universales/backend/01-arquitectura.md` y `02-datos-y-transacciones.md` traducidos a Spring Boot.

## Estructura de paquetes
```text
shopify.api.core
├── ShopifyApplication.java
├── comun/                         # transversal, sin reglas de negocio
│   ├── config/                    # CORS, OpenAPI, JPA auditing, MVC, Async, Scheduling, Dotenv
│   ├── seguridad/                 # SecurityConfig, jwt/, ContextoTienda, Permiso, RolTienda, @RequierePermiso
│   ├── auditoria/                 # AuditoriaEntidad (base JPA), RegistroAuditoria (entidad, repo, servicio)
│   ├── excepcion/                 # excepciones con código + ManejadorExcepcionesGlobal
│   ├── dto/                       # RespuestaApi, ConsultaPaginadaDto, PaginacionQueryInput, EstadoOperacionDto
│   ├── evento/                    # PublicadorEvento
│   └── util/                      # GeneradorSlug, GeneradorToken, Dinero (redondeo), Reloj
└── modulos/
    └── <modulo>/
        ├── controlador/           # @RestController por recurso
        ├── servicio/              # @Service: reglas y transacciones
        ├── repositorio/           # Spring Data JPA: todas las consultas
        ├── entidad/               # @Entity (extienden AuditoriaEntidad)
        ├── dto/
        │   ├── request/
        │   └── response/
        ├── modelo/                # enums de estado con transiciones, objetos de valor, constantes
        ├── mapeador/              # MapStruct entidad ⇄ DTO
        └── (opcionales, solo si existen)
            ├── evento/            # records de eventos del módulo
            ├── escuchador/        # @TransactionalEventListener(AFTER_COMMIT)
            ├── programador/       # @Scheduled (vencimientos, renovaciones)
            └── pasarela/          # clientes de servicios externos (Stripe, correo)
```

## Módulos y dueños de tablas
| Módulo | Tablas que escribe (dueño) |
|---|---|
| `usuario` | Usuarios, TokensSeguridad, DireccionesUsuario |
| `tienda` | Tiendas, PersonalTienda, Roles (solo lectura en runtime) |
| `suscripcion` | PlanesSuscripcion, SuscripcionesTienda, CobrosSuscripcion |
| `catalogo` | Categorias, Productos, ProductosCategorias, VariantesProducto, ImagenesProducto |
| `inventario` | InventarioVariante, MovimientosInventario |
| `cupon` | Cupones |
| `envio` | TarifasEnvio, Envios |
| `carrito` | Carritos, ItemsCarrito |
| `orden` | Ordenes, ItemsOrden |
| `checkout` | — (orquesta; escribe a través de los servicios dueños) |
| `pago` | Pagos (+ orquesta cancelación y reembolso) |
| `balance` | BalancesTienda |
| `notificacion` | — (escucha eventos y envía correos) |
| `comun/auditoria` | RegistroAuditoria |

## Dependencias permitidas (sin ciclos)
```text
checkout ─► carrito, catalogo, inventario, cupon, envio, tienda, orden, totales
pago     ─► orden, inventario, balance, cupon, suscripcion
envio    ─► orden, tienda
ruta     ─► envio (despacha al iniciar; lee envíos y órdenes con consultas de solo lectura)
seguimiento ─► envio, ruta (consulta pública)
carrito  ─► catalogo, inventario, cupon, tienda, totales, envio (cotización con envío, A-003)
catalogo ─► suscripcion (límites), inventario (alta de inventario inicial)
tienda   ─► suscripcion, balance
suscripcion, inventario, cupon, balance, orden, usuario ─► solo comun
```
- Un módulo usa otro **solo a través de su servicio** (clase `*Servicio` pública). Nunca inyecta el repositorio ni la entidad de otro módulo para **escribir**.
- Para **leer** datos ajenos en un listado o reporte, el repositorio propio puede tener una consulta con `JOIN` o proyección (sin modificar). Ejemplo: `suscripcion` cuenta productos y personal con consultas propias para validar SUS-008, en vez de depender de `catalogo` (que ya depende de `suscripcion`).
- Entre módulos se referencian por **id** (`UUID tiendaId`), no con `@ManyToOne` a entidades de otro módulo. Dentro de un módulo sí (`Producto` → `Variante`).
- `orden` no conoce a `pago` ni a `envio`: expone métodos de transición (`aplicarPagoConfirmado`, `aplicarReembolso`, `marcarPreparada`, `marcarEntregada`, `anular`) que solo llaman esos módulos.

## Responsabilidades por capa
| Capa | Hace | No hace |
|---|---|---|
| Controlador | Rutas, `@Valid`, obtener `ContextoTienda`/usuario, `@RequierePermiso`, llamar **un** método de servicio, envolver en `RespuestaApi` | Reglas, consultas, inyectar repositorios, `@Transactional` |
| Servicio | Reglas de negocio con su código (`CAT-003`), permisos que dependen del contenido, cálculos, `@Transactional`, auditoría atómica, publicar eventos | `EntityManager`, JPQL/SQL, `HttpServletRequest`, devolver entidades al controlador |
| Repositorio | `JpaRepository<Entidad, UUID>`, `@Query`, `@Lock(PESSIMISTIC_WRITE)`, `@Modifying` para updates relativos | Reglas, DTOs de request/response, transacciones propias, excepciones de negocio |
| Entidad | Mapeo JPA exacto de la tabla | Lógica de negocio compleja (sí métodos pequeños como `estaOperativa()`) |
| DTO | Contrato HTTP (request con Bean Validation, response sin datos internos) | Exponer entidades |
| Modelo | Enums con `puedeTransicionarA`, objetos de valor (`TotalesCalculados`), constantes | Acceso a datos |
| Mapeador | MapStruct entidad → response, request → entidad | Reglas |

## Convenciones Spring
- **Nombres**: `ProductoControlador`, `ProductoServicio`, `ProductoRepositorio`, `ProductoEntidad`, `CrearProductoRequest`, `ProductoDetalleResponse`, `ProductoMapeador`, `EstadoPago` (enum en `modelo/`).
- **Un controlador por recurso** (no uno por acción). Si un servicio supera ~400 líneas o mezcla flujos, se parte por caso de uso (`CheckoutServicio`, `ReembolsoServicio`).
- **Transacción** = `@Transactional` en el método público del servicio (unidad de trabajo). Lecturas: `@Transactional(readOnly = true)`. Nada de red (Stripe, correo) dentro de una transacción con bloqueos.
- **Eventos**: se publican en el servicio; los escuchadores usan `@TransactionalEventListener(phase = AFTER_COMMIT)` + `@Async`.
- **Bloqueos**: métodos de repositorio `bloquearPor…` con `@Lock(LockModeType.PESSIMISTIC_WRITE)`; orden de bloqueo documentado en el módulo.
- **Updates relativos** (balance, cupón, número de orden): `@Modifying @Query("UPDATE … SET x = x + :delta …")` que devuelven filas afectadas.
- **Estados**: `@Enumerated(EnumType.STRING)` con enums cuyo `name()` coincide con el CHECK de la BD.
- **Dinero**: `BigDecimal`, escala 2, `RoundingMode.HALF_UP` vía `comun/util/Dinero`.
- **Tiempo**: `Instant` en UTC; reloj inyectable (`Clock` bean) para poder probar vencimientos.
- **Excepciones** (`comun/excepcion`): `NoAutenticadoException` 401, `AccesoDenegadoException` 403, `RecursoNoEncontradoException` 404, `ConflictoEstadoException` 409, `ReglaNegocioException` 422. Todas reciben `(codigo, mensaje)`. Violaciones de índice único se traducen a 409/422 con el código de la regla en el servicio o en el manejador global.
- **JSON**: `snake_case` (ya configurado), nulos omitidos.
- **Migraciones**: Flyway (`src/main/resources/db/migration/V001__…`, `V002__…`); `ddl-auto=validate`.
- **Rutas**: panel bajo `/panel/...` con `X-Tienda-Id`; vitrina pública bajo `/vitrina/{subdominio}/...`; cuenta del usuario bajo `/cuenta/...`; plataforma bajo `/plataforma/...`; autenticación bajo `/auth/...`. Cada módulo adopta estas rutas al reescribirse (D-022). Las pruebas declaran sus rutas en la clase `Rutas`.

## Lo que desaparece
- `domain/modelo` (POJOs duplicados de la entidad), `domain/puerto`, `infrastructure/persistencia/adaptador`, mapeadores de persistencia dominio ⇄ entidad, `application/casouso` (uno por acción) y controladores atómicos.
- `BaseInputDto.idTienda` / `idUsuario`: el contexto viene de `ContextoTienda` y de la sesión, nunca del DTO.

## Pruebas
- `src/test/java/.../soporte/`: base con Testcontainers (PostgreSQL 16) + Flyway + `MockMvc`, utilidades para registrar/activar/iniciar sesión y crear tienda.
- Por módulo: `<Modulo>HumoTest` (HTTP de punta a punta) y pruebas unitarias de reglas puras (calculadora de totales, transiciones de estado).
- `ArquitecturaTest` (ArchUnit): controladores no dependen de repositorios; servicios no usan `EntityManager`; ningún módulo importa paquetes `repositorio` o `entidad` de otro módulo; sin ciclos entre `modulos.*`.
