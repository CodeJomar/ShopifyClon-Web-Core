# Escalabilidad y resiliencia

## Procesos sin estado
- Ningún dato de sesión o de negocio vive en la memoria de un proceso. El estado compartido (sesiones, contadores de intentos, avisos) está en la base o en un almacén externo, con **alternativa en memoria solo para desarrollo** y degradación explícita.
- Configuración por entorno, puerto y dirección configurables, registros a la salida estándar, cierre ordenado (se termina lo en curso, se cierra el pool).
- Tiempo real: el emisor de eventos se desacopla del transporte para poder añadir un adaptador (broker) al escalar a varias réplicas.

## Salud
- **Liveness** (el proceso responde) y **readiness** (puede atender: base de datos disponible) son comprobaciones distintas.
- Las migraciones corren una vez por release, nunca en cada réplica al arrancar.

## Concurrencia y consistencia
- Diseñar con peticiones simultáneas desde el inicio: bloqueos ordenados, índices únicos como respaldo, idempotencia (ver `02-datos-y-transacciones.md`).
- Transacciones cortas; el trabajo lento y las llamadas externas, fuera.
- Un pool de conexiones dimensionado para el paralelismo real: lecturas en paralelo del mismo endpoint no deben agotarlo.

## Datos
- Índices para cada filtro y orden frecuente; paginación obligatoria; sin consultas en bucle.
- Crecimiento previsto: retención, archivado y tareas de mantenimiento periódicas (limpieza de sesiones y códigos vencidos, respaldos) desde el diseño.
- Diseñar sin cerrar la puerta a varios inquilinos (identificador de organización en las tablas relevantes) aunque el primer producto no lo implemente.

## Caché
- Solo con invalidación explícita y a tiempo (la caché de permisos se invalida después del commit del cambio, no antes).
- Una caché no es fuente de verdad: ante duda se lee la base.

## Llamadas remotas y trabajo asíncrono
- Toda llamada remota tiene **timeout**. Los reintentos solo en operaciones seguras, con espera creciente y aleatoria.
- Efectos externos (correo, webhooks, mensajes) por cola o bandeja de salida con idempotencia en el consumidor.
- Las tareas en segundo plano no bloquean la respuesta cuando el resultado no cambia lo que se responde (p. ej. recuperación de contraseña responde de inmediato).

## Control de carga
- Límites de peticiones y de tamaño; respuestas 429 con espera indicada.
- Los paneles y reportes pesados se acotan por período máximo y se paginan.

## Observabilidad
- Registros estructurados con correlación; métricas de latencia, errores y saturación del pool; trazas en flujos críticos.
- Una alerta por síntoma que importe al usuario, no por cada excepción.
