# ImmoCalc Deployment Guide

This document describes how to deploy ImmoCalc to a production server using Docker and the caddy-network infrastructure.

## Overview

ImmoCalc is deployed to `immocalc.festas-builds.com` using:

- **Docker** for containerization
- **Docker Compose** for orchestration
- **Caddy** (from Link-in-Bio repository) as reverse proxy with automatic HTTPS
- **GitHub Actions** for automated deployments

## Required GitHub Secrets

For complete instructions on managing secrets, see [Secrets Management Guide](docs/SECRETS_MANAGEMENT.md).

Configure these secrets in your GitHub repository settings (`Settings` → `Secrets and variables` → `Actions`):

### Infrastructure Secrets

| Secret            | Description                        | Required |
| ----------------- | ---------------------------------- | -------- |
| `SERVER_HOST`     | The server IP address or hostname  | Yes      |
| `SERVER_USER`     | SSH username for the server        | Yes      |
| `SSH_PRIVATE_KEY` | Private SSH key for authentication | Yes      |
| `DOMAIN`          | Base domain for the deployment     | Yes      |

### Application Secrets

| Secret           | Description                         | Required | How to Generate           |
| ---------------- | ----------------------------------- | -------- | ------------------------- |
| `DB_PASSWORD`    | PostgreSQL database password        | Yes      | `openssl rand -base64 32` |
| `JWT_SECRET`     | Secret key for JWT token generation | Yes      | `openssl rand -base64 32` |
| `SESSION_SECRET` | Secret key for session management   | No       | `openssl rand -base64 32` |

Secrets are automatically injected into the `.env` file on the server during deployment. See the [Secrets Management Guide](docs/SECRETS_MANAGEMENT.md) for detailed setup instructions.

## Optional Environment Variables

Create a `.env` file on the server with these optional variables:

```bash
# Database Configuration (Required)
DB_PASSWORD=your_secure_postgres_password_here
JWT_SECRET=your_secure_jwt_secret_here_at_least_32_chars

# Optional: AI Integration
OPENAI_API_KEY=sk-your-api-key

# Optional: Google Maps API (for property location display)
NEXT_PUBLIC_GOOGLE_MAPS_KEY=your-google-maps-key
```

> **Note:** The PostgreSQL password and JWT secret are required for production deployment. Optional features (AI, Maps) work with graceful degradation if keys are not provided.

## Initial Server Setup

### 1. Clone the Repository

```bash
mkdir -p /home/deploy
cd /home/deploy
git clone https://github.com/Festas/Immo-Invest-Tool.git immocalc
cd immocalc
```

### 2. Create the External Network

If the `caddy-network` doesn't exist yet:

```bash
docker network create caddy-network
```

### 3. Create Environment File (Optional)

```bash
cp .env.example .env
# Edit .env with your values
nano .env
```

### 4. Update Caddyfile in Link-in-Bio Repository

Add the following entry to the Caddyfile in the `Festas/Link-in-Bio` repository:

```caddyfile
# ImmoCalc subdomain - Immobilien Investment Calculator
# The immocalc container must join the 'caddy-network' external network
immocalc.festas-builds.com {
    tls eric@festas-builds.com
    encode gzip zstd
    # Cache static Next.js assets with immutable cache headers
    @static path /_next/static/*
    header @static Cache-Control "public, max-age=31536000, immutable"
    reverse_proxy immocalc:3000
}
```

### 5. Deploy the Application

```bash
docker compose up -d --build
```

### 6. Run Database Migrations

After the containers are up, run the database migrations:

```bash
# Deploy migrations to the database
docker compose exec web npx prisma migrate deploy

# Verify the database is accessible
docker compose exec web npx prisma db pull
```

### 7. Verify Deployment

```bash
# Check container status
docker compose ps

# View logs
docker compose logs -f

# Test health endpoint (via host port 8086 mapped to container port 3000)
curl http://localhost:8086/api/health

# Alternative: Test container port directly (from within the container network)
curl http://localhost:3000/api/health

# The health endpoint should return:
# - status: "healthy" when all systems operational
# - status: "degraded" when some components have issues
# - status: "unhealthy" when critical systems are down
```

**Port Mapping**: The container internally listens on port 3000 (as defined in the Dockerfile). The docker-compose configuration maps host port 8086 to container port 3000, making the application accessible via `http://127.0.0.1:8086` on the host machine. This allows nginx or other services running on the host to access the immocalc container on port 8086.

## Health Monitoring

ImmoCalc includes a comprehensive health check endpoint at `/api/health` that monitors:

- **Server Status**: Confirms the backend is running
- **Storage Accessibility**: Validates DATA_DIR is readable and writable
- **Database/User Data**: Checks if user data can be accessed
- **Environment Configuration**: Reports JWT_SECRET and NODE_ENV status
- **Secrets Configuration**: Verifies all required and optional secrets are properly configured

### Health Check Response

