# Rediseño de OTemu — flujo, perfiles y decisiones

Documento de partida del rediseño masivo (4 semanas). Lo escribe el frontend a partir de lo que pidió el usuario; el backend
lo lee, lo corrige donde la realidad del código sea distinta y contesta las preguntas de la sección 5.
Estado: **borrador para validar** (2026-11-12).

## 1. Idea general
OTemu pasa de «un panel para quien tiene tienda» a una **plataforma con mercado**: cualquiera compra productos de muchas tiendas;
quien quiere vender crea su tienda; la plataforma se administra aparte.

## 2. Flujo de pantallas

```
/  (landing pública)
 ├─ qué es OTemu · crear mi tienda · comprar en otras tiendas (productos de tiendas con producto publicado)
 ├─ explorar el mercado: tiendas y productos de todas las tiendas, búsqueda y categorías
 └─ login / registro
        │
        ▼  según lo que la persona sea (puede ser varias cosas a la vez)
 ┌─────────────┬──────────────────────────────┬────────────────────────────────┐
 │ COMPRADOR   │ PROPIETARIO                  │ ADMINISTRADOR (plataforma)     │
 └─────────────┴──────────────────────────────┴────────────────────────────────┘
```

### Comprador (todo usuario nuevo lo es)
- Navega el mercado, arma **un carrito con productos de N tiendas** y hace **un solo pago**.
- Sigue sus pedidos y el despacho (por tienda, porque cada tienda despacha lo suyo).
- Si quiere vender: ve los **planes de suscripción** (puede **empezar gratis con 1 tienda**) y **al crear su tienda pasa a ser propietario**.

### Propietario (derivado: tiene al menos una tienda)
- Todo lo del comprador (también puede comprar en su propia tienda).
- **Panel general**: resumen de **todas sus tiendas** en un dashboard.
- Al elegir una tienda: **panel administrativo de esa tienda** (catálogo, inventario, pedidos, envíos y rutas, cupones, personal,
  configuración, suscripción). Esto es lo que hoy ya existe, reubicado.
- Crea **empleados** de su tienda con **permisos por rol** configurables.

### Administrador de plataforma
- Ve **todas las tiendas**, usuarios, auditoría, seguridad, planes y comisiones; suspende o reactiva tiendas.
- **Puede crear otros administradores** (roles por permiso).
- **También puede tener tienda propia y comprar** (es una persona con varios perfiles, no una cuenta aparte).
- **Un propietario nunca ve los permisos de un administrador** (por defecto).

## 3. Decisiones tomadas por el usuario (no se discuten)
| # | Decisión |
|---|---|
| D1 | Al registrarse se es **comprador**. **Propietario = tiene una tienda**: se pasa a serlo al **crear la primera tienda con un plan** (hay plan gratuito de 1 tienda). El rol se **deriva** de lo que la persona tiene. |
| D2 | **Un solo pago** por carrito aunque tenga productos de varias tiendas; **el dinero de cada tienda se separa automáticamente**. |
| D3 | Administradores y propietarios crean personas (administradores / empleados) con **roles por permiso**; los permisos de plataforma no son visibles para un propietario. |
| D4 | El flujo cambia **todo el frontend**; hay **4 semanas**. Lo que requiera backend lo hace «OTemu - Rediseño Backend». |

## 4. Reglas que propone el frontend (el backend las valida o las cambia)
- **Una compra = un «pedido» (padre) con una «orden» por tienda (hijas)**. Cada orden hija tiene su propio total, impuestos,
  envío, inventario, estado de preparación y despacho. El pago es del pedido padre y se reparte entre las hijas.
- **El envío se cotiza por tienda** (cada tienda tiene sus tarifas). El carrito global agrupa líneas por tienda.
- El comprador ve **un solo pedido** con sub-secciones por tienda; cada tienda ve **solo su orden hija**.
- Reembolsos y cancelaciones se hacen **por orden hija**.
- La comisión de la plataforma se calcula **por tienda** y se descuenta al repartir el pago.
- Un administrador de plataforma con tienda propia usa los mismos paneles que un propietario para esa tienda.

## 5. Preguntas abiertas para el backend (responder en `01-necesidades-backend.md`)
1. **Reparto del pago (D2):** ¿Stripe Connect (cuentas conectadas, «separate charges and transfers») o cobrar a la plataforma y registrar
   en los balances por tienda (el módulo `balance` ya lleva ventas, comisiones y saldo pendiente por tienda) con liquidación manual/simulada?
   Recomendación del frontend: **lo segundo para las 4 semanas**, dejando la transferencia real como mejora.
2. **Despacho y transportista:** hoy una ruta tiene chofer y placa como texto y **el propietario** actualiza el estado de cada parada.
   El usuario plantea que, si la ruta «llega a un transportista», **él mismo actualiza el estado del pedido**. Opciones:
   - **A (actual):** el propietario sigue actualizando; el chofer es un dato. Sin cambios de backend.
   - **B:** nuevo perfil **transportista** (usuario con login) al que se asigna una ruta y que solo ve sus rutas y cambia estados y sube la foto.
   Recomendación del frontend: **B simple** (una pantalla «Mis rutas» para el transportista), pero hay que decidirlo en la semana 1
   porque define roles y permisos. Pregunta añadida: con pedidos de varias tiendas, ¿el transportista es de **una tienda** o **de la plataforma**?
3. **Modelo de roles:** hoy hay `RolTienda` fijo (propietario, administrador, gestores) y un indicador `EsAdministradorPlataforma`.
   ¿Se pasa a **roles y permisos en base de datos** (con un ámbito: plataforma o tienda)? Esto es el cimiento de «administradores y empleados configurables».
4. **Marketplace:** ¿cómo se identifica una tienda «visible en el mercado»? (producto publicado + tienda activa y operativa + plan que lo permita).
5. **Planes:** ¿el plan gratuito de 1 tienda ya existe en `PlanesSuscripcion`? ¿Qué pasa al bajar de plan con más tiendas?

## 6. Fuera de alcance del rediseño (para no desbordar las 4 semanas)
Transferencias bancarias reales a tiendas, facturación electrónica, devoluciones logísticas complejas, GPS, optimización de rutas,
aplicación móvil. Se anotan como mejoras.

## 7. Decisiones provisionales del 2026-11-12 (D-1 a D-5 del backend)
El usuario está ausente y dejó dicho que el frontend siga **sin esperar su autorización**. Para no frenar al backend 4 semanas, el frontend acepta
**provisionalmente** las cinco propuestas de la sección 6 de `01-necesidades-backend.md`. **El usuario puede cambiarlas al volver**; si cambia alguna, se avisa al backend por mensaje.
| # | Decisión provisional |
|---|---|
| D-1 | Plan gratuito: 20 productos, 0 personal, comisión 5 %, sin vencimiento; una tienda gratuita por persona. |
| D-2 | «Un solo pago» solo con tarjeta; con transferencia/Yape cada tienda confirma el pago de su orden. |
| D-3 | Un carrito tiene una sola moneda (error `CAR-009` al mezclar). |
| D-4 | `/vitrina/{sub}/carrito` y `/checkout` se mantienen como adaptador *deprecated* hasta que el frontend migre; retiro en la semana 4. |
| D-5 | Transportista de **una** tienda (rol de personal con permiso mínimo sobre sus rutas); es lo primero que se recorta si el tiempo aprieta. |
