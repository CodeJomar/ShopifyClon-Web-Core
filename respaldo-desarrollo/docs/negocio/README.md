# Lógica de negocio — ShopifyClon

Completada a partir de las plantillas de `kit-claude-estandares-universales/logica-de-negocio/`. Claude **no inventa reglas**: lo que falte va a `08-preguntas-abiertas.md`.

| Archivo | Contenido |
|---|---|
| `00-vision-y-glosario.md` | Qué es, alcance v1, glosario |
| `01-actores-roles-permisos.md` | Roles, matriz de permisos |
| `04-reglas-de-integridad.md` | Dinero, estados, unicidad, concurrencia |
| `05-decisiones.md` | D-001… (algunas por confirmar) |
| `06-principios-ux-producto.md` | Lo que la API garantiza a la interfaz |
| `07-requisitos-no-funcionales.md` | Rendimiento, concurrencia, auditoría |
| `08-preguntas-abiertas.md` | Q-001… |
| `modulos/` | `transversal`, `identidad`, `tiendas-y-personal`, `suscripciones`, `catalogo`, `inventario`, `cupones`, `carrito`, `ordenes`, `pagos`, `envios`, `balances-y-metricas` |
| `flujos/` | `alta-de-tienda`, `checkout`, `ciclo-de-vida-orden` |

## Prefijos de reglas
`SEG` seguridad · `AUD` auditoría · `ERR` errores · `USR` identidad · `TIE` tienda · `PER` personal · `SUS` suscripciones · `CAT` catálogo · `INV` inventario · `CUP` cupones · `CAR` carrito · `CHK` checkout · `ORD` órdenes · `PAG` pagos · `ENV` envíos · `BAL`/`MET` balances y métricas.

El código de error que devuelve la API es el mismo identificador de la regla violada.
