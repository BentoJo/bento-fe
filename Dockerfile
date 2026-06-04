# =========================
# 1. BUILD STAGE
# =========================
FROM node:20-alpine AS builder

WORKDIR /app

# NEXT_PUBLIC_* are INLINED into the bundle at BUILD time, so they must be
# provided as build args (the deploy workflow passes them from CI secrets).
ARG NEXT_PUBLIC_DEVICE_FINGERPRINT_STORAGE_KEY
ARG NEXT_PUBLIC_DEVICE_NAME_STORAGE_KEY
ARG NEXT_PUBLIC_API_URL

ENV NEXT_PUBLIC_DEVICE_FINGERPRINT_STORAGE_KEY=$NEXT_PUBLIC_DEVICE_FINGERPRINT_STORAGE_KEY
ENV NEXT_PUBLIC_DEVICE_NAME_STORAGE_KEY=$NEXT_PUBLIC_DEVICE_NAME_STORAGE_KEY
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL
ENV NEXT_TELEMETRY_DISABLED=1

# install dependencies
COPY package*.json ./
RUN npm ci

# copy source + build (produces .next/standalone)
COPY . .
RUN npm run build


# =========================
# 2. RUNNER STAGE (standalone)
# =========================
FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
ENV HOSTNAME=0.0.0.0

# run as non-root
RUN addgroup -g 1001 -S nodejs && adduser -S nextjs -u 1001

# Next.js standalone output: a minimal node server + only the deps it needs.
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
COPY --from=builder --chown=nextjs:nodejs /app/public ./public

USER nextjs
EXPOSE 3000

# Runtime (non-NEXT_PUBLIC) secrets — NEXTAUTH_SECRET / NEXTAUTH_URL — are read
# from process.env at RUNTIME and MUST be supplied by docker-compose
# `environment` (never baked into the image).
CMD ["node", "server.js"]