```json
{
  "status": "healthy|degraded|unhealthy",
  "timestamp": "2024-12-07T15:00:00.000Z",
  "checks": {
    "server": {
      "status": "up",
      "uptime": 12345
    },
    "storage": {
      "status": "accessible|inaccessible|error",
      "path": "/data/.auth",
      "readable": true,
      "writable": true,
      "error": "optional error message"
    },
    "database": {
      "status": "accessible|inaccessible|error",
      "userCount": 5,
      "error": "optional error message"
    },
    "secrets": {
      "status": "complete|partial|missing",
      "required": {
        "JWT_SECRET": true
      },
      "optional": {
        "SESSION_SECRET": true,
        "DOMAIN": true
      },
      "warnings": []
    }
  },
  "environment": {
    "nodeEnv": "production",
    "hasJwtSecret": true
  }
}
```

### Secrets Status

- **`complete`**: All required and optional secrets are configured
- **`partial`**: Required secrets present, but some optional secrets missing (results in `degraded` overall status)
- **`missing`**: Required JWT_SECRET not configured (results in `unhealthy` overall status)

For detailed information about secrets management, see [Secrets Management Guide](docs/SECRETS_MANAGEMENT.md).

### Using the Health Check

**Docker Compose Health Check:**
The production deployment automatically uses the health endpoint:

```bash
docker compose ps  # Shows health status
```

**Manual Health Check:**

```bash
# Check local instance
curl http://localhost:3000/api/health

# Check production
curl https://immocalc.festas-builds.com/api/health
```

**HTTP Status Codes:**

- `200 OK`: System is healthy or degraded (still operational)
- `503 Service Unavailable`: System is unhealthy (critical issues)

## Database Management

### Running Migrations

When the database schema changes, apply migrations to update the database:

```bash
# Deploy migrations to production database
docker compose exec web npx prisma migrate deploy
```

### Database Backup

Create regular backups of the PostgreSQL database:

```bash
# Backup with timestamp to a secure location
docker compose exec -T db pg_dump -U immo_user immo_invest > backup_$(date +%Y%m%d_%H%M%S).sql
chmod 600 backup_*.sql  # Restrict access to backup files

# Backup with custom name
docker compose exec -T db pg_dump -U immo_user immo_invest > backup.sql
chmod 600 backup.sql
```

**Note**: Store backup files in a secure location (not in the web-accessible directory) with restricted permissions to protect sensitive data.

### Database Restore

Restore from a backup file:

```bash
# Restore from backup
docker compose exec -T db psql -U immo_user immo_invest < backup.sql
```

### Database Access

Access the PostgreSQL database directly:

```bash
# Access PostgreSQL shell
docker compose exec db psql -U immo_user -d immo_invest

# Run SQL query
docker compose exec db psql -U immo_user -d immo_invest -c "SELECT COUNT(*) FROM \"User\";"
```

### Database Studio (Development)

For a visual database management interface:

```bash
# On your local machine with DATABASE_URL pointing to the server
npm run db:studio
```

**Security Warning**: Prisma Studio should only be used in development environments. Never expose it to the public internet. When connecting to production databases, ensure you're using a secure tunnel (e.g., SSH tunnel) and that the DATABASE_URL is properly configured with appropriate access controls.

**Security Note**: The PostgreSQL container does NOT expose port 5432 externally. It's only accessible internally via the `caddy-network` for security reasons.

## Error Handling and Logging

### Backend Error Logging

The authentication system includes comprehensive error logging with specific error codes:

**Common Error Codes:**

- `MISSING_CREDENTIALS`: Username or password not provided
- `INVALID_CREDENTIALS`: Invalid username or password
- `STORAGE_PERMISSION_ERROR`: Cannot access user data (EACCES)
- `STORAGE_NOT_FOUND`: User database file missing (ENOENT)
- `STORAGE_ERROR`: Generic storage/database error
- `PASSWORD_VERIFICATION_ERROR`: Password hashing/comparison failed
- `SESSION_CONFIG_ERROR`: JWT_SECRET not configured
- `SESSION_CREATION_ERROR`: Session token creation failed
- `COOKIE_ERROR`: Session cookie couldn't be set
- `UNEXPECTED_ERROR`: Unexpected server error

**Log Levels:**

- `console.info`: Successful operations with timing
- `console.warn`: Failed authentication attempts
- `console.error`: System errors and exceptions

**Development Mode:**
When `NODE_ENV=development`, additional debug information is logged including:

- Request timing and duration
- Detailed error stack traces
- File system operation details
- Health check results

### Frontend Error Handling

The login form provides user-friendly error messages:

**Network Errors:**

- Detects when the backend is unreachable
- Automatically checks health endpoint to provide context
- Shows specific message if server reports storage issues

**Authentication Errors:**

- Displays backend error messages in German
- Provides specific guidance based on error type
- Clear distinction between network and auth failures

