FROM node:22-alpine

WORKDIR /app

# Install dependencies required for native node build tools & Prisma
RUN apk add --no-cache openssl libc6-compat

# Copy workspace configuration and packages
COPY package*.json ./
COPY backend/package*.json ./backend/
COPY frontend/package*.json ./frontend/
COPY admin/package*.json ./admin/

# Install root & workspace dependencies
RUN npm install

# Copy shared scripts and backend source files
COPY scripts ./scripts
COPY backend ./backend

WORKDIR /app/backend

# Generate Prisma Client
RUN npx prisma generate

EXPOSE 8585

ENV PORT=8585

# Start backend dev server with hot reload and client guarantee
CMD ["sh", "-c", "npx prisma generate && npm run dev"]
