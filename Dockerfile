FROM node:20-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

FROM deps AS build
COPY . .
RUN npm run build

FROM node:20-alpine AS runtime
WORKDIR /app
ENV HOST=0.0.0.0
ENV PORT=4173
# Copy only the production build output — node_modules are not needed at runtime
# since vite preview serves static files from dist/
COPY --from=build /app/dist ./dist
COPY --from=deps /app/node_modules ./node_modules
COPY --from=build /app/package.json ./package.json
EXPOSE 4173
HEALTHCHECK --interval=30s --timeout=5s --start-period=20s --retries=3 CMD wget -qO- "http://127.0.0.1:${PORT}/" >/dev/null || exit 1
CMD ["npx", "vite", "preview", "--host", "0.0.0.0", "--port", "4173"]
