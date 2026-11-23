# R-014 — Semilla de datos de demostración

Objetivo (pedido del usuario, 2026-11-18): al pasar a una base nueva (Railway) el sistema no debe verse vacío ni quedar sin un administrador con el que entrar. La semilla es **opcional**, **repetible** y **solo la ejecuta el backend** al arrancar cuando se pide.

## Activación
- Variable `SEMILLA_DEMO=true` (por omisión `false`: nunca corre sola). Sin ella no hace nada.
- `SEMILLA_DEMO_CONTRASENA`: contraseña de todas las cuentas de demostración. **Obligatoria si la semilla está activa** (si falta, el arranque la omite y avisa en el log); jamás se escribe en el código, en los logs ni en las migraciones.
- Corre una vez al terminar Flyway, después de que el contexto esté listo (por ejemplo un `ApplicationRunner`). Debe usar los **servicios** del dominio (para respetar sus reglas), no SQL a pelo, salvo donde no haya servicio.

## Idempotencia
Cada pieza se busca por clave natural (correo, subdominio, número de orden) y se omite si ya existe. Correrla dos veces no duplica nada, y correrla sobre la base de pruebas actual (que ya tiene datos de e2e) no rompe nada. Un resumen en el log: «creados X, omitidos Y», sin datos sensibles.

## Qué crea
1. **Cuentas activas** (misma contraseña, de la variable): `admin.demo@otemu.test` (administrador de plataforma con el rol `ADMIN_PLATAFORMA`), `propietario.demo@otemu.test`, `propietario2.demo@otemu.test`, `comprador.demo@otemu.test`. Correos configurables por variable si se quiere (`SEMILLA_ADMIN_CORREO`).
2. **Seis tiendas** operativas y visibles en el mercado, repartidas entre los dos propietarios y todas en **PEN** (el carrito es de una sola moneda): Café Andino, Casa Quinua, Taller Textil Cusco, Neo Gadgets, Aroma Selva, Papel y Tinta. Mezcla de plan gratuito y de pago (suscripción activa) para que `/propietario` y la administración muestren variedad.
3. **De 5 a 8 productos por tienda**, publicados, con título y descripción en español, 1 a 3 imágenes (URLs estables, por ejemplo `https://picsum.photos/seed/<slug>/600/600`), precios realistas, stock rastreado, categorías por tienda, algunos con variantes (talla/color) y uno o dos digitales por tienda. Precio de comparación en algunos.
4. **Envíos:** por tienda, dos tarifas (estándar y exprés) y una gratis sobre un monto.
5. **Pedidos de ejemplo** del comprador demo repartidos en 2 o 3 tiendas, con estados distintos (pagado y sin preparar, preparado, entregado, uno pendiente de pago manual) para que «Mis pedidos», el panel de la tienda, las métricas y la administración tengan movimiento. Pagos registrados como pagos manuales (sin llamar a Stripe).
6. **Reseñas** (cuando R-011 esté mezclada): de 2 a 6 reseñas por producto en los productos con pedido entregado, con calificaciones variadas y comentarios cortos, para que el mercado muestre estrellas.

## No hacer
- No tocar datos existentes que no sean de la semilla ni borrar nada.
- No usar correos reales ni números de teléfono reales.
- No enviar correos (ni activar `MAIL_ENABLED`), no crear intentos de Stripe.
- No cambiar contratos de la API; no habilitarla en `application.properties` por defecto.

## Criterios de cierre
Prueba de integración que corre la semilla dos veces sobre una base vacía y verifica conteos iguales; el mercado devuelve productos y tiendas; el administrador demo entra y `GET /plataforma/tiendas` lista las seis; sección en la guía de endpoints y en el README («cómo sembrar una base nueva en Railway: variables y orden»). Push a `develop-rediseno` y mensaje corto con el commit.
