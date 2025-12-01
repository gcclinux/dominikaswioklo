# Stage 1: Build Frontend
FROM node:20-alpine AS frontend-builder
WORKDIR /app/frontend
COPY frontend/package.json frontend/package-lock.json ./
RUN npm ci
COPY frontend/ ./
# Force output to dist to ensure consistency
RUN npm run build -- --outDir dist

# Stage 2: Build Backend
FROM node:20-alpine AS backend-builder
WORKDIR /app/backend
COPY backend/package.json backend/package-lock.json ./
RUN npm ci
COPY backend/ ./
RUN npm run build

# Stage 3: Production Runtime
FROM node:20-alpine
WORKDIR /app

# Set environment variables
ENV NODE_ENV=production
ENV PORT=5000

# Install production dependencies for backend
COPY backend/package.json backend/package-lock.json ./
RUN npm ci --only=production

# Copy built backend code
COPY --from=backend-builder /app/backend/dist ./dist

# Copy built frontend code to where the server expects it
# server.ts expects: ../../frontend/dist relative to dist/server.js
# So we place it at /app/frontend/dist
COPY --from=frontend-builder /app/frontend/dist ./frontend/dist

# Expose the port
EXPOSE 5000

# Start the server
CMD ["node", "dist/server.js"]
