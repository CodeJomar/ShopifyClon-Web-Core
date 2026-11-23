# Contratos de API y validación

## Entradas
- **Validación estricta**: se descartan o rechazan propiedades desconocidas; sin conversión implícita global; las conversiones de texto a número o booleano son explícitas.
- Toda entrada tiene **límites**: longitud de texto, rangos, tamaño de colecciones y de cada elemento anidado. Lo que no se acota se abusa.
- La validación anidada se declara explícitamente; si no, no se ejecuta.
- Se separa la validación **sintáctica** (forma) de la **semántica** (reglas de negocio, en el servicio).
- **Dinero**: cadena decimal con validador propio (no negativo, máximo dos decimales, sin signo ni exponente). Nunca como número de coma flotante en el contrato.
- El cliente envía identificadores y cantidades; **nombres, precios y totales los resuelve el servidor**.

## Salidas
- DTO de respuesta explícito: sin secretos ni columnas internas.
- Los identificadores internos solo se exponen cuando el cliente los necesita; las vistas de sesión no devuelven ids.
- Fechas en formato estándar con zona; dinero como cadena decimal.

## Errores
- **Un solo formato de error** para toda la API: estado, lista de mensajes con código, y un identificador de correlación.
- Mapa de estados: 400 entrada inválida, 401 sin identidad, 403 sin permiso, 404 no existe, 409 conflicto de estado o duplicado, 422 regla de negocio (si el proyecto la distingue), 429 demasiadas peticiones.
- Una excepción no controlada responde 500 con mensaje genérico y deja el detalle en el log.
- **Los mensajes dicen lo que realmente falló** y usan la etiqueta humana del campo (`notas de cierre`, no `notas_cierre`). Un validador que rechaza símbolos no responde «no admite HTML».
- Los mensajes de autenticación y recuperación son genéricos para no revelar si una cuenta existe.

## Reglas de texto compartidas con la interfaz
- Caracteres permitidos, series de símbolos y «al menos una letra» para nombres de cosas del negocio (roles, categorías, productos) se definen una vez y se **replican en el cliente** para avisar antes de enviar. El servidor sigue siendo la autoridad.
- El texto se guarda como texto plano: el marcado se rechaza en la entrada en vez de «limpiarse» después.

## Paginación y listados
- Parámetros de página y límite acotados; respuesta con total y página actual.
- Filtros y búsquedas escapan los comodines del usuario (se busca texto literal).
- Rangos de fechas validados y con un máximo explícito.

## Idempotencia y concurrencia en el contrato
- Las operaciones críticas aceptan una cabecera de clave de idempotencia (obligatoria en dinero). Una petición reutilizada responde 200 con el mismo resultado; la nueva, 201.

## Evolución
- Cambios compatibles hacia atrás por defecto. Lo que se retira se avisa y se deprecia antes de borrarse.
