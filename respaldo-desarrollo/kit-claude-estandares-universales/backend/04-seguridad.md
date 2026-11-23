# Seguridad

## Identidad
- **Una sola autoridad de autenticación.** El backend emite y valida las sesiones; ningún otro componente firma credenciales.
- Sin registro público si el producto no lo exige: las cuentas las crea quien tiene permiso y se activan con un enlace de un solo uso y con caducidad.
- Contraseñas con un algoritmo lento y con sal (bcrypt, argon2, scrypt). Nunca MD5, SHA-1 ni SHA simple.
- Recuperación con códigos de un solo uso, caducidad corta, intentos limitados, enfriamiento entre emisiones y respuesta idéntica exista o no la cuenta.
- Mensajes de login genéricos («credenciales inválidas»); el detalle de estado de cuenta se muestra solo cuando la contraseña es correcta.
- Comparaciones de secretos en tiempo constante; se ejecuta el mismo trabajo (hash) aunque la cuenta no exista para igualar tiempos.

## Sesiones y tokens
- Acceso de vida corta y renovación rotativa con **detección de reutilización**: usar un token ya rotado fuera de la ventana de gracia revoca toda la familia y se audita.
- La rotación es atómica: la revocación condicionada («solo si sigue vigente») decide quién gana.
- **Cookies `HttpOnly` y `Secure`** para navegador; el JavaScript de la página nunca ve los tokens.
- Políticas de sesión explícitas: **inactividad** (se quema tras X minutos sin actividad real del usuario, no por consultas automáticas), **tope absoluto** desde el inicio, y **una sola sesión activa por cuenta** si el producto lo requiere (candado por usuario dentro de una transacción; el segundo inicio pide confirmación y avisa a la sesión vigente).
- Un cambio de contraseña, baja o suspensión revoca las sesiones.

## Autorización
- **Denegar por defecto**: todo endpoint exige identidad y permiso salvo que se marque como público expresamente.
- Permisos como **datos** (rol -> permisos), no como lógica fija: cambian sin desplegar y se cachean con invalidación inmediata al modificar.
- Se valida también la **propiedad del recurso**, no solo el rol (quién abrió el turno, a quién pertenece el pedido).
- Los permisos que dependen del contenido (aplicar un descuento) se comprueban en el servicio.
- **Anti-escalada**: nadie concede un permiso que no tiene ni modifica el rol que lo define.
- Las pruebas cubren autorización de objeto, no solo autenticación.

## Datos sensibles
- Datos personales cifrados en reposo con cifrado reversible (distinto del hash de contraseñas), con claves fuera del código y rotables.
- Secretos solo en variables de entorno o gestor de secretos; la aplicación falla al arrancar si falta uno obligatorio.
- Nunca se registran contraseñas, tokens, códigos ni secretos; los registros redactan datos personales.

## Entrada y salida
- Consultas parametrizadas: es la defensa contra inyección; detectar palabras sospechosas es capa adicional, nunca sustituto.
- XSS: se almacena texto plano y se rechaza el marcado; la interfaz escapa al mostrar.
- Límites de tamaño de cuerpo, de colecciones y de longitud de campos.
- Protección contra contaminación de prototipos y propiedades inesperadas.

## Transporte y perímetro
- HTTPS en el perímetro, cabeceras de seguridad, CORS estricto con orígenes explícitos y protección CSRF para peticiones con cookie que cambian estado.
- Límite de peticiones por IP y por cuenta, con endurecimiento en login, recuperación y activación.
- Un WAF o proxy es defensa adicional, no sustituye la seguridad de la aplicación.

## Integridad del dominio
- El servidor decide dinero, estados y propiedad. Los cambios de estado pasan por un único mapa de transiciones permitidas; todo lo demás es 409.
- Los registros contables y los períodos cerrados son inmutables también en la base; las correcciones son ajustes auditados con motivo obligatorio.

## Auditoría
- Eventos de seguridad y de dinero (login, bloqueo, reutilización de token, cambios de permisos, cobros, devoluciones, cierres, ajustes) se auditan con usuario, severidad, IP y detalle.
- Los eventos críticos se auditan **dentro** de la transacción del cambio; el resto, por cola.
- Cada petición lleva identificador de correlación.

## Dependencias
- Se inspeccionan los manifiestos reales, avisos de seguridad y pruebas del repositorio; no se mantienen listas externas de versiones «correctas».
- Nada de actualizaciones forzadas ni de saltos de versión mayor sin aprobación.
