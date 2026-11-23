# Plan de migración de datos y despliegue del rediseño (R-001)

**Estado:** preparado, **nada de esto se ejecutó**. No se tocó `develop`, `prod` ni Railway. Lo decide el usuario. Última revisión: 2026-11-17, sobre la rama `develop-rediseno` del backend.

## 1. Qué cambia en la base de datos (Flyway V7 a V10)

Todas las migraciones son **aditivas**: no borran tablas ni columnas. Se aplican solas al arrancar la API (`FLYWAY_ENABLED=true`). Probadas en una base vacía (todas las pruebas de integración) y sobre datos antiguos (V8).

| Migración | Qué hace | Riesgo sobre datos existentes |
|---|---|---|
| V7 | `Tiendas`: `Descripcion`, `UrlLogo`, `VisibleEnMercado` (por omisión `TRUE`); plan `GRATIS`; índice del mercado | Bajo. Las tiendas existentes quedan **visibles en el mercado** salvo que se oculten |
| V8 | Tabla `Pedidos`, `Ordenes.PedidoId` y relleno: **cada orden existente recibe un pedido de una hija** (mismo id, número `P-000001…`, moneda de su tienda) | Medio: toca todas las filas de `Ordenes`. Probado con 2 órdenes de 2 tiendas. En bases grandes tarda lo que tarde un `INSERT … SELECT` |
| V9 | Cambia la unicidad de `Pagos` (ahora incluye la orden) y crea `RepartosPago` | Bajo. Las ventas históricas **no** tienen asientos en `RepartosPago`; solo los pagos nuevos |
| V10 | `RolesPlataforma`, `RolesPlataformaPermisos`, `Usuarios.RolPlataformaId`; roles `ADMIN_PLATAFORMA`, `SOPORTE`, `FINANZAS` | Bajo. Los administradores actuales siguen siendo superadministradores (bandera) |

**No hay migración de vuelta.** Para deshacer, restaurar un respaldo anterior a V7. Por eso el paso 0 de abajo es obligatorio si la base tiene datos que importan.

## 2. Dos caminos para Railway

### Camino A (recomendado): base nueva y vacía en Railway
El usuario ya dijo que la base de Railway se crea desde cero. Es el camino más limpio:
1. Crear el Postgres de Railway y apuntar `DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USERNAME`, `DB_PASSWORD`, `DB_SSL_MODE`.
2. Primer arranque de la API: Flyway crea todo (V1 a V10) y siembra planes (`BASICO`, `ESTANDAR`, `AVANZADO`, `GRATIS`), roles de tienda y roles de plataforma.
3. Crear la cuenta de administrador de plataforma (no hay endpoint, es a propósito): registrarse por `/auth/registro`, activar con el código, y luego en la base: `UPDATE "Usuarios" SET "EsAdministradorPlataforma" = TRUE WHERE "CorreoElectronico" = '<correo>';`. (La columna no se puede editar desde la API.) Los administradores siguientes se crean desde la API con un rol (`POST /plataforma/administradores`).
4. Las cuentas de prueba y las tiendas de demostración se crean de nuevo; las imágenes nuevas se suben a Supabase Storage.

### Camino B: llevar los datos de Supabase a Railway
Solo si hay datos reales que conservar. Orden:
1. **Respaldo completo** de Supabase antes de tocar nada (`pg_dump` en formato custom).
2. Levantar la API contra la base **vacía** de Railway para que Flyway cree el esquema.
3. Copiar solo datos, sin la tabla de Flyway ni las sembradas por migración (`PlanesSuscripcion`, `Roles`, `RolesPlataforma`, `RolesPlataformaPermisos`), con las restricciones diferidas: `pg_dump --data-only --disable-triggers --exclude-table=flyway_schema_history …` y `pg_restore`. Si los planes de Supabase tienen precios cambiados, copiarlos con `INSERT … ON CONFLICT ("Codigo") DO UPDATE`.
4. Ejecutar V8 a mano **no** hace falta: si los datos copiados son de antes del rediseño, copiar `Ordenes` sin `PedidoId` y correr el `INSERT … SELECT` de V8 sobre ellas (está en `V8__pedidos.sql`); si ya son de V8, copiarlos tal cual. No mezclar ambos casos.
5. Ajustar la secuencia: `SELECT setval('"SecuenciaNumeroPedido"', (SELECT COALESCE(MAX(substring("NumeroPedido" from 3)::int), 0) + 1 FROM "Pedidos"), false);`
6. Las **imágenes** viven en Supabase Storage (`SUPABASE_*`) y la base solo guarda sus URL: siguen funcionando mientras el bucket exista. Migrarlas es un trabajo aparte.
7. Verificar conteos por tabla (`Usuarios`, `Tiendas`, `Productos`, `Ordenes`, `Pedidos`, `Pagos`) entre origen y destino.

## 3. Variables de entorno (solo los nombres; los valores los pone el usuario en Railway)
Sin cambios respecto de hoy: `DB_*`, `JWT_SECRET_KEY`, `JWT_EXPIRATION_TIME`, `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `BREVO_API_KEY`, `MAIL_*`, `SUPABASE_*`, `CORS_ORIGENES_PERMITIDOS`, `APP_WEB_URL`, `APP_ZONA_HORARIA`, `PROXY_CABECERA_IP`/`API_PROXY_SECRETO`, `FORWARD_HEADERS_STRATEGY`, `WS_*`, `FLYWAY_ENABLED`.
**Decidir antes del despliegue:** `SWAGGER_HABILITADO` y `LABORATORIO_HABILITADO` (apagarlos pasada la presentación; el laboratorio escribe datos reales) y que `CORS_ORIGENES_PERMITIDOS` incluya el dominio del frontend nuevo. No hay variables nuevas del rediseño.

## 4. Stripe
- El webhook sigue siendo el mismo (`/webhooks/stripe`) y los mismos eventos (`payment_intent.succeeded` y `payment_intent.payment_failed`). **No hay que reconfigurarlo.**
- Un pedido de varias tiendas se cobra con **un** PaymentIntent (metadato `pedido_id`) y un pago por orden con la misma transacción. Los reembolsos por orden hija se hacen como reembolsos parciales sobre ese cobro.
- **No se probó contra Stripe real** (solo con la pasarela falsa de las pruebas). Antes de la presentación conviene un pago de prueba con la tarjeta `4242 4242 4242 4242` en un pedido de dos tiendas y confirmar que llega el webhook.

## 5. Pasos de despliegue (cuando el usuario lo autorice)
0. Respaldo de la base destino (si no es vacía).
1. Integrar `develop-rediseno` en `develop` (el usuario) y de `develop` a `prod`. Railway despliega solo desde `prod`.
2. Revisar las variables de la sección 3 en Railway.
3. Desplegar. En el log debe verse a Flyway aplicando V7 a V10 y el arranque sin errores.
4. Pruebas de humo, en este orden: `GET /health` → `GET /planes` (4 planes, `GRATIS` con `es_gratuito`) → `GET /mercado/destacados` → login del administrador → `GET /plataforma/roles` → crear una tienda gratuita → un pedido de dos tiendas con pago de prueba → `GET /plataforma/repartos`.
5. Apagar Swagger y el laboratorio si corresponde.

**Plan de vuelta atrás:** volver a desplegar el commit anterior de `prod` basta para recuperar el código, porque las columnas y tablas nuevas quedan y el código viejo las ignora (y el índice nuevo de `Pagos` es más permisivo que el anterior). Lo que no se deshace son los pedidos, pagos y repartos creados con el código nuevo. Para volver del todo, restaurar el respaldo del paso 0.

## 6. Riesgos abiertos
- La regla «la plataforma no puede quedarse sin quien gestione administradores» está implementada pero **sin prueba automática** (en la base compartida de pruebas siempre hay otros superadministradores).
- Las ventas anteriores al rediseño no aparecen en `RepartosPago`; el panel de movimientos solo muestra pagos nuevos.
- `visible_en_mercado` es verdadero por omisión: las tiendas existentes aparecerán en el mercado en cuanto tengan productos publicados con imagen.
- No se audita aún el desbloqueo con código por correo ni la recuperación de clave.
- Pago con Stripe real sin probar (sección 4). Fuera de alcance por decisión: transportista (B10), roles de tienda editables (B9 etapa 2) y sesiones activas.
