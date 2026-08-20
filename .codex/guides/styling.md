# Styling Rules (Tailwind CSS 4 + shadcn/ui)

## Tailwind CSS 4

- Import via `@import "tailwindcss"` in `styles.css` (no `@tailwind` directives)
- Theme customization in CSS variables (not `tailwind.config.js` — doesn't exist in v4)
- Use `@theme` directive for custom tokens

## Design System: Émeraude

The app uses a green-toned, corporate design system (MongoDB-inspired):

```css
/* Already defined in styles.css or to be added */
@theme {
  --color-brand: #00ED64;
  --color-brand-dark: #00684A;
  --color-brand-soft: #E3FCF7;
  --color-brand-on: #001E2B;
  --color-canvas: #FFFFFF;
  --color-canvas-alt: #F7F8FA;
  --color-surface: #F9FBFA;
  --color-text: #001E2B;
  --color-text-secondary: #5C6C75;
  --color-text-muted: #889397;
  --color-border: #E8EDEB;
  --color-border-strong: #C1C7C6;
  --color-success: #00684A;
  --color-warning: #C76C17;
  --color-danger: #CF4A22;
}
```

## shadcn/ui Components

- Install via `pnpx shadcn@latest add <component>`
- Components live in `src/components/ui/`
- NEVER modify shadcn source files directly — extend via wrapper components
- Use `cn()` utility for conditional classes (from `src/lib/utils.ts`)

## Utility Libraries

### `cn()` — Class Merging (clsx + tailwind-merge)

`src/lib/utils.ts` exports `cn()` which combines `clsx` (conditional classes) + `tailwind-merge` (deduplicates conflicting Tailwind classes):

```typescript
import { cn } from '#/lib/utils'

// Conditional classes
<div className={cn('p-4 rounded-lg', isActive && 'bg-brand-soft')} />

// Override pattern (tailwind-merge resolves conflicts)
<div className={cn('px-4 py-2 text-sm', className)} />
// If className='px-8', result is 'py-2 text-sm px-8' (px-4 removed)
```

### `cva` — Class Variance Authority

Use `cva` to define component variants with type-safe props:

```typescript
import { cva, type VariantProps } from 'class-variance-authority'

const badgeVariants = cva(
  'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold',
  {
    variants: {
      variant: {
        success: 'bg-success/10 text-success',
        warning: 'bg-warning/10 text-warning',
        danger: 'bg-danger/10 text-danger',
        neutral: 'bg-surface text-text-secondary',
      },
    },
    defaultVariants: { variant: 'neutral' },
  },
)

interface BadgeProps extends VariantProps<typeof badgeVariants> {
  className?: string
  children: React.ReactNode
}

export function Badge({ variant, className, children }: BadgeProps) {
  return <span className={cn(badgeVariants({ variant }), className)}>{children}</span>
}
```

### `tw-animate-css` — Animation Utilities

Pre-built CSS animations available via Tailwind classes. Already imported in `styles.css`.

Common classes:
- `animate-in` / `animate-out` — enter/exit animations
- `fade-in` / `fade-out` — opacity transitions
- `slide-in-from-top` / `slide-in-from-bottom` — directional slides
- `zoom-in` / `zoom-out` — scale transitions

Used internally by shadcn Dialog, Drawer, Dropdown overlays. Don't apply manually unless building custom animated components.

## Rules

1. **ALWAYS** use Tailwind utilities — no inline styles, no CSS files per component
2. **NEVER** use arbitrary values `[#hex]` when a design token exists
3. **USE** `cn()` for conditional/merged classes (never raw `clsx` or manual concatenation)
4. **USE** `cva` when a component has 2+ visual variants — not if/else chains
5. **PREFER** responsive utilities over media queries: `md:flex lg:grid-cols-3`
6. **USE** shadcn variants for component states — don't reinvent
7. **LOADING STATES**: Always use Skeleton components matching the final layout:
   ```typescript
   {isLoading ? <Skeleton className="h-10 w-full" /> : <DataContent />}
   ```
8. **RESPONSIVE MODALS**: Use Dialog on desktop, Drawer on mobile (shadcn pattern):
   ```typescript
   // Use useMediaQuery to switch between Dialog and Drawer
   ```

## Layout Patterns

- **Page layout**: Sidebar + main content area
- **Sidebar**: Fixed left, collapsible on mobile
- **Content**: Max-width container with padding
- **Cards**: Primary content container for dashboard sections
- **Tables**: Full-width with horizontal scroll on mobile

## Typography

- Font: DM Sans (to be loaded)
- Headings: font-bold, tracking-tight
- Body: text-text-body (--color-text-body)
- Muted: text-text-muted

## Spacing Scale

Use Tailwind's default spacing — do NOT create custom spacing values unless absolutely necessary. Maintain consistent spacing:
- Section gaps: `gap-6` or `space-y-6`
- Card padding: `p-6`
- Element gaps: `gap-3` or `gap-4`
- Tight groups: `gap-2`
