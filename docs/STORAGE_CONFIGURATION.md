# Storage Configuration

## Overview

This document explains the storage configuration for user authentication data in ImmoCalc Pro.

## Problem

In Docker environments, the application previously tried to write user data to `/app/.data`, which resulted in `EACCES: permission denied` errors because:

1. The `/app` directory is owned by the `nextjs` user but may not have write permissions for the `.data` subdirectory
2. Container filesystem restrictions prevent writing to certain paths
3. No persistent volume was configured, causing data loss on container restarts

## Solution

The storage system has been updated to use a configurable, writable location with proper Docker volume support.

### Key Changes

1. **Configurable Storage Path**
   - Environment variable: `DATA_DIR` (optional)
   - Default (development): `.data` in project root
   - Default (production): `/data/.auth`

2. **Docker Configuration**
   - Dockerfile creates `/data/.auth` with proper permissions
   - Docker Compose mounts persistent volume at `/data`
   - Data survives container restarts and updates

3. **Error Handling**
   - API catches `EACCES` permission errors
   - Returns user-friendly error messages
   - Frontend displays informative error messages

## Configuration

### Environment Variables

Add to your `.env.local` or environment configuration:

```bash
# Optional: Override default storage location
DATA_DIR=/custom/data/path

# Required in production: JWT secret for session tokens
JWT_SECRET=your-secure-random-secret-here
```

Generate a secure JWT_SECRET:

```bash
openssl rand -base64 32
```

### Docker Setup

The Docker configuration automatically:

- Creates `/data/.auth` directory in the container
- Sets ownership to `nextjs:nodejs` user
- Mounts a persistent volume named `immocalc-data`

No additional configuration needed for Docker deployments.

### Development Setup

For local development, the application automatically uses `.data` in the project root. This directory is:

- Created automatically on first registration
- Ignored by git (in `.gitignore`)
- Suitable for development and testing only

## Troubleshooting

### Registration fails with permission error

**Symptom**: Error message "Storage permission error. The server cannot write user data."

**Solution**:

1. Check that the `DATA_DIR` path is writable by the application
2. Ensure Docker volume is properly mounted (for Docker deployments)
3. Verify directory permissions: `ls -la /data` (in container)

### Data not persisting across restarts

**Symptom**: Users must re-register after container restart

**Solution**:

1. Ensure Docker Compose includes the volume mount:
   ```yaml
   volumes:
     - immocalc-data:/data
   ```
2. Verify volume exists: `docker volume ls | grep immocalc-data`
3. Inspect volume: `docker volume inspect immocalc-data`

### Custom storage location

To use a custom storage location:

1. Set `DATA_DIR` environment variable:

   ```bash
   DATA_DIR=/path/to/storage
   ```

2. Ensure the directory:
   - Exists or can be created
   - Has write permissions for the application user
   - Is backed up if needed

## File Structure

```
/data/.auth/              # Production storage (Docker)
  └── users.json          # User authentication data

.data/                    # Development storage (local)
  └── users.json          # User authentication data
```

## Security Notes

1. **File Permissions**: Ensure storage directory is only readable by the application user
2. **Backups**: Implement regular backups of the storage directory
3. **Encryption**: Consider encrypting the storage directory for sensitive data
4. **JWT Secret**: Always use a secure, random JWT_SECRET in production
5. **Migration**: For production use, migrate to a proper database (PostgreSQL, MongoDB, etc.)

## Future Improvements

The current file-based storage is suitable for:

- Development and testing
- Small deployments with few users
- Self-hosted single-instance deployments

For production at scale, consider migrating to:

- PostgreSQL with proper indexing
- MongoDB for document-based storage
- Supabase for managed database with auth
- Redis for session management

## Related Files

- `src/lib/auth/storage.ts` - Storage implementation
- `src/app/api/auth/register/route.ts` - Registration API with error handling
- `src/components/auth/RegisterForm.tsx` - Frontend with error display
- `Dockerfile` - Container configuration
- `docker-compose.yml` - Development deployment
- `docker-compose.prod.yml` - Production deployment
