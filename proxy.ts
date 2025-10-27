/**
 * Next.js Proxy
 *
 * This proxy runs on every request and handles:
 * - Auth token refresh via Supabase
 * - Session management
 * - Cookie updates
 *
 * The matcher config ensures the proxy doesn't run on:
 * - Static files (_next/static)
 * - Image optimization files (_next/image)
 * - Favicon and other assets
 *
 * @see https://nextjs.org/docs/app/building-your-application/routing/middleware
 */

import { type NextRequest } from 'next/server'
import { updateSession } from '@/lib/supabase/middleware'

export async function proxy(request: NextRequest) {
  return await updateSession(request)
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - Static assets (images, etc.)
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
