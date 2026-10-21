# OTemu (web)

Interfaz web de OTemu, la plataforma para crear tu tienda en línea y vender por redes. Next.js 16 (App Router) que consume solo la API Spring del backend (`/api/v1`); no toca la base de datos ni decide reglas de negocio.

## Requisitos

- Node.js 22 y npm.
- La API Spring corriendo en `http://localhost:8080` para las pantallas que la usan.

## Cómo levantarlo

1. Copia `.env.example` a `.env` (no subas `.env` al repositorio).
2. `npm ci`
3. `npm run dev` y abre http://localhost:3000

## Scripts

| Comando | Uso |
|---|---|
| `npm run dev` | Servidor de desarrollo |
| `npm run lint` | ESLint |
| `npx tsc --noEmit` | Comprobación de tipos |
| `npm run build` | Build de producción (standalone) |
| `npm run e2e` | Pruebas end-to-end con Playwright |

## Pruebas end-to-end

Requisitos:
- Servidor web ejecutándose (por ejemplo en el puerto 3100: `npm run start -- -p 3100` o en 3000).
- La API Spring activa en `http://localhost:8080`.
- Navegador Chromium instalado (`npx playwright install chromium`).

Variables de entorno:
- `E2E_BASE_URL`: URL base del frontend (por defecto `http://localhost:3100`).
- `E2E_CORREO`: Correo de la cuenta de prueba con acceso a tienda.
- `E2E_CONTRASENA`: Contraseña de la cuenta de prueba.

Ejecución:
```bash
npm run e2e
```
Si faltan las variables `E2E_CORREO` y `E2E_CONTRASENA`, las pruebas que requieren autenticación se saltan automáticamente sin fallar.

Documentación de arquitectura y de tareas: `../docs/arquitectura-frontend.md` y `../docs/orquestacion-frontend/`.
