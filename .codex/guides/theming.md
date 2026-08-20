# Theming (next-themes)

## Setup (already configured)

Package: `next-themes` — handles dark/light/system mode with SSR-safe rendering.

Used by shadcn's `Toaster` component (`src/components/ui/sonner.tsx`) to match toast theme.

### Provider

Add `ThemeProvider` in `__root.tsx` (wraps children):

```typescript
import { ThemeProvider } from 'next-themes'

function RootDocument({ children }: { children: React.ReactNode }) {
  return (
    <html suppressHydrationWarning>
      <body>
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem disableTransitionOnChange>
          {children}
        </ThemeProvider>
      </body>
    </html>
  )
}
```

## Usage

```typescript
import { useTheme } from 'next-themes'

function ThemeToggle() {
  const { theme, setTheme } = useTheme()

  return (
    <Button variant="ghost" size="icon" onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}>
      <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
      <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
    </Button>
  )
}
```

## CSS Variables for Dark Mode

Tailwind 4 uses CSS variables. Define dark variants in `styles.css`:

```css
:root {
  --color-canvas: #ffffff;
  --color-text: #001e2b;
  /* ... light tokens */
}

.dark {
  --color-canvas: #0a0a0a;
  --color-text: #fafafa;
  /* ... dark tokens */
}
```

## Hydration Safety

`next-themes` injects a script to prevent FOUC. The `suppressHydrationWarning` on `<html>` is required.

To avoid hydration mismatches when rendering theme-dependent UI:

```typescript
import { useTheme } from 'next-themes'
import { useEffect, useState } from 'react'

function ThemeAwareComponent() {
  const { resolvedTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => { setMounted(true) }, [])

  if (!mounted) return <Skeleton className="h-8 w-8" />

  return <span>{resolvedTheme === 'dark' ? '🌙' : '☀️'}</span>
}
```

## Rules

1. **USE** `attribute="class"` — Tailwind 4 dark mode uses `.dark` class
2. **DEFAULT** to `"light"` for now (dark mode tokens not yet fully defined)
3. **ALWAYS** add `suppressHydrationWarning` to `<html>` tag
4. **USE** `resolvedTheme` (not `theme`) when you need the actual value (handles "system")
5. **GUARD** theme-dependent rendering with `mounted` state to prevent hydration mismatch
6. **DO NOT** use `dark:` Tailwind variants without corresponding CSS variable changes
7. **PREFER** CSS variable approach over Tailwind `dark:` for design tokens — single source of truth
