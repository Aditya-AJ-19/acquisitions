# WARP.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

## Development Commands

### Server
- **Development**: `npm run dev` - Starts the server with Node.js watch mode (auto-restarts on file changes)
- **Entry point**: `src/index.js` (loads environment variables and starts the server)

### Code Quality
- **Lint**: `npm run lint` - Check code with ESLint
- **Lint Fix**: `npm run lint:fix` - Auto-fix ESLint issues
- **Format**: `npm run format` - Format code with Prettier
- **Format Check**: `npm run format:check` - Check code formatting without modifying files

### Database (Drizzle ORM)
- **Generate Migrations**: `npm run db:generate` - Generate migration files from schema changes in `src/models/*.js`
- **Run Migrations**: `npm run db:migrate` - Apply pending migrations to the database
- **Database Studio**: `npm run db:studio` - Open Drizzle Studio UI for database management

## Architecture Overview

### Core Technology Stack
- **Runtime**: Node.js with ES modules (`"type": "module"`)
- **Framework**: Express v5.x
- **Database**: Neon PostgreSQL with Drizzle ORM
- **Security**: Arcjet (bot detection, rate limiting, shield)
- **Logging**: Winston with file-based logs
- **Authentication**: JWT tokens with httpOnly cookies

### Project Structure
The project uses a layered architecture with path aliases defined in package.json `imports`:
- `#config/*` → `src/config/*` - Configuration files (database, logger, arcjet)
- `#controllers/*` → `src/controllers/*` - Request handlers
- `#models/*` → `src/models/*` - Drizzle ORM schema definitions
- `#routes/*` → `src/routes/*` - Express route definitions
- `#utils/*` → `src/utils/*` - Utility functions (JWT, cookies, formatting)
- `#middleware/*` → `src/middleware/*` - Express middleware
- `#services/*` → `src/services/*` - Business logic layer
- `#validations/*` → `src/validations/*` - Zod validation schemas

### Application Flow
1. **Entry**: `src/index.js` → `src/server.js` → `src/app.js`
2. **Request Pipeline**: 
   - Security headers (helmet)
   - CORS
   - Body parsing (JSON/URL-encoded)
   - Request logging (morgan → Winston)
   - Cookie parsing
   - **Security middleware** (Arcjet: bot detection, shield, rate limiting)
   - Route handlers

### Security Architecture
**Arcjet Integration** (`src/config/arcjet.js`):
- Shield protection (blocks common attacks)
- Bot detection (allows search engines and preview bots)
- Base rate limiting (5 requests per 2 seconds)

**Dynamic Rate Limiting** (`src/middleware/security.middleware.js`):
Applied per role with sliding window (1 minute):
- Admin: 20 requests/minute
- User: 10 requests/minute
- Guest: 5 requests/minute

Returns 409 status for blocked requests with appropriate error messages.

### Authentication Flow
1. **Sign-Up/Sign-In** → Controller validates with Zod schemas
2. **Service Layer** → Handles password hashing (bcrypt), database operations
3. **Token Generation** → JWT token with user id, email, role
4. **Cookie Storage** → httpOnly, secure (production), sameSite: strict, 15-minute expiry
5. **Middleware** → Security checks on all routes (role-based rate limiting)

### Database Schema
**Users table** (`src/models/user.model.js`):
- PostgreSQL table via Drizzle ORM (pgTable)
- Fields: id (serial), name, email (unique), password (hashed), role (default: 'user'), timestamps
- Migrations stored in `drizzle/` directory

### Logging Strategy
**Winston Logger** (`src/config/logger.js`):
- Service name: 'acquisitions-api'
- File transports: `logs/error.log` (errors only), `logs/combined.log` (all levels)
- Console transport in non-production (colorized)
- Integrated with Morgan for HTTP request logging

### Environment Configuration
Required variables (see `.env.example`):
- `PORT` - Server port (default: 3000)
- `NODE_ENV` - Environment (development/production)
- `LOG_LEVEL` - Logging level (default: info)
- `DATABASE_URL` - Neon PostgreSQL connection string
- `JWT_SECRET` - JWT signing secret (defaults to placeholder if not set)
- `ARCJET_KEY` - Arcjet API key for security features

### Code Style
**ESLint** rules:
- Indent: 2 spaces
- Quotes: single
- Semi: required
- No var, prefer const
- Arrow functions preferred
- Unix line endings

**Prettier** config:
- Single quotes
- 2-space tabs
- 80 character line width
- Trailing commas (ES5)
- LF line endings

## Key Implementation Patterns

### Error Handling
- Controllers use try-catch with `next(error)` for unhandled errors
- Service functions throw errors that controllers catch and translate to HTTP responses
- Validation errors formatted with `formatValidationError` utility
- Security middleware catches Arcjet errors and returns 500 status

### Database Queries
- Use Drizzle ORM with query builder syntax
- Import `db` from `#config/database.js`
- Use `eq()` helper for WHERE clauses
- Always use `.limit(1)` for single-record queries
- Return statements exclude password fields

### Validation
- All input validated with Zod schemas before processing
- Use `.safeParse()` to avoid throwing errors
- Return 400 status with formatted validation errors

### Cookie Management
- Use `cookies` utility object (`#utils/cookies.js`)
- Never manually set cookie options - use helper methods
- Token stored as 'token' cookie name
