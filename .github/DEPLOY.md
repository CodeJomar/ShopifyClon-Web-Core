# Despliegue de la Web (Railway)

Este repositorio es el servicio **Web** de Railway (raíz del repositorio = raíz del servicio, con su `railway.json` y su `Dockerfile`), conectado a la rama **`prod`** con *Wait for CI* activado (ver `GITFLOW.md`).

| Variable | Valor |
|---|---|
| `API_INTERNAL_URL` | URL privada de la API: `http://<nombre-del-servicio-api>.railway.internal:<puerto de la API>`. Es variable de **build**: si cambia, redesplegar. |
| `NEXT_PUBLIC_API_URL` | `/api` (el navegador habla con la web y esta reenvía a la API: las cookies de sesión quedan en el mismo dominio) |

Health check: `/`. El servicio API y sus variables están documentados en el repositorio de la API (`.github/DEPLOY.md`).

## Pendiente conocido
- El KDS usa WebSocket. La web reenvía `/api` por HTTP; el socket debe llegar a la API directamente (dominio público de la API) usando el ticket de `POST /api/auth/ws-ticket`. Hay que definirlo al integrar el KDS.
