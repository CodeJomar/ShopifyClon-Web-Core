# Feedback y overlays

Tres tipos, tres funciones. Se elige por **intención**, no por apariencia.

| Intención | Componente | Bloquea | Uso |
|---|---|---|---|
| Informar qué pasó o qué pasa | **Notificación (toast)** | No | Progreso y resultado de acciones, errores de la API, avisos |
| Pedir una decisión | **Confirmación** | Sí | Acciones irreversibles o importantes: eliminar, anular, cerrar caja |
| Capturar o ver datos | **Panel** (contenedor flotante lateral) | Parcial (fondo difuminado) | Crear, editar, ver detalle |

## Reglas
- Cada tipo se inicializa **una sola vez** en la raíz y se usa desde cualquier lugar. Ninguna pantalla monta el suyo ni guarda estado de apertura de avisos.
- **Notificación**: se envuelve la petición (cargando -> éxito/error) y el detalle del error viene del backend. Sin banners en línea ni spinners en botones para errores de la API. La validación de campo no es una notificación.
- **Confirmación**: genérica por defecto («¿Estás seguro?»); el texto específico va en la notificación posterior. Solo pregunta sí/no: nunca contiene formularios. Las acciones destructivas usan la variante destructiva. Nada de diálogos nativos del navegador.
- **Panel**: los formularios y detalles se abren en el panel estándar; no se usa un modal centrado para formularios ni se crea un panel paralelo.
- Capas: panel < notificación < confirmación, para que un aviso o una confirmación se vean sobre un panel abierto.

## Panel estándar y sus ajustes
- El panel se extiende con propiedades **opcionales** (ajuste del pie, ajuste del cuerpo) en vez de bifurcarse. El pie estándar son dos botones lado a lado (neutral primero, principal después); cuando hace falta otra disposición (botones apilados) se pasa el ajuste.
- Si solo una lista interna debe tener scroll, se apaga el scroll del cuerpo.

## Foco
- El foco visible es discreto: un anillo fino del mismo tono que el componente, solo para teclado.

## Evitar
- Un componente de aviso o confirmación por pantalla.
- Modales centrados para confirmar y para formularios a la vez.
- Errores de la API en alertas en línea, `console.log` o diálogos nativos.
- Esconder una acción destructiva detrás de un «deshacer» sin que el producto lo haya diseñado.
