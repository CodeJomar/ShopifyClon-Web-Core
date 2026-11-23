# W-014 — Vitrina pública: portada, catálogo y detalle de producto (base funcional)

| Campo | Valor |
|---|---|
| Ejecutor | Antigravity, **en paralelo** con Haiku (modo paralelo, ver `README.md`) |
| Carpeta de trabajo | worktree `C:\UTP-Proyectos\Shopify-Clon-Core\Desarrollo\wt\W-014` |
| Rama | `tarea/W-014-vitrina` desde `develop` |
| Depende de | W-003 (mergeada). No depende del panel |
| Tamaño | M |

## Objetivo
Cualquier persona, sin sesión, abre `/tienda/{subdominio}` y ve la tienda: portada, catálogo con búsqueda, categorías y orden, y el detalle de un producto con sus variantes. Es **móvil primero** y **se comparte por WhatsApp/Instagram** (metadatos Open Graph). Base funcional: **lo que importa es que funcione y esté integrado con la API**; el diseño lo trabaja después el responsable. El botón "Agregar al carrito" queda visible pero desactivado (lo conecta W-015).

## Contexto (leer solo esto)
- `docs/arquitectura-frontend.md` (estructura, reglas 1, 6, 8) y `docs/diseno-web.md` (§2 tokens, §4 componentes)
- `docs/negocio/modulos/catalogo.md` (CAT-011) y `docs/negocio/modulos/tiendas-y-personal.md` (TIE-004, TIE-009)
- Código: `src/lib/api/` (cliente y `ErrorApi`), `src/dtos/core/respuesta-api.dto.ts`, `src/shared/utils/dinero.ts`, `src/shared/components/` (solo para **usar**), `src/proxy.ts`, `src/modules/catalogo/` **no existe en `develop` todavía**: no lo busques

## Contrato de la API (verificado por Opus; públicas, sin sesión; JSON en `snake_case`)
| Acción | Endpoint | Respuesta |
|---|---|---|
| Tienda | `GET /vitrina/{subdominio}` | `{ nombre, subdominio, moneda, correo_contacto, precios_incluyen_impuesto }` · **404 `TIE-404`** si no existe o no es operativa |
| Categorías | `GET /vitrina/{subdominio}/categorias` | `[{ nombre, identificador_url }]` |
| Productos | `GET /vitrina/{subdominio}/productos?pagina=0&texto=&categoria={identificador_url}&orden=recientes\|precio_asc\|precio_desc` | `Paginado<{ titulo, identificador_url, precio_minimo, precio_comparacion?, imagen_principal?, disponible }>` (página desde 0) |
| Detalle | `GET /vitrina/{subdominio}/productos/{identificador_url}` | `{ titulo, identificador_url, descripcion?, categorias: [{ nombre, identificador_url }], variantes: [{ id, titulo, precio, precio_comparacion?, disponible, requiere_envio }], imagenes: [{ url_imagen, texto_alternativo?, variante_id?, posicion }] }` · 404 si no está publicado |

La vitrina **nunca** recibe `costo_unitario` (CAT-011). Montos con `formatearDinero(monto, tienda.moneda)`.

## Lectura desde el servidor (excepción acordada a la regla 1)
La vitrina es pública y debe verse bien al compartir el enlace (vista previa con título e imagen). Por eso sus páginas son **Server Components** que leen la API desde el servidor:
- Crear `src/lib/api/publico.ts` (solo servidor, `import "server-only"` si está disponible): `obtenerPublico<T>(ruta)` hace `fetch` a `${API_INTERNAL_URL}/api/v1/vitrina/...` con `cache: "no-store"` (o `next: { revalidate: 60 }`), desempaqueta `RespuestaApi` y lanza `ErrorApi`. **Solo** rutas `vitrina/…`, **solo GET**, **sin** cookies ni `Authorization`.
- Lo interactivo (buscador, selector de orden, selector de variante) va en componentes cliente pequeños que cambian la URL (`?texto=&categoria=&orden=&pagina=`); la página del servidor vuelve a leer.

