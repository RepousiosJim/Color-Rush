# 🚀 Deployment Guide - Vercel

This guide will help you deploy **Gems Rush: Divine Teams** to Vercel.

## Prerequisites

- [Vercel Account](https://vercel.com) (free)
- [GitHub Account](https://github.com) (for repository hosting)
- Node.js 18+ installed locally

## 🎯 Quick Deployment (Recommended)

### Method 1: GitHub Integration

1. **Push to GitHub**
   ```bash
   git init
   git add .
   git commit -m "🎮 Initial commit - Gems Rush Divine Teams"
   git remote add origin https://github.com/yourusername/gems-rush-multiplayer.git
   git push -u origin main
   ```

2. **Import to Vercel**
   - Visit [vercel.com/new](https://vercel.com/new)
   - Import your GitHub repository
   - Configure project settings:
     - **Framework Preset**: Next.js
     - **Root Directory**: `./` (default)
     - **Build Command**: `npm run build` (auto-detected)
     - **Output Directory**: `.next` (auto-detected)
     - **Install Command**: `npm install` (auto-detected)

3. **Deploy**
   - Click "Deploy"
   - Vercel will build and deploy automatically
   - Get your live URL: `https://your-app.vercel.app`

### Method 2: Vercel CLI

1. **Install Vercel CLI**
   ```bash
   npm install -g vercel
   ```

2. **Login to Vercel**
   ```bash
   vercel login
   ```

3. **Deploy**
   ```bash
   # From project root
   vercel
   
   # Follow the prompts:
   # - Set up and deploy? Yes
   # - Link to existing project? No (first time)
   # - Project name: gems-rush-multiplayer (or your choice)
   # - Directory: ./ 
   ```

4. **Production Deployment**
   ```bash
   vercel --prod
   ```

## ⚙️ Environment Configuration

### Required Environment Variables

Set these in your Vercel dashboard under **Settings > Environment Variables**:

```env
# Database (if using)
DATABASE_URL=postgresql://username:password@host:5432/gems_rush

# NextAuth.js (if implementing auth)
NEXTAUTH_URL=https://your-app.vercel.app
NEXTAUTH_SECRET=your-random-secret-string

# JWT (if using)
JWT_SECRET=another-random-secret-string

# Production Settings
NODE_ENV=production
NEXT_PUBLIC_APP_URL=https://your-app.vercel.app
```

### Optional Environment Variables

```env
# OAuth Providers
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

GITHUB_CLIENT_ID=your-github-client-id
GITHUB_CLIENT_SECRET=your-github-client-secret

# Analytics (optional)
NEXT_PUBLIC_GA_ID=G-XXXXXXXXXX
```

## 🗄️ Database Setup (PostgreSQL)

### Option 1: Vercel Postgres (Recommended)

1. Go to your Vercel project dashboard
2. Click **Storage** tab
3. Click **Create Database** > **Postgres**
4. Choose your plan (Hobby is free)
5. Database credentials will be auto-added to environment variables

### Option 2: External Provider

Popular options:
- [Neon](https://neon.tech) (free tier)
- [Supabase](https://supabase.com) (free tier)
- [PlanetScale](https://planetscale.com) (free tier)
- [Railway](https://railway.app) (free tier)

## 🔧 Build Configuration

The project includes optimized build settings in `vercel.json`:

```json
{
  "buildCommand": "npm run build",
  "framework": "nextjs",
  "regions": ["iad1", "sfo1"]
}
```

### Build Commands

```bash
# Development
npm run dev

# Production build
npm run build

# Start production server
npm run start

# Lint code
npm run lint
```

## 🌐 Custom Domain (Optional)

1. Go to your Vercel project dashboard
2. Click **Settings** > **Domains**
3. Add your custom domain
4. Configure DNS records as instructed
5. SSL certificate is automatically provided

## 📊 Performance Optimization

### Automatic Optimizations Enabled

- ✅ **Image Optimization**: Next.js automatic image optimization
- ✅ **Code Splitting**: Automatic route-based code splitting
- ✅ **Static Generation**: Pre-rendered pages for better performance
- ✅ **Edge Functions**: Fast serverless function execution
- ✅ **Global CDN**: Content delivered from edge locations worldwide

### Recommended Settings

```javascript
// next.config.ts
const nextConfig = {
  experimental: {
    optimizeCss: true,
    optimizePackageImports: ['framer-motion', 'react-icons']
  },
  images: {
    formats: ['image/webp', 'image/avif'],
    minimumCacheTTL: 60
  },
  compress: true
}
```

## 🔍 Monitoring & Analytics

### Vercel Analytics (Built-in)

- Automatically enabled for all deployments
- View performance metrics in Vercel dashboard
- Real-time monitoring of Core Web Vitals

### Optional Third-party Analytics

```javascript
// Add to app/layout.tsx
import { Analytics } from '@vercel/analytics/react'

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        {children}
        <Analytics />
      </body>
    </html>
  )
}
```

## 🚨 Troubleshooting

### Common Issues

1. **Build Failures**
   ```bash
   # Check for TypeScript errors
   npm run lint
   
   # Test build locally
   npm run build
   ```

2. **Environment Variable Issues**
   - Ensure all required environment variables are set in Vercel dashboard
   - Variables starting with `NEXT_PUBLIC_` are exposed to the browser

3. **Database Connection Issues**
   - Verify `DATABASE_URL` is correct
   - Check database provider allows connections from Vercel IPs

4. **Route Issues**
   - Ensure all API routes are in `src/app/api/` directory
   - Check file naming follows Next.js App Router conventions

### Debug Commands

```bash
# Check deployment logs
vercel logs

# View environment variables
vercel env list

# Check project info
vercel ls
```

## 🎮 Post-Deployment Checklist

- [ ] Game loads without errors
- [ ] All gem interactions work correctly
- [ ] Scoring system functions properly
- [ ] Level progression works
- [ ] Mobile responsiveness verified
- [ ] Performance metrics are good (Lighthouse score)
- [ ] SSL certificate is active
- [ ] Custom domain configured (if applicable)

## 🔄 Continuous Deployment

Once connected to GitHub:

1. **Automatic Deployments**
   - Every push to `main` branch triggers production deployment
   - Pull requests create preview deployments

2. **Branch Deployments**
   ```bash
   # Deploy specific branch
   vercel --prod --confirm
   ```

3. **Rollback if Needed**
   - Use Vercel dashboard to rollback to previous deployment
   - Or redeploy previous commit

## 📞 Support

- **Vercel Documentation**: [vercel.com/docs](https://vercel.com/docs)
- **Next.js Documentation**: [nextjs.org/docs](https://nextjs.org/docs)
- **Deployment Issues**: Check Vercel community forums

---

## 🎉 Success!

Your **Gems Rush: Divine Teams** game is now live! 

Share your deployment URL and let players enjoy the divine match-3 experience! 🔮⚡ 