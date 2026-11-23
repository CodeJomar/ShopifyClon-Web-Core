# Preguntas abiertas

Mientras una pregunta esté abierta, se implementa la **opción por defecto** indicada (marcada como provisional en el código si aplica).

| ID | Pregunta | Módulo | Por defecto mientras tanto | Estado |
|---|---|---|---|---|
| Q-001 | Nombre comercial del producto | general | "ShopifyClon" | abierta |
| Q-002 | ¿Separar "correo verificado" de "cuenta bloqueada"? (hoy ambos son `EstaActivo`) | identidad | no separar | abierta |
| Q-003 | Moneda por defecto de tiendas nuevas: ¿USD (BD actual) o PEN? | tiendas | USD | abierta |
| Q-004 | ¿Transferir la propiedad de una tienda? | tiendas | no en v1 | abierta |
| Q-005 | Un usuario con varias tiendas: ¿una suscripción por tienda (como Shopify) o una por usuario? | suscripciones | una por tienda | abierta |
| Q-006 | ¿Invitar personal que aún no tiene cuenta (correo con enlace)? | personal | no; debe registrarse antes | abierta |
| Q-007 | Precios y límites definitivos de los planes | suscripciones | tabla del módulo | abierta |
| Q-008 | Cobro de suscripción: ¿Stripe real en modo prueba o pasarela simulada? | suscripciones | adaptador simulado detrás de un puerto; Stripe después | abierta |
| Q-009 | ¿Imagen principal obligatoria para publicar un producto? | catálogo | sí | abierta |
| Q-010 | Rediseño de la web: identidad, flujos y diferenciadores frente a Shopify | web | pendiente; la API no depende de él | abierta |
| Q-011 | ¿Límite de uso de cupón por cliente? | cupones | no | abierta |
| Q-012 | ¿Permitir preparar/enviar órdenes no pagadas (pago contra entrega)? | órdenes | no | abierta |
| Q-013 | Pago que llega después de anular la orden: ¿reembolso automático o revisión manual? | pagos | revisión manual | abierta |
| Q-014 | ¿Se devuelve la comisión de plataforma al reembolsar? | balances | no | abierta |
| Q-015 | ¿La prueba gratuita es una por **usuario** (solo su primera tienda) o una por **tienda**? Por tienda permite abusar creando tiendas nuevas | suscripciones | una por usuario: desde la segunda tienda se paga para activarla | cerrada → D-024 |
| Q-016 | Un reembolso cuando la orden tiene varios cobros aprobados: ¿se reparte entre cobros o se imputa a uno solo? | pagos | se imputa al primer cobro con saldo suficiente; si no cabe, se pide reembolsar en partes | abierta |
| Q-017 | ¿El top de productos de las métricas debe restar las unidades reembolsadas o repuestas? | métricas | no: muestra unidades brutas de órdenes pagadas no canceladas | abierta |
