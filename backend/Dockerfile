# ----------------------------
# 1. Builder Stage
# ----------------------------
FROM node:24-alpine3.21 AS builder

# Enable corepack (for pnpm)
RUN corepack enable

WORKDIR /app

# Copy lockfile & manifest first for caching
COPY pnpm-lock.yaml ./
COPY package.json ./

# Install dependencies (including dev) using pnpm
RUN pnpm install --frozen-lockfile

# Copy the rest of the source code
COPY . .

# Build all apps/packages (if using TS or a build step)
# For plain JS, you can skip this line
RUN pnpm run build

# ----------------------------
# 2. Runtime Stage
# ----------------------------
FROM node:24-alpine3.21

RUN corepack enable

WORKDIR /app

# Copy only the required files from builder
COPY --from=builder /app/package.json ./
COPY --from=builder /app/pnpm-lock.yaml ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
# Or if you're not building: COPY --from=builder /app/src ./src


# Run as non-root for better security
USER node

# Start the app
CMD ["node", "dist/server.js"]
# Or if plain JS: CMD ["node", "src/server.js"]
