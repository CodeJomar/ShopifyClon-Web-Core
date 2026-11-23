# 1. Dominio de Identidad, Multi-Tenancy y Accesos

## 1. "Usuarios"
**Responsabilidad:** Es la tabla central de identidad (autenticación y perfil base) para todos los actores de la plataforma: dueños de tiendas, colaboradores y compradores finales.

**Aspectos clave:**
- Almacena credenciales seguras (`ContrasenaHash` con BCrypt) y datos de contacto (`CorreoElectronico`, `Telefono`).
- `EstaActivo`: Permite habilitar o deshabilitar cuentas (por ejemplo, validación de correo o bloqueo por fraude).
- Incluye trazabilidad universal (`UsuarioCreacion`, `UsuarioEdicion`) y eliminación lógica (`Eliminado`).

## 2. "Roles"
**Responsabilidad:** Catálogo maestro del sistema de autorización (RBAC - Role-Based Access Control).

**Aspectos clave:**
- Define los perfiles de permiso (ej. `ADMIN_TIENDA`, `OPERADOR_INVENTARIO`, `CLIENTE`).
- Su campo `Codigo` único es el que evalúa Spring Security en las anotaciones `@PreAuthorize("hasRole('ADMIN_TIENDA')")`.

## 3. "Tiendas"
**Responsabilidad:** Entidad raíz del modelo Multi-Tenant. Representa a cada comercio electrónico independiente alojado en la plataforma.

**Aspectos clave:**
- Vinculada a un propietario inicial (`PropietarioId` → `Usuarios`).
- Identificación web dual: `Subdominio` (ej. `mitienda.clonshopify.com`) y `DominioPersonalizado` (ej. `mitienda.com`).
- Define la divisa base para todo el catálogo y transacciones (`Moneda`, ej. USD, COP, EUR).

## 4. "PersonalTienda"
**Responsabilidad:** Tabla asociativa que gestiona los permisos y roles de los usuarios dentro de tiendas específicas (relación N:M entre `Usuarios`, `Tiendas` y `Roles`).

**Aspectos clave:**
- Permite que un usuario sea `ADMIN_TIENDA` en una tienda y simple `OPERADOR` o `CLIENTE` en otra.
- Restricción única (`"TiendaId"`, `"UsuarioId"`, `"RolId"`) para prevenir roles duplicados en un mismo comercio.

## 5. "DireccionesUsuario"
**Responsabilidad:** Libreta de direcciones de envío y facturación guardadas por los clientes registrados.

**Aspectos clave:**
- Acelera el checkout permitiendo marcar una dirección como predeterminada (`EsPrincipal = TRUE`).
- Desacoplada de las órdenes: si el usuario edita su dirección guardada aquí en el futuro, no altera las direcciones históricas de compras pasadas (éstas se congelan en `Ordenes`).

## 6. "TokensSeguridad"
**Responsabilidad:** Gestión de ciclos de vida de tokens efímeros fuera de la sesión JWT.

**Aspectos clave:**
- Se utiliza para flujos sensibles: activación de cuentas recién registradas (`ACTIVACION_CUENTA`) y restablecimiento de contraseña olvidada (`RECUPERACION_CLAVE`).
- Incluye fecha de expiración (`FechaExpiracion`) y bandera de consumo único (`Usado = TRUE`), evitando ataques de repetición.

---

# 2. Dominio de Catálogo, Productos e Inventario

## 7. "Categorias"
**Responsabilidad:** Organización taxonómica y agrupamiento temático de los productos de cada tienda.

**Aspectos clave:**
- Multi-tenant estricto: Pertenece a una tienda específica (`TiendaId`).
- `IdentificadorUrl` (slug): Permite rutas amigables en el frontend (ej. `/tienda/calzado-hombre`). La restricción `UqCategoriasTiendaIdentificadorUrl` garantiza que dos tiendas diferentes puedan usar el mismo slug, pero no la misma tienda.

## 8. "Productos"
**Responsabilidad:** Representa la entidad abstracta de un artículo puesto a la venta (la "ficha técnica" o concepto global del producto).

**Aspectos clave:**
- Contiene los metadatos comunes: título, descripción, proveedor, si es un producto digital (`EsDigital`) y estado de visibilidad (`EstaPublicado`).
- Importante: Un producto por sí solo no tiene precio ni stock directo, ya que esos datos pertenecen a sus variantes concretas.

## 9. "ProductosCategorias"
**Responsabilidad:** Tabla puente de relación N:M entre `Productos` y `Categorias`.

**Aspectos clave:**
- Permite que un mismo producto figure en múltiples categorías (ej. una zapatilla en "Calzado", "Deportes" y "Ofertas").

## 10. "VariantesProducto"
**Responsabilidad:** Representa la unidad vendible y física (SKU) de un producto, con sus combinaciones específicas (talla, color, material, o variante por defecto).

**Aspectos clave:**
- Maneja los datos financieros: Precio de venta, `PrecioComparacion` (precio tachado/oferta) y `CostoUnitario` (para calcular el margen de ganancia de la tienda).
- Control logístico: `PesoGramos` y `RequiereEnvio` (clave para calcular tarifas de flete o saltarse envíos si es digital).

## 11. "InventarioVariante"
**Responsabilidad:** Control de existencias en tiempo real y prevención de sobreventas (overselling).

