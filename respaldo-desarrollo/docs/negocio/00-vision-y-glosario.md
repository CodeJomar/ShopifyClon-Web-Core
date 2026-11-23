# Visión y glosario

## Producto
- **Nombre**: ShopifyClon (nombre comercial pendiente, ver Q-001).
- **Qué problema resuelve**: permite que cualquier comerciante cree su tienda en línea en minutos (catálogo, carrito, checkout, pagos, envíos) sin programar, pagando una suscripción mensual o anual a la plataforma.
- **Para quién**:
  - **Comerciantes** (pequeñas y medianas marcas) que necesitan vender en línea.
  - **Compradores** que visitan la tienda de un comerciante, con o sin cuenta.
  - **Administradores de la plataforma**, que gestionan los planes y supervisan las tiendas.
- **Fuera de alcance (por ahora)**: tienda de aplicaciones, temas editables tipo Liquid, punto de venta físico (POS), multi-ubicación de inventario, multi-moneda por tienda, liquidaciones (payouts) automáticas a cuentas bancarias, facturación electrónica SUNAT, marketplace entre tiendas.

## Alcance de la primera versión
- Registro de usuario, activación de cuenta y recuperación de clave.
- Alta de tienda con subdominio único y **suscripción de prueba** a un plan.
- **Planes de suscripción** con límites (productos, personal) y comisión por venta; renovación, cambio de plan, cancelación y bloqueo por impago.
- Personal de tienda con roles fijos (propietario, administrador, gestor de catálogo, gestor de pedidos).
- Catálogo: categorías, productos, variantes (SKU), imágenes, publicación.
- Inventario con reservas durante el pago y libro de movimientos.
- Cupones de descuento (porcentaje, monto fijo, envío gratis).
- Tarifas de envío por tienda e impuesto configurable.
- Carrito persistente con invitado y fusión al iniciar sesión.
- Checkout con recálculo en servidor, idempotente, que crea la orden.
- Pagos: manual (efectivo/transferencia confirmada por personal) y pasarela en línea (Stripe en modo prueba) con webhook.
- Preparación y envío de órdenes, cancelación y reembolsos.
- Balance de la tienda y métricas básicas del panel.

## Futuro previsto que no debe quedar bloqueado
- Varias ubicaciones de inventario por tienda.
- Opciones estructuradas de producto (Talla × Color) que generan variantes.
- Permisos granulares por miembro del personal (en lugar de roles fijos).
- Envíos parciales (preparar una parte de la orden).
- Liquidaciones al comerciante y libro contable de balance.
- Dominios personalizados verificados, multi-moneda, varios idiomas.
- Recuperación de carritos abandonados por correo.

## Glosario
| Término | Definición exacta | No confundir con |
|---|---|---|
| Plataforma | El sistema completo que aloja muchas tiendas (inquilinos). | Tienda |
| Tienda | Un comercio independiente (inquilino). Todo dato de negocio pertenece a una tienda. | Plataforma |
| Comerciante / Propietario | Usuario dueño de una tienda (`Tiendas.PropietarioId`). Paga la suscripción. | Personal |
| Personal | Usuario que opera una tienda con un rol (`PersonalTienda`). | Comprador |
| Comprador | Persona que compra en una tienda; puede ser **invitado** (sin cuenta) o **registrado**. | Personal |
| Plan | Oferta comercial de la plataforma: precio, límites y comisión (`PlanesSuscripcion`). | Suscripción |
| Suscripción | Contrato vigente entre una tienda y un plan, con su período actual (`SuscripcionesTienda`). | Plan |
| Cobro de suscripción | Intento de cobro de un período de suscripción (`CobrosSuscripcion`). | Pago (de orden) |
| Producto | Ficha comercial (título, descripción, imágenes). No tiene precio ni stock. | Variante |
| Variante | Unidad vendible con SKU, precio e inventario. Todo producto tiene al menos una. | Producto |
| Stock físico | `CantidadDisponible`: unidades existentes. | Stock vendible |
| Stock reservado | `CantidadReservada`: unidades comprometidas por órdenes pendientes de pago. | — |
| Stock vendible | `CantidadDisponible − CantidadReservada`. Es lo que se puede comprar. | Stock físico |
| Carrito | Selección previa a la compra; precios **no** congelados. | Orden |
| Checkout | Operación que valida el carrito, calcula totales en servidor y crea la orden. | Pago |
| Orden | Contrato de venta con precios, direcciones e impuestos **congelados**. | Carrito |
| Pago | Movimiento de dinero de una orden: cargo o reembolso (`Pagos`). Solo se añade. | Cobro de suscripción |
| Preparación | Ciclo físico de la orden (no preparada → preparada → entregada). Independiente del pago. | Estado de pago |
| Envío | Despacho físico con transportista y guía (`Envios`). | Tarifa de envío |
| Tarifa de envío | Opción de envío que la tienda ofrece en el checkout, con su precio. | Envío |
| Cupón | Código de descuento de una tienda. Uno por orden. | — |
| Comisión de plataforma | Porcentaje del total pagado que cobra la plataforma según el plan. | Impuesto |
| Balance | Agregado financiero de la tienda (ventas, órdenes, saldo por cobrar). | Pago |

## Restricciones
- Legales y de cumplimiento: proyecto académico (UTP). Pagos en **modo prueba** únicamente; no se almacenan datos de tarjeta (lo tokeniza la pasarela). Datos personales según Ley 29733 (Perú) en lo razonable.
- Presupuesto, plazos y equipo: un desarrollador con asistencia de Claude (Opus orquesta, Sonnet/Haiku implementan).
- Infraestructura disponible: PostgreSQL en Supabase (plan gratuito), backend Spring Boot 3.3 / Java 17 en Docker, frontend Next.js (rediseño pendiente).
