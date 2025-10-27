# GSAP Animation Guide

**IMPORTANT**: When implementing animations in this project, **always use GSAP** as the primary animation library.

## Overview

- **GSAP 3**: Installed and configured for Next.js and React
- **Custom Hook**: `hooks/use-gsap.ts` - Handles GSAP context and automatic cleanup
- **Client Components Only**: GSAP requires `'use client'` directive
- **Documentation**: https://gsap.com/docs/v3/

## Installation

GSAP is already installed. All plugins are included in the main package:

```bash
pnpm add gsap  # If you need to reinstall
```

## Basic Setup

### 1. Simple Animation

```tsx
'use client'

import { useRef } from 'react'
import { useGSAP } from '@/hooks/use-gsap'
import gsap from 'gsap'

export function AnimatedComponent() {
  const container = useRef<HTMLDivElement>(null)

  useGSAP(
    () => {
      gsap.to('.element', {
        x: 100,
        duration: 1,
        ease: 'power2.out'
      })
    },
    { scope: container } // Scope animations to this container
  )

  return (
    <div ref={container}>
      <div className="element">Animated content</div>
    </div>
  )
}
```

### 2. Multiple Elements

```tsx
'use client'

import { useRef } from 'react'
import { useGSAP } from '@/hooks/use-gsap'
import gsap from 'gsap'

export function MultipleAnimations() {
  const container = useRef<HTMLDivElement>(null)

  useGSAP(
    () => {
      // Animate multiple elements
      gsap.to('.box', {
        y: 100,
        stagger: 0.1, // 0.1s delay between each
        duration: 0.8,
      })
    },
    { scope: container }
  )

  return (
    <div ref={container}>
      <div className="box">Box 1</div>
      <div className="box">Box 2</div>
      <div className="box">Box 3</div>
    </div>
  )
}
```

## Event-Triggered Animations

### onClick Animation

```tsx
'use client'

import { useRef } from 'react'
import gsap from 'gsap'

export function ClickAnimation() {
  const boxRef = useRef<HTMLDivElement>(null)

  const handleClick = () => {
    gsap.to(boxRef.current, {
      rotation: 360,
      scale: 1.2,
      duration: 0.5,
      ease: 'back.out(1.7)',
      onComplete: () => {
        // Reset after animation
        gsap.to(boxRef.current, {
          rotation: 0,
          scale: 1,
          duration: 0.3,
        })
      },
    })
  }

  return (
    <div
      ref={boxRef}
      onClick={handleClick}
      className="cursor-pointer bg-primary text-primary-foreground p-4 rounded-md"
    >
      Click me to animate
    </div>
  )
}
```

### onHover Animation

```tsx
'use client'

import { useRef } from 'react'
import gsap from 'gsap'

export function HoverAnimation() {
  const boxRef = useRef<HTMLDivElement>(null)

  const handleMouseEnter = () => {
    gsap.to(boxRef.current, {
      scale: 1.1,
      duration: 0.3,
      ease: 'power2.out',
    })
  }

  const handleMouseLeave = () => {
    gsap.to(boxRef.current, {
      scale: 1,
      duration: 0.3,
      ease: 'power2.in',
    })
  }

  return (
    <div
      ref={boxRef}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className="bg-accent p-4 rounded-md"
    >
      Hover over me
    </div>
  )
}
```

## Timeline Animations

Timelines allow you to sequence multiple animations:

```tsx
'use client'

import { useRef } from 'react'
import { useGSAP } from '@/hooks/use-gsap'
import gsap from 'gsap'

export function TimelineExample() {
  const container = useRef<HTMLDivElement>(null)

  useGSAP(
    () => {
      const tl = gsap.timeline({
        repeat: -1, // Infinite loop
        yoyo: true, // Reverse on alternate iterations
      })

      tl.to('.box1', { x: 100, duration: 1 })
        .to('.box2', { y: 100, duration: 1 }, '-=0.5') // Start 0.5s before previous ends
        .to('.box3', { rotation: 360, duration: 1 }, '<') // Start at same time as previous
    },
    { scope: container }
  )

  return (
    <div ref={container}>
      <div className="box1 bg-red-500 w-20 h-20" />
      <div className="box2 bg-green-500 w-20 h-20" />
      <div className="box3 bg-blue-500 w-20 h-20" />
    </div>
  )
}
```

## Common Animation Properties

```tsx
gsap.to(element, {
  // Position
  x: 100,              // Move 100px right
  y: 50,               // Move 50px down
  xPercent: 50,        // Move 50% of element width
  yPercent: 25,        // Move 25% of element height

  // Scale & Rotation
  scale: 1.5,          // Scale to 150%
  scaleX: 2,           // Scale width only
  scaleY: 0.5,         // Scale height only
  rotation: 360,       // Rotate 360 degrees
  rotationX: 45,       // 3D rotation on X axis
  rotationY: 45,       // 3D rotation on Y axis

  // Opacity & Display
  opacity: 0.5,        // Semi-transparent
  autoAlpha: 0,        // Opacity + visibility (0 = hidden)

  // Timing
  duration: 1,         // 1 second
  delay: 0.5,          // Start after 0.5s
  repeat: 2,           // Repeat 2 times
  repeatDelay: 1,      // 1s pause between repeats
  yoyo: true,          // Reverse on alternate repeats

  // Easing
  ease: 'power2.out',  // Common eases: power1-4, back, elastic, bounce
})
```