**Aspectos clave:**
- Separada de la variante para permitir concurrencia y bloqueos transaccionales (row-level locks / `SELECT FOR UPDATE`) sin bloquear la lectura de precios.
- `CantidadDisponible`: Existencias listas para venta.
- `CantidadReservada`: Unidades apartadas temporalmente durante un checkout en curso.
- `PermitirVentaSinStock`: Habilita ventas bajo pedido (backorders) cuando el inventario llega a cero.

## 12. "ImagenesProducto"
**Responsabilidad:** Galería multimedia asociada al catálogo.

**Aspectos clave:**
- Soporta ordenamiento visual (`Posicion`), imagen de portada (`EsPrincipal`) y texto accesible para SEO (`TextoAlternativo`).
- Permite vincular una foto a todo el producto general (`ProductoId`) o asignarla a una variante puntual (`VarianteId`, ej. mostrar la foto de la camiseta roja cuando el cliente elige el color rojo).

---

# 3. Dominio de Marketing y Promociones

## 13. "Cupones"
**Responsabilidad:** Motor de reglas de descuento aplicables al subtotal de la compra.

**Aspectos clave:**
- Modelado de 3 modalidades comerciales: `PORCENTAJE` (ej. 15% off), `MONTO_FIJO` (ej. $10 USD menos) o `ENVIO_GRATIS`.
- Reglas de validación: `MontoMinimoCompra`, rangos de vigencia (`FechaInicio`, `FechaFin`) y límite de canjes (`LimiteUsosTotal` vs `CantidadUsosActual`).

---

# 4. Dominio de Experiencia de Compra (Carritos)

## 14. "Carritos"
**Responsabilidad:** Persistencia del carrito de compras con soporte tanto para compradores autenticados como para invitados anónimos (Guest Checkout).

**Aspectos clave:**
- `TokenSesion`: Identificador único guardado en la cookie o localStorage del cliente para mantener el carrito activo entre visitas sin requerir login obligatorio.
- Si el comprador inicia sesión más tarde, se vincula `UsuarioId`.
- Puede tener un `CuponId` pre-aplicado antes de procesar el pago.

## 15. "ItemsCarrito"
**Responsabilidad:** El detalle de cada línea añadida al carrito.

**Aspectos clave:**
- Apunta siempre a `VarianteId` (la talla/color exacta) con su `Cantidad` deseada.
- No almacena precios congelados: el precio siempre se consulta al vuelo desde `VariantesProducto` para reflejar cualquier cambio antes del checkout definitivo.

---

# 5. Dominio Transaccional: Órdenes, Pagos y Logística

## 16. "Ordenes"
**Responsabilidad:** El contrato de venta legal y transaccional definitivo entre un cliente y una tienda.

**Aspectos clave:**
- Desglose financiero inmutable: Congela `Subtotal`, `DescuentoTotal`, `CostoEnvio`, `ImpuestosTotal` y `Total`.
- Máquina de estados desacoplada:
  - `EstadoPago`: `PENDIENTE`, `PAGADO`, `REEMBOLSADO`.
  - `EstadoPreparacion`: `NO_PREPARADO`, `PREPARADO`, `ENTREGADO`.
- Snapshot de direcciones (JSONB): Congela una copia exacta de las direcciones de envío y facturación al momento de la compra para que nunca se alteren ante futuras modificaciones del usuario.

## 17. "ItemsOrden"
**Responsabilidad:** Registro inmutable del detalle de productos comprados en cada orden.

**Aspectos clave:**
- Patrón Snapshot: Almacena copias estáticas de `TituloProducto`, `TituloVariante`, `SKU` y `PrecioUnitario`. Si en el futuro el dueño de la tienda renombra o borra el producto del catálogo, el comprobante y factura del cliente permanecen intactos.

## 18. "Pagos"
**Responsabilidad:** Historial de intentos y transacciones procesadas con proveedores de pago.

**Aspectos clave:**
- Soporta múltiples pasarelas (`STRIPE`, `PAYPAL`, `MERCADOPAGO`, `EFECTIVO`).
- Guarda el identificador externo del procesador (`TransaccionId`) y la respuesta cruda de la pasarela en `DetallesRespuesta` (JSONB), vital para auditoría, webhooks y resolución de disputas/contracargos.

## 19. "Envios"
**Responsabilidad:** Trazabilidad física y despacho logístico de la orden.

**Aspectos clave:**
- Permite seguimiento mediante `EmpresaTransporte`, `NumeroGuia` y `UrlSeguimiento`.
- Auditoría de tiempos de entrega: `FechaDespacho`, `FechaEntregaEstimada` y `FechaEntregaReal` para calcular métricas de cumplimiento de envíos (SLA).

## 20. "BalancesTienda"
**Responsabilidad:** Agregado analítico y financiero de cada comercio para liquidaciones y estadísticas rápidas.

**Aspectos clave:**
- Acumula `TotalVentasHistorico`, `CantidadOrdenes` y `SaldoPendienteCobro`.
- Evita tener que ejecutar consultas pesadas de tipo `SUM(...)` sobre miles de filas en la tabla `Ordenes` cada vez que el dueño de la tienda entra a su panel de administración.

---

# Resumen del Flujo Transaccional

- **Identidad / Configuración:** `Usuarios` → `Roles` → `Tiendas` (y `PersonalTienda`).
- **Exhibición:** `Categorias` → `ProductosCategorias` → `Productos` → `VariantesProducto` → `InventarioVariante` e `ImagenesProducto`.
- **Conversión:** `Carritos` → `ItemsCarrito` (+ `Cupones`).
- **Cierre de Venta:** `Ordenes` → `ItemsOrden` (congelando stock y precios) → `Pagos` → `Envios` → `BalancesTienda`.