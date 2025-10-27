/**
 * Supabase Browser Client
 *
 * Creates a Supabase client for use in:
 * - Client Components (with 'use client')
 * - Browser-side code
 *
 * This is a singleton pattern - the same client instance is reused across
 * the application to optimize performance and connection pooling.
 *
 * @example Client Component
 * ```tsx
 * 'use client'
 * import { createClient } from '@/lib/supabase/client'
 * import { useEffect, useState } from 'react'
 *
 * export function ClientComponent() {
 *   const [data, setData] = useState(null)
 *   const supabase = createClient()
 *
 *   useEffect(() => {
 *     supabase.from('posts').select().then(({ data }) => setData(data))
 *   }, [supabase])
 *
 *   return <div>{JSON.stringify(data)}</div>
 * }
 * ```
 *
 * @example Real-time Subscription
 * ```tsx
 * 'use client'
 * import { createClient } from '@/lib/supabase/client'
 *
 * export function RealtimeComponent() {
 *   const supabase = createClient()
 *
 *   useEffect(() => {
 *     const channel = supabase
 *       .channel('posts')
 *       .on('postgres_changes',
 *         { event: '*', schema: 'public', table: 'posts' },
 *         (payload) => console.log('Change received!', payload)
 *       )
 *       .subscribe()
 *
 *     return () => { supabase.removeChannel(channel) }
 *   }, [supabase])
 * }
 * ```
 */

import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}
