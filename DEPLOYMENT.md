# ImmoCalc Deployment Guide

This document describes how to deploy ImmoCalc to a production server using Docker and the caddy-network infrastructure.

## Overview

ImmoCalc is deployed to `immocalc.festas-builds.com` using:

- **Docker** for containerization
- **Docker Compose** for orchestration
- **Caddy** (from Link-in-Bio repository) as reverse proxy with automatic HTTPS
- **GitHub Actions** for automated deployments

## Required GitHub Secrets

Configure these secrets in your GitHub repository settings:

| Secret           | Description                        |
| ---------------- | ---------------------------------- |
| `SERVER_HOST`    | The server IP address or hostname  |
| `SERVER_USER`    | SSH username for the server        |
| `SERVER_SSH_KEY` | Private SSH key for authentication |

## Optional Environment Variables

Create a `.env` file on the server with these optional variables:

```bash
# Supabase Configuration (for cloud sync feature)
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key

# OpenAI API (for AI-powered deal analysis)
OPENAI_API_KEY=sk-your-api-key

# Google Maps API (for property location display)
NEXT_PUBLIC_GOOGLE_MAPS_KEY=your-google-maps-key
```

> **Note:** All features work without these APIs (graceful degradation). The app will use local storage and disable optional features if keys are not provided.

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

### 6. Verify Deployment

```bash
# Check container status
docker compose ps

# View logs
docker compose logs -f

# Test health endpoint
curl http://localhost:3000
```

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

2. Verify the caddy-network exists:

   ```bash
   docker network ls | grep caddy-network
   ```

3. Ensure port 3000 is not in use by another process

### 502 Bad Gateway

1. Verify the container is running and healthy:

   ```bash
   docker compose ps
   ```

2. Check if the container is connected to caddy-network:

   ```bash
   docker network inspect caddy-network
   ```

3. Restart the Caddy container in Link-in-Bio repository

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
Internet ──► immocalc.festas-builds.com ──► caddy-network ──► immocalc:3000
                                    │                                 │
                                    └─────────────────────────────────┘
```

## Reference

This deployment pattern mirrors the setup used in the `Festas/PC-Builder` repository, running at `rigpilot.festas-builds.com`.
