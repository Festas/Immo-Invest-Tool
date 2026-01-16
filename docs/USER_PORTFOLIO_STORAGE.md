# Per-User Portfolio Storage

## Overview

ImmoCalc Pro implements per-user portfolio storage using PostgreSQL database with Prisma ORM. Each authenticated user has their own completely separate, private data isolated at the database level. This ensures data privacy, scalability, and proper relational data management.

## Architecture

### Database Schema

The application uses PostgreSQL with the following schema:

```prisma
model User {
  id                  String     @id @default(uuid())
  username            String     @unique
  email               String?    @unique
  passwordHash        String

  // Profile
  displayName         String?

  // Security
  isActive            Boolean    @default(true)
  failedLoginAttempts Int        @default(0)
  lockedUntil         DateTime?
  lastLoginAt         DateTime?

  // Timestamps
  createdAt           DateTime   @default(now())
  updatedAt           DateTime   @updatedAt

  // Relations
  properties          Property[]
  scenarios           Scenario[]
}

model Property {
  id          String    @id @default(uuid())
  userId      String

  // Metadata
  name        String
  address     String?
  postalCode  String?

  // All property input data stored as JSON for flexibility
  inputData   Json

  // Calculated output data (optional, can be recalculated)
  outputData  Json?

  // Timestamps
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt

  // Relations
  user        User      @relation(fields: [userId], references: [id], onDelete: Cascade)
  scenarios   Scenario[]
}
```

### Data Storage Strategy

- **User Data**: Stored in the `User` table with authentication and security fields
- **Property Data**: Stored in the `Property` table with JSON fields for flexibility
- **Property Input**: The `PropertyInput` TypeScript interface is serialized to JSON in the `inputData` column
- **Property Output**: Calculation results are stored in the `outputData` JSON column
- **User Isolation**: Foreign key constraints and cascade deletes ensure data isolation

## Components

### 1. Database Layer (`src/lib/db/`)

Core Prisma-based functions for database operations:

#### User Operations (`src/lib/db/user.ts`):

- `createUser(username, passwordHash, email?)` - Create new user
- `findUserByUsername(username)` - Find by username (case-insensitive)
- `findUserById(id)` - Find by ID
- `updateUser(id, data)` - Update user fields
- `updateLastLogin(id)` - Update lastLoginAt timestamp
- `incrementFailedLogins(id)` - For security tracking
- `resetFailedLogins(id)` - Reset after successful login

#### Property Operations (`src/lib/db/property.ts`):

- `createProperty(userId, data)` - Create new property
- `getPropertiesByUserId(userId)` - Get all user properties
- `getPropertyById(id, userId)` - Get single property (with ownership check)
- `updateProperty(id, userId, data)` - Update property
- `deleteProperty(id, userId)` - Delete property

### 2. Storage Adapters

#### Auth Storage (`src/lib/auth/storage.ts`)

Maintains backward compatibility with existing authentication code while using Prisma under the hood:

- Implements the same `StoredUser` interface
- Wraps database operations with compatibility layer
- Maintains existing error handling patterns

#### Portfolio Storage (`src/lib/storage/user-portfolio.ts`)

Maintains backward compatibility with existing portfolio code:

- Wraps Prisma property operations
- Maintains existing function signatures
- Handles data transformation between database and application formats

### 3. API Routes

API routes remain unchanged as they use the storage layer functions:

#### `/api/auth/register` (POST)

- Creates user in database
- Validates username uniqueness
- Hashes password with bcrypt

#### `/api/auth/login` (POST)

- Authenticates against database
- Creates JWT session token
- Updates lastLoginAt timestamp

#### `/api/portfolio` (GET, POST)

- **GET** - Retrieve all properties for authenticated user
- **POST** - Create a new property

#### `/api/portfolio/[id]` (GET, PUT, DELETE)

- **GET** - Retrieve a specific property (with ownership check)
- **PUT** - Update a property (with ownership check)
- **DELETE** - Delete a property (with ownership check)

### 4. Zustand Store Integration

The Zustand store continues to work with server sync capabilities:

