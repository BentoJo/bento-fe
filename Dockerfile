# =========================
# 1. BUILD STAGE
# =========================
FROM node:20-alpine AS builder

WORKDIR /app

# ---- build args (IMPORTANT for NEXT_PUBLIC vars) ----
ARG NEXT_PUBLIC_DEVICE_FINGERPRINT_STORAGE_KEY
ARG NEXT_PUBLIC_DEVICE_NAME_STORAGE_KEY
ARG NEXT_PUBLIC_API_URL

ENV NEXT_PUBLIC_DEVICE_FINGERPRINT_STORAGE_KEY=$NEXT_PUBLIC_DEVICE_FINGERPRINT_STORAGE_KEY
ENV NEXT_PUBLIC_DEVICE_NAME_STORAGE_KEY=$NEXT_PUBLIC_DEVICE_NAME_STORAGE_KEY
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL

# install dependencies
COPY package*.json ./
RUN npm ci

# copy source code
COPY . .

# build next app
RUN npm run build


# =========================
# 2. RUNNER STAGE
# =========================
FROM node:20-alpine AS runner

WORKDIR /app

# copy built app
COPY --from=builder /app ./

EXPOSE 3000

CMD ["npm", "start"]