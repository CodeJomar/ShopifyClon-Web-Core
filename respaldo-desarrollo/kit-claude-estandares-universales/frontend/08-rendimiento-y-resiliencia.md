# Rendimiento y resiliencia

- **Medir antes de optimizar.** Una sensación de lentitud pide dato: pantalla, acción, dispositivo y entorno (modo desarrollo y producción se comportan distinto).
- La división de código por ruta la hace el framework; se agregan cargas diferidas solo para módulos pesados, opcionales o exclusivos del cliente.
- Sin memoización por costumbre: se agrega cuando hay una causa de renderizado concreta.
- Listados siempre paginados o ajustados al espacio; búsquedas con retardo (debounce).
- Imágenes y fuentes con las optimizaciones del framework; dimensiones reservadas para evitar saltos de diseño.
- **Errores aislados**: límites de error por ruta y locales para que una falla no tumbe toda la aplicación, con opción de reintentar.
- **Estados de carga** con esqueletos que respetan la forma final; nunca pantallas en blanco.
- **Conectividad**: indicador visible y degradación a sondeo si falla el canal en vivo.
- Los sondeos se pausan con la pestaña oculta y se limpian al desmontar.
- Menos JavaScript en el cliente: lo que se pueda resolver en el servidor o en el compilador, allí.
