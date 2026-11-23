# Principios

Los principios resuelven los casos que ninguna regla prevé. Cuando dos reglas chocan, gana el principio.

## Fuente de verdad y confianza
1. **El servidor decide dinero, estado y permisos.** El cliente propone y la interfaz solo ayuda; nada que afecte integridad se acepta tal cual llega.
2. **Un solo camino de escritura por dato.** Si un valor se puede cambiar por dos rutas, tarde o temprano divergen.
3. **Defensa en profundidad.** Validación en cliente (experiencia), en la API (autoridad) y en la base de datos (última barrera: únicos, checks, disparadores).
4. **Seguro por defecto.** Se niega todo lo que no se permitió expresamente, con el menor privilegio y fallando cerrado.

## Estructura
5. **Separar decidir, consultar y presentar.** Quien decide reglas no construye consultas; quien consulta no decide; quien presenta no calcula negocio.
6. **Dependencias hacia el dominio y sin ciclos.** Si hace falta un ciclo, la dirección de las dependencias está mal.
7. **Cada dato tiene un dueño.** Solo el dueño escribe; los demás leen o piden al dueño.
8. **Explícito sobre implícito.** Conversiones, validaciones, transacciones y bloqueos se escriben a la vista; la magia del framework no es contrato.

## Cambio y mantenimiento
9. **Cambio mínimo y coherente con las convenciones existentes.** Se busca antes de crear y se imita lo que ya hay.
10. **Reutilizar antes de crear; promover al segundo uso.** La primera vez se hace local; la segunda se extrae con propiedades genéricas y se borra la copia.
11. **El comportamiento observable es el contrato.** Una refactorización no cambia lo que ve el usuario ni lo que devuelve la API; si una prueba debe cambiar, el comportamiento cambió.
12. **Cambios pequeños y reversibles.** Commits atómicos, migraciones compatibles hacia atrás, módulo por módulo.
13. **Consistencia entre pantallas y módulos.** Mismo patrón, mismo orden, mismo aspecto.

## Operación
14. **Idempotencia y concurrencia son requisitos, no extras.** Todo lo que mueve dinero, stock o estado se diseña para reintentos y peticiones simultáneas.
15. **Los registros contables no se editan.** Lo que importa para auditoría o dinero es de solo-añadir; se corrige con ajustes trazables.
16. **Observabilidad desde el inicio.** Logs estructurados sin secretos, auditoría de eventos críticos, identificador de correlación.
17. **Proceso sin estado y configurable por entorno.** Escalar horizontalmente no debe requerir reescribir.
18. **Medir antes de optimizar.** Sin medición no hay hallazgo de rendimiento.

## Comunicación
19. **Los mensajes dicen la verdad.** Un error nombra lo que realmente falló, en el idioma y las palabras del usuario, no con el nombre interno del campo.
20. **No se inventan reglas de negocio.** Lo ambiguo se pregunta y la respuesta se documenta como decisión.
21. **Las decisiones se registran.** Qué se decidió, por qué y qué se descartó.
