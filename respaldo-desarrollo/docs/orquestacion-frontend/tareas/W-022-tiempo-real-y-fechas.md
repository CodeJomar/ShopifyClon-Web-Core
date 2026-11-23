# W-022 · Tiempo real (WebSocket) y fechas con zona de Lima

**Estado:** pendiente. Se hace después de W-021 (o en paralelo, son independientes).
**Origen:** backend ya en `develop` y `prod` de `ShopifyClon-Api-Core` y desplegado en Railway.
**Rama sugerida:** `tarea/W-022-tiempo-real-y-fechas` desde `develop` de `ShopifyClon-Web-Core`.

---

## 1. Fechas con zona de Lima (cambio de contrato, afecta a todo)

El backend ahora serializa **todas** las fechas con hora con el desfase de Lima:

| Antes | Ahora |
|---|---|
| `2026-11-11T21:38:02.017Z` | `2026-11-11T16:38:02.017-05:00` |

Es **el mismo instante**; solo cambia cómo se escribe. Afecta a `marca_tiempo` y a campos como `fecha_creacion`, `fecha_expiracion_pago`, `expira_en`, eventos de envío, etc. Las fechas sin hora (`AAAA-MM-DD`) no cambian.

**Qué revisar en el frontend**
- `new Date(texto)` y las utilidades de `src/shared/utils/fechas` interpretan el desfase sin cambios: no debería romperse nada.
- Buscar código que compare o recorte la cadena asumiendo que termina en `Z` (`endsWith("Z")`, `.slice(0, 10)` para sacar el día, `split("T")`): con `-05:00` el día que se ve en la cadena ya es el de Lima. Preferir `formatearFecha` con `timeZone: "America/Lima"`.
- Formatear siempre con `timeZone: "America/Lima"` para que el comprador y el panel vean lo mismo aunque el navegador esté en otra zona.
- Los e2e que comparen fechas literales con `Z` hay que ajustarlos.

---

## 2. Tiempo real con WebSocket (STOMP)

### 2.1 Contrato del backend

| Dato | Valor |
|---|---|
| Endpoint | `ws(s)://{host}/api/v1/ws` (WebSocket nativo; **no** hay SockJS) |
| Protocolo | STOMP 1.2. Destinos de salida `/topic/...`. El cliente **no puede enviar** (`SEND` se rechaza) |
| Orígenes permitidos | Los de `CORS_ORIGENES_PERMITIDOS` del backend (hoy el dominio de Railway y `http://localhost:3000`). Si la web se sirve desde otro dominio, hay que agregarlo al backend |
| Heartbeat | Activo en el servidor |

**Cómo autenticarse en el `CONNECT`** (cabeceras STOMP, una sola de las dos; mandar ambas da error):
- **Panel (comerciante):** `POST /auth/ws-ticket` (con sesión) → `{ticket, expira_en, ttl_segundos}`. Ticket **efímero de un solo uso**. Conectar con la cabecera `X-Ws-Ticket: <ticket>`. Hay que pedir uno **nuevo en cada conexión y reconexión**.
- **Comprador sin cuenta:** conectar **sin** cabeceras de autenticación; solo puede suscribirse a su orden (ver abajo).
- (También se acepta `Authorization: Bearer <jwt>`, pero desde el navegador el ticket es lo correcto: no pone el JWT en la conexión.)

**Canales**

| Canal | Quién | Contenido |
|---|---|---|
| `/topic/tienda/{tiendaId}/ordenes` | Miembro de la tienda con permiso de ver órdenes | Eventos de órdenes y envíos de esa tienda |
| `/topic/ordenes/{tokenAcceso}` | Cualquiera que tenga el `token_acceso` de la orden | Estado de **esa** orden |

Suscribirse a una tienda ajena o a un canal inexistente se rechaza.

**Mensajes del canal de tienda** (`NotificacionOrdenTienda`, snake_case): `tipo`, `orden_id`, `tienda_id`, `numero_orden`, `nombre_cliente`, `total`, `moneda`, `estado`, `estado_pago`, `estado_preparacion`, `motivo`, `envio_id`, `numero_guia`, `transportista`, y la hora del evento (`ocurrido_en`).

**Mensajes del canal del comprador** (`NotificacionOrdenComprador`): `tipo`, `numero_orden`, `estado`, `estado_pago`, `estado_preparacion`, `motivo`, `numero_guia`, `transportista`, `url_seguimiento`, `ocurrido_en`. No trae datos internos ni de terceros.

**Valores de `tipo`:** `ORDEN_CREADA`, `ORDEN_PAGADA`, `ORDEN_CANCELADA`, `ENVIO_DESPACHADO`, `ENVIO_ENTREGADO`.

