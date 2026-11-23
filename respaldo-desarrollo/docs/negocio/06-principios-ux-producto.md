# Principios de experiencia de producto

> La web se rediseñará por completo para diferenciarse de Shopify. Este documento fija solo lo que el **backend** necesita saber; el resto se completa cuando empiece el rediseño (Q-010).

## Usuarios y contexto de uso
| Usuario | Dispositivo | Entorno | Prioridad |
|---|---|---|---|
| Comprador | Móvil | Navegación rápida, desde redes sociales | Checkout en pocos pasos, sin cuenta obligatoria |
| Comerciante | Escritorio y móvil | Gestiona pedidos durante el día | Ver y preparar pedidos rápido |
| Admin de plataforma | Escritorio | Ocasional | Claridad |

## Lo que la API garantiza a cualquier interfaz
1. Mensajes de error en español, dirigidos a la persona, sin nombres internos de campos (`"El SKU ya está en uso en tu tienda"`, no `"sku duplicate"`).
2. Cada error de negocio lleva un **código estable** (`CHK-004`, `INV-002`) además del mensaje, para que la interfaz pueda reaccionar sin leer el texto.
3. JSON en `snake_case`, fechas ISO-8601 en UTC, montos como cadena decimal o número con 2 decimales y siempre con la moneda de la tienda.
4. Listados paginados con el mismo contrato (`ConsultaPaginadaDto`).

## Vocabulario de interfaz (una palabra por concepto)
Producto, Variante, Inventario, Categoría, Cupón, Carrito, Pagar (checkout), Orden, Pago, Reembolso, Preparar, Envío, Plan, Suscripción, Personal.

## Idiomas y formatos
- Español (es-PE). Fecha `dd/mm/aaaa`, hora 24 h en la zona horaria de la tienda (por defecto `America/Lima`), moneda con símbolo y 2 decimales.
