/**
 * Supabase Configuration
 *
 * Centralized configuration and constants for Supabase.
 * This ensures consistency across the application.
 */

/**
 * Validate that required environment variables are set
 */
function validateEnv() {
  const requiredEnvVars = {
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  }

  const missingVars = Object.entries(requiredEnvVars)
    .filter(([_, value]) => !value)
    .map(([key]) => key)

  if (missingVars.length > 0) {
    throw new Error(
      `Missing required environment variables: ${missingVars.join(', ')}\n` +
        'Please check your .env.local file and ensure all required variables are set.\n' +
        'See .env.example for the required variables.'
    )
  }
}

// Validate environment variables on module load
if (typeof window === 'undefined') {
  // Only validate on server side to avoid issues during build
  validateEnv()
}

/**
 * Supabase configuration object
 */
export const supabaseConfig = {
  url: process.env.NEXT_PUBLIC_SUPABASE_URL!,
  anonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  serviceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY,
} as const

/**
 * Auth configuration
 */
export const authConfig = {
  // Redirect URL after authentication
  redirectTo: process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000',

  // Cookie options
  cookieOptions: {
    name: 'sb-auth-token',
    domain: process.env.NEXT_PUBLIC_COOKIE_DOMAIN,
    sameSite: 'lax' as const,
    path: '/',
  },
} as const

/**
 * Storage configuration
 */
export const storageConfig = {
  // Maximum file size (in bytes) - default 50MB
  maxFileSize: 50 * 1024 * 1024,

  // Allowed file types
  allowedFileTypes: {
    images: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
    documents: ['application/pdf', 'application/msword'],
  },
} as const

/**
 * Realtime configuration
 */
export const realtimeConfig = {
  // Presence options
  presence: {
    key: 'user_id',
  },
} as const