## GSAP Plugins

### ScrollTrigger

Trigger animations on scroll:

```tsx
'use client'

import { useRef } from 'react'
import { useGSAP } from '@/hooks/use-gsap'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

export function ScrollAnimation() {
  const container = useRef<HTMLDivElement>(null)

  useGSAP(
    () => {
      gsap.to('.box', {
        x: 500,
        scrollTrigger: {
          trigger: '.box',
          start: 'top center',    // When top of box hits center of viewport
          end: 'bottom center',   // When bottom of box hits center of viewport
          scrub: true,            // Smooth scrubbing
          markers: true,          // Show markers (remove in production)
        },
      })
    },
    { scope: container }
  )

  return (
    <div ref={container} className="h-[200vh]">
      <div className="box bg-primary w-20 h-20 mt-[50vh]" />
    </div>
  )
}
```

### Other Plugins

All GSAP plugins are included in the main package:

```tsx
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { Flip } from 'gsap/Flip'
import { MotionPathPlugin } from 'gsap/MotionPathPlugin'
import { TextPlugin } from 'gsap/TextPlugin'
import { ScrollToPlugin } from 'gsap/ScrollToPlugin'

gsap.registerPlugin(ScrollTrigger, Flip, MotionPathPlugin, TextPlugin, ScrollToPlugin)
```

## Best Practices

### 1. Always Use useGSAP Hook

```tsx
// ✅ Correct
useGSAP(() => {
  gsap.to('.element', { x: 100 })
}, { scope: container })

// ❌ Wrong - No automatic cleanup
useEffect(() => {
  gsap.to('.element', { x: 100 })
}, [])
```

### 2. Prefer Refs Over Selectors

```tsx
// ✅ Better - Direct reference
const boxRef = useRef<HTMLDivElement>(null)
gsap.to(boxRef.current, { x: 100 })

// ⚠️ Works but less precise
gsap.to('.box', { x: 100 })
```

### 3. Scope Animations to Containers

```tsx
// ✅ Correct - Scoped to container
useGSAP(
  () => { gsap.to('.box', { x: 100 }) },
  { scope: container }
)

// ⚠️ Affects ALL .box elements on page
useGSAP(() => {
  gsap.to('.box', { x: 100 })
})
```

### 4. Clean Up Event Listeners

```tsx
'use client'

import { useRef, useEffect } from 'react'
import gsap from 'gsap'

export function EventAnimation() {
  const boxRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const box = boxRef.current
    if (!box) return

    const handleClick = () => {
      gsap.to(box, { rotation: 360 })
    }

    box.addEventListener('click', handleClick)
    
    // ✅ Clean up
    return () => {
      box.removeEventListener('click', handleClick)
    }
  }, [])

  return <div ref={boxRef}>Click me</div>
}
```

### 5. Works Seamlessly with Tailwind

```tsx
useGSAP(() => {
  gsap.to('.box', {
    // GSAP handles these
    x: 100,
    rotation: 45,
    scale: 1.5,
    // Tailwind handles these
    className: 'bg-primary text-white rounded-lg',
  })
})
```

## Performance Tips

1. **Use transforms**: `x`, `y`, `scale`, `rotation` are GPU-accelerated
2. **Avoid animating**: `width`, `height`, `top`, `left` (triggers layout)
3. **Use `will-change`**: Add `will-change-transform` class for complex animations
4. **Batch animations**: Use timelines for multiple animations
5. **Kill animations**: Call `gsap.killTweensOf()` to stop animations if needed

## Common Easing Functions

```tsx
// Standard eases
ease: 'power1.out'    // Gentle deceleration
ease: 'power2.out'    // Medium deceleration
ease: 'power3.out'    // Strong deceleration
ease: 'power4.out'    // Very strong deceleration

// Bounce
ease: 'bounce.out'    // Bounces at end
ease: 'bounce.in'     // Bounces at start
ease: 'bounce.inOut'  // Bounces both ends

// Elastic
ease: 'elastic.out(1, 0.3)'  // Elastic spring effect

// Back
ease: 'back.out(1.7)' // Overshoots then settles

// Custom
ease: 'steps(12)'     // Stepped animation
```

## Example Component

See `components/gsap-example.tsx` for a complete working example (can be deleted if not needed).

## Resources

- **Official Docs**: https://gsap.com/docs/v3/
- **Easing Visualizer**: https://gsap.com/docs/v3/Eases
- **Cheat Sheet**: https://gsap.com/docs/v3/GSAP/gsap.to()
- **Examples**: https://codepen.io/GreenSock