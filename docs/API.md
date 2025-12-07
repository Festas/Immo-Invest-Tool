# API Documentation

## Health Check Endpoint

ImmoCalc Pro includes a comprehensive health monitoring endpoint that provides real-time status of all critical system components.

### Endpoint

```
GET /api/health
```

### Response

The health check endpoint returns a JSON object with the following structure:

```typescript
interface HealthCheckResult {
  status: "healthy" | "degraded" | "unhealthy";
  timestamp: string; // ISO 8601 format
  checks: {
    server: {
      status: "up";
      uptime: number; // in seconds
    };
    storage: {
      status: "accessible" | "inaccessible" | "error";
      path: string; // storage directory path
      writable: boolean;
      readable: boolean;
      error?: string; // only present if status is "error"
    };
    database: {
      status: "accessible" | "inaccessible" | "error";
      userCount?: number; // number of registered users
      error?: string; // only present if status is "error"
    };
  };
  environment: {
    nodeEnv: string; // "development" or "production"
    hasJwtSecret: boolean; // whether JWT_SECRET is configured
  };
}
```

### HTTP Status Codes

- **200 OK**: System is healthy or degraded (still operational)
- **503 Service Unavailable**: System is unhealthy (critical issues detected)

### Example Responses

**Healthy System:**

```json
{
  "status": "healthy",
  "timestamp": "2024-12-07T15:30:00.123Z",
  "checks": {
    "server": {
      "status": "up",
      "uptime": 12345.67
    },
    "storage": {
      "status": "accessible",
      "path": "/data/.auth",
      "writable": true,
      "readable": true
    },
    "database": {
      "status": "accessible",
      "userCount": 5
    }
  },
  "environment": {
    "nodeEnv": "production",
    "hasJwtSecret": true
  }
}
```

**Unhealthy System (Storage Issues):**

```json
{
  "status": "unhealthy",
  "timestamp": "2024-12-07T15:30:00.123Z",
  "checks": {
    "server": {
      "status": "up",
      "uptime": 12345.67
    },
    "storage": {
      "status": "inaccessible",
      "path": "/data/.auth",
      "writable": false,
      "readable": true
    },
    "database": {
      "status": "error",
      "error": "EACCES: permission denied"
    }
  },
  "environment": {
    "nodeEnv": "production",
    "hasJwtSecret": true
  }
}
```

### Use Cases

1. **Container Health Checks**: Docker Compose uses this endpoint to determine container health
2. **Monitoring**: External monitoring systems can poll this endpoint
3. **Debugging**: Developers can check system status when troubleshooting issues
4. **Frontend Error Handling**: The login form checks this endpoint on network errors

---

## Authentication Error Codes

The authentication system returns specific error codes to help diagnose and resolve issues.

### Login Endpoint (`POST /api/auth/login`)

#### Success Response (200 OK)

```json
{
  "success": true,
  "user": {
    "id": "uuid-string",
    "username": "username"
  }
}
```

#### Error Responses

All error responses follow this format:

```json
{
  "error": "Human-readable error message (in German)",
  "code": "ERROR_CODE"
}
```

### Error Codes

| HTTP Status | Error Code                    | Description                         | User Action                                        |
| ----------- | ----------------------------- | ----------------------------------- | -------------------------------------------------- |
| 400         | `MISSING_CREDENTIALS`         | Username or password not provided   | Fill in all fields                                 |
| 401         | `INVALID_CREDENTIALS`         | Invalid username or password        | Check username and password                        |
| 500         | `STORAGE_PERMISSION_ERROR`    | Cannot access user data (EACCES)    | Contact administrator - file permission issue      |
| 500         | `STORAGE_NOT_FOUND`           | User database file missing (ENOENT) | Contact administrator - database not initialized   |
| 500         | `STORAGE_ERROR`               | Generic storage/database error      | Try again later or contact administrator           |
| 500         | `PASSWORD_VERIFICATION_ERROR` | Password hashing/comparison failed  | Try again                                          |
| 500         | `SESSION_CONFIG_ERROR`        | JWT_SECRET not configured           | Contact administrator - server configuration issue |
| 500         | `SESSION_CREATION_ERROR`      | Session token creation failed       | Try again                                          |
| 500         | `COOKIE_ERROR`                | Session cookie couldn't be set      | Check browser settings, clear cookies              |
| 500         | `UNEXPECTED_ERROR`            | Unexpected server error             | Try again later or contact administrator           |

