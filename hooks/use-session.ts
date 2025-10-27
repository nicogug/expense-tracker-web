/**
 * useSession Hook
 *
 * Client-side React hook for accessing the current session in Client Components.
 * Subscribes to auth state changes and updates automatically.
 *
 * @example
 * ```tsx
 * 'use client'
 * import { useSession } from '@/hooks/use-session'
 *
 * export function SessionInfo() {
 *   const { session, loading } = useSession()
 *
 *   if (loading) return <div>Loading...</div>
 *   if (!session) return <div>No session</div>
 *
 *   return <div>Session expires at: {session.expires_at}</div>
 * }
 * ```
 */

'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { Session } from '@supabase/supabase-js'

export function useSession() {
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    // Get initial session
    const getSession = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession()
      setSession(session)
      setLoading(false)
    }

    getSession()

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
      setLoading(false)
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [supabase])

  return { session, loading }
}