### Troubleshooting Authentication Issues

**Login fails with "Netzwerkfehler":**

1. Check if backend is running: `curl http://localhost:3000/api/health`
2. Check health endpoint status and database accessibility
3. Verify Docker containers are healthy: `docker compose ps`
4. Check logs for errors: `docker compose logs -f`

**Login fails with "Fehler beim Zugriff auf Benutzerdaten":**

1. Check database connection: `docker compose exec db pg_isready -U immo_user -d immo_invest`
2. Verify DATABASE_URL is correctly configured in the web container
3. Check health endpoint database status
4. Review database logs: `docker compose logs db`

**Login fails with "Server-Konfigurationsfehler":**

1. Ensure JWT_SECRET is set in production environment
2. Generate a secure secret: `openssl rand -base64 32`
3. Add to `.env` file: `JWT_SECRET=your-generated-secret`
4. Restart the containers: `docker compose restart`

## Automated Deployments

The GitHub Actions workflow (`.github/workflows/deploy.yml`) automatically deploys to production when:

- Changes are pushed to the `main` branch
- The workflow is manually triggered via `workflow_dispatch`

### Deployment Process

1. SSH into the production server
2. Pull latest changes from `main` branch
3. Stop the running container
4. Rebuild the Docker image (no cache)
5. Start the new container
6. Clean up unused Docker resources

## Manual Deployment

To deploy manually on the server:

```bash
cd /home/deploy/immocalc
git pull origin main
docker compose down
docker compose build --no-cache
docker compose up -d
docker system prune -f
```

## Monitoring

### View Logs

```bash
docker compose logs -f web
```

### Check Container Health

```bash
docker compose ps
docker inspect immocalc --format='{{.State.Health.Status}}'
```

### Restart the Application

```bash
docker compose restart web
```

## Troubleshooting

### Container Won't Start

1. Check logs for errors:

   ```bash
   docker compose logs web
   ```

2. Check health status:

   ```bash
   curl http://localhost:3000/api/health
   ```

3. Verify the caddy-network exists:

   ```bash
   docker network ls | grep caddy-network
   ```

4. Ensure port 3000 is not in use by another process

### 502 Bad Gateway

1. Verify the container is running and healthy:

   ```bash
   docker compose ps
   docker inspect immocalc --format='{{.State.Health.Status}}'
   ```

2. Check the health endpoint directly:

   ```bash
   curl http://localhost:3000/api/health
   ```

3. Check if the container is connected to caddy-network:

   ```bash
   docker network inspect caddy-network
   ```

4. Restart the Caddy container in Link-in-Bio repository

### Database Connection Issues

If the health check reports database issues or the application cannot connect to PostgreSQL:

1. Check if the database container is running:

   ```bash
   docker compose ps db
   docker compose logs db
   ```

2. Verify database is healthy:

   ```bash
   docker compose exec db pg_isready -U immo_user -d immo_invest
   ```

3. Check if web container can reach the database:

   ```bash
   docker compose exec web sh -c 'nc -zv db 5432'
   ```

4. Verify DATABASE_URL is correctly set:

   ```bash
   docker compose exec web env | grep DATABASE_URL
   ```

5. Check if migrations have been applied:

   ```bash
   docker compose exec web npx prisma migrate status
   ```

6. Inspect the postgres-data volume:

   ```bash
   docker volume inspect immocalc_postgres-data
   ```

7. Check for disk space issues:

   ```bash
   df -h
   ```

### Build Failures

1. Ensure Docker has enough disk space:

   ```bash
   docker system df
   ```

2. Clear Docker cache if needed:
   ```bash
   docker system prune -a
   ```

## Architecture

```
                                    ┌─────────────────────────────────┐
                                    │         Link-in-Bio             │
                                    │    (Caddy Reverse Proxy)        │
                                    │                                 │
Internet ──► immocalc.festas-builds.com ──► caddy-network ──┬─► immocalc:3000 (web)
                                    │                        │
                                    └────────────────────────┼────────────────┘
                                                             │
                                                             └─► immocalc-db:5432 (PostgreSQL)

Host machine (nginx/other services) ──► localhost:8086 ──► immocalc:3000
```

### Port Configuration

- **Container Port (Web)**: 3000 (defined in Dockerfile EXPOSE 3000)
- **Container Port (DB)**: 5432 (internal only, not exposed to host)
- **Host Port**: 8086 (mapped in docker-compose files)
- **Internal Network**: immocalc:3000, immocalc-db:5432 (accessible to containers on caddy-network)
- **External Access**: localhost:8086 (accessible to host machine services like nginx)

### Data Persistence

- **PostgreSQL Data**: Stored in `postgres-data` Docker volume
- **Database Backups**: Created manually using `pg_dump` (see Database Management section)

## Reference

This deployment pattern mirrors the setup used in the `Festas/PC-Builder` repository, running at `rigpilot.festas-builds.com`.
