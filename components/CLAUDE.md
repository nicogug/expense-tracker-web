# Component Guidelines

This file provides guidance for working with components in this Next.js application.

## shadcn/ui Integration

### Installation

Add components using the shadcn CLI:

```bash
npx shadcn@latest add [component-name]
```

Components are installed to `components/ui/` with automatic path alias configuration.

### Configuration

- **Style**: "new-york"
- **Base color**: zinc
- **Icons**: Lucide React
- **Utilities**: `cn()` helper at `lib/utils.ts` (combines clsx + tailwind-merge)
- **Variants**: Class Variance Authority (CVA) available

### Path Aliases

```tsx
import { Button } from '@/components/ui/button'
import { MyComponent } from '@/components/my-component'
import { useMyHook } from '@/hooks/use-my-hook'
import { cn } from '@/lib/utils'
```

## shadcn MCP Server

When working with Claude Code, a shadcn MCP (Model Context Protocol) server is available.

### Available Capabilities

- **Search components**: Fuzzy search across registries
- **List components**: Browse all available components
- **View details**: Get implementation, dependencies, and files
- **Get examples**: Find usage patterns and demos
- **Add commands**: Retrieve correct CLI syntax
- **Audit**: Verify new components work correctly

### Usage Examples

```
# Search for components
"find button components"
"search for form inputs"

# Get usage examples
"show accordion example"
"button demo code"

# Installation help
"how to add dialog component"
"command to install table"

# Audit new work
"audit checklist for new components"
```

### When to Use MCP Tools

Use the shadcn MCP tools when you need to:
- Search for available components before implementing features
- Find usage examples and implementation patterns
- Get proper CLI commands for adding components
- View component details and dependencies
- Verify newly created components

Note: MCP server requires `components.json` (already configured in this project).

## Component Conventions

### Server vs Client Components

**Default: Server Components**
- All components are Server Components by default
- No need for `'use client'` directive unless specifically needed
- Better performance, reduced bundle size

**When to use Client Components** (`'use client'` directive):
- Event handlers (onClick, onChange, etc.)
- React hooks (useState, useEffect, useRef, etc.)
- Browser APIs (localStorage, window, document)
- GSAP animations (requires `useGSAP` hook)
- Third-party libraries that use hooks

```tsx
// Server Component (default)
export function ServerCard({ title }: { title: string }) {
  return <div>{title}</div>
}

// Client Component (explicit)
'use client'

import { useState } from 'react'

export function ClientCard() {
  const [count, setCount] = useState(0)
  return <button onClick={() => setCount(count + 1)}>{count}</button>
}
```

### Styling Conventions

**Always use CSS variables** for colors:

```tsx
// ✅ Correct - Uses design tokens
<div className="bg-background text-foreground border-border" />

// ❌ Wrong - Hardcoded colors
<div className="bg-white text-black border-gray-300" />
```

**Use cn() for conditional classes**:

```tsx
import { cn } from '@/lib/utils'

<div className={cn(
  'base-classes',
  isActive && 'active-classes',
  className // Props override
)} />
```

### Component Variants (CVA)

Class Variance Authority is available for managing component variants:

```tsx
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const buttonVariants = cva(
  'inline-flex items-center justify-center rounded-md font-medium',
  {
    variants: {
      variant: {
        default: 'bg-primary text-primary-foreground',
        outline: 'border border-input bg-background',
      },
      size: {
        default: 'h-10 px-4 py-2',
        sm: 'h-9 px-3',
        lg: 'h-11 px-8',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
)

interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

export function Button({ className, variant, size, ...props }: ButtonProps) {
  return (
    <button
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}
```

## Best Practices

1. **Composition**: Build complex UIs by composing smaller components
2. **Type Safety**: Always type props interfaces/types
3. **Accessibility**: Use semantic HTML and ARIA attributes
4. **Performance**: Keep Server Components when possible
5. **Styling**: Use design tokens, avoid inline styles
6. **Reusability**: Extract common patterns to shared components

## Common Patterns

### Form Components

```tsx
'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

export function MyForm() {
  const [value, setValue] = useState('')

  return (
    <form onSubmit={(e) => { e.preventDefault() }}>
      <Input
        value={value}
        onChange={(e) => setValue(e.target.value)}
      />
      <Button type="submit">Submit</Button>
    </form>
  )
}
```

### Animated Components

See `docs/animations.md` for complete GSAP integration patterns.

### Data Loading Components

Server Components can fetch data directly:

```tsx
import { getUser } from '@/lib/supabase/queries/users'

export async function UserProfile({ userId }: { userId: string }) {
  const user = await getUser(userId)
  return <div>{user.name}</div>
}
```

For mutations, see `lib/supabase/CLAUDE.md` and `lib/auth/CLAUDE.md`.