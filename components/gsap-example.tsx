'use client'

import { useRef } from 'react'
import gsap from 'gsap'
import { useGSAP } from '@/hooks/use-gsap'

/**
 * Example component demonstrating different GSAP animation patterns
 * This file can be deleted - it's just for reference
 */
export function GSAPExample() {
  const container = useRef<HTMLDivElement>(null)
  const boxRef = useRef<HTMLDivElement>(null)
  const circleRef = useRef<HTMLButtonElement>(null)

  // Example 1: Auto-play animation on mount
  useGSAP(
    () => {
      gsap.to('.box', {
        x: 100,
        rotation: 360,
        duration: 2,
        ease: 'power2.inOut',
        repeat: -1,
        yoyo: true,
      })
    },
    { scope: container }
  )

  // Example 2: Click-triggered animation
  const handleClick = () => {
    if (circleRef.current) {
      gsap.to(circleRef.current, {
        scale: 1.5,
        backgroundColor: '#10b981',
        duration: 0.3,
        ease: 'back.out(1.7)',
        yoyo: true,
        repeat: 1,
      })
    }
  }

  // Example 3: Timeline animation
  const handleTimeline = () => {
    const tl = gsap.timeline()
    tl.to(boxRef.current, { y: 50, duration: 0.5 })
      .to(boxRef.current, { x: 50, duration: 0.5 })
      .to(boxRef.current, { y: 0, duration: 0.5 })
      .to(boxRef.current, { x: 0, duration: 0.5 })
  }

  return (
    <div ref={container} className="space-y-8 p-8">
      <div>
        <h3 className="mb-4 text-lg font-semibold">Auto-play Animation</h3>
        <div className="box h-20 w-20 rounded-lg bg-primary" />
      </div>

      <div>
        <h3 className="mb-4 text-lg font-semibold">Click to Animate</h3>
        <button
          ref={circleRef}
          onClick={handleClick}
          className="h-20 w-20 rounded-full bg-primary transition-colors hover:bg-primary/90"
        />
      </div>

      <div>
        <h3 className="mb-4 text-lg font-semibold">Timeline Animation</h3>
        <div ref={boxRef} className="h-20 w-20 rounded-lg bg-primary" />
        <button
          onClick={handleTimeline}
          className="mt-4 rounded-md bg-secondary px-4 py-2 text-secondary-foreground hover:bg-secondary/80"
        >
          Play Timeline
        </button>
      </div>
    </div>
  )
}
