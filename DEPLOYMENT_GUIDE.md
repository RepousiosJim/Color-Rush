# Deployment Guide for Multiplayer Match-3 Game

## 🔧 **Quick Setup (15 minutes)**

### **Option A: Supabase (Recommended for beginners)**

```bash
# 1. Initialize Next.js project
npx create-next-app@latest gems-rush-multiplayer --typescript --tailwind --app
cd gems-rush-multiplayer

# 2. Install dependencies
npm install @supabase/supabase-js @supabase/auth-helpers-nextjs
npm install socket.io socket.io-client
npm install zustand
npm install zod react-hook-form @hookform/resolvers
npm install framer-motion react-hot-toast

# 3. Setup Supabase
npx supabase init
npx supabase start
```

**Create account at [supabase.com](https://supabase.com) and create new project**

```bash
# 4. Environment setup
cp .env.example .env.local
# Add your Supabase credentials to .env.local
```

### **Option B: Full Stack Setup (Advanced)**

```bash
# 1. Initialize project
npx create-next-app@latest gems-rush-multiplayer --typescript --tailwind --app
cd gems-rush-multiplayer

# 2. Install all dependencies
npm install prisma @prisma/client
npm install next-auth
npm install socket.io socket.io-client
npm install zustand
npm install bcryptjs jsonwebtoken
npm install zod react-hook-form @hookform/resolvers
npm install @radix-ui/react-dialog @radix-ui/react-select
npm install framer-motion react-hot-toast
npm install --save-dev @types/bcryptjs @types/jsonwebtoken

# 3. Setup PostgreSQL database
# Install PostgreSQL locally or use cloud service
createdb gems_rush_game

# 4. Initialize Prisma
npx prisma init
# Copy schema from database-schema.sql to prisma/schema.prisma
npx prisma migrate dev --name init
npx prisma generate
```

## 🔐 **Environment Configuration**

### **.env.local (Complete Setup)**

```env
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/gems_rush_game"

# For Supabase (Alternative)
NEXT_PUBLIC_SUPABASE_URL="your-supabase-url"
NEXT_PUBLIC_SUPABASE_ANON_KEY="your-supabase-anon-key"
SUPABASE_SERVICE_ROLE_KEY="your-service-role-key"

# Authentication
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-super-secret-jwt-key-32-chars-min"

# Socket.io
SOCKET_SERVER_URL="http://localhost:3001"
SOCKET_SERVER_PORT="3001"

# File uploads (optional)
UPLOAD_THING_SECRET="your-uploadthing-secret"
UPLOAD_THING_APP_ID="your-uploadthing-app-id"

# Redis (for production scaling)
REDIS_URL="redis://localhost:6379"

# Email (for notifications)
EMAIL_SERVER_HOST="smtp.gmail.com"
EMAIL_SERVER_PORT="587"
EMAIL_SERVER_USER="your-email@gmail.com"
EMAIL_SERVER_PASSWORD="your-app-password"

# Analytics (optional)
NEXT_PUBLIC_GA_MEASUREMENT_ID="G-XXXXXXXXXX"

# Error tracking (optional)
SENTRY_DSN="your-sentry-dsn"
```

## 🗄️ **Database Setup Options**

### **Option A: Supabase (Easiest)**

1. Create account at [supabase.com](https://supabase.com)
2. Create new project
3. Copy connection details to `.env.local`
4. Run SQL schema from `database-schema.sql` in Supabase SQL editor

### **Option B: PostgreSQL + Prisma**

```bash
# Local PostgreSQL
brew install postgresql  # macOS
sudo apt install postgresql postgresql-contrib  # Ubuntu
winget install PostgreSQL.PostgreSQL  # Windows

# Start PostgreSQL
brew services start postgresql  # macOS
sudo service postgresql start  # Ubuntu

# Create database
createdb gems_rush_game

# Setup Prisma
npx prisma migrate dev --name init
npx prisma studio  # Database GUI
```

### **Option C: Cloud Database**

**Recommended providers:**
- **Neon** (PostgreSQL) - [neon.tech](https://neon.tech) - Free tier
- **PlanetScale** (MySQL) - [planetscale.com](https://planetscale.com) - Free tier  
- **Railway** (PostgreSQL) - [railway.app](https://railway.app) - Free tier
- **Heroku Postgres** - [heroku.com](https://heroku.com) - Free tier

## 🚀 **Deployment Options**

### **Option 1: Vercel (Recommended)**

```bash
# 1. Install Vercel CLI
npm i -g vercel

# 2. Deploy
vercel

# 3. Add environment variables in Vercel dashboard
# https://vercel.com/your-username/gems-rush-multiplayer/settings/environment-variables

# 4. Setup Socket.io server separately (see below)
```

**Socket.io Server Deployment:**
```bash
# Create separate Node.js server for Socket.io
mkdir socket-server
cd socket-server
npm init -y
npm install socket.io cors dotenv jsonwebtoken

# Deploy to Railway/Render/DigitalOcean
# Update SOCKET_SERVER_URL in Vercel env vars
```

### **Option 2: Full Stack Deployment**

**Platforms that support both Next.js and Socket.io:**
- **Railway** - [railway.app](https://railway.app)
- **Render** - [render.com](https://render.com)  
- **DigitalOcean App Platform** - [digitalocean.com](https://digitalocean.com)

```yaml
# railway.toml
[build]
  builder = "nixpacks"

[deploy]
  startCommand = "npm start"

[[services]]
  name = "web"
  type = "web"
  
[[services]]  
  name = "socket"
  type = "web"
```

### **Option 3: Docker Deployment**

```dockerfile
# Dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build

EXPOSE 3000 3001

CMD ["npm", "start"]
```

```yaml
# docker-compose.yml
version: '3.8'

services:
  app:
    build: .
    ports:
      - "3000:3000"
      - "3001:3001"
    environment:
      - DATABASE_URL=postgresql://postgres:password@db:5432/gems_rush
    depends_on:
      - db
      - redis

  db:
    image: postgres:15
    environment:
      POSTGRES_DB: gems_rush
      POSTGRES_USER: postgres  
      POSTGRES_PASSWORD: password
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./database-schema.sql:/docker-entrypoint-initdb.d/schema.sql

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"

volumes:
  postgres_data:
```

## ⚡ **Performance Optimization**

### **1. Database Optimization**

```sql
-- Add database indexes for performance
CREATE INDEX CONCURRENTLY idx_users_email_hash ON users USING hash(email);
CREATE INDEX CONCURRENTLY idx_game_rooms_status_created ON game_rooms(status, created_at);
CREATE INDEX CONCURRENTLY idx_leaderboard_score_rank ON leaderboard_entries(score DESC, rank);

-- Enable database connection pooling
-- Add to DATABASE_URL: ?connection_limit=10&pool_timeout=20
```

### **2. Redis Caching (Production)**

```typescript
// lib/cache/redis.ts
import Redis from 'ioredis'

export const redis = new Redis(process.env.REDIS_URL!)

export async function cacheLeaderboard(type: string, data: any, ttl = 300) {
  await redis.setex(`leaderboard:${type}`, ttl, JSON.stringify(data))
}

export async function getCachedLeaderboard(type: string) {
  const cached = await redis.get(`leaderboard:${type}`)
  return cached ? JSON.parse(cached) : null
}
```

### **3. CDN Setup**

```javascript
// next.config.js
/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['cdn.yourdomain.com'],
    loader: 'cloudinary', // or 'vercel'
  },
  
  // Enable compression
  compress: true,
  
  // Optimize bundle
  experimental: {
    optimizeCss: true,
    optimizeServerReact: true,
  }
}
```

## 🛡️ **Security & Production Setup**

### **1. Security Headers**

```typescript
// middleware.ts
import { NextResponse } from 'next/server'

export function middleware(request: NextRequest) {
  const response = NextResponse.next()
  
  // Security headers
  response.headers.set('X-Frame-Options', 'DENY')
  response.headers.set('X-Content-Type-Options', 'nosniff')
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')
  response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()')
  
  return response
}
```

### **2. Rate Limiting**

```typescript
// lib/rate-limit.ts
import { redis } from './cache/redis'

export async function rateLimit(identifier: string, limit = 10, window = 60) {
  const key = `rate_limit:${identifier}`
  const current = await redis.incr(key)
  
  if (current === 1) {
    await redis.expire(key, window)
  }
  
  return {
    success: current <= limit,
    remaining: Math.max(0, limit - current),
    reset: Date.now() + (window * 1000)
  }
}
```

### **3. Input Validation**

```typescript
// lib/validation/schemas.ts
import { z } from 'zod'

export const createRoomSchema = z.object({
  maxPlayers: z.number().min(2).max(4),
  isPrivate: z.boolean(),
  gameMode: z.enum(['classic', 'timed', 'survival']),
  timeLimit: z.number().min(60).max(600).optional()
})

export const gameMoveSchema = z.object({
  fromRow: z.number().min(0).max(7),
  fromCol: z.number().min(0).max(7),
  toRow: z.number().min(0).max(7),  
  toCol: z.number().min(0).max(7),
  timestamp: z.number()
})
```

## 📊 **Monitoring & Analytics**

### **1. Application Monitoring**

```typescript
// lib/monitoring/logger.ts
export const logger = {
  info: (message: string, meta?: any) => {
    console.log(`[INFO] ${message}`, meta)
    // Send to monitoring service (DataDog, NewRelic, etc.)
  },
  
  error: (error: Error, context?: any) => {
    console.error(`[ERROR] ${error.message}`, { error, context })
    // Send to error tracking (Sentry, Bugsnag, etc.)
  },
  
  gameEvent: (event: string, userId: string, data?: any) => {
    console.log(`[GAME] ${event}`, { userId, data })
    // Send to analytics (Google Analytics, Mixpanel, etc.)
  }
}
```

### **2. Health Checks**

```typescript
// app/api/health/route.ts
export async function GET() {
  try {
    // Check database
    await prisma.$queryRaw`SELECT 1`
    
    // Check Redis  
    await redis.ping()
    
    return Response.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      services: {
        database: 'up',
        redis: 'up',
        socket: 'up'
      }
    })
  } catch (error) {
    return Response.json({
      status: 'unhealthy',
      error: error.message
    }, { status: 503 })
  }
}
```

## 🎯 **Go-Live Checklist**

### **Pre-Launch (Development)**
- [ ] Database schema implemented
- [ ] Authentication system working
- [ ] Game engine converted to React/TypeScript
- [ ] Basic multiplayer functionality
- [ ] UI/UX polished
- [ ] Mobile responsive design
- [ ] Accessibility features implemented

### **Beta Testing**
- [ ] Socket.io server deployed
- [ ] Database deployed with backups
- [ ] Real-time multiplayer testing
- [ ] Load testing with multiple concurrent games
- [ ] Cross-browser compatibility
- [ ] Mobile app testing (iOS/Android)

### **Production Launch**
- [ ] Domain configured with SSL
- [ ] CDN setup for static assets  
- [ ] Database connection pooling
- [ ] Redis caching implemented
- [ ] Monitoring and logging setup
- [ ] Error tracking configured
- [ ] Backup and disaster recovery plan
- [ ] Rate limiting and security measures
- [ ] Analytics tracking implemented
- [ ] Legal pages (Privacy Policy, Terms of Service)

### **Post-Launch**
- [ ] Performance monitoring
- [ ] User feedback collection
- [ ] A/B testing setup for features
- [ ] Regular database maintenance
- [ ] Security updates and patches
- [ ] Feature flag system for gradual rollouts

This guide provides everything you need to take your match-3 game from development to a production-ready multiplayer experience! 🚀 