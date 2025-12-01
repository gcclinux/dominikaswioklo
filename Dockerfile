# Stage 1: Build Frontend
FROM node:20-alpine AS frontend-builder
WORKDIR /app/frontend
COPY frontend/package.json frontend/package-lock.json ./
RUN npm ci
COPY frontend/ ./
# Build with empty API URL for relative paths (same-origin in production)
ENV VITE_API_BASE_URL=""
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

# Install build dependencies for native modules (sqlite3)
RUN apk add --no-cache python3 make g++

# Set environment variables
ENV NODE_ENV=production
ENV PORT=5000
ENV FRONTEND_PATH=/app/frontend/dist
ENV DB_PATH=/app/data/scheduler.db

# Install production dependencies for backend
COPY backend/package.json backend/package-lock.json ./
RUN npm ci --only=production

# Remove build dependencies to reduce image size
RUN apk del python3 make g++

# Copy built backend code
COPY --from=backend-builder /app/backend/dist ./dist

# Copy built frontend code to where the server expects it
COPY --from=frontend-builder /app/frontend/dist ./frontend/dist

# Create data directory for SQLite database (can be mounted as volume)
RUN mkdir -p /app/data

# Expose the port
EXPOSE 5000

# Volume for persistent database storage
VOLUME ["/app/data"]

# Start the server
CMD ["node", "dist/server.js"]