Referencia viva: en el laboratorio (`/api/v1/laboratorio/`) hay una pestaña **Tiempo real** con un cliente STOMP funcionando; úsala como ejemplo de la secuencia de conexión.

### 2.2 Qué hacer en el frontend

1. **Cliente STOMP.** Agregar `@stomp/stompjs` (sin SockJS). Un módulo `src/lib/tiempo-real/` con:
   - `conectarPanel(tiendaId, onMensaje)`: pide el ticket por el proxy (`/api/auth/ws-ticket`, igual que el resto de llamadas, para no exponer el JWT), conecta con `X-Ws-Ticket`, se suscribe a `/topic/tienda/{tiendaId}/ordenes`.
   - `conectarOrden(tokenAcceso, onMensaje)`: conecta anónimo y se suscribe a `/topic/ordenes/{tokenAcceso}`.
   - Reconexión con **ticket nuevo** en cada intento (retardo creciente, tope de unos 30 s) y desconexión limpia al desmontar el componente.
2. **Proxy de Next.** El navegador no puede mandar `Authorization` al WebSocket. Opciones: (a) endpoint `/api/ws-ticket` que llama a `POST /auth/ws-ticket` con la sesión de la cookie y devuelve el ticket (recomendado); (b) conectar directo a la URL pública de la API (necesita su origen en CORS). En ambos casos la URL del WebSocket sale de una variable `NEXT_PUBLIC_WS_URL` (en local `ws://localhost:8080/api/v1/ws`, en producción `wss://otemu-api-core-production.up.railway.app/api/v1/ws`). Next **no** hace proxy de WebSocket de forma fiable: no apoyarse en `/api` para el socket.
3. **Panel del comerciante** (`/panel/ordenes`, `/panel`): suscribirse al canal de la tienda activa. Al llegar un mensaje:
   - aviso tipo toast: «Orden #1001 de Ana — S/ 105,00 pagada» según `tipo`;
   - refrescar la lista de órdenes (invalidar la consulta) en vez de reconstruirla a mano;
   - indicador discreto de conexión («En vivo» / «Reconectando…»).
4. **Página de la orden del comprador** (`/tienda/[subdominio]/orden/[token]`): suscribirse a `/topic/ordenes/{token}`. Reemplaza el *polling* de 1,5 s del pago con Stripe: al llegar `ORDEN_PAGADA` se actualiza el estado y se muestra «Pago recibido». **Mantener el polling como respaldo** si el socket no conecta (p. ej. 5 s) para no depender solo del WebSocket.
5. **Seguimiento** (`/seguimiento`): si el comprador tiene el `token_acceso`, mostrar los cambios `ENVIO_DESPACHADO` y `ENVIO_ENTREGADO` en vivo. El seguimiento público por guía (sin token) sigue por consulta normal.
6. **Estado y limpieza.** Un solo socket por pestaña; no abrir uno por componente. Cerrar al cerrar sesión o cambiar de tienda.

### 2.3 Cosas a tener en cuenta

- **Una réplica:** el broker del servidor es en memoria; con una sola instancia en Railway funciona. No hay problema para la entrega.
- **Seguridad:** el comprador solo recibe su orden; un comerciante solo su tienda. Probar que suscribirse a otra tienda falla y mostrar un error discreto, no romper la pantalla.
- **Sesión revocada:** si el usuario cambia la contraseña o cierra sesiones (ver W-021), el socket abierto debe cerrarse y no reconectar con el ticket viejo; el siguiente `POST /auth/ws-ticket` dará 401.
- **Tipos:** agregar los DTO de los mensajes en `src/dtos/tiempo-real/`.

### 2.4 Pruebas

- **Manual:** pagar una orden (laboratorio o Stripe) con el panel abierto en otra pestaña y ver el aviso sin recargar; con la página de la orden abierta, ver pasar a «Pagado» sin esperar al polling.
- **e2e (Playwright):** dos contextos de navegador (panel y comprador); crear la orden, pagarla con pago manual desde el panel y comprobar que la vista del comprador cambia sola. Si el socket falla, el e2e debe seguir pasando gracias al respaldo por consulta.
- `npm run lint`, `npx tsc --noEmit`, `npm run build`.

## 3. Criterios de aceptación

1. Con el panel abierto, una orden nueva o pagada aparece como aviso y en la lista sin recargar.
2. La página de la orden del comprador pasa a «Pagado» sola; si el WebSocket cae, sigue funcionando por consulta.
3. Cada reconexión usa un ticket nuevo; al cerrar sesión el socket se cierra.
4. Todas las fechas se ven en hora de Lima y nada depende de que la cadena termine en `Z`.
5. lint, tsc y build sin errores; e2e nuevos en verde.
