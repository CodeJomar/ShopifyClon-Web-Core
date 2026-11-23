# Interfaz táctil y responsiva

## Táctil primero
- Objetivos de toque de **44 px como mínimo y 48-56 px** en listas de opciones. Nada de íconos diminutos dentro de una tarjeta.
- **La tarjeta completa es el botón** (elemento de botón real, con foco, teclado y etiqueta accesible). Los elementos internos son de texto en línea, no bloques.
- Pocos pasos por acción. Un flujo típico de agregar algo: tocar la tarjeta -> panel con las opciones en columna y una nota opcional -> botones apilados al final («Agregar» como principal y «Sin extras» como secundario).
- Marcar una opción **no cierra** el panel; solo los botones confirman y cierran.
- El botón secundario «sin extras» se oculta cuando haría lo mismo que el principal o cuando una opción es obligatoria.
- Nada depende de `hover`. El feedback al presionar es visible (escala o color).
- Las cantidades se ajustan en el resumen del pedido, no en el catálogo.

## Feedback en acciones repetidas
- Un solo aviso que **reemplaza** al anterior, de corta duración (1,5 a 2 s).
- Los límites avisan («Máximo por producto»); un toque que no hace nada es un error de diseño.

## Un único punto de quiebre
- El umbral entre navegación fija y cajón se define **una vez** (hook de consulta de medios) y se replica en las clases de estilo con el mismo valor, para que el estado y el CSS nunca discrepen.
- El botón del encabezado muestra el estado del modo activo (cajón abierto o cerrado), no una bandera del otro modo.
- Al cambiar de modo, el cajón vuelve a quedar cerrado.

## Trampas de diseño conocidas
- Las cuadrículas que calculan cuántos elementos caben recortan con `overflow-hidden`: no se eleva la tarjeta al pasar el mouse (se recorta) y no se añade relleno al contenedor medido (cambia el cálculo).
- Un panel con campo fijo y lista larga hace scroll **solo en la lista**: se apaga el scroll del cuerpo y la lista usa `min-height: 0; flex: 1; overflow-y: auto`.
- Un desplegable dentro de un campo angosto hereda su ancho y corta el texto: se ensancha el popup y se alinea al borde.
- El encabezado de la pantalla va dentro del contenedor principal cuando el espacio vertical importa; no en una fila aparte encima de dos columnas.

## Sesión y conectividad
- Aviso antes de que la sesión expire por inactividad; mensaje claro al volver a iniciar.
- Indicador visible del estado de conexión en pantallas en vivo.

## Verificación
- Revisar a 768, 1024 y 1280 px como mínimo, en claro y oscuro, y con un rol sin permisos para ver los estados vacíos o restringidos.
