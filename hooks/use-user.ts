/**
 * useUser Hook
 *
 * Client-side React hook for accessing the current user in Client Components.
 * Subscribes to auth state changes and updates automatically.
 *
 * @example
 * ```tsx
 * 'use client'
 * import { useUser } from '@/hooks/use-user'
 *
 * export function UserProfile() {
 *   const { user, loading } = useUser()
 *
 *   if (loading) return <div>Loading...</div>
 *   if (!user) return <div>Not logged in</div>
 *
 *   return <div>Welcome {user.email}</div>
 * }
 * ```
 */

'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { User } from '@supabase/supabase-js'

export function useUser() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    // Get initial user
    const getUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      setUser(user)
      setLoading(false)
    }

    getUser()

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
      setLoading(false)
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [supabase])

  return { user, loading }
}
