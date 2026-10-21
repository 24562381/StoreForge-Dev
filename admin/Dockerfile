FROM node:22-alpine

WORKDIR /app

RUN apk add --no-cache libc6-compat

# Copy workspace package manifests
COPY package*.json ./
COPY backend/package*.json ./backend/
COPY frontend/package*.json ./frontend/
COPY admin/package*.json ./admin/

# Install dependencies
RUN npm install

# Copy admin source
COPY admin ./admin

WORKDIR /app/admin

EXPOSE 4000

ENV PORT=4000
ENV HOSTNAME="0.0.0.0"

# Start Next.js admin development server
CMD ["npm", "run", "dev"]
