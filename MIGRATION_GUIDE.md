# PostgreSQL Migration with Prisma - Migration Guide

## Overview

This PR migrates the ImmoCalc Pro application from JSON file-based storage to PostgreSQL database with Prisma ORM. This provides better scalability, data integrity, and proper relational data management.

## What Changed

### Database Layer (New)

- **Prisma Schema** (`prisma/schema.prisma`): Defines User, Property, and Scenario models
- **Prisma Client** (`src/lib/db/prisma.ts`): Singleton client for database connections
- **User Operations** (`src/lib/db/user.ts`): CRUD operations for users
- **Property Operations** (`src/lib/db/property.ts`): CRUD operations for properties

### Storage Layer (Updated)

- **Auth Storage** (`src/lib/auth/storage.ts`): Now uses Prisma instead of JSON files
- **Portfolio Storage** (`src/lib/storage/user-portfolio.ts`): Now uses Prisma instead of JSON files
- Both maintain backward-compatible interfaces

### API Routes (Unchanged)

API routes continue to work without modification since they use the storage layer functions.

### Configuration

- **`.env.example`**: Added DATABASE_URL configuration
- **`package.json`**: Added database management scripts
- **`.gitignore`**: Added Prisma artifacts
- **Documentation**: Updated `docs/USER_PORTFOLIO_STORAGE.md`

## Migration Steps

### For Development

1. **Install Dependencies**

   ```bash
   npm install
   ```

2. **Set Up PostgreSQL**

   ```bash
   # Option 1: Install PostgreSQL locally
   # Follow instructions at https://www.postgresql.org/download/

   # Option 2: Use Docker
   docker run --name immocalc-postgres \
     -e POSTGRES_DB=immo_invest \
     -e POSTGRES_USER=immo_user \
     -e POSTGRES_PASSWORD=your_password \
     -p 5432:5432 \
     -d postgres:16-alpine
   ```

3. **Configure Database Connection**
   Create `.env.local`:

   ```env
   DATABASE_URL="postgresql://immo_user:your_password@localhost:5432/immo_invest?schema=public"
   JWT_SECRET="your-jwt-secret-here"
   ```

4. **Generate Prisma Client**

   ```bash
   npm run db:generate
   ```

5. **Push Schema to Database**

   ```bash
   npm run db:push
   ```

6. **Run the Application**
   ```bash
   npm run dev
   ```

### For Production

1. **Set Up PostgreSQL Database**
   - Use a managed PostgreSQL service (AWS RDS, Azure Database, Google Cloud SQL, etc.)
   - Or set up PostgreSQL on your server

2. **Configure Environment Variables**

   ```env
   DATABASE_URL="postgresql://user:password@host:port/database?schema=public"
   JWT_SECRET="secure-random-string-minimum-32-bytes"
   NODE_ENV="production"
   ```

3. **Run Migrations** (for production deployments)

   ```bash
   npm run db:migrate
   ```

4. **Build and Deploy**
   ```bash
   npm run build
   npm start
   ```

### Migrating Existing Data

If you have existing users and properties in JSON files:

1. **Backup Existing Data**

   ```bash
   cp -r .data /backup/.data-$(date +%Y%m%d)
   # or
   cp -r /data /backup/data-$(date +%Y%m%d)
   ```

2. **Create Migration Script**
   Create a script to read JSON files and insert into database:

   ```javascript
   // migrate-data.js
   const fs = require("fs");
   const { PrismaClient } = require("@prisma/client");

   const prisma = new PrismaClient();

   async function migrate() {
     // Read users from JSON
     const users = JSON.parse(fs.readFileSync(".data/users.json", "utf-8"));

     // Insert users
     for (const user of users) {
       await prisma.user.create({
         data: {
           id: user.id,
           username: user.username,
           passwordHash: user.passwordHash,
           createdAt: new Date(user.createdAt),
         },
       });

       // Read user's portfolio
       const portfolioPath = `.data/users/${user.id}/portfolio.json`;
       if (fs.existsSync(portfolioPath)) {
         const portfolio = JSON.parse(fs.readFileSync(portfolioPath, "utf-8"));

         // Insert properties
         for (const property of portfolio.properties) {
           await prisma.property.create({
             data: {
               id: property.id,
               userId: user.id,
               name: property.name,
               address: property.address,
               postalCode: property.postalCode,
               inputData: property.input,
               outputData: property.output,
               createdAt: new Date(property.createdAt),
               updatedAt: new Date(property.updatedAt),
             },
           });
         }
       }
     }
   }

   migrate().then(() => console.log("Migration complete"));
   ```

