# ==============================================================================
# ganesh chaturthi — Production Multi-Stage Dockerfile
# Generated autonomously by Orbit (Nexora DevOps Engineer)
# ==============================================================================

# Build Stage
FROM node:22-alpine AS builder
WORKDIR /app

COPY package*.json ./
RUN npm install --include=dev

COPY . .
# If React Vite build script exists, build client bundle
RUN if grep -q "build" package.json; then npm run build; fi

# Production Runtime Stage
FROM node:22-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000

COPY package*.json ./
RUN npm install --omit=dev --ignore-scripts

COPY --from=builder /app ./

# Security: Run as non-root user
USER node

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3000/api/health || exit 1

CMD ["npm", "start"]
