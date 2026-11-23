# T-001 — Flyway, Testcontainers y base de pruebas de integración

| Campo | Valor |
|---|---|
| Modelo sugerido | Sonnet |
| Repositorio | `C:\UTP-Proyectos\Shopify-Clon-Core\Desarrollo\ShopifyClon-Api-Core` |
| Rama | `tarea/T-001-flyway-y-pruebas` desde `develop` |
| Depende de | — |
| Tamaño estimado | S |

## Objetivo
Que el esquema se aplique con Flyway (V1 + V2) y que exista una base de pruebas de integración contra PostgreSQL real desechable (Testcontainers), lista para que las tareas siguientes escriban pruebas HTTP del comportamiento definido en `docs/negocio`.

> El código actual **no** es la referencia (D-022): no se escriben pruebas que fijen su comportamiento. Los módulos se reescriben en tareas posteriores.

## Contexto obligatorio (leer solo esto)
- `C:\UTP-Proyectos\Shopify-Clon-Core\Desarrollo\docs\orquestacion\README.md` (reglas del ejecutor)
- `C:\UTP-Proyectos\Shopify-Clon-Core\Desarrollo\docs\arquitectura-backend.md` (sección "Pruebas")
- `C:\UTP-Proyectos\Shopify-Clon-Core\Desarrollo\database.sql` (V1)
- `C:\UTP-Proyectos\Shopify-Clon-Core\Desarrollo\docs\base-de-datos\V002__suscripciones-y-ajustes.sql` (V2)
- Del código: `pom.xml`, `src/main/resources/application.properties`, `config/DotenvInitializer.java`, `src/test/java/shopify/api/core/ShopifyApplicationTests.java`, y los controladores de `modules/usuario/infrastructure/rest/` (solo para la prueba de ejemplo).

## Alcance
1. **Dependencias** en `pom.xml` (sin versión; las gestiona el BOM de Spring Boot 3.3.4). No agregues ni actualices nada más:
   - `org.flywaydb:flyway-core`, `org.flywaydb:flyway-database-postgresql`
   - test: `org.springframework.boot:spring-boot-testcontainers`, `org.testcontainers:junit-jupiter`, `org.testcontainers:postgresql`
   - test: `com.tngtech.archunit:archunit-junit5` versión `1.3.0` (se usará desde T-002; aquí solo se agrega)
2. **Migraciones** en `src/main/resources/db/migration/`:
   - `V1__esquema_inicial.sql`: copia exacta de `database.sql`.
   - `V2__suscripciones_y_ajustes.sql`: copia de `V002__suscripciones-y-ajustes.sql` quitando solo las líneas `BEGIN;` y `COMMIT;`.
3. **Configuración** en `application.properties`:
   ```properties
   spring.flyway.enabled=${FLYWAY_ENABLED:true}
   spring.flyway.locations=classpath:db/migration
   spring.flyway.baseline-on-migrate=true
   spring.flyway.baseline-version=2
   ```
4. **Base de pruebas** en `src/test/java/shopify/api/core/soporte/`:
   - `PruebaIntegracionBase` (abstracta): `@SpringBootTest` + `@AutoConfigureMockMvc` + `@ActiveProfiles("test")`; un único `PostgreSQLContainer<?>` (`postgres:16-alpine`) **compartido** por toda la ejecución (iniciado en bloque `static`, registrado con `@ServiceConnection` o `@DynamicPropertySource`); `@MockBean JavaMailSender`. Expone `MockMvc mvc`, `ObjectMapper json`, `JdbcTemplate jdbc`, y helpers genéricos: `String sufijo()` (único por llamada), `ResultActions postJson(ruta, cuerpo, String jwt, UUID tiendaId)`, `getConToken(...)`, `putJson(...)`, `delete(...)` (jwt y tienda opcionales: si no son nulos se envían `Authorization: Bearer …` y `X-Tienda-Id`).
   - `Rutas`: clase de constantes vacía con un comentario explicando que toda ruta usada por pruebas se declara aquí.
   - `src/test/resources/application-test.properties`: valores **ficticios** para toda propiedad obligatoria (p. ej. `jwt.secreto` de prueba de 64+ caracteres, `app.supabase.url=http://localhost`, `spring.mail.host=localhost`). Nada de `.env`.
   - Si `DotenvInitializer` carga `.env` en el perfil `test`, haz que no lo haga cuando el perfil activo sea `test` (cambio mínimo).
5. `ShopifyApplicationTests` extiende `PruebaIntegracionBase` (hoy se conectaría a Supabase y, con Flyway, **migraría la base real**).
6. **Pruebas de la base**, en `src/test/java/shopify/api/core/soporte/`:
   - `MigracionesTest`: verifica con `jdbc` que existen las tablas `PlanesSuscripcion`, `SuscripcionesTienda`, `CobrosSuscripcion`, `TarifasEnvio`, `MovimientosInventario`, `RegistroAuditoria`; que hay 3 planes (`BASICO`, `ESTANDAR`, `AVANZADO`) y los roles `PROPIETARIO`, `ADMINISTRADOR`, `GESTOR_CATALOGO`, `GESTOR_PEDIDOS`; y que `flyway_schema_history` tiene las versiones `1` y `2` con `success = true`.
   - `PruebaEjemploHttpTest`: una sola prueba que hace `POST /usuarios/registro` con datos válidos y sufijo único y verifica `2xx` y que la fila existe en `"Usuarios"`. Su único fin es demostrar que la base HTTP funciona (se reemplazará en T-003).

## Fuera de alcance
- Cualquier cambio en `src/main/java` salvo el mínimo de `DotenvInitializer`.
- Entidades nuevas, re-arquitectura, cambios de rutas.
- **Arrancar la aplicación con el `.env` real**: aplicaría V2 en Supabase. Eso lo hará el responsable cuando decida.

## Criterios de aceptación
- [ ] `mvn test` → `BUILD SUCCESS` con Docker encendido, dos ejecuciones seguidas.
- [ ] El log muestra a Flyway aplicando las versiones 1 y 2 sobre el contenedor.
- [ ] Las pruebas no leen `.env` ni se conectan a Supabase (verificable: con `.env` renombrado temporalmente, `mvn test` sigue pasando — hazlo y restáuralo).
- [ ] No hay valores de `.env` en ningún archivo nuevo.

## Verificación (ejecutar y pegar resumen en el reporte)
```bash
mvn -q -DskipTests compile
mvn test
mvn test
git log --oneline develop..HEAD
```

## Riesgos y notas
- Sin Docker no hay Testcontainers: si no conecta, detente y repórtalo; no uses H2.
- `ddl-auto=validate` corre tras Flyway: si el contexto no levanta por una columna que una entidad mapea y el SQL no tiene, no cambies ni la entidad ni el SQL: repórtalo como bloqueante.
- JSON en `snake_case` (`correo_electronico`, `contrasena`, `nombres`, `apellidos`).
- Commits sugeridos: `chore(T-001): flyway y migraciones V1 V2`, `test(T-001): base testcontainers`, `test(T-001): pruebas de migraciones y ejemplo http`.
