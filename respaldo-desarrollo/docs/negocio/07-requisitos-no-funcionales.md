# Requisitos no funcionales

| Tema | Valor esperado | Cómo se mide |
|---|---|---|
| Usuarios simultáneos | 50 concurrentes en demo; diseño sin estado para escalar horizontalmente | Prueba de carga simple (k6 o JMeter) sobre catálogo y checkout |
| Volumen de datos y retención | < 10 000 órdenes/mes en demo; órdenes y pagos se conservan siempre (soft delete) | Conteo en base |
| Disponibilidad | Best effort (entorno académico); sin ventana fija | — |
| Tiempo de respuesta | Catálogo p95 < 300 ms; checkout p95 < 800 ms (sin contar pasarela) | Logs con duración por petición |
| Dispositivos | API REST; la web se rediseñará (móvil primero) | — |
| Modo degradado | Si la pasarela no responde, la orden queda `PENDIENTE` y se puede reintentar el pago | Prueba manual con pasarela caída |
| Respaldos | Los del plan de Supabase | — |
| Cumplimiento | Pagos en modo prueba; sin datos de tarjeta en el backend | Revisión de código |
| Auditoría exigida | `RegistroAuditoria` para las acciones listadas en `04-reglas-de-integridad.md` | Prueba por acción |
| Multi-inquilino | Desde el inicio: base compartida, filtro por `TiendaId` validado | Prueba de aislamiento entre dos tiendas (SEG-001) |
| Concurrencia crítica | Dos checkouts por la última unidad: exactamente uno reserva | Prueba de concurrencia con base real |
| Presupuesto | Supabase gratuito (límite de conexiones: pool máx. 10) | `DB_POOL_MAX_SIZE` |
| Observabilidad | Logs estructurados con id de correlación (`X-Correlacion-Id`), sin secretos | Revisión de logs |
