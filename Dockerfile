# ────────────────────────────────────────────────
# Stage 1: Builder
# ────────────────────────────────────────────────
FROM node:22-alpine AS builder

RUN npm install -g pnpm

WORKDIR /app

# Copy workspace manifests first (layer cache optimisation)
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml ./
COPY packages/types/package.json ./packages/types/
COPY apps/api/package.json ./apps/api/

# Install all dependencies
RUN pnpm install --frozen-lockfile

# Copy source code
COPY packages/types/ ./packages/types/
COPY apps/api/ ./apps/api/

# Generate Prisma client
RUN cd apps/api && npx prisma generate

# Build NestJS
RUN pnpm --filter api build


# ────────────────────────────────────────────────
# Stage 2: Production Runner
# Copy the entire node_modules from builder — avoids
# fighting pnpm's virtual store paths for Prisma.
# ────────────────────────────────────────────────
FROM node:22-alpine AS runner

WORKDIR /app

# Copy everything from builder that the app needs at runtime
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/apps/api/dist ./apps/api/dist
COPY --from=builder /app/apps/api/node_modules ./apps/api/node_modules
COPY --from=builder /app/packages ./packages

# Copy Prisma schema (needed at runtime)
COPY apps/api/prisma ./apps/api/prisma

# Copy package manifests (needed for module resolution)
COPY package.json pnpm-workspace.yaml ./
COPY apps/api/package.json ./apps/api/

ENV NODE_ENV=production
ENV PORT=8080

EXPOSE 8080

CMD ["node", "apps/api/dist/src/main.js"]
