# W-008-C1 — Subir imagen de producto desde el equipo (A-001)

| Campo | Valor |
|---|---|
| Ejecutor | Haiku, en el checkout principal (puerto 3000), con navegador |
| Rama | `tarea/W-008-C1-subir-imagen` desde `develop` |
| Depende de | W-008 (web) y **A-001** (backend, mergeado en `af16136`; `api-core` ya reconstruido) |
| Tamaño | S |

## Objetivo
En la isla **Imágenes** del detalle del producto (W-008), además de "pegar URL", el comerciante puede **subir un archivo** desde su equipo. La web lo envía a la API, recibe la URL pública y la agrega al producto con el endpoint de imágenes que ya existe. Prioridad: **que funcione e integre con la API**. Sin pulido visual y **sin capturas**.

## Contexto (leer solo esto)
- `docs/orquestacion/ajustes/A-001-subida-de-imagenes.md` (contrato y códigos)
- Código: `src/modules/catalogo/` (detalle del producto, acción de agregar imagen por URL, `TODO(A-001)`), `src/lib/api/client.ts`, `src/app/api/[...ruta]/route.ts` (el proxy ya reenvía el cuerpo binario con su `Content-Type`; límite de 6 MB)

## Contrato (verificado por Opus)
| Acción | Endpoint | Cuerpo / respuesta |
|---|---|---|
| Subir | `POST /panel/archivos/imagenes` (con `X-Tienda-Id`, que pone el proxy; permiso `CATALOGO_GESTIONAR`) | `multipart/form-data` con el campo **`archivo`** → 201 `{ url }` (URL pública `https`) |
| Agregar al producto | `POST /panel/catalogo/productos/{productoId}/imagenes` (ya existe, W-008) | `{ url_imagen: <url devuelta>, texto_alternativo?, es_principal? }` |

Reglas de la API: solo **JPEG, PNG y WebP** (validados por los bytes del archivo), **máximo 5 MB**. Errores: `ALM-004` (no es una imagen válida), `ALM-005` (más de 5 MB), `ALM-003` (tipo no soportado), `ALM-002` (no se pudo guardar), `ALM-001` (almacenamiento no configurado, 503).

## Cambios
1. En la isla Imágenes: un control "Subir desde mi equipo" (`<input type="file" accept="image/jpeg,image/png,image/webp">`, con un botón existente que lo abra) junto al formulario de URL actual (que se conserva).
2. Validación previa en la web (solo para avisar antes, la API decide): tipo JPEG/PNG/WebP y tamaño ≤ 5 MB; si no, mensaje en el campo y no se envía.
3. Al elegir el archivo: subir (`FormData` con el campo `archivo`) → con la `url` devuelta, llamar a la acción de agregar imagen (texto alternativo opcional del mismo formulario) → recargar las imágenes. Botón en estado "Subiendo…" y desactivado mientras tanto.
4. **Cuidado con axios**: la instancia de `lib/api/client.ts` tiene `Content-Type: application/json` por defecto. Con `FormData`, **no** se debe enviar ese encabezado (axios convertiría el `FormData` a JSON o faltaría el `boundary`). Pasar el encabezado `Content-Type` como `undefined`/eliminarlo para esa petición, de modo que el navegador ponga `multipart/form-data; boundary=…`. Verificarlo en la pestaña Red del navegador.
5. Errores: el `mensaje` de la API en el formulario o en un toast. Quitar el `TODO(A-001)`.
6. No crear ni modificar nada en `src/shared/components/**` ni `globals.css`.

## Criterios de aceptación (con la API real, en "Tienda W006 Prueba", producto "Plato W008 UI")
- [ ] Subir un PNG o JPG pequeño desde el equipo → aparece en la lista de imágenes del producto y su URL abre la imagen.
- [ ] La petición sale como `multipart/form-data` con `boundary` (comprobado en Red).
- [ ] Un archivo de texto renombrado a `.png` → error de la API (`ALM-004`) visible; un archivo de más de 5 MB → aviso de la web sin enviar.
- [ ] Marcar la imagen subida como principal funciona (como con las de URL).
- [ ] El flujo de pegar URL sigue funcionando.
- [ ] `npm run lint`, `npx tsc --noEmit` y `npm run build` sin errores.
- [ ] Reporte con cada flujo y su resultado (**sin capturas**) y las imágenes subidas (URLs).
- [ ] **No detener la API**.
