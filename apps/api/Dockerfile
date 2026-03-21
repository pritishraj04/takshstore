# --- Stage 1: Dependencies ---
FROM node:20-alpine AS builder

# Install OpenSSL (required for Prisma on Alpine)
RUN apk add --no-cache openssl

WORKDIR /app

# Copy package.json and lock files
COPY package*.json ./
COPY prisma ./prisma/

# Install ALL dependencies (including devDependencies needed for build)
RUN npm ci

# Copy the rest of the application code
COPY . .

# Generate Prisma Client
RUN npx prisma generate

# Build the NestJS application (compiles TS to JS)
RUN npm run build


# --- Stage 2: Production Node Modules ---
FROM node:20-alpine AS deps

RUN apk add --no-cache openssl
WORKDIR /app

COPY package*.json ./
COPY prisma ./prisma/

# Install ONLY production dependencies to keep the image small
RUN npm ci --omit=dev

# We still need to generate the Prisma client for production
RUN npx prisma generate


# --- Stage 3: Final Production Image ---
FROM node:20-alpine AS production

RUN apk add --no-cache openssl
WORKDIR /app

# Set node environment to production
ENV NODE_ENV=production

# Copy only the necessary compiled files and production dependencies
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/package.json ./package.json
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/prisma ./prisma

# Expose the NestJS default port
EXPOSE 4000

# Start the application
CMD ["npm", "run", "start:prod"]
