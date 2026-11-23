# Codificación en frontend

- **Nombres**: componentes en singular y con intención; archivos con el nombre de su componente principal; un componente principal por archivo.
- **Textos de interfaz** en el idioma del producto y fáciles de extraer a un sistema de traducción.
- **Tipos**: inferidos del esquema; sin `any`; los tipos de la API en un solo lugar.
- **Hooks y efectos**: los efectos son para sincronizar con sistemas externos, no para derivar estado. Lo derivado se calcula al renderizar; reiniciar estado por un cambio de condición se hace ajustando el estado durante el render.
- **Limpieza**: toda suscripción, temporizador o sondeo se limpia al desmontar.
- **Constantes** con nombre para valores mágicos (máximos, tiempos); mapas únicos para estados y etiquetas.
- **Sin duplicación**: al segundo uso, se extrae (ver `02-componentes-y-reutilizacion.md`).
- **Comentarios** para el porqué (una restricción, una trampa de diseño), no para repetir el código.
- **Código muerto** se elimina junto con lo que lo reemplaza; no se deja «por si acaso».
- **Estilos**: sistema de utilidades o tokens del diseño; sin valores sueltos repetidos; los estados de interacción (hover, foco, deshabilitado, activo) se definen siempre.
- **Importaciones** hacia la superficie pública de otros módulos, nunca a sus archivos internos.
- **Formato** por herramienta; cambio mínimo y coherente con el estilo existente.
