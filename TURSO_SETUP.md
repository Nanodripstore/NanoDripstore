# Turso Database Setup Guide

This project now uses Turso (cloud SQLite) for both local development and production environments.

## Prerequisites

1. **Create a Turso account**: https://turso.tech/
2. **Install Turso CLI**: `npm install -g @libsql/cli` or `curl -sSfL https://get.tur.so/install.sh | bash`

## Setup Steps

### 1. Create Your Turso Database

```bash
# Login to Turso
turso auth login

# Create a new database
turso db create nanodrip-store

# Get your database URL
turso db show nanodrip-store

# Create an auth token
turso db tokens create nanodrip-store
```

### 2. Update Environment Variables

#### For Local Development (`.env.local`):
```env
TURSO_DATABASE_URL="libsql://nanodrip-store-[your-org].turso.io"
TURSO_AUTH_TOKEN="your-turso-auth-token-here"
```

#### For Production (Netlify Environment Variables):
```env
TURSO_DATABASE_URL="libsql://nanodrip-store-[your-org].turso.io"
TURSO_AUTH_TOKEN="your-turso-auth-token-here"
AUTH_SECRET="your-auth-secret-here"
NEXTAUTH_URL="https://your-site.netlify.app"
AUTH_GOOGLE_ID="your-google-client-id"
AUTH_GOOGLE_SECRET="your-google-client-secret"
NODE_ENV="production"
```

### 3. Push Database Schema

```bash
# Generate Prisma client
npx prisma generate

# Push schema to Turso (creates tables)
npx prisma db push

# Optional: Seed your database
npx prisma db seed
```

### 4. Verify Connection

```bash
# Test your database connection
npm run build
```

## Benefits of Using Turso Everywhere

✅ **Consistent Environment**: Same database technology for local and production
✅ **Edge Performance**: Turso provides edge replicas for faster access
✅ **SQLite Compatibility**: Full SQLite feature set with cloud benefits
✅ **Automatic Backups**: Built-in backup and point-in-time recovery
✅ **Collaboration**: Multiple developers can share the same database
✅ **Scaling**: Handles high traffic without configuration changes

## Database Features

- **Embedded Replicas**: Turso can create local replicas for faster read access
- **Branching**: Create database branches for feature development
- **Multi-region**: Deploy database close to your users
- **ACID Transactions**: Full SQLite transaction support

## Troubleshooting

1. **Connection Issues**: Verify your `TURSO_DATABASE_URL` and `TURSO_AUTH_TOKEN`
2. **Schema Errors**: Run `npx prisma db push` to sync schema changes
3. **Build Errors**: Ensure all environment variables are set correctly

## Migration from SQLite

- ✅ Local SQLite database removed (`prisma/dev.db`)
- ✅ Database configuration updated to use Turso exclusively
- ✅ Prisma adapter configured for libSQL
- ✅ Environment variables updated

Your project is now fully configured to use Turso for all environments!
