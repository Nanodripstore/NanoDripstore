# NanoDrip Store - Local Development & Testing

## Quick Start Commands

### 1. Install Dependencies
```bash
npm install
```

### 2. Setup Environment
```bash
# Copy .env.example to .env.local
cp .env.example .env.local

# Edit .env.local with your local values:
# NEXTAUTH_URL=http://localhost:3000
# NEXTAUTH_SECRET=your_local_secret
# GOOGLE_CLIENT_ID=your_google_client_id
# GOOGLE_CLIENT_SECRET=your_google_client_secret
# DATABASE_URL="file:./dev.db"
```

### 3. Database Setup
```bash
# Generate Prisma client
npx prisma generate

# Apply database migrations
npx prisma db push

# (Optional) Seed database
npx prisma db seed
```

### 4. Start Development Server
```bash
npm run dev
```

### 5. Test Endpoints
- Home: http://localhost:3000
- Health Check: http://localhost:3000/api/health
- Sign In: http://localhost:3000/api/auth/signin

## Common Development Tasks

### Reset Database
```bash
# Delete and recreate database
rm prisma/dev.db
npx prisma db push
```

### View Database
```bash
# Open Prisma Studio
npx prisma studio
```

### Build for Production
```bash
# Test production build
npm run build
npm start
```

### Environment Variables

#### Local Development (.env.local)
```
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your_local_secret_here
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
DATABASE_URL="file:./dev.db"
```

#### Production (Netlify)
```
NEXTAUTH_URL=https://www.nanodripstore.netlify.app
NEXTAUTH_SECRET=your_production_secret_here
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
TURSO_DATABASE_URL=your_turso_url
TURSO_AUTH_TOKEN=your_turso_token
```

## Troubleshooting

### Common Issues

1. **Database Connection Error**
   - Run: `npx prisma generate`
   - Check DATABASE_URL in .env.local

2. **Authentication Not Working**
   - Verify NEXTAUTH_URL matches your current URL
   - Check Google OAuth configuration

3. **Build Errors**
   - Delete .next folder: `rm -rf .next`
   - Clear node_modules: `rm -rf node_modules && npm install`

### Debug Commands
```bash
# Check environment variables
echo $NEXTAUTH_URL

# Test database connection
npx prisma db push --preview-feature

# Check Next.js config
npm run build -- --debug
```
