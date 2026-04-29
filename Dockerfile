# ── Etapa 1: dependencias ─────────────────────────────────────────────────────
FROM node:20-alpine AS deps

WORKDIR /app

# Copiar manifests de dependencias primero (cache layer)
COPY package*.json ./

# Instalar solo dependencias de producción
RUN npm ci --omit=dev

# ── Etapa 2: imagen final ─────────────────────────────────────────────────────
FROM node:20-alpine AS runner

# Usuario no-root para seguridad
RUN addgroup -S appgroup && adduser -S appuser -G appgroup

WORKDIR /app

# Copiar dependencias de producción desde la etapa anterior
COPY --from=deps /app/node_modules ./node_modules

# Copiar código fuente
COPY src/ ./src/
COPY package.json ./

# Propietario del directorio de trabajo
RUN chown -R appuser:appgroup /app

USER appuser

EXPOSE 3000

# Variables de entorno por defecto (sobreescribir en docker-compose)
ENV NODE_ENV=production \
    PORT=3000

# Health check nativo de Docker
HEALTHCHECK --interval=30s --timeout=10s --start-period=15s --retries=3 \
  CMD wget -qO- http://localhost:3000/health || exit 1

CMD ["node", "src/app.js"]