### Example Error Response

```json
{
  "error": "Ungültiger Benutzername oder Passwort.",
  "code": "INVALID_CREDENTIALS"
}
```

---

## Registration Endpoint (`POST /api/auth/register`)

### Success Response (201 Created)

```json
{
  "success": true,
  "user": {
    "id": "uuid-string",
    "username": "username",
    "createdAt": "2024-12-07T15:30:00.123Z"
  }
}
```

### Error Responses

| HTTP Status | Error Code      | Description                         | User Action                          |
| ----------- | --------------- | ----------------------------------- | ------------------------------------ |
| 400         | (no code)       | Missing required fields             | Fill in all required fields          |
| 400         | (no code)       | Username too short (< 3 characters) | Use a longer username                |
| 400         | (no code)       | Invalid username characters         | Use only letters, numbers, -, and \_ |
| 400         | (no code)       | Password too short (< 8 characters) | Use a longer password                |
| 400         | (no code)       | Passwords don't match               | Ensure both passwords are identical  |
| 409         | (no code)       | Username already exists             | Choose a different username          |
| 500         | `STORAGE_ERROR` | Storage permission error            | Contact administrator                |

---

## Frontend Error Handling

### Network Error Detection

The frontend distinguishes between two types of errors:

1. **Network Errors**: Server is unreachable (fetch() throws exception)
   - Frontend automatically checks `/api/health` to provide context
   - Shows specific message if server reports storage issues
   - Message: "Netzwerkfehler: Verbindung zum Server fehlgeschlagen..."

2. **Backend Errors**: Server responds with error (response.ok === false)
   - Displays the specific error message from backend
   - Error message is in German and user-friendly

### Error Message Examples

**Network Error (Server Down):**

```
Netzwerkfehler: Verbindung zum Server fehlgeschlagen. Der Server ist möglicherweise nicht erreichbar. Bitte überprüfen Sie Ihre Internetverbindung und versuchen Sie es erneut.
```

**Network Error (Storage Issues):**

```
Netzwerkfehler: Verbindung zum Server fehlgeschlagen. Der Server meldet Probleme mit dem Datenspeicher oder der Konfiguration. Bitte überprüfen Sie Ihre Internetverbindung und versuchen Sie es erneut.
```

**Authentication Error:**

```
Ungültiger Benutzername oder Passwort.
```

**Storage Permission Error:**

```
Fehler beim Zugriff auf Benutzerdaten. Bitte kontaktieren Sie den Administrator.
```

---

## Logging

### Backend Logging

The authentication system includes comprehensive logging:

**Log Levels:**

- `console.info`: Successful operations with timing information
- `console.warn`: Failed authentication attempts (with username)
- `console.error`: System errors and exceptions (with stack traces)

**Development Mode:**
When `NODE_ENV=development`, additional debug information is logged:

- Request timing and duration
- Detailed error stack traces
- File system operation details
- Health check results

**Example Log Output:**

```
[Login] Success: { username: 'testuser', userId: 'uuid-123', duration: '45ms' }
[Login] Failed - user not found: { username: 'unknown', duration: '12ms' }
[Login] Storage error while finding user: { username: 'test', error: 'EACCES', code: 'EACCES', stack: '...' }
[Health Check] Status: healthy, Duration: 15ms { storage: 'accessible', database: 'accessible', writable: true, readable: true }
```

### Accessing Logs

**Development:**

```bash
npm run dev
# Logs appear in console
```

**Production (Docker):**

```bash
# Follow logs
docker compose logs -f

# Last 100 lines
docker compose logs --tail=100

# Filter for specific service
docker compose logs -f web
```
