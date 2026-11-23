# A-002 — IP real del visitante tras el proxy de la web

| Campo | Valor |
|---|---|
| Modelo sugerido | Haiku |
| Repositorio | `ShopifyClon-Api-Core` |
| Rama | `ajuste/A-002-ip-real-tras-proxy` desde `develop` |
| Origen | Revisión de W-003 (2026-10-20): la web llama a la API siempre desde su servidor (proxy `/api/[...ruta]`) |
| Bloquea | Despliegue en Railway (con un solo usuario en desarrollo no se nota) |
| Tamaño estimado | S |

## Problema
`LimitePeticionesInterceptor` usa `request.getRemoteAddr()` como clave del limitador (IP + ruta). Detrás del proxy de Next, **todas** las peticiones llegan con la IP del servidor web: si una persona agota el límite de `/auth/login`, se bloquea el login de **todos** los usuarios durante 60 s. Además, un atacante podría provocarlo a propósito.

## Contrato con la web (ya implementado en W-003, commit `7c09aa6`)
Si la web tiene configurada `API_PROXY_SECRETO`, cada petición reenviada lleva:
- `X-Forwarded-For: <ip del visitante>` (una sola IP)
- `X-Proxy-Secreto: <secreto compartido>`

## Alcance
- Propiedad `app.proxy.secreto` (`${API_PROXY_SECRETO:}`, vacía por defecto).
- Un único resolvedor de "IP del cliente" (componente compartido) que devuelve la IP de `X-Forwarded-For` **solo** si `app.proxy.secreto` no está vacío y `X-Proxy-Secreto` coincide (comparación en tiempo constante, `MessageDigest.isEqual`). En cualquier otro caso devuelve `getRemoteAddr()`.
- `LimitePeticionesInterceptor` (y cualquier otro uso de la IP, por ejemplo la auditoría, si existe) usa ese resolvedor.
- Validar que el valor de `X-Forwarded-For` sea una IP (v4 o v6); si no lo es, usar `getRemoteAddr()`.
- Nunca registrar el secreto en logs.

## Fuera de alcance
- `server.forward-headers-strategy` o `RemoteIpValve` (dependen de la red de Railway; el secreto es independiente).

## Criterios de aceptación (verificables)
- [ ] Prueba: con secreto correcto, dos IPs distintas en `X-Forwarded-For` tienen límites independientes.
- [ ] Prueba: con secreto incorrecto o ausente, se ignora `X-Forwarded-For` (clave = `getRemoteAddr()`).
- [ ] Prueba: con `app.proxy.secreto` vacío, se ignora siempre `X-Forwarded-For`.
- [ ] Prueba: un `X-Forwarded-For` que no es IP no se usa.
- [ ] `mvn -q test` en verde.

## Requisito del responsable (al desplegar)
Generar un secreto largo y aleatorio y ponerlo igual en `API_PROXY_SECRETO` de la API y de la web (Railway). Es secreto: no va al repositorio.
