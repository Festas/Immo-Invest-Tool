# Per-User Portfolio Storage

## Overview

ImmoCalc Pro implements per-user portfolio storage where each authenticated user has their own completely separate, private database file. This ensures data privacy and allows multiple users to use the application without seeing each other's portfolios.

## Architecture

### Storage Structure

```
/data/
├── .auth/
│   └── users.json                    # User authentication data
└── users/
    ├── <userId-1>/
    │   └── portfolio.json           # User 1's private portfolio
    ├── <userId-2>/
    │   └── portfolio.json           # User 2's private portfolio
    └── ...
```

Each user's portfolio is stored in a separate JSON file under `/data/users/<userId>/portfolio.json` in production, or `.data/users/<userId>/portfolio.json` in development.

### Portfolio File Format

Each portfolio file contains:

```json
{
  "userId": "user-id-123",
  "properties": [
    {
      "id": "property-id-1",
      "name": "Property Name",
      "address": "Property Address",
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z",
      "input": {
        /* PropertyInput object */
      },
      "output": {
        /* PropertyOutput object */
      }
    }
  ],
  "updatedAt": "2024-01-01T00:00:00.000Z"
}
```

## Components

### 1. Storage Module (`src/lib/storage/user-portfolio.ts`)

Core functions for managing user portfolios:

- `loadUserPortfolio(userId)` - Load user's properties
- `saveUserPortfolio(userId, properties)` - Save user's properties
- `addPropertyToPortfolio(userId, property)` - Add a property
- `updatePropertyInPortfolio(userId, propertyId, updates)` - Update a property
- `deletePropertyFromPortfolio(userId, propertyId)` - Delete a property
- `getPropertyFromPortfolio(userId, propertyId)` - Get a single property

### 2. API Routes

#### `/api/portfolio` (GET, POST)

- **GET** - Retrieve all properties for the authenticated user
- **POST** - Create a new property

```typescript
// Example: Create a new property
const response = await fetch("/api/portfolio", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ property }),
});
```

#### `/api/portfolio/[id]` (GET, PUT, DELETE)

- **GET** - Retrieve a specific property
- **PUT** - Update a property
- **DELETE** - Delete a property

```typescript
// Example: Update a property
const response = await fetch(`/api/portfolio/${propertyId}`, {
  method: "PUT",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ updates: { name: "New Name" } }),
});
```

### 3. Zustand Store Integration

The Zustand store has been enhanced with server sync capabilities:

- `isServerSyncEnabled` - Whether server sync is active
- `syncWithServer()` - Sync portfolio from server
- `setServerSyncEnabled(enabled)` - Enable/disable server sync

When a user is authenticated:

1. The store automatically enables server sync
2. Properties are loaded from the server
3. All property operations (save, update, delete) are synced to the server

When a user is not authenticated:

1. Server sync is disabled
2. Properties are stored in localStorage only
3. Properties persist across sessions in the browser

### 4. Authentication Integration

All portfolio API routes are protected by authentication:

```typescript
const session = await getSession();
if (!session) {
  return NextResponse.json({ error: "Nicht authentifiziert" }, { status: 401 });
}
```

Only the authenticated user can access their own portfolio data.

## Usage

### For Users

1. **Without Authentication**
   - Properties are stored in browser localStorage
   - Data is private to the browser
   - Data persists across sessions
   - Limited to single device

2. **With Authentication**
   - Properties are stored on the server
   - Data is accessible from any device
   - Data is private to the user account
   - Automatic sync across devices

### For Developers

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
# Optional: Override default storage location
DATA_DIR=/custom/data/path

# Required in production: JWT secret for session tokens
JWT_SECRET=your-secure-random-secret-here
```

### Docker Configuration

The Dockerfile automatically creates the necessary directories:

```dockerfile
# Create data directory for persistent storage with correct permissions
RUN mkdir -p /data/.auth /data/users
RUN chown -R nextjs:nodejs /data
```

Docker Compose should mount a volume:

```yaml
volumes:
  - immocalc-data:/data
```

## Security

### Privacy Guarantees

1. **User Isolation**: Each user's portfolio is stored in a separate file
2. **Authentication Required**: All API routes check authentication before accessing data
3. **User-Scoped Access**: Users can only access their own portfolio data
4. **No Cross-User Access**: There's no way for one user to access another user's data

### Best Practices

1. Always use HTTPS in production
2. Set a strong JWT_SECRET
3. Regularly backup the `/data` directory
4. Monitor file permissions on the server
5. Consider encrypting the data directory

## Testing

Run the portfolio storage tests:

```bash
npm run test:run -- src/__tests__/unit/user-portfolio-storage.test.ts
```

The test suite includes:

- User isolation tests
- CRUD operation tests
- Error handling tests
- Data persistence tests

## Migration

### Migrating from localStorage to Server Storage

When a user creates an account:

1. Their existing localStorage data remains in the browser
2. They can manually import properties from localStorage
3. Once synced to server, data is accessible from any device

### Future Improvements

For production at scale, consider:

- Migrating to PostgreSQL or MongoDB
- Implementing real-time sync with WebSockets
- Adding conflict resolution for multi-device edits
- Implementing data versioning and history
- Adding backup and restore functionality

## Troubleshooting

### Portfolio not syncing

**Check:**

1. User is authenticated: `/api/auth/session`
2. Server sync is enabled: Check `isServerSyncEnabled` in store
3. Network connectivity
4. Browser console for errors

### Permission errors

**Check:**

1. `/data/users` directory exists
2. Directory has write permissions
3. Docker volume is mounted correctly
4. File ownership is correct (`nextjs:nodejs`)

### Data not persisting

**Check:**

1. Docker volume is configured
2. Environment variables are set correctly
3. File write operations succeed (check logs)
4. Disk space is available

## Related Files

- `src/lib/storage/user-portfolio.ts` - Core storage implementation
- `src/app/api/portfolio/route.ts` - List and create APIs
- `src/app/api/portfolio/[id]/route.ts` - Get, update, delete APIs
- `src/store/index.ts` - Zustand store with server sync
- `src/lib/hooks/usePortfolioSync.ts` - Auto-sync hook
- `src/__tests__/unit/user-portfolio-storage.test.ts` - Test suite
