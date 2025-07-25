# Turso Database Setup Issue

## Problem
Prisma with `provider = "sqlite"` expects URLs with `file:` protocol, but Turso uses `libsql:` protocol.

## Current Error
```
error: Error validating datasource `db`: the URL must start with the protocol `file:`
```

## Solutions to Try

### Option 1: Use HTTP URL (Recommended)
Some Turso databases support HTTP access. Check your Turso dashboard for an HTTP URL instead of libsql://

Example format: `https://[database-name]-[org].turso.io`

### Option 2: Use Turso's SQLite-compatible URL
Check if Turso provides a SQLite-compatible URL format in your dashboard.

### Option 3: Use Driver Adapters (Complex)
Requires specific Prisma and Turso adapter configuration.

## Current Netlify Environment Variables Needed

For SQLite-compatible approach:
```bash
DATABASE_URL=file:./prisma/dev.db  # Build time only
```

For runtime (in your Netlify production environment):
```bash
DATABASE_URL=[turso-http-url-if-available]
TURSO_DATABASE_URL=libsql://nanodrip-store-nanodrip-store.aws-ap-south-1.turso.io
TURSO_AUTH_TOKEN=your-token
```

## Next Steps
1. Check Turso dashboard for HTTP URL option
2. If no HTTP URL available, we may need to switch to a different database provider
3. Alternatively, use a simpler SQLite file for production (less scalable but works)

## Alternative: Switch to PostgreSQL
If Turso compatibility issues persist, consider:
- Supabase (PostgreSQL)
- PlanetScale (MySQL)
- Railway (PostgreSQL)

These have better Prisma compatibility out of the box.
