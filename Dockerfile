# syntax=docker/dockerfile:1

# ---------- Build stage: install everything, build the client ----------
FROM node:24-alpine AS build
WORKDIR /app

# package-lock.json (when committed) makes builds reproducible
COPY package*.json ./
RUN if [ -f package-lock.json ]; then npm ci --no-audit --no-fund; else npm install --no-audit --no-fund; fi

COPY . .

# Optional: bake the photos into the image so the site has no external image host.
ARG VITE_LOCAL_IMAGES=false
ENV VITE_LOCAL_IMAGES=${VITE_LOCAL_IMAGES}
RUN if [ "$VITE_LOCAL_IMAGES" = "true" ]; then node scripts/download-images.mjs; fi

RUN npm run build
RUN npm prune --omit=dev

# ---------- Runtime stage: small image, non-root ----------
FROM node:24-alpine AS runtime
WORKDIR /app
ENV NODE_ENV=production \
    PORT=3000 \
    STORAGE_DIR=/app/storage

COPY --from=build /app/package*.json ./
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/dist ./dist
COPY --from=build /app/server ./server

# Persistent folder for listings, users, uploaded photos, inquiries, valuations and subscribers
RUN mkdir -p /app/storage && chown -R node:node /app/storage
USER node
VOLUME ["/app/storage"]
EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=5s --start-period=20s --retries=3 \
  CMD node -e "fetch('http://127.0.0.1:'+(process.env.PORT||3000)+'/api/health').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"

CMD ["node_modules/.bin/tsx", "server/index.ts"]
