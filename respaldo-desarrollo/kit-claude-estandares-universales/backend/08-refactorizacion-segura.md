# Refactorización segura

Para mover estructura (introducir repositorios, partir servicios, reorganizar carpetas) **sin cambiar el comportamiento**.

## Antes
1. **Plan por módulo** (el modelo más fuerte lo escribe): consultas actuales con su transacción, firmas nuevas, riesgos, pruebas, pasos.
2. **Pruebas de humo** contra el código actual. Se confirman en verde y se commitean solas.
3. Orden: módulos hoja primero; aquel en el que otros escriben antes que sus llamadores; dinero y sesiones al final.

## Durante
4. Crear la pieza nueva **copiando cada consulta tal cual** (con sus rarezas).
5. Reescribir el servicio método a método, manteniendo mensajes, orden de operaciones, orden de bloqueo y momento de los efectos (después del commit).
6. Las mismas pruebas, **sin modificarlas**, después de cada paso grande. Si una debe cambiar, el comportamiento cambió: detenerse y decidir.
7. Agregar el módulo a la prueba de guardia de arquitectura.

## Después
8. Compilación, lint, pruebas unitarias y de base de datos en verde.
9. Un commit por módulo, con mensaje claro.
10. Las observaciones halladas (rarezas que parecen errores) se anotan y se resuelven en commits separados.

## Definición de módulo terminado
- El servicio no importa el ORM ni el esquema.
- El repositorio no importa DTOs, no lanza excepciones de transporte, no captura errores de base de datos.
- Las pruebas de humo pasan sin cambios.
- Los eventos y la auditoría por cola siguen después del commit; la auditoría atómica, dentro.
- El orden de bloqueo no cambió.
- Los mensajes de error son idénticos.
- No hay cambios de esquema ni de contrato HTTP.
- La prueba de guardia lo incluye.
- Quedó un commit propio.

## Qué no se hace en el mismo cambio
- Partir servicios grandes, cambiar el contrato, corregir rarezas, actualizar dependencias.
