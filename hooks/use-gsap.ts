'use client'

import { useEffect, useRef, type MutableRefObject } from 'react'
import gsap from 'gsap'

/**
 * Custom hook to use GSAP with React
 * Automatically handles cleanup of GSAP animations
 *
 * @example
 * ```tsx
 * 'use client'
 * import { useGSAP } from '@/hooks/use-gsap'
 *
 * export function AnimatedComponent() {
 *   const container = useRef<HTMLDivElement>(null)
 *
 *   useGSAP(() => {
 *     gsap.to('.box', { rotation: 360, duration: 2 })
 *   }, { scope: container })
 *
 *   return (
 *     <div ref={container}>
 *       <div className="box">Animated element</div>
 *     </div>
 *   )
 * }
 * ```
 */
export function useGSAP(
  callback: (context: gsap.Context) => void,
  options?: {
    scope?: MutableRefObject<HTMLElement | null>
    dependencies?: unknown[]
    revertOnUpdate?: boolean
  }
) {
  const { scope, dependencies = [], revertOnUpdate = false } = options || {}

  useEffect(() => {
    const ctx = gsap.context(callback, scope?.current || undefined)

    return () => {
      if (revertOnUpdate) {
        ctx.revert()
      } else {
        ctx.kill()
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, dependencies)
}

/**
 * Hook to get a ref for GSAP animations
 * Useful when you need to reference elements in GSAP animations
 */
export function useGSAPRef<T extends HTMLElement = HTMLElement>() {
  return useRef<T>(null)
}
