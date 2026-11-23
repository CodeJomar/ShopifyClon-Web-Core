# Laboratorio de endpoints

Páginas HTML servidas por el propio backend para **probar la API a mano**: cada módulo explica qué hace cada endpoint, qué hay que tener listo para que funcione y trae casos ejecutables con un clic (éxito, error de negocio, validación y seguridad) contra la API real.

## Dónde está

| | |
|---|---|
| URL | `http://localhost:8080/api/v1/laboratorio/index.html` (también `/api/v1/laboratorio`, que redirige) |
| Código | `src/main/resources/laboratorio/` (HTML + `assets/lab.js`, `assets/recetas.js`, `assets/lab.css`) |
| Servido por | `comun/config/LaboratorioConfig` (recursos estáticos) + permitAll en `SecurityConfig` para `GET /laboratorio/**` |
| Apagar | `LABORATORIO_HABILITADO=false` (propiedad `app.laboratorio.habilitado`): responde 404 |
| Desarrollo de las páginas | `APP_LABORATORIO_UBICACION=file:/lab/` con la carpeta montada en el contenedor (cambios sin reconstruir la imagen) |

**Necesita el contenedor `shfy-api-core` prendido** (Docker). Escribe datos reales en la base de pruebas.

## Cómo se usa

1. Abre **Cuenta y sesión** e inicia sesión (la contraseña solo vive en la pestaña abierta, nunca en disco).
2. En **Tienda y personal** elige o crea una tienda de prueba (si no tiene prueba gratuita nace vencida; la receta la paga con `tok_lab`).
3. Los demás módulos usan lo que ya se generó: `token`, `tiendaId`, `subdominio`, `productoId`, `varianteId`, `tarifaId`, `carritoToken`, `ordenId`, `tokenAcceso`, `envioId`, `guia`, `rutaId`…
4. Barra superior: **Ver y editar estado** (valores guardados en el navegador), **Probar conexión**.
5. Cada módulo trae botones de **preparación rápida** (recetas) y **Ejecutar todo el módulo** (omite los casos marcados *manual*: los que piden datos tuyos o destruyen estado).

Los valores por defecto de los campos que son al azar o salen del estado se recalculan en cada ejecución si no los tocaste. Si la API responde 429, el laboratorio espera lo que indica `Retry-After` y reintenta solo.

## Módulos (17 páginas, ~111 endpoints, ~370 casos)

| Página | Cubre |
|---|---|
| `index.html` | Conexión, estado y portada |
| `cuenta.html` | Registro, activación, login, recuperación, perfil, direcciones |
| `tienda.html` | Crear/ver/editar tienda, vitrina, activar/desactivar, personal |
| `suscripcion.html` | Planes, pagar, cambiar plan, cancelar/revertir (SUS-017) |
| `plataforma.html` | Planes y suscripciones como administrador de plataforma (`admin.prueba@otemu.test`) |
| `catalogo.html` | Categorías, productos, variantes, imágenes, publicar, vitrina |
| `inventario.html` | Stock, ajuste con motivo, rastreo, movimientos |
| `cupones.html` | CRUD de cupones (porcentaje, monto fijo, envío gratis) |
| `tarifas.html` | Tarifas de envío del panel y de la vitrina |
| `carrito.html` | Carrito público: items, cupón, cotización con envío, vincular |
| `checkout.html` | Convertir carrito en orden: CHK-004, ENV-007, idempotencia |
| `ordenes.html` | Órdenes del panel, «mis compras» y estado por token |
| `pagos.html` | Pago manual, cancelar, reembolsos; Stripe **pendiente** |
| `envios.html` | Preparar, despachar, entregar, no entregado, devolver, eventos |
| `rutas.html` | Hoja de ruta y guía de remisión |
| `seguimiento.html` | Seguimiento público por guía |
| `metricas.html` | Métricas del panel |

## Cómo añadir o cambiar un caso

Cada página llama a `Lab.pagina({archivo, titulo, descripcion, avisos, recetas, endpoints})`. Un endpoint es `{id, metodo, ruta, titulo, acceso, cabeceras, sirve, notas, necesita, casos}` y un caso:

```js
{ titulo, tipo: 'ok'|'error'|'validacion'|'seguridad', descripcion, necesita: ['claveDeEstado'], manual: false,
  campos: [{ k, etiqueta, valor, tipo: 'numero'|'bool'|'select'|'json'|'password', opciones, ayuda }],
  antes(ctx)            // opcional, puede devolver una promesa (arma datos)
  peticion(ctx)         // {metodo, ruta, query, cuerpo, cabeceras, sesion:false, tienda:true, carrito:true, idem:true, archivo}
  espera: { estado: 200 | [200, 409], codigo, validacion, contiene, verifica(resp) }
  despues(resp, ctx)    // opcional, guarda ids en el estado (puede devolver una promesa)
}
```

`ctx` trae `e` (estado), `v` (valores de los campos), `pedir`, `exigir`, `azar`, `uuid`, `fecha(dias)`, `hora(dias)` (ISO con hora), `png` y `log`. Las recetas compartidas (`Lab.R.*`) están en `assets/recetas.js`.

## Hallazgos de contrato (ver con el laboratorio)

- Duplicados (`CAT-002`, `CAT-003`, `CUP-001`) responden **422**, no 409; `PAG-004`, `PAG-007` sin pago y `PAG-002` responden **409**; el webhook sin configurar responde **403** `PAG-003`.
- `SUS-017` (409) se evalúa **antes** que la validación del cuerpo: con la tienda vencida, un cuerpo inválido da 409, no 422.
- Los `PUT` de imagen y variante son reemplazos completos (exigen `url_imagen` y `sku`).
- Estado de suscripción en prueba: `PRUEBA` (no `EN_PRUEBA`).
- Stripe queda pendiente de configurar (PAG-002/PAG-003).

## Página del rediseño (R-001)

`rediseno.html` agrupa los casos del rediseño: mercado público, carrito global, pedidos, panel del propietario, administración de plataforma y roles. Está en el grupo «Rediseño (R-001)» del menú. Las páginas de carrito, checkout y órdenes siguen probando las rutas por tienda, que se mantienen.
