# Datos y transacciones

## Repositorio (obligatorio en todo módulo con base de datos)
- Uno por **agregado** (las tablas que el módulo posee).
- Métodos con nombre de intención de negocio: `buscar…` (devuelve el objeto o nulo), `listar…`, `existe…`, `insertar…`, `bloquear…` (bloqueo de fila), `leerCompartido…`, `contar…`.
- Devuelve filas o formas tipadas pequeñas, nunca constructores de consulta del ORM.
- **Nunca** importa DTOs, lanza excepciones de transporte, captura errores de base de datos, abre transacciones ni emite eventos.
- El servicio convierte «no encontrado» en la excepción de negocio, conservando el mensaje que la API ya tenía.
- Se conservan las particularidades de cada consulta al migrar (un filtro ausente, un límite, un orden): son comportamiento observable. Si parecen un error, se anotan y se corrigen aparte.

## Unidad de trabajo
- El servicio abre la transacción con una unidad de trabajo: un proveedor que envuelve el mecanismo transaccional del acceso a datos, para que los servicios no conozcan el ORM.
- La transacción es el **último parámetro** de los métodos del repositorio: opcional en lecturas y escrituras que pueden ir dentro o fuera de una; **obligatoria** en cualquier método que bloquee filas.
- Una **marca de edición** (usuario + instante) se crea una vez por operación y se pasa a cada escritura: todas las filas comparten el instante.
- Transacciones cortas. Sin llamadas de red, correos ni mensajería externa dentro de ellas.

## Efectos posteriores al commit
- Eventos en tiempo real, correos, invalidación de cachés y auditoría por cola se ejecutan **después** de confirmar.
- La auditoría que debe ser atómica con el cambio usa la variante transaccional dentro del callback.
- Cuando un evento externo debe ser fiable respecto al cambio, **bandeja de salida transaccional** (outbox): el evento se guarda en la misma transacción y un proceso aparte lo publica con reintentos e idempotencia.

## Concurrencia y bloqueos
- Se bloquea la fila sobre la que se decide (`para actualizar`) o, si solo debe seguir abierta, con bloqueo compartido.
- **El orden de bloqueo es parte del contrato.** Se documenta por flujo y no se altera. Una lectura sin bloqueo para hallar al padre no se convierte en bloqueo: cambiaría el orden y puede provocar interbloqueos.
- Las carreras se respaldan en la base: índices únicos (parciales si aplica) y restricciones; la violación única se traduce a conflicto (409).

## Idempotencia
- Operaciones susceptibles de reintento (cobros, creaciones, devoluciones) reciben una **clave de idempotencia** del cliente.
- Orden: buscar la clave antes de la transacción; comparar una huella del contenido (misma clave con otro contenido = conflicto); insertar; capturar la violación única **fuera** de la transacción (ya está abortada) y releer al ganador con una consulta nueva.
- Decidir y **probar** qué reciben las peticiones simultáneas con la misma clave. Las perdedoras pueden esperar el bloqueo y recibir «ya procesado» (409) en vez de la respuesta reutilizada; el efecto sigue siendo una sola escritura, pero el contrato se documenta.

## Integridad en la base de datos
- Las invariantes críticas también viven en la base: únicos parciales («un solo turno abierto»), checks de rangos y estados, claves foráneas y, para registros contables, disparadores que impiden actualizar o borrar.
- Borrado lógico para datos con historia; las instantáneas (nombre y precio al momento de la venta) se guardan en la fila, no se reconstruyen.
- Dinero con tipo decimal exacto; tiempo en UTC.

## Consultas
- Parametrizadas siempre. Identificadores dinámicos (columna de orden) solo desde una lista permitida.
- Paginación obligatoria en listados. Evitar consultas en bucle: agrupar por lote.
- Lecturas independientes pueden ir en paralelo sobre el pool, **no** dentro de una transacción (la serializaría); el pool debe dimensionarse para ese paralelismo.

## Migraciones
- Parte del release, repetibles en CI, ejecutadas **una vez** por despliegue (no por réplica).
- Cambios sin interrupción con **expandir/contraer**: agregar compatible, migrar datos y código, retirar lo viejo después.