- `isServerSyncEnabled` - Whether server sync is active
- `syncWithServer()` - Sync portfolio from server
- `setServerSyncEnabled(enabled)` - Enable/disable server sync

When a user is authenticated:

1. The store automatically enables server sync
2. Properties are loaded from the database via API
3. All property operations sync to the database

When a user is not authenticated:

1. Server sync is disabled
2. Properties are stored in localStorage only

## Usage

### For Users

1. **Without Authentication**
   - Properties are stored in browser localStorage
   - Data is private to the browser
   - Limited to single device

2. **With Authentication**
   - Properties are stored in PostgreSQL database
   - Data is accessible from any device
   - Data is private to the user account
   - Automatic sync across devices
   - Better data integrity and reliability

### For Developers

#### Setting up the Database

1. **Install Dependencies**

```bash
npm install
```

2. **Configure Database Connection**

```bash
# .env.local
DATABASE_URL="postgresql://user:password@localhost:5432/immo_invest?schema=public"
```

3. **Generate Prisma Client**

```bash
npm run db:generate
```

4. **Push Schema to Database** (for development)

```bash
npm run db:push
```

5. **Or Create Migrations** (for production)

```bash
npm run db:migrate
```

#### Using Database Management Scripts

```json
{
  "scripts": {
    "db:generate": "prisma generate", // Generate Prisma Client
    "db:push": "prisma db push", // Push schema changes (dev)
    "db:migrate": "prisma migrate dev", // Create migrations
    "db:studio": "prisma studio" // Open database GUI
  }
}
```

#### Using the Portfolio Sync Hook

```typescript
import { usePortfolioSync } from "@/lib/hooks/usePortfolioSync";

function MyComponent() {
  // Automatically syncs portfolio when user is authenticated
  usePortfolioSync();

  // Rest of component...
}
```

#### Accessing the Store

```typescript
import { useImmoCalcStore } from "@/store";

function MyComponent() {
  const { properties, saveProperty, deleteProperty, syncWithServer } = useImmoCalcStore();

  // Save a new property (automatically syncs if authenticated)
  await saveProperty("Property Name", "Address");

  // Delete a property (automatically syncs if authenticated)
  await deleteProperty(propertyId);

  // Manually sync with server
  await syncWithServer();
}
```

## Configuration

### Environment Variables

```bash
# Required: PostgreSQL connection string
DATABASE_URL="postgresql://user:password@localhost:5432/immo_invest?schema=public"

# Alternative: SQLite for development/testing
# DATABASE_URL="file:./dev.db"

# Required in production: JWT secret for session tokens
JWT_SECRET=your-secure-random-secret-here
```

### Docker Configuration

For Docker deployments, PostgreSQL is included as a service in docker-compose:

```yaml
services:
  db:
    image: postgres:16-alpine
    container_name: immocalc-db
    restart: unless-stopped
    environment:
      POSTGRES_USER: immo_user
      POSTGRES_PASSWORD: ${DB_PASSWORD}
      POSTGRES_DB: immo_invest
    volumes:
      - postgres-data:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U immo_user -d immo_invest"]
      interval: 5s
      timeout: 5s
      retries: 5
    networks:
      - caddy-network

  web:
    environment:
      - DATABASE_URL=postgresql://immo_user:${DB_PASSWORD}@db:5432/immo_invest?schema=public
      - JWT_SECRET=${JWT_SECRET}
    depends_on:
      db:
        condition: service_healthy

volumes:
  postgres-data:
    driver: local
```

#### Starting the Containers

```bash
# Set required environment variables
export DB_PASSWORD=your_secure_password
export JWT_SECRET=your_secure_jwt_secret

# Start all services
docker compose up -d

# Check health status
docker compose ps
```

#### Running Database Migrations

After starting the containers for the first time, run migrations:

```bash
# Deploy migrations to the database
docker compose exec web npx prisma migrate deploy

# Or generate and push schema (for development)
docker compose exec web npx prisma db push
```

#### Database Backup and Restore

**Backup the database:**

```bash
# Backup to a secure location with proper permissions
docker compose exec -T db pg_dump -U immo_user immo_invest > backup_$(date +%Y%m%d_%H%M%S).sql
chmod 600 backup_*.sql  # Restrict access to backup files
```

