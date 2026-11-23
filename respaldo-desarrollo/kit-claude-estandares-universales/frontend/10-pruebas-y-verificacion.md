# Pruebas y verificación

## Qué se prueba
- **Unitarias**: lógica pura (cálculo de precios con extras, validadores de texto, utilidades de fechas).
- **Componentes**: flujos clave de interacción (abrir panel, marcar opción, confirmar, validar un campo).
- **Extremo a extremo**: los caminos críticos (iniciar sesión, tomar un pedido, cobrar).
- Un error corregido deja una prueba de regresión cuando sea razonable.

## Verificación visual (obligatoria en cambios de interfaz)
- Se revisa en un **navegador real** a 768, 1024 y 1280 px como mínimo, en claro y oscuro.
- Se prueba con un rol que **no** tiene todos los permisos para ver estados restringidos.
- Para pasos que dependen de tiempo (sesiones que expiran, avisos), se repite con esperas más largas antes de dar por fallido: en modo desarrollo la interfaz tarda en reflejar un clic.
- Se informa **qué no se pudo verificar** (teclado táctil, dispositivos reales, roles sin acceso).

## Puertas
- Tipos, lint y compilación en verde antes de dar algo por terminado.
- Las herramientas del framework pueden reescribir archivos de apoyo al arrancar en desarrollo; se restauran antes de confirmar cambios.

## Datos de prueba
- Cuentas y contraseñas de demostración viven en un archivo local no versionado; nunca se usan datos reales.
