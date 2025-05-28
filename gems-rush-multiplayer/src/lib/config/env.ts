// Environment configuration and validation
// Ensures all required environment variables are set and properly typed

export const env = {
  // Public environment variables (can be accessed client-side)
  NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
  NEXT_PUBLIC_GA_MEASUREMENT_ID: process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID,
  
  // Server-only environment variables
  DATABASE_URL: process.env.DATABASE_URL || '',
  NEXTAUTH_URL: process.env.NEXTAUTH_URL || 'http://localhost:3000',
  NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET || '',
  
  // Socket.io configuration
  SOCKET_SERVER_URL: process.env.SOCKET_SERVER_URL || 'http://localhost:3001',
  SOCKET_SERVER_PORT: process.env.SOCKET_SERVER_PORT || '3001',
  
  // Optional services
  GOOGLE_SITE_VERIFICATION: process.env.GOOGLE_SITE_VERIFICATION,
  SENTRY_DSN: process.env.SENTRY_DSN,
  REDIS_URL: process.env.REDIS_URL,
  
  // OAuth providers
  GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID,
  GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET,
  GITHUB_CLIENT_ID: process.env.GITHUB_CLIENT_ID,
  GITHUB_CLIENT_SECRET: process.env.GITHUB_CLIENT_SECRET,
  
  // Email configuration
  EMAIL_SERVER_HOST: process.env.EMAIL_SERVER_HOST,
  EMAIL_SERVER_PORT: process.env.EMAIL_SERVER_PORT,
  EMAIL_SERVER_USER: process.env.EMAIL_SERVER_USER,
  EMAIL_SERVER_PASSWORD: process.env.EMAIL_SERVER_PASSWORD,
  
  // File upload
  UPLOAD_THING_SECRET: process.env.UPLOAD_THING_SECRET,
  UPLOAD_THING_APP_ID: process.env.UPLOAD_THING_APP_ID,
  
  // Node environment
  NODE_ENV: process.env.NODE_ENV || 'development',
} as const

// Validation for required environment variables
export function validateEnvironment() {
  const errors: string[] = []
  
  // Required for production
  if (env.NODE_ENV === 'production') {
    if (!env.NEXTAUTH_SECRET) {
      errors.push('NEXTAUTH_SECRET is required in production')
    }
    
    if (!env.DATABASE_URL) {
      errors.push('DATABASE_URL is required')
    }
  }
  
  // Validate URL formats
  if (env.NEXTAUTH_URL && !isValidUrl(env.NEXTAUTH_URL)) {
    errors.push('NEXTAUTH_URL must be a valid URL')
  }
  
  if (env.NEXT_PUBLIC_APP_URL && !isValidUrl(env.NEXT_PUBLIC_APP_URL)) {
    errors.push('NEXT_PUBLIC_APP_URL must be a valid URL')
  }
  
  if (errors.length > 0) {
    console.error('❌ Environment validation failed:')
    errors.forEach(error => console.error(`  - ${error}`))
    
    if (env.NODE_ENV === 'production') {
      throw new Error('Environment validation failed in production')
    }
  }
  
  return errors.length === 0
}

// Helper function to validate URLs
function isValidUrl(url: string): boolean {
  try {
    new URL(url)
    return true
  } catch {
    return false
  }
}

// Type definitions for better IDE support
export type Environment = typeof env

// Validate environment on module load
if (typeof window === 'undefined') {
  // Only validate on server-side
  validateEnvironment()
} 