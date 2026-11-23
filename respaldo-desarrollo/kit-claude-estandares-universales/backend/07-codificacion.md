# Codificación en backend

## Nombres y lenguaje
- Un solo idioma para el dominio dentro del código; el vocabulario del negocio se usa tal cual (glosario en `logica-de-negocio/`).
- Métodos con intención: `buscarVigente`, `existeNombre`, `bloquearPorId`. Evitar `get`, `do`, `handle` sin complemento.
- Constantes con nombre para valores mágicos; mapas únicos para estados y transiciones.

## Estructura del código
- Funciones cortas y cohesionadas; un servicio por caso de uso cuando crece.
- Sin código muerto, sin comentarios que repiten el código. Un comentario explica el **porqué** (una decisión, una restricción, una trampa), no el qué.
- La lógica que se repite vive en un único lugar; al segundo uso se extrae.
- Las dependencias van de fuera hacia dentro: transporte -> servicio -> repositorio. Nunca al revés.

## Datos y tipos
- Dinero en unidades enteras mínimas (céntimos) para calcular y en decimal exacto para guardar; nunca coma flotante.
- Tiempo en UTC al guardar; zona horaria explícita al mostrar o agrupar por día.
- Tipos explícitos en límites (entradas, salidas, retornos de repositorio); sin `any` ni equivalentes.
- Las fábricas de consultas indican su tipo de retorno cuando el compilador no puede nombrarlo.

## Errores
- Los errores de negocio son excepciones propias traducidas a un formato uniforme en el borde; no se usan códigos mágicos ni cadenas para distinguirlos.
- Nunca se traga un error: se maneja, se relanza o se registra con contexto.
- Los errores de base de datos no se capturan en los repositorios.

## Configuración y registro
- Toda configuración viene del entorno y se valida al arrancar.
- Registros estructurados con nivel y correlación; sin datos personales ni secretos.

## Dependencias
- Reutilizar lo instalado antes de agregar; evaluar mantenimiento y seguridad de lo nuevo.
- Sin actualizaciones forzadas ni cambios de versión mayor sin aprobación.

## Higiene de cambios
- Cambio mínimo y coherente con el estilo existente; formato por herramienta, no por opinión.
- Un commit por tema; los cambios de estructura no se mezclan con los de comportamiento.
