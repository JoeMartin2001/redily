# ─── Stage 1: Build ────────────────────────────────────────────────
FROM node:20-alpine AS builder

WORKDIR /usr/src/app

# Copy package files and install dependencies
COPY package.json yarn.lock ./
RUN yarn install --frozen-lockfile

# Copy source and build the app
COPY . .

# Build TS -> dist
RUN yarn build

# ─── Stage 2: Runtime ──────────────────────────────────────────────
FROM node:20-alpine AS runner

WORKDIR /usr/src/app

# Copy only necessary files from builder
COPY --from=builder /usr/src/app/node_modules ./node_modules
COPY --from=builder /usr/src/app/dist ./dist
COPY package*.json ./

# Expose the app port (use env later for flexibility)
EXPOSE 4000

# Default command
CMD ["node", "dist/main.js"]