**Restore from backup:**

```bash
docker compose exec -T db psql -U immo_user immo_invest < backup.sql
```

**Note**: Store backup files in a secure location with appropriate permissions (e.g., `chmod 600`) to protect sensitive data.

**Note**: The PostgreSQL container does NOT expose port 5432 externally for security. It's only accessible internally via the `caddy-network`.

## Security

### Privacy Guarantees

1. **Database-Level Isolation**: Each user's data is isolated by userId foreign keys
2. **Cascade Deletes**: When a user is deleted, all their properties are automatically deleted
3. **Ownership Checks**: All property operations verify userId ownership
4. **Authentication Required**: All API routes check authentication before accessing data
5. **No Cross-User Access**: Database queries are always filtered by userId

### Best Practices

1. Always use HTTPS in production
2. Set a strong `JWT_SECRET` (minimum 32 bytes)
3. Use a secure PostgreSQL password
4. Regularly backup the PostgreSQL database
5. Enable PostgreSQL SSL connections in production
6. Monitor database access logs
7. Keep Prisma and dependencies updated

## Testing

### Run Portfolio Storage Tests

```bash
npm run test:run -- src/__tests__/unit/user-portfolio-storage.test.ts
```

### Run Auth Storage Tests

```bash
npm run test:run -- src/__tests__/unit/auth-login.test.ts
```

**Note**: Tests may need to be updated to mock Prisma client instead of file system operations.

## Migration

### Migrating from JSON File Storage

For existing deployments with JSON file storage:

1. **Export Existing Data**
   - Read user data from `.data/users.json` or `/data/.auth/users.json`
   - Read portfolio data from `/data/users/{userId}/portfolio.json`

2. **Set Up PostgreSQL Database**
   - Install PostgreSQL
   - Create database
   - Run `npm run db:push` to create tables

3. **Import Data**
   - Create migration script to read JSON files
   - Insert users into User table
   - Insert properties into Property table with proper userId references

4. **Verify Migration**
   - Test user login
   - Test property loading
   - Verify data integrity

5. **Clean Up**
   - Archive JSON files as backup
   - Update environment variables
   - Remove file system dependencies

### Database Migrations

For schema changes in production:

```bash
# Create a new migration
npm run db:migrate

# This will:
# 1. Prompt for migration name
# 2. Generate SQL migration files
# 3. Apply migration to database
# 4. Update Prisma Client
```

## Troubleshooting

### Portfolio not syncing

**Check:**

1. User is authenticated: `/api/auth/session`
2. DATABASE_URL is configured correctly
3. Database is accessible and tables exist
4. Network connectivity
5. Browser console for errors

### Database connection errors

**Check:**

1. PostgreSQL is running
2. DATABASE_URL format is correct
3. Database user has proper permissions
4. Firewall allows database connections
5. SSL settings if required

### Data not persisting

**Check:**

1. Database tables exist (run `npm run db:push`)
2. Prisma Client is generated (run `npm run db:generate`)
3. No database transaction errors in logs
4. Disk space is available
5. Database user has write permissions

### Migration errors

**Check:**

1. Database is accessible
2. No active connections blocking schema changes
3. Migration files are in correct order
4. Backup database before attempting fixes

## Related Files

- `prisma/schema.prisma` - Database schema definition
- `src/lib/db/prisma.ts` - Prisma client singleton
- `src/lib/db/user.ts` - User database operations
- `src/lib/db/property.ts` - Property database operations
- `src/lib/auth/storage.ts` - Auth storage adapter (Prisma-backed)
- `src/lib/storage/user-portfolio.ts` - Portfolio storage adapter (Prisma-backed)
- `src/app/api/auth/register/route.ts` - Registration endpoint
- `src/app/api/auth/login/route.ts` - Login endpoint
- `src/app/api/portfolio/route.ts` - List and create APIs
- `src/app/api/portfolio/[id]/route.ts` - Get, update, delete APIs
- `src/store/index.ts` - Zustand store with server sync
- `src/lib/hooks/usePortfolioSync.ts` - Auto-sync hook
