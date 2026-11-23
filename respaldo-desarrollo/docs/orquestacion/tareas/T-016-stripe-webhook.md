# T-016 — Pago en línea con Stripe (modo prueba) y webhook idempotente

| Campo | Valor |
|---|---|
| Modelo | Sonnet |
| Rama | `tarea/T-016-stripe` desde `develop` |
| Depende de | T-015 |
| Tamaño | M |

## Objetivo
El comprador paga su orden con Stripe (PaymentIntent) y el webhook confirma el pago una sola vez aunque llegue repetido.

## Contexto (leer solo esto)
- `docs/orquestacion/README.md` (reglas del ejecutor, commits sin `Co-Authored-By`)
- `docs/negocio/modulos/pagos.md` (PAG-002, 003, 006, 009, 010)
- Código: `modulos/pago/**` (sobre todo `ConfirmacionPagoServicio.confirmar`), `OrdenServicio.bloquear`. Dependencia ya presente: `com.stripe:stripe-java` 26.0.0 (no agregues otra).

## Alcance
1. **Puerto** `modulos/pago/pasarela/PasarelaEnLinea`: `IntentoPago crearIntento(UUID ordenId, UUID tiendaId, long montoCentavos, String moneda)` y `IntentoPago recuperarIntento(String id)` (record `IntentoPago(id, clientSecret, estado)`), y `EventoPasarela verificarWebhook(String cuerpo, String firma)` (record `EventoPasarela(tipo, intentoId, montoCentavos)`; firma inválida → `AccesoDenegadoException("PAG-003", …)`).
   - `StripePasarela` (`@Component`) con `stripe.secret-key=${STRIPE_SECRET_KEY:}` y `stripe.webhook-secret=${STRIPE_WEBHOOK_SECRET:}`. Si la clave está vacía, iniciar un pago responde 409 `PAG-002` "Los pagos en línea no están configurados".
   - En pruebas, una `PasarelaEnLineaFalsa` (`@Primary`, solo en `src/test`) que genera ids `pi_test_…` y firma con un secreto fijo.
2. **Iniciar pago** (PAG-002): `POST /vitrina/{subdominio}/ordenes/{tokenAcceso}/pagar` (público, `@LimitarPeticiones(porMinuto = 10)`). Orden de esa tienda con ese token (si no → 404 `ORD-404`), `ABIERTA` + `PENDIENTE`, pasarela `STRIPE`, no vencida (si no → 409 `PAG-002`). Si ya hay un pago `STRIPE` `PENDIENTE` de la orden → `recuperarIntento` y devolver el mismo `client_secret`. Si no: **fuera de transacción** `crearIntento` (monto = `Total × 100` exacto); luego en una transacción inserta `Pagos` `CARGO` `PENDIENTE` con `TransaccionId = intento.id`. Respuesta: `client_secret`, `monto`, `moneda`.
3. **Webhook** (PAG-003): `POST /webhooks/stripe` (ya es público), cuerpo crudo (`@RequestBody String`) + encabezado `Stripe-Signature`.
   - `payment_intent.succeeded`: busca el pago por (`STRIPE`, intentoId); inexistente → 200 y log; ya `APROBADO` → 200 sin efectos; monto ≠ total de la orden → pago `RECHAZADO` y log de error (no confirma). Si no: en una transacción, bloquea el pago, lo marca `APROBADO` y llama a `confirmar` (que ya aplica PAG-006 si la orden fue anulada).
   - `payment_intent.payment_failed`: pago `RECHAZADO` (si estaba `PENDIENTE`).
   - Otros tipos → 200 sin efectos. `DetallesRespuesta` guarda solo `{tipo, intento_id, monto}` (PAG-009).
4. `application.properties`: las dos propiedades con valor vacío por defecto. **No** escribas claves reales en ningún archivo.

## Criterios de aceptación (con la pasarela falsa)
- [ ] Iniciar pago → pago `PENDIENTE` y `client_secret`; repetir → mismo intento, sin pago nuevo.
- [ ] Orden `MANUAL`, vencida o pagada → 409 `PAG-002`; token ajeno → 404.
- [ ] Webhook `succeeded` → orden `PAGADO`, stock vendido, balance; **el mismo webhook dos veces** → un solo descuento de stock y un solo registro en balance.
- [ ] Firma inválida → 403 `PAG-003`; monto distinto → pago `RECHAZADO`, orden sigue `PENDIENTE`.
- [ ] Webhook `succeeded` sobre orden `ANULADO` → PAG-006 (auditoría, orden intacta).
- [ ] Sin `STRIPE_SECRET_KEY` (bean real) → 409 `PAG-002` al iniciar.
- [ ] `mvn test` en verde; `ArquitecturaTest` pasa; commits sin coautor.

## Nota para el responsable
Para probar con Stripe real en modo prueba: crear una cuenta, poner `STRIPE_SECRET_KEY=sk_test_…` y `STRIPE_WEBHOOK_SECRET=whsec_…` en `.env` y usar `stripe listen --forward-to localhost:8080/api/v1/webhooks/stripe`.
