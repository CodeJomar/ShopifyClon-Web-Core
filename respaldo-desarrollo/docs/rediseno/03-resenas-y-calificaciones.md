# R-011 — Reseñas y calificaciones de productos

Pedido del usuario (2026-11-17): al estilo de un marketplace tipo Temu, cualquier persona con cuenta puede comprar (propietarios y administradores incluidos) y quien compró un producto puede calificarlo y comentarlo. Contrato propuesto entre el frontend y «OTemu - Rediseño Backend». Alcance mínimo, pensado para entrar en la semana que queda.

## Reglas
- Una reseña por persona y por producto (no por variante). Calificación entera de 1 a 5; comentario opcional de hasta 1000 caracteres.
- **Compra verificada:** solo puede reseñar quien tiene una orden **pagada** que contenga ese producto. Sin compra → `403 RES-001`.
- Nadie reseña un producto de una tienda de la que es miembro (propietario o personal) → `403 RES-002`.
- Segunda reseña del mismo producto → `409 RES-003` (se edita la existente).
- Autor visible: nombre y la inicial del apellido («Ana P.»). Nunca el correo.
- Moderación mínima: permiso de plataforma `PLATAFORMA_AUDITORIA` o uno nuevo `PLATAFORMA_RESENAS` puede ocultar una reseña (queda auditado). El propietario no puede borrar reseñas de sus productos.

## Endpoints
1. `GET /vitrina/{subdominio}/productos/{slug}/resenas?pagina=0&orden=recientes|mejores|peores` (público, paginado de 10)
```json
{ "resumen": { "promedio": 4.6, "total": 18, "distribucion": { "1": 0, "2": 1, "3": 1, "4": 4, "5": 12 } },
  "mi_resena": { "id": "uuid", "calificacion": 5, "comentario": "…", "fecha": "…" },
  "puedo_resenar": true,
  "pagina": { "datos": [ { "id": "uuid", "calificacion": 5, "comentario": "…", "autor": "Ana P.", "compra_verificada": true, "fecha": "…" } ], "total": 18, "pagina_actual": 0, "total_paginas": 2 } }
```
`mi_resena` y `puedo_resenar` solo con sesión (null/false sin sesión).
2. `POST /vitrina/{subdominio}/productos/{slug}/resenas` `{ "calificacion": 1-5, "comentario": "…" }` → 201 con la reseña (sesión).
3. `PUT /cuenta/resenas/{id}` `{ calificacion, comentario }` · `DELETE /cuenta/resenas/{id}` (solo la autora).
4. `POST /plataforma/resenas/{id}/ocultar` `{ motivo }` (moderación, auditado).

## Cambios a respuestas existentes
- `GET /mercado/productos`, `/mercado/destacados` y `/vitrina/{sub}/productos`: cada producto trae `calificacion_promedio` (número con 1 decimal o `null`) y `cantidad_resenas`. Nuevo orden opcional `orden=mejor_calificados`.
- `GET /vitrina/{sub}/productos/{slug}` (detalle): `calificacion_promedio`, `cantidad_resenas`.
- `GET /mercado/tiendas`: opcional `calificacion_promedio` de la tienda (promedio de sus productos); si cuesta, se omite.

## Fuera de alcance
Fotos en reseñas, respuesta del propietario, «me fue útil», reportes por usuarios.

## Criterios de cierre
Pruebas de integración de las reglas RES-001 a RES-003, el promedio y la distribución, y que el promedio salga en el mercado; entradas en el laboratorio y en la guía de endpoints.
