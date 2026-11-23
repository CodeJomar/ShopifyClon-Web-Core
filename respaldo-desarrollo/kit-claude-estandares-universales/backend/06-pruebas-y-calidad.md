# Pruebas y calidad

## Niveles
- **Unitarias** para reglas puras y servicios con repositorios simulados.
- **Integración** para repositorios y restricciones contra una base real desechable.
- **E2E / contrato** para los flujos críticos: autenticación, autorización y propiedad, validación de entradas, dinero.
- **Humo por módulo** (abajo) para refactorizar con seguridad.

## Pruebas de humo por módulo
- Un archivo por módulo, a nivel HTTP, contra la aplicación compilada y una base real desechable; un puerto propio por archivo y un apoyo común que arranca la app e inicia sesión.
- Fijan el **comportamiento actual**: éxitos, conflictos, validaciones, efectos en la base y auditoría. Se escriben **antes** de refactorizar y se vuelven a ejecutar **sin cambios** después.
- Datos únicos por ejecución (sufijos) para no depender de limpieza; los límites de longitud del dominio se respetan.
- Lo que depende de tiempo real o de un canal que no se prueba aquí se anota como no cubierto.
- Las rarezas que se deciden conservar se fijan con una prueba y un comentario.

## Pruebas de guardia de arquitectura
- Una prueba barata verifica las reglas de capas: los servicios migrados no importan el ORM ni el esquema; los repositorios no importan DTOs ni lanzan excepciones de transporte.
- La lista de módulos protegidos crece con cada migración.

## Concurrencia y seguridad
- Pruebas de idempotencia con peticiones simultáneas y de reintento con contenido distinto.
- Pruebas de ownership y de permisos: que un usuario sin permiso reciba 403 y que un recurso ajeno no sea accesible.
- Una prueba de regresión por cada error corregido, cuando sea razonable.

## Puertas de calidad
- La integración continua ejecuta instalación determinista, compilación y tipos, lint, pruebas y revisión de dependencias.
- Nunca se debilita ni se omite una puerta para «ponerla en verde» sin una decisión escrita.
- Las pruebas contra base de datos corren en serie; un fallo en la primera ejecución tras levantar la base puede ser solo calentamiento: se repite antes de investigar.

## Evidencias
- Capturas, respuestas y registros usados como evidencia son artefactos del proyecto, fuera del código fuente y sin secretos ni datos personales.
