# DevOps Course - Dockerized Node.js Application with Neon Database

A production-ready Node.js application with Express, Drizzle ORM, and Neon Database integration. This setup supports both local development with Neon Local and production deployment with Neon Cloud.

## 🏗️ Architecture Overview

- **Development**: Uses Neon Local proxy for ephemeral database branches
- **Production**: Connects directly to Neon Cloud database
- **Framework**: Express.js with TypeScript-style imports
- **Database**: PostgreSQL via Neon Database
- **ORM**: Drizzle ORM for type-safe database operations
- **Security**: Helmet, CORS, rate limiting with Arcjet

## 📋 Prerequisites

### Required Tools
- [Docker](https://www.docker.com/get-started) and Docker Compose
- [Node.js 18+](https://nodejs.org/) (for local development without Docker)
- [Git](https://git-scm.com/)

### Neon Database Setup
1. Create a [Neon account](https://neon.tech/)
2. Create a new project
3. Get your credentials from the Neon Console:
   - **NEON_API_KEY**: Settings → API Keys
   - **NEON_PROJECT_ID**: Project Settings → General
   - **PARENT_BRANCH_ID**: Branches tab (usually `main` or `br-xxx`)

## 🚀 Quick Start

### 1. Clone and Setup
```bash
git clone <your-repository-url>
cd devops-course
```

### 2. Configure Environment Variables

#### For Development (.env.development)
```bash
# Copy the template and update with your Neon credentials
cp .env.development .env.development.local

# Edit the file and replace placeholder values:
NEON_API_KEY=your_actual_neon_api_key
NEON_PROJECT_ID=your_actual_neon_project_id
PARENT_BRANCH_ID=your_parent_branch_id
```

#### For Production (.env.production)
```bash
# Set these environment variables in your production environment
DATABASE_URL=postgres://username:password@ep-example.us-east-1.aws.neon.tech/dbname?sslmode=require
JWT_SECRET=your_super_secure_jwt_secret
CORS_ORIGIN=https://your-domain.com
```

## 🛠️ Development Environment

### Using Docker Compose (Recommended)

#### Start Development Environment
```bash
# Load environment variables and start services
docker-compose --env-file .env.development.local -f docker-compose.dev.yml up --build

# Or run in detached mode
docker-compose --env-file .env.development.local -f docker-compose.dev.yml up -d --build
```

#### What This Does:
- 🐳 Starts **Neon Local** proxy container
- 📦 Creates ephemeral database branches automatically
- 🔄 Enables hot-reloading for development
- 🗄️ Optionally runs Drizzle Studio for database management

#### Available Services:
- **App**: http://localhost:3000
- **Database**: localhost:5432 (via Neon Local)
- **Drizzle Studio**: http://localhost:4983 (run with `--profile studio`)

#### Start with Database Studio:
```bash
docker-compose --env-file .env.development.local -f docker-compose.dev.yml --profile studio up --build
```

#### View Logs:
```bash
# All services
docker-compose -f docker-compose.dev.yml logs -f

# Specific service
docker-compose -f docker-compose.dev.yml logs -f app
docker-compose -f docker-compose.dev.yml logs -f neon-local
```

#### Stop Development Environment:
```bash
docker-compose -f docker-compose.dev.yml down

# Remove volumes (clean slate)
docker-compose -f docker-compose.dev.yml down -v
```

### Local Development (Without Docker)

If you prefer running Node.js locally while using Neon Local in Docker:

```bash
# Start only Neon Local
docker run --name neon-local-dev \
  -p 5432:5432 \
  -e NEON_API_KEY=your_neon_api_key \
  -e NEON_PROJECT_ID=your_neon_project_id \
  -e PARENT_BRANCH_ID=your_parent_branch_id \
  neondatabase/neon_local:latest

# In another terminal, start the app
npm install
cp .env.development .env
# Update DATABASE_URL to use localhost:5432
npm run dev
```

## 🚀 Production Deployment

### Using Docker Compose

#### 1. Set Environment Variables
```bash
# Option 1: Create .env file for production
DATABASE_URL=postgres://username:password@ep-example.us-east-1.aws.neon.tech/dbname?sslmode=require
JWT_SECRET=your_super_secure_jwt_secret
CORS_ORIGIN=https://your-domain.com

# Option 2: Export as system environment variables
export DATABASE_URL="postgres://username:password@ep-example.us-east-1.aws.neon.tech/dbname?sslmode=require"
export JWT_SECRET="your_super_secure_jwt_secret"
export CORS_ORIGIN="https://your-domain.com"
```

#### 2. Deploy Application
```bash
# Build and start production services
docker-compose -f docker-compose.prod.yml up --build -d

# With nginx reverse proxy
docker-compose -f docker-compose.prod.yml --profile nginx up --build -d

# View production logs
docker-compose -f docker-compose.prod.yml logs -f
```

#### 3. Health Check
```bash
# Check if application is healthy
curl http://localhost:3000/health

# Expected response:
# {
#   "status": "OK",
#   "timestamp": "2024-01-01T00:00:00.000Z",
#   "uptime": 123.456
# }
```

### Cloud Deployment (AWS/GCP/Azure)

#### 1. Container Registry
```bash
# Build and tag for production
docker build -t your-registry/devops-course:latest --target production .

# Push to registry
docker push your-registry/devops-course:latest
```

#### 2. Environment Variables
Set these in your cloud provider's environment configuration:
- `DATABASE_URL`: Your Neon Cloud connection string
- `JWT_SECRET`: Secure random string
- `CORS_ORIGIN`: Your domain(s)
- `NODE_ENV=production`

## 🗄️ Database Operations

### Run Database Migrations
```bash
# Development
docker-compose -f docker-compose.dev.yml exec app npm run db:migrate

# Production
docker-compose -f docker-compose.prod.yml exec app npm run db:migrate
```

### Generate New Migrations
```bash
# Development
docker-compose -f docker-compose.dev.yml exec app npm run db:generate
```

### Access Drizzle Studio
```bash
# Start with studio profile
docker-compose --env-file .env.development.local -f docker-compose.dev.yml --profile studio up -d

# Visit http://localhost:4983
```

## 🔧 Environment Variables Reference

### Development Environment
| Variable | Description | Example |
|----------|-------------|---------|
| `NODE_ENV` | Environment mode | `development` |
| `PORT` | Application port | `3000` |
| `DATABASE_URL` | Neon Local connection | `postgres://neon:npg@neon-local:5432/dbname?sslmode=require` |
| `NEON_API_KEY` | Your Neon API key | `neon_api_key_xxx` |
| `NEON_PROJECT_ID` | Your Neon project ID | `proud-sound-12345` |
| `PARENT_BRANCH_ID` | Parent branch for ephemeral branches | `br-main-abc123` |
| `JWT_SECRET` | JWT signing secret | `dev_secret_123` |
| `LOG_LEVEL` | Logging verbosity | `debug` |

### Production Environment
| Variable | Description | Example |
|----------|-------------|---------|
| `NODE_ENV` | Environment mode | `production` |
| `PORT` | Application port | `3000` |
| `DATABASE_URL` | Neon Cloud connection | `postgres://user:pass@ep-xxx.neon.tech/db?sslmode=require` |
| `JWT_SECRET` | JWT signing secret | `super_secure_secret_xxx` |
| `CORS_ORIGIN` | Allowed CORS origins | `https://yourdomain.com` |
| `LOG_LEVEL` | Logging verbosity | `info` |
| `TRUST_PROXY` | Trust reverse proxy | `true` |

## 📊 Monitoring and Debugging

### View Application Logs
```bash
# Development
docker-compose -f docker-compose.dev.yml logs -f app

# Production
docker-compose -f docker-compose.prod.yml logs -f app
```

### Database Connection Testing
```bash
# Test Neon Local connection
docker-compose -f docker-compose.dev.yml exec neon-local pg_isready -h localhost -p 5432 -U neon

# Test application database connection
docker-compose -f docker-compose.dev.yml exec app node -e "
  import('./src/config/database.js').then(db => {
    console.log('Database connection successful');
    process.exit(0);
  }).catch(err => {
    console.error('Database connection failed:', err);
    process.exit(1);
  });
"
```

### Performance Monitoring
```bash
# Container resource usage
docker stats

# Application health check
curl http://localhost:3000/health
```

## 🚨 Troubleshooting

### Common Issues

#### 1. Neon Local Connection Failed
```bash
# Check if Neon Local is running
docker-compose -f docker-compose.dev.yml ps neon-local

# Check Neon Local logs
docker-compose -f docker-compose.dev.yml logs neon-local

# Verify environment variables
docker-compose -f docker-compose.dev.yml exec neon-local env | grep NEON
```

#### 2. Application Can't Connect to Database
```bash
# Check network connectivity
docker-compose -f docker-compose.dev.yml exec app nslookup neon-local

# Verify database URL
docker-compose -f docker-compose.dev.yml exec app echo $DATABASE_URL
```

#### 3. Port Already in Use
```bash
# Find what's using port 3000
netstat -tulnp | grep :3000
# Or on Windows
netstat -an | findstr :3000

# Use different port
PORT=3001 docker-compose -f docker-compose.dev.yml up
```

#### 4. Permission Issues
```bash
# Fix file permissions
chmod +x ./scripts/*

# Fix Docker permissions (Linux)
sudo usermod -aG docker $USER
```

### Logs and Debugging
```bash
# Detailed container inspection
docker-compose -f docker-compose.dev.yml exec app sh

# Check environment variables
docker-compose -f docker-compose.dev.yml exec app printenv

# Database connection test
docker-compose -f docker-compose.dev.yml exec app npm run db:studio
```

## 🔒 Security Considerations

### Development
- Neon Local creates ephemeral branches that are automatically deleted
- Environment variables are loaded from local files
- Debug logging is enabled for troubleshooting

### Production
- All secrets are injected via environment variables
- Non-root user in containers
- Resource limits and health checks configured
- CORS origins restricted to your domains
- Reverse proxy recommended (nginx configuration included)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test with both development and production configurations
5. Submit a pull request

## 📄 License

ISC License - see LICENSE file for details.

---

## 🆘 Need Help?

- **Neon Documentation**: https://neon.com/docs
- **Neon Local Guide**: https://neon.com/docs/local/neon-local
- **Docker Documentation**: https://docs.docker.com/
- **Express.js Documentation**: https://expressjs.com/