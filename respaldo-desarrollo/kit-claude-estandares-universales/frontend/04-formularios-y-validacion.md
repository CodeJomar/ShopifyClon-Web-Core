# Formularios y validación

- **Un esquema por formulario** como fuente de validación y de tipos; los tipos se infieren del esquema.
- La validación del cliente es **experiencia**, no frontera de confianza: el servidor valida de nuevo.
- Las **reglas de texto** (caracteres permitidos, series de símbolos, «al menos una letra» en nombres de cosas del negocio) se replican del servidor en una utilidad compartida y se aplican a **todo** campo de texto libre. Un campo que las omite pasa el formulario y solo el servidor lo rechaza, con un mensaje confuso.
- Los errores de campo se muestran **junto al campo**; los errores de la API, como notificación, con el mensaje del servidor sin reescribirlo por formulario.
- Mientras la petición corre, el botón de envío se deshabilita; no hay spinners dentro de botones como único aviso.
- El botón principal del formulario vive en el pie del contenedor y envía el formulario por su identificador.
- Etiquetas **cortas** cuando varios campos comparten una fila en una columna angosta («Mesa», no «Seleccionar mesa»); si una etiqueta se parte en dos líneas, es demasiado larga.
- Los campos opcionales dicen «(opcional)»; los obligatorios no repiten «obligatorio».
- Un formulario largo se divide en secciones; las suscripciones a cambios de campo son selectivas para no re-renderizar todo.
- Se mantiene el foco y el orden de tabulación lógicos; Enter envía cuando tiene sentido.
- Al cerrar un formulario con cambios sin guardar, se pide confirmación solo si el costo de perderlos lo justifica.
