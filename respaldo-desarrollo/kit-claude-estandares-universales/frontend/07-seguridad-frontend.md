# Seguridad en el frontend

- **Tokens y sesión**: nunca en almacenamiento accesible por JavaScript (`localStorage`, `sessionStorage`, almacenes globales). La sesión viaja en cookies `HttpOnly` y `Secure` administradas por el backend; la interfaz solo envía credenciales a orígenes de confianza.
- **La interfaz no es autoridad**: ocultar un botón no protege nada. El backend valida cada acción.
- **XSS**: nunca se inserta HTML crudo desde datos del usuario; el texto se escapa. Los campos de texto libre rechazan marcado en el cliente (y el servidor lo vuelve a rechazar).
- **Secretos**: nada sensible en el paquete del cliente. Las variables expuestas al navegador son públicas por definición.
- **Redirecciones**: los destinos de «volver a» se validan contra una lista o prefijo propio (evita redirecciones abiertas).
- **Sesión expirada**: una respuesta 401 lleva al inicio de sesión con un aviso claro y sin dejar datos sensibles en pantalla.
- **Datos personales**: se muestran solo cuando hacen falta, se enmascaran cuando es posible y no se envían a registros ni a terceros.
- **Terceros**: scripts y servicios externos se justifican y se limitan; ninguno recibe datos del usuario sin decisión explícita.
- **Cabeceras y CSP**: se configuran en el servidor de la interfaz; no se deshabilitan para «hacer funcionar» algo.
- **Dependencias**: se revisan manifiestos y avisos de seguridad reales; sin actualizaciones forzadas ni saltos de versión mayor sin aprobación.
- **Mensajes de error**: no revelan detalles internos ni la existencia de cuentas.
