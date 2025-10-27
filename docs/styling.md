# Styling System

Complete guide to the styling system in this Next.js application using Tailwind CSS v4.

## Tailwind CSS v4

This project uses **Tailwind CSS v4** with the new inline `@theme` configuration system.

### Configuration Location

All theme configuration is in `app/globals.css` using the `@theme inline` block.

```css
@theme inline {
  --color-background: oklch(0% 0 0);
  --color-foreground: oklch(98% 0 0);
  /* ... more theme variables */
}
```

### Key Differences from v3

- No `tailwind.config.js` file
- Theme defined directly in CSS using `@theme inline`
- Better CSS variables integration
- Native CSS support for design tokens

## Color System

### OKLCH Color Space

All colors use the **OKLCH** color space for better perceptual uniformity and wide color gamut support.

**Format**: `oklch(lightness% chroma hue / alpha)`

```css
/* Examples */
--color-primary: oklch(51% 0.177 256);           /* Blue */
--color-destructive: oklch(58% 0.23 29);        /* Red */
--color-success: oklch(70% 0.15 150);           /* Green */
```

**Benefits**:
- More perceptually uniform than HSL
- Better color interpolation
- Wider color gamut
- Consistent lightness across hues

### Design Tokens (CSS Variables)

All colors are defined as CSS variables with light and dark mode variants.

**Structure**:
```css
@theme inline {
  /* Light mode (default) */
  --color-background: oklch(100% 0 0);
  --color-foreground: oklch(10% 0 0);
  
  /* Dark mode */
  @custom-variant dark (&:is(.dark *)) {
    --color-background: oklch(10% 0 0);
    --color-foreground: oklch(98% 0 0);
  }
}
```

### Core Color Variables

#### Background & Foreground
```css
bg-background       /* Page background */
text-foreground     /* Main text color */
```

#### UI Elements
```css
bg-card             /* Card backgrounds */
text-card-foreground

bg-popover          /* Popover/dropdown backgrounds */
text-popover-foreground

bg-primary          /* Primary buttons, accents */
text-primary-foreground

bg-secondary        /* Secondary buttons */
text-secondary-foreground

bg-muted            /* Muted backgrounds */
text-muted-foreground

bg-accent           /* Accent backgrounds */
text-accent-foreground
```

#### Interactive States
```css
bg-destructive      /* Destructive actions (delete, remove) */
text-destructive-foreground

border-border       /* Borders */
border-input        /* Input borders */
ring-ring          /* Focus rings */
```

#### Semantic Colors
```css
bg-success          /* Success states */
text-success-foreground

bg-warning          /* Warning states */
text-warning-foreground

bg-error            /* Error states */
text-error-foreground

bg-info             /* Info states */
text-info-foreground
```

## Styling Conventions

### ✅ DO: Use CSS Variables

```tsx
// Correct - Uses design tokens
<div className="bg-background text-foreground" />
<button className="bg-primary text-primary-foreground" />
<div className="border border-border" />
```

### ❌ DON'T: Use Hardcoded Colors

```tsx
// Wrong - Breaks theme system
<div className="bg-white text-black" />
<button className="bg-blue-500 text-white" />
<div className="border border-gray-300" />
```

### Use cn() for Conditional Classes

```tsx
import { cn } from '@/lib/utils'

<div className={cn(
  'base-classes bg-background',
  isActive && 'bg-accent',
  isError && 'border-destructive',
  className // Always allow prop override
)} />
```

### Component Prop Overrides

Always allow className to be overridden:

```tsx
interface Props {
  className?: string
}

export function Card({ className }: Props) {
  return (
    <div className={cn(
      'rounded-lg border bg-card p-6',
      className // Last so it can override
    )} />
  )
}
```

## Theme Customization

### Border Radius

Controlled via the `--radius` variable:

```css
@theme inline {
  --radius: 0.625rem; /* 10px */
}
```

Usage:
```tsx
<div className="rounded-[--radius]" />     /* Uses theme radius */
<div className="rounded-md" />             /* Standard sizes still work */
```

### Spacing & Sizing

Standard Tailwind spacing scale works as expected:

```tsx
<div className="p-4 m-2 space-y-4" />     /* 16px, 8px, 16px */
<div className="w-full h-screen" />        /* 100%, 100vh */
```

### Typography

```tsx
<h1 className="text-4xl font-bold" />
<p className="text-sm text-muted-foreground" />
<code className="font-mono text-xs" />
```

## Dark Mode

### Implementation

Dark mode uses the `.dark` class on a parent element (typically `<html>`):

