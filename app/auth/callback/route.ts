/**
 * Auth Callback Route
 *
 * Handles OAuth callbacks from providers like Google.
 * Exchanges the code for a session and redirects to the app.
 */

import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  const origin = requestUrl.origin

  if (code) {
    const supabase = await createClient()
    await supabase.auth.exchangeCodeForSession(code)
  }

  // Redirect to dashboard or home after successful authentication
  return NextResponse.redirect(`${origin}/dashboard`)
}
