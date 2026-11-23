# Registro de decisiones

Formato: contexto → decisión → descartado → consecuencias. Estado `vigente` salvo que se indique. Fecha de todas las iniciales: 2026-10-13. Las marcadas **(confirmar)** las propuso Claude y esperan el visto bueno del responsable del proyecto.

### D-001 Orquestación por modelos
- Contexto: se quiere limitar el uso del modelo más caro.
- Decisión: Opus analiza, decide y escribe tareas en `docs/orquestacion/tareas/`; Sonnet (o Haiku en tareas mecánicas) las implementa en otra sesión; Opus revisa. Correcciones pequeñas las hace Opus; si son muchas, escribe una tarea de corrección.
- Descartado: un solo modelo para todo (caro) o implementar sin plan (incoherente entre módulos).
- Consecuencias: cada tarea debe ser autosuficiente; ver `docs/orquestacion/README.md`.

### D-002 Planes de suscripción en tres tablas
- Contexto: el profesor pidió planes de suscripción; Shopify cobra a la tienda un plan con límites y comisión.
- Decisión: `PlanesSuscripcion` (catálogo), `SuscripcionesTienda` (contrato vigente, una no cancelada por tienda) y `CobrosSuscripcion` (solo-añadir, un registro por intento de cobro de período). El precio se congela en la suscripción (`PrecioPactado`).
- Descartado: columna `PlanId` en `Tiendas` (no guarda historia ni período ni cobros).
- Consecuencias: migración `V002`; módulo `suscripcion` nuevo.

### D-003 Reserva de stock al crear la orden **(confirmar)**
- Contexto: `CantidadReservada` existe pero no se definió cuándo se usa.
- Decisión: agregar al carrito no reserva. El checkout crea la orden `PENDIENTE` y **reserva**; al pagarse se descuenta del físico y se libera la reserva; si vence sin pago o se cancela, se libera. Vencimiento: 30 min en pasarela en línea, 48 h en pago manual.
- Descartado: reservar al agregar al carrito (bloquea stock con carritos abandonados); descontar directo sin reserva (no distingue físico de comprometido).
- Consecuencias: tarea programada que anula órdenes vencidas.

### D-004 Un rol por usuario y tienda
- Decisión: la unicidad de `PersonalTienda` pasa a (`TiendaId`, `UsuarioId`) entre no eliminados.
- Descartado: varios roles acumulables (complica la matriz sin necesidad real).

### D-005 El comprador no es un rol
- Decisión: los compradores no se registran en `PersonalTienda`; su relación con la tienda son sus carritos y órdenes.
- Consecuencias: `PersonalTienda` = solo personal; el código `CLIENTE` se retira de la semilla.

### D-006 Matriz de permisos fija en código
- Decisión: enum `Permiso` y mapa `Rol → Set<Permiso>` en el código (ver `01-actores-roles-permisos.md`).
- Descartado: tabla de permisos editable (fuera de alcance v1; queda como futuro).

### D-007 Prueba gratuita y bloqueo por impago **(confirmar)**
- Decisión: al crear la tienda se crea una suscripción `PRUEBA` de 14 días al plan elegido (por defecto `BASICO`). Si vence sin pago pasa a `VENCIDA`: la vitrina y el checkout se cierran, el panel sigue accesible solo para pagar o exportar. Tras 30 días en `VENCIDA` la tienda pasa a `EstaActiva = FALSE` (no se borra nada).
- Descartado: borrar datos al vencer; permitir vender sin plan.

### D-008 Cambio de plan inmediato y sin prorrateo **(confirmar)**
- Decisión: subir o bajar de plan inicia un período nuevo con el precio del plan nuevo y genera su cobro. Bajar de plan se rechaza si el uso actual supera los límites del plan destino.
- Descartado: prorrateo por días (más exacto, más complejo; futuro).

### D-009 Pagos solo-añadir
- Decisión: cada cargo y cada reembolso es una fila de `Pagos` (`Tipo = CARGO | REEMBOLSO`). Lo reembolsado se calcula sumando filas.
- Descartado: editar `Monto` o tener un `Estado` `REEMBOLSADO` en el pago original.

### D-010 Preparación con un único envío por orden
- Decisión: v1 no admite envíos parciales: crear el envío marca toda la orden `PREPARADO`; entregarlo, `ENTREGADO`. Solo el módulo de envíos escribe `EstadoPreparacion`. Órdenes sin líneas que requieran envío pasan a `ENTREGADO` al pagarse.
- Descartado: preparación por línea (futuro).

### D-011 Tarifas de envío por tienda sin zonas
- Decisión: tabla `TarifasEnvio` (nombre, precio, monto mínimo para gratis). El comprador elige una en el checkout.
- Descartado: zonas por país/región y cálculo por peso (futuro; `PesoGramos` ya existe).

### D-012 Impuesto único por tienda **(confirmar)**
- Decisión: `Tiendas.TasaImpuesto` (por defecto 0.18, IGV) y `PreciosIncluyenImpuesto` (por defecto TRUE, costumbre en Perú). El envío no lleva impuesto.
- Descartado: impuestos por región o por producto.

### D-013 SKU único por tienda
- Contexto: hoy `UqVariantesProductoSKU` es global: una tienda bloquea el SKU de otra.
- Decisión: se elimina la restricción global; la unicidad por tienda la valida el servicio (consulta por tienda) y se refuerza con índice parcial cuando se añada `TiendaId` a variantes (futuro).
- Consecuencias: riesgo bajo de carrera entre dos altas simultáneas con el mismo SKU en la misma tienda; aceptado.