```tsx
// In layout or component
<html className={isDark ? 'dark' : ''}>
```

### Custom Variant Syntax

Dark mode styles are defined using `@custom-variant`:

```css
@custom-variant dark (&:is(.dark *)) {
  --color-background: oklch(10% 0 0);
  --color-foreground: oklch(98% 0 0);
}
```

This applies styles when the element is inside a `.dark` ancestor.

### Auto-Switching Colors

CSS variables automatically switch between light/dark values:

```tsx
// No need for dark: prefix!
<div className="bg-background text-foreground" />
// Automatically uses dark values when .dark is present
```

## Fonts

### Configuration

Fonts are loaded in the root layout using `next/font/google`:

```tsx
import { GeistSans } from 'geist/font/sans'
import { GeistMono } from 'geist/font/mono'

export default function RootLayout({ children }) {
  return (
    <html className={`${GeistSans.variable} ${GeistMono.variable}`}>
      <body className="font-sans">{children}</body>
    </html>
  )
}
```

### CSS Variables

```css
--font-sans: 'Geist Sans', sans-serif;
--font-mono: 'Geist Mono', monospace;
```

### Usage

```tsx
<p className="font-sans">Default text</p>
<code className="font-mono">Code block</code>
```

## Responsive Design

Standard Tailwind breakpoints:

```tsx
<div className="
  p-4              /* Mobile */
  md:p-6           /* Tablet */
  lg:p-8           /* Desktop */
  xl:p-10          /* Large desktop */
">
  Responsive padding
</div>
```

Breakpoints:
- `sm`: 640px
- `md`: 768px
- `lg`: 1024px
- `xl`: 1280px
- `2xl`: 1536px

## Common Patterns

### Card Component

```tsx
<div className="rounded-lg border bg-card text-card-foreground shadow-sm p-6">
  <h3 className="text-lg font-semibold">Card Title</h3>
  <p className="text-sm text-muted-foreground">Card description</p>
</div>
```

### Button Variants

```tsx
// Primary
<button className="bg-primary text-primary-foreground hover:bg-primary/90" />

// Secondary
<button className="bg-secondary text-secondary-foreground hover:bg-secondary/80" />

// Destructive
<button className="bg-destructive text-destructive-foreground hover:bg-destructive/90" />

// Outline
<button className="border border-input bg-background hover:bg-accent" />

// Ghost
<button className="hover:bg-accent hover:text-accent-foreground" />
```

### Form Input

```tsx
<input className="
  flex h-10 w-full rounded-md
  border border-input
  bg-background
  px-3 py-2
  text-sm
  ring-offset-background
  placeholder:text-muted-foreground
  focus-visible:outline-none
  focus-visible:ring-2
  focus-visible:ring-ring
  focus-visible:ring-offset-2
  disabled:cursor-not-allowed
  disabled:opacity-50
" />
```

### Container

```tsx
<div className="container mx-auto px-4 py-8">
  {/* Content */}
</div>
```

## Accessibility

### Focus Styles

Always include focus styles:

```tsx
<button className="
  focus-visible:outline-none
  focus-visible:ring-2
  focus-visible:ring-ring
  focus-visible:ring-offset-2
">
  Button
</button>
```

### Color Contrast

All color combinations in the theme meet WCAG AA standards:
- Foreground/background pairs have sufficient contrast
- Interactive elements are clearly distinguishable

### Screen Reader Only

```tsx
<span className="sr-only">Screen reader only text</span>
```

## Performance

### Purging

Tailwind automatically purges unused styles in production builds.

### JIT Mode

Tailwind v4 uses Just-In-Time compilation by default - only generates styles you actually use.

## Extending the Theme

### Adding Custom Colors

Edit `app/globals.css`:

```css
@theme inline {
  /* Add your custom color */
  --color-brand: oklch(60% 0.2 250);
  
  @custom-variant dark (&:is(.dark *)) {
    --color-brand: oklch(70% 0.2 250);
  }
}
```

Usage:
```tsx
<div className="bg-brand text-brand-foreground" />
```

### Adding Custom Utilities

```css
@layer utilities {
  .text-balance {
    text-wrap: balance;
  }
  
  .scrollbar-hide {
    scrollbar-width: none;
    &::-webkit-scrollbar {
      display: none;
    }
  }
}
```

## Resources

- **Tailwind v4 Docs**: https://tailwindcss.com/docs
- **OKLCH Color Picker**: https://oklch.com/
- **shadcn/ui Themes**: https://ui.shadcn.com/themes
- **Color Contrast Checker**: https://webaim.org/resources/contrastchecker/