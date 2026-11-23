# A-001 — Subida de imágenes a Supabase Storage

| Campo | Valor |
|---|---|
| Modelo sugerido | Sonnet (sesión del backend) |
| Repositorio | `ShopifyClon-Api-Core` |
| Rama | `ajuste/A-001-subida-imagenes` desde `develop` |
| Origen | Frontend, decisión QW-004 (la web ofrece **pegar URL** o **subir archivo**) |
| Bloquea | W-008 (imágenes de producto), solo la opción "subir" |
| Tamaño estimado | M |

## Objetivo
El comerciante sube una imagen desde la web y recibe una URL `https` pública. Esa URL se usa luego con los endpoints que ya existen (`POST /panel/catalogo/productos/{id}/imagenes` con `ImagenRequest.urlImagen`). **No cambia** ningún contrato existente: solo se agrega un endpoint.

## Contexto obligatorio (leer solo esto)
- `docs/arquitectura-backend.md` (capas, `RespuestaApi`, errores)
- `docs/negocio/modulos/transversal.md` (formato de errores y códigos) y `docs/negocio/modulos/catalogo.md`
- `modulos/catalogo/controlador/ImagenPanelControlador.java` (permiso y `X-Tienda-Id` a imitar)
- `application.properties`, sección `app.supabase.*`

## Alcance
- `POST /panel/archivos/imagenes` (`multipart/form-data`, campo `archivo`), con `X-Tienda-Id` y el mismo permiso que gestionar el catálogo.
- Validación: solo JPEG, PNG y WebP, comprobando los **bytes iniciales** (no solo el `Content-Type`); máximo 5 MB.
- **Almacenamiento intercambiable (decisión del responsable, 2026-10-21: no quedar amarrado a Supabase)**: una interfaz `AlmacenamientoImagenes` (`subir(tiendaId, bytes, tipo) → url pública`) en `comun` o en el módulo de catálogo, y una implementación `SupabaseStorageAlmacenamiento`. El servicio del endpoint solo conoce la interfaz. La implementación se elige con `app.almacenamiento.proveedor` (por defecto `supabase`); otra futura (S3/R2, disco local) será una clase nueva sin tocar el servicio.
- Implementación Supabase: bucket público `app.supabase.bucket-imagenes` (por defecto `ShopifyClon-Images-Core`, el nombre real creado por el responsable), ruta `{tiendaId}/{uuid}.{ext}`, API REST de Storage (`RestClient`, sin dependencias nuevas), URL base `app.supabase.url` (ya existe, `SUPABASE_URL`) y la clave **`app.supabase.secret-key=${SUPABASE_SECRET_KEY:}`** (la variable que ya puso el responsable; vacía por defecto).
  - Es una clave del formato nuevo de Supabase (`sb_secret_…`), no la `service_role` JWT antigua: se envía en la cabecera **`apikey`**; comprobar contra el bucket real si Storage además exige `Authorization: Bearer <clave>` y documentar lo que funcionó.
  - La `publishable key` (`SUPABASE_PUBLISHABLE_KEY`) **no** sirve para subir: no usarla aquí.
- Respuesta `201` con `RespuestaApi<{ url }>`: URL pública `https` del objeto.
- Códigos nuevos (registrar en `catalogo.md` o `transversal.md`): archivo no permitido (422), archivo demasiado grande (413/422), almacenamiento no configurado o caído (503). Elegir prefijo según la convención vigente.
- `spring.servlet.multipart.max-file-size` y `max-request-size` coherentes con 5 MB.
- Pruebas: tipo inválido, tamaño excedido, sin permiso (403), tienda ajena, éxito con el cliente de Storage simulado.

## Fuera de alcance
- Borrar del bucket la imagen cuando se elimina de un producto (anotar como pendiente).
- Redimensionar o comprimir.

## Criterios de aceptación (verificables)
- [ ] El endpoint aparece en Swagger con su esquema multipart.
- [ ] Un PNG renombrado a `.exe` se acepta solo si sus bytes son PNG; un texto renombrado a `.png` se rechaza.
- [ ] Sin `SUPABASE_SECRET_KEY` el endpoint responde 503 con código propio y el resto de la API arranca normal.
- [ ] El servicio depende solo de la interfaz `AlmacenamientoImagenes` (prueba con una implementación falsa).
- [ ] Prueba real manual contra el bucket: subir una imagen pequeña y abrir la URL devuelta (200). Anotar la URL en el reporte.
- [ ] La URL devuelta funciona en `POST /panel/catalogo/productos/{id}/imagenes`.
- [ ] Pruebas afectadas en verde (`mvn test -Dtest=...` de las clases nuevas y de catálogo/imágenes); la suite completa solo si el responsable la pide.

## Requisitos del responsable (antes de la verificación real)
- ✅ Claves puestas en los `.env` (2026-10-21): `SUPABASE_URL`, `SUPABASE_PUBLISHABLE_KEY` y `SUPABASE_SECRET_KEY` en el API. La `SUPABASE_SECRET_KEY` es secreta: nunca en la web ni en el repositorio; en Railway, como variable del servicio de la API.
- Bucket **público** `ShopifyClon-Images-Core` (creado por el responsable el 2026-10-21, con límite de 5 MB y tipos image/jpeg, image/png, image/webp): si no existe, el ejecutor lo comprueba con `GET {SUPABASE_URL}/storage/v1/bucket/ShopifyClon-Images-Core` y, si falta, **se detiene y avisa** (no lo crea por su cuenta).
- La web **no** necesita claves de Supabase: sube a la API (`POST /api/panel/archivos/imagenes` por el proxy). `NEXT_PUBLIC_SUPABASE_URL`/`NEXT_PUBLIC_SUPABASE_ANON_KEY` del `.env` de la web no se usan (la publishable/anon key es pública por diseño, no es un riesgo, pero conviene no depender de ella).

## Riesgos y notas para el ejecutor
- La clave de servicio salta las políticas de Storage: el endpoint debe validar tienda y permiso **antes** de subir.
- Nunca usar el nombre de archivo del usuario en la ruta.
