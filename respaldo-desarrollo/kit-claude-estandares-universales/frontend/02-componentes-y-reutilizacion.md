# Componentes y reutilización

## Antes de crear
1. Buscar en el sistema de componentes compartido y en los módulos vecinos un componente que ya haga el trabajo.
2. Leer la regla del tipo de componente (overlays, formularios) antes de elegir una base.
3. Si el estándar casi sirve, **extenderlo con una propiedad opcional** (nombre de clase del pie, del cuerpo, variante) sin tocar las pantallas existentes. Nunca bifurcarlo.
4. Solo si no existe nada parecido, crear uno nuevo, local al módulo.

## Promover al segundo uso
- Cuando el mismo patrón aparece en un **segundo** módulo, se extrae a compartido con propiedades genéricas y cada módulo mapea sus datos al componente (el filtro de categorías recibe `{ id, nombre }`, no el tipo del dominio).
- Se borra la copia del módulo. Los identificadores de pruebas se parametrizan (prefijo).
- No se abstrae en el primer uso ni se genera configuración con veinte opciones: si una propiedad solo la usa una pantalla, probablemente debe ser un hijo (`children`).

## Diseño de la API de un componente
- Datos por propiedades; los componentes compartidos **no obtienen datos** por su cuenta.
- Estados completos: cargando, vacío, error, deshabilitado, seleccionado.
- Composición antes que interruptores: cuando aparecen banderas booleanas que cambian la estructura, se divide.
- Nombres de propiedades en el idioma y vocabulario del producto.

## Un solo contenedor por función
- Notificaciones, confirmaciones y paneles de formulario son **únicos y globales** (ver `06-feedback-y-overlays.md`). Nada de componentes paralelos «porque se parecen».
- Un contenedor paralelo termina con espaciado, cabecera y pie distintos: el usuario lo nota.

## Consistencia visual
- Colores, espaciados y tipografía salen de tokens del sistema de diseño, no de valores sueltos.
- Mismo patrón, mismo orden y mismo aspecto entre pantallas.
- Los íconos y etiquetas siguen un vocabulario único (una acción se llama igual en todas partes).