## Pantallas (`src/app/(vitrina)/tienda/[subdominio]/…`, módulo `src/modules/vitrina/`)
| Ruta | Muestra / permite |
|---|---|
| `layout.tsx` | Layout propio de la vitrina (no el del panel): encabezado con el nombre de la tienda (enlace a la portada), buscador y un acceso al carrito (ícono `ShoppingBag`, desactivado con `TODO(W-015)`); pie "Hecho con OTemu" y correo de contacto. Móvil primero. Si `GET /vitrina/{sub}` da 404 → `notFound()` |
| `page.tsx` (portada) | Nombre de la tienda, categorías como enlaces/chips (al catálogo filtrado) y los productos más recientes (primera página) en grilla |
| `productos/page.tsx` | Catálogo: buscador, filtro de categoría, orden (Recientes, Precio: menor a mayor, Precio: mayor a menor), grilla de tarjetas (imagen o ícono, título, "desde {precio}", precio de comparación tachado si existe, "Agotado" si `disponible` es falso) y `BarraPaginacion`. Vacío: `EstadoVacio` "No encontramos productos" con "Limpiar filtros" |
| `productos/[slug]/page.tsx` | Detalle: galería de imágenes (principal grande + miniaturas; la imagen cambia si la variante elegida tiene imagen propia), título, precio de la variante elegida (con comparación tachada), selector de variante (solo si hay más de una; las agotadas desactivadas), descripción, categorías, botón "Agregar al carrito" **desactivado** (`TODO(W-015)`). 404 si el producto no existe o no está publicado |
| `not-found.tsx` | "Esta tienda no está disponible" (o "Este producto no está disponible") con `EstadoVacio` |

- `generateMetadata` en la portada y en el detalle: `title` ("{producto} · {tienda}"), `description` y `openGraph.images` con la imagen principal.
- `src/proxy.ts`: `/tienda/*` ya es pública (W-003); confirmarlo.
- Tarjeta de producto de la vitrina: `modules/vitrina/components/tarjeta-producto.tsx`, simple, con `Card` y tokens.

## Componentes
Solo componentes existentes. **No** crear ni modificar nada en `src/shared/components/**` ni `globals.css`. Imágenes con `<img>` (o `next/image` con `unoptimized`, porque las URLs son de cualquier dominio `https`). Si algo hace falta, se anota en el reporte.

## Estados obligatorios
Vacío · error (mensaje de la API) · 404 de tienda y de producto · agotado.

## Fuera de alcance
- Carrito y checkout (W-015, W-016). Pulido visual (lo hace el responsable). Subdominios reales (decisión QW-005: por ruta).

## Criterios de aceptación (sin navegador: Opus comprueba en el navegador que funcione al revisar)
Datos de prueba: la tienda `tienda-w006-prueba` (operativa) tiene al menos un producto publicado ("Taza W008 Prueba"); `tienda-w006-dos` **no** es operativa.
- [ ] `curl -s -o /dev/null -w "%{http_code}" http://localhost:3100/tienda/tienda-w006-prueba` → 200, y el HTML contiene el nombre de la tienda y "Taza W008 Prueba".
- [ ] `/tienda/tienda-w006-prueba/productos?texto=taza` → 200 con el producto; `?texto=zzzz` → 200 con el texto del estado vacío.
- [ ] `/tienda/tienda-w006-prueba/productos?orden=precio_desc` y `?categoria=<un identificador_url real>` → 200 sin errores.
- [ ] `/tienda/tienda-w006-prueba/productos/<slug de la taza>` → 200; el HTML contiene `og:title` y `og:image`.
- [ ] `/tienda/tienda-w006-dos` y `/tienda/no-existe` → 404 con el texto "Esta tienda no está disponible".
- [ ] El HTML de ninguna página contiene `costo_unitario`.
- [ ] `npm run lint`, `npx tsc --noEmit` y `npm run build` sin errores.
- [ ] Reporte con la salida real de cada `curl` (código y fragmento relevante del HTML).
