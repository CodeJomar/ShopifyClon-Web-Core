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

Documentación de arquitectura y de tareas: `../docs/arquitectura-frontend.md` y `../docs/orquestacion-frontend/`.
