# -----------------------------------------------------------------------------
# Stage 1: Dependencies (deps)
# Instala solo las dependencias necesarias respetando package-lock.json
# -----------------------------------------------------------------------------
FROM node:22-alpine AS deps
RUN apk add --no-cache libc6-compat

WORKDIR /app

# Copia solo los manifiestos para aprovechar la cache de Docker
COPY package.json package-lock.json ./

# Instalación limpia y determinista
RUN npm ci

# -----------------------------------------------------------------------------
# Stage 2: Builder
# Compila la aplicación Next.js generando los bundles standalone
# -----------------------------------------------------------------------------
FROM node:22-alpine AS builder
RUN apk add --no-cache libc6-compat

WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Desactivar telemetría en build
ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_ENV=production

# URL de la API NestJS para los rewrites de /api (se hornea en el build)
ARG API_INTERNAL_URL=http://api-core:4000
ENV API_INTERNAL_URL=$API_INTERNAL_URL
# La API se consume por el mismo origen (/api)
ENV NEXT_PUBLIC_API_URL=/api

# URL pública de la API para el WebSocket del KDS (tiempo real). NEXT_PUBLIC_* se hornea al compilar:
# en Railway se define como variable del servicio y llega aquí como argumento de build. Vacía = el KDS usa solo sondeo.
ARG NEXT_PUBLIC_WS_URL=
ENV NEXT_PUBLIC_WS_URL=$NEXT_PUBLIC_WS_URL

# Compilación de producción
RUN npm run build

# -----------------------------------------------------------------------------
# Stage 3: Runner
# Imagen final minimalista sin código fuente, devDependencies ni herramientas de build
# -----------------------------------------------------------------------------
FROM node:22-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
ENV HOSTNAME=0.0.0.0

# Usuario sin privilegios
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

# Copiar archivos estáticos de /public
COPY --from=builder /app/public ./public

# Directorio .next con permisos para usuario no-root
RUN mkdir .next && chown nextjs:nodejs .next

# Copiar salida standalone y assets estáticos generados
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

CMD ["node", "server.js"]