3. **Run Migration**

   ```bash
   node migrate-data.js
   ```

4. **Verify Data**

   ```bash
   npm run db:studio
   # Opens Prisma Studio to view database content
   ```

5. **Archive Old Files**
   After verifying data migration, archive JSON files:
   ```bash
   mkdir -p /backup/json-storage
   mv .data /backup/json-storage/
   # or
   mv /data /backup/json-storage/
   ```

## Database Management Scripts

```bash
# Generate Prisma Client (after schema changes)
npm run db:generate

# Push schema to database (for development)
npm run db:push

# Create migration files (for production)
npm run db:migrate

# Open database GUI
npm run db:studio
```

## Docker Configuration

### Using Docker Compose

Update `docker-compose.yml` to include PostgreSQL:

```yaml
services:
  web:
    build: .
    ports:
      - "8086:3000"
    environment:
      - DATABASE_URL=postgresql://immo_user:${DB_PASSWORD}@db:5432/immo_invest?schema=public
      - JWT_SECRET=${JWT_SECRET}
      - NODE_ENV=production
    depends_on:
      - db

  db:
    image: postgres:16-alpine
    environment:
      - POSTGRES_DB=immo_invest
      - POSTGRES_USER=immo_user
      - POSTGRES_PASSWORD=${DB_PASSWORD}
    volumes:
      - postgres-data:/var/lib/postgresql/data
    ports:
      - "5432:5432"

volumes:
  postgres-data:
```

**Note**: The `/data` volume mount for JSON file storage is no longer needed and can be removed.

## Testing

### Unit Tests

The portfolio storage tests need to be updated to mock Prisma client instead of file system operations. Auth tests continue to work as they already mock the storage layer.

```bash
# Run auth tests (should pass)
npm run test:run -- src/__tests__/unit/auth-login.test.ts

# Portfolio tests need updating to mock Prisma
# npm run test:run -- src/__tests__/unit/user-portfolio-storage.test.ts
```

### Manual Testing

1. **Register a new user**

   ```bash
   curl -X POST http://localhost:3000/api/auth/register \
     -H "Content-Type: application/json" \
     -d '{"username":"testuser","password":"testpass123","passwordRepeat":"testpass123"}'
   ```

2. **Login**

   ```bash
   curl -X POST http://localhost:3000/api/auth/login \
     -H "Content-Type: application/json" \
     -d '{"username":"testuser","password":"testpass123"}' \
     -c cookies.txt
   ```

3. **Create property**

   ```bash
   curl -X POST http://localhost:3000/api/portfolio \
     -H "Content-Type: application/json" \
     -b cookies.txt \
     -d '{"property":{...}}'
   ```

4. **List properties**
   ```bash
   curl http://localhost:3000/api/portfolio \
     -b cookies.txt
   ```

## Troubleshooting

### "Environment variable not found: DATABASE_URL"

- Make sure `.env.local` exists with `DATABASE_URL` set
- Restart the development server after adding environment variables

### "Can't reach database server"

- Check PostgreSQL is running: `pg_isready -h localhost -p 5432`
- Verify connection string in `DATABASE_URL`
- Check firewall rules

### "Prisma Client Not Generated"

```bash
npm run db:generate
```

### Migration Errors

```bash
# Reset database (WARNING: deletes all data)
npm run db:push -- --force-reset

# Or manually drop tables and re-push
psql $DATABASE_URL -c "DROP SCHEMA public CASCADE; CREATE SCHEMA public;"
npm run db:push
```

## Rollback Plan

If issues occur, you can rollback to JSON file storage:

1. Restore from backup:

   ```bash
   cp -r /backup/.data-YYYYMMDD .data
   ```

2. Checkout previous commit:

   ```bash
   git checkout <previous-commit-hash>
   ```

3. Reinstall dependencies:
   ```bash
   npm install
   ```

## Benefits of PostgreSQL Migration

1. **Scalability**: Handle more users and properties
2. **Data Integrity**: ACID transactions and constraints
3. **Performance**: Indexed queries and optimized lookups
4. **Backup**: Standard database backup tools
5. **Concurrency**: Multiple users can access data simultaneously
6. **Security**: Database-level user authentication and permissions
7. **Flexibility**: Easy to add new features and relationships

## Support

For issues or questions about the migration:

- Check the documentation: `docs/USER_PORTFOLIO_STORAGE.md`
- Review Prisma documentation: https://www.prisma.io/docs
- Open an issue on GitHub
