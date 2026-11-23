# R-020 — Variantes visibles (colores, tallas y fotos) en tarjeta y detalle

Pedido del usuario (2026-11-18): las variantes son lo que el propietario define al crear el producto: **más fotos** y, según el producto, **tallas** (una prenda) o **colores** (una taza). La tarjeta del mercado muestra las variantes en una segunda columna y el detalle las muestra a la derecha, con galería de fotos. No hace falta una tabla nueva de «opciones»: se usa lo que ya existe (variantes con `titulo` e imágenes con `variante_id`) y una convención.

## Convención del título de variante
`titulo` = valores separados por « / », en este orden si hay dos: **«Color / Talla»** (ejemplos: «Negro / M», «Rojo / L»). Con una sola opción, solo el valor («S», «M», «Azul»). Una variante sin opciones se llama «Predeterminada» (ya existe). La web separa los valores y decide si son tallas (S, M, L, XL, 38, 40…) o colores.

## Cambios en la API
1. **Lista del mercado** (`GET /mercado/productos`, `/mercado/destacados`, `/vitrina/{sub}/productos`): cada producto agrega
   - `descripcion_corta`: texto plano de hasta 110 caracteres sacado de la descripción (ausente si no hay),
   - `variantes_resumen`: hasta 3 `{titulo, precio}` de las variantes publicadas (sin «Predeterminada» si es la única),
   - `cantidad_variantes`: total de variantes publicadas (siempre).
   Hoy la web las completa pidiendo el detalle de cada producto (12 consultas por página); con esto se quita ese rodeo.
2. **Detalle** (`GET /vitrina/{sub}/productos/{slug}`): confirmar que `variantes[]` trae `titulo`, `precio`, `precio_comparacion`, `disponible` y que `imagenes[]` trae `variante_id` (nulo = foto general). No hace falta nada más para este paso.
3. **Panel**: confirmar que se pueden subir varias imágenes por producto y asociar una imagen a una variante (si ya existe, no se toca). Si la pantalla del panel del propietario no permite asociar una foto a una variante, anotarlo: es trabajo del frontend (R-021).

## Datos de ejemplo (se suma a la semilla R-014)
Productos de demostración con variantes para poder ver todo: 
- una **prenda** («Polo Alpaca», «Chalina Baby Alpaca»…) con tallas S, M, L, XL y 2 o 3 colores («Negro / M»), 3 a 5 fotos, algunas asociadas a un color; 
- una **taza o cerámica** con 3 colores y 3 fotos; 
- un producto **digital** sin variantes; 
- un producto con una variante **agotada** y otra con **precio de comparación**.
Con descripción de 2 o 3 frases en español. URLs de imagen estables y reales (no solo `picsum`: deben cargar).

## Criterios de cierre
Los campos nuevos salen en la lista y no cambian los existentes; prueba de integración del resumen de variantes; los productos de ejemplo se ven en `/mercado`. Push a `develop-rediseno` y aviso con el commit.
