# ========================================================
# 1️⃣ Base stage — sets up the common environment
# ========================================================
FROM node:18-alpine AS base

# Set working directory
WORKDIR /app

# Set environment variables
ENV NODE_ENV=production \
    PATH=/app/node_modules/.bin:$PATH

# ========================================================
# 2️⃣ Dependencies stage — install only prod dependencies
# ========================================================
FROM base AS deps

# Copy package files first for better caching
COPY package.json package-lock.json* ./

# Install production dependencies
RUN npm ci --only=production && npm cache clean --force

# ========================================================
# 3️⃣ Development stage
# ========================================================
FROM base AS development

ENV NODE_ENV=development

# Copy package files first
COPY package.json package-lock.json* ./

# Install all dependencies (including dev)
RUN npm ci

# Copy the rest of the source code
COPY . .

# Expose port for dev server
EXPOSE 3000

# Run the development server
CMD ["npm", "run", "dev"]

# ========================================================
# 4️⃣ Production stage
# ========================================================
FROM base AS production

# Create a non-root user
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nodejs

# Copy production node_modules from deps stage
COPY --from=deps /app/node_modules ./node_modules

# Copy app source code
COPY --chown=nodejs:nodejs . .

# Switch to non-root user
USER nodejs

# Expose application port
EXPOSE 3000

# Healthcheck for production
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000/health', res => process.exit(res.statusCode === 200 ? 0 : 1))"

# Start the app
CMD ["npm", "start"]
