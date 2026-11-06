# ---------- Build ----------
FROM node:22-alpine AS build
WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY . .
RUN npm run build

# ---------- Runtime ----------
FROM node:22-alpine
WORKDIR /app
ENV NODE_ENV=production

# La app queda empaquetada en dist/ (frontend + backend en un solo proceso).
COPY --from=build /app/dist ./dist
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/package.json ./package.json

# Las variables de entorno se inyectan con --env-file .env o docker-compose.
EXPOSE 3000
CMD ["node", "dist/boot.js"]