### D-014 Unicidades compatibles con eliminación lógica
- Decisión: las restricciones `UNIQUE` sobre slugs, códigos y números se reemplazan por índices únicos parciales `WHERE "Eliminado" = FALSE`, para poder reutilizar un slug o código borrado.

### D-015 Pasarelas de la primera versión
- Decisión: `MANUAL` (efectivo/transferencia; el personal registra el pago) y `STRIPE` en modo prueba con webhook firmado. `PAYPAL` y `MERCADOPAGO` quedan como valores reservados.

### D-016 Comisión de plataforma congelada al pagar
- Decisión: al aprobarse el cargo se guarda `Ordenes.ComisionPlataforma = Total × PorcentajeComision del plan vigente`; el balance suma `Total − Comision` a `SaldoPendienteCobro`. No hay liquidaciones automáticas en v1.

### D-017 Contexto de tienda validado
- Contexto: hoy cualquier usuario autenticado puede operar cualquier tienda enviando `X-Tienda-Id`, y `CrearProducto` acepta `idTienda` en el cuerpo.
- Decisión: el panel exige `X-Tienda-Id` y el servidor verifica que el usuario sea propietario o personal activo de esa tienda; si no, 404. La vitrina pública resuelve la tienda por subdominio. Nunca se lee `TiendaId` del cuerpo.

### D-018 Precios del carrito no congelados
- Decisión: el carrito siempre muestra el precio actual; el checkout recibe `total_esperado` y, si difiere del recalculado, responde 409 con el carrito actualizado para que el comprador confirme.

### D-019 Fusión de carritos al iniciar sesión
- Decisión: si un invitado inicia sesión con un carrito activo, se vincula a su usuario; si ya tenía otro activo en esa tienda, se fusionan sumando cantidades (tope por línea) y el de invitado se marca `CONVERTIDO`.

### D-020 Un cupón por orden; el uso no se devuelve
- Decisión: un cupón por carrito/orden. El uso se consume al crear la orden. Si la orden se anula por falta de pago **sí** se devuelve el uso; si se cancela después de pagada, no.

### D-021 Re-arquitectura: capas por módulo en lugar de semi-hexagonal
- Contexto: el backend empezó con dominio puro, puertos, adaptadores y un caso de uso + un controlador por acción; en la práctica los casos de uso de catálogo ya usaban JPA directo y la duplicación (modelo de dominio + entidad + dos mapeadores) no aportaba.
- Decisión: cada módulo con `controlador/`, `servicio/`, `repositorio/`, `entidad/`, `dto/`, `modelo/`, `mapeador/` y extras opcionales. Un controlador por recurso. La entidad JPA es el modelo persistente; no hay modelo de dominio paralelo. Detalle en `docs/arquitectura-backend.md`.
- Descartado: hexagonal completa (sobrecosto para un CRUD con reglas acotadas); carpetas globales por tipo técnico (`controllers/` con todo el sistema) porque mezcla capacidades.
- Consecuencias: se reescribe módulo por módulo (D-022). Los servicios sí importan entidades JPA, pero no `EntityManager` ni consultas: todas las consultas viven en el repositorio.

### D-022 Los documentos mandan sobre el código existente
- Contexto: el código actual del backend es un prototipo; el responsable indicó que la referencia son estos documentos.
- Decisión: cada módulo se **reescribe** según su MD y `docs/arquitectura-backend.md`, con pruebas del comportamiento objetivo, y el código viejo de ese módulo se elimina en la misma tarea. No se escriben pruebas que fijen el comportamiento actual.
- Descartado: refactorización segura con pruebas de humo previas (kit `08-refactorizacion-segura.md`): costaría fijar comportamiento que de todos modos se cambia, incluidos fallos de seguridad.
- Consecuencias: las rutas nuevas (`/auth`, `/cuenta`, `/panel`, `/vitrina`, `/plataforma`) se adoptan desde la reescritura de cada módulo; la web deberá adaptarse (se rediseña de todos modos).

### D-023 Límite de peticiones en memoria (provisional)
- Contexto: USR-009 exige limitar intentos de login/registro/recuperación; no hay dependencia de rate limiting ni Redis.
- Decisión: limitador propio en `comun/seguridad` con ventana fija de 1 minuto por (IP, ruta), en memoria del proceso, activado con `@LimitarPeticiones(porMinuto = N)`. La IP es `request.getRemoteAddr()`.
- Descartado: bucket4j/Redis (dependencias nuevas e infraestructura) por ahora.
- Consecuencias: con varias instancias el límite es por instancia; detrás de un proxy hará falta configurar `server.forward-headers-strategy`. Revisar al desplegar.

### D-024 Prueba gratuita una por usuario
- Fecha: 2026-10-14. Decisión del responsable (cierra Q-015).
- Decisión: solo la primera tienda de un usuario recibe prueba; las siguientes nacen `VENCIDA` y se activan pagando. `app.suscripcion.prueba-una-por-usuario=true`.
- Descartado: una prueba por tienda (permite no pagar nunca).

### D-025 La vitrina marca, no oculta, los productos sin stock
- Fecha: 2026-10-14. Decisión del responsable.
- Decisión: los productos publicados sin stock vendible se muestran con `disponible = false`; no se ocultan.
