# Testing Rules (Vitest + Testing Library)

## Test Runner

- **Vitest** for all tests (unit, component, integration)
- Config: `vite.config.ts` (Vitest uses Vite config)
- Environment: `jsdom` for component tests
- Command: `pnpm test` (run all), `pnpm test -- --watch` (watch mode)

## File Location

Test files live NEXT TO their source files:

```
features/students/
├── hooks/
│   ├── use-students.ts
│   └── use-students.test.ts     ← here
├── schemas/
│   ├── student.schema.ts
│   └── student.schema.test.ts   ← here
├── components/
│   ├── student-card.tsx
│   └── student-card.test.tsx    ← here
```

## What to Test

| Layer | Test | Priority |
|-------|------|----------|
| Zod schemas | Validation rules, edge cases | HIGH |
| Utility functions | Pure logic | HIGH |
| Custom hooks (non-query) | State logic, transformations | MEDIUM |
| Components | User interactions, conditional rendering | MEDIUM |
| Query hooks | Integration with mock API | LOW (covered by E2E) |
| Route loaders | SSR data loading | LOW (covered by E2E) |

## Schema Test Pattern

```typescript
import { describe, it, expect } from 'vitest'
import { createStudentSchema } from './student.schema'

describe('createStudentSchema', () => {
  it('accepts valid input', () => {
    const result = createStudentSchema.safeParse({
      firstName: 'Jean',
      lastName: 'Dupont',
      dateOfBirth: '2010-05-15',
      classGroupId: '550e8400-e29b-41d4-a716-446655440000',
      gender: 'M',
    })
    expect(result.success).toBe(true)
  })

  it('rejects empty firstName', () => {
    const result = createStudentSchema.safeParse({
      firstName: '',
      lastName: 'Dupont',
      dateOfBirth: '2010-05-15',
      classGroupId: '550e8400-e29b-41d4-a716-446655440000',
      gender: 'M',
    })
    expect(result.success).toBe(false)
  })
})
```

## Component Test Pattern

```typescript
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect } from 'vitest'
import { StudentCard } from './student-card'

describe('StudentCard', () => {
  const student = {
    id: '1',
    fullName: 'Jean Dupont',
    status: 'active',
    classGroup: '6ème A',
  }

  it('renders student name', () => {
    render(<StudentCard student={student} />)
    expect(screen.getByText('Jean Dupont')).toBeInTheDocument()
  })

  it('shows status badge', () => {
    render(<StudentCard student={student} />)
    expect(screen.getByText('active')).toBeInTheDocument()
  })
})
```

## Rules

1. **ALWAYS** test Zod schemas — they are the contract between frontend and API
2. **NEVER** test implementation details — test behavior and output
3. **NEVER** mock TanStack Query internals — use `QueryClientProvider` wrapper
4. **USE** `@testing-library/react` for component tests — no Enzyme, no shallow rendering
5. **PREFER** `screen.getByRole` over `getByTestId` — test accessibility
6. **NO** snapshot tests — they break on every style change and provide little value
