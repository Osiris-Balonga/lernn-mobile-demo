# Error Tracking (Sentry)

## Setup

Package: `@sentry/tanstackstart-react` — Sentry SDK with TanStack Start integration.

### Initialization

Create `src/integrations/sentry/init.ts`:

```typescript
import * as Sentry from '@sentry/tanstackstart-react'

Sentry.init({
  dsn: import.meta.env.VITE_SENTRY_DSN,
  environment: import.meta.env.MODE,
  enabled: import.meta.env.PROD,
  integrations: [
    Sentry.browserTracingIntegration(),
    Sentry.replayIntegration({ maskAllText: false, blockAllMedia: false }),
  ],
  tracesSampleRate: 0.2,
  replaysSessionSampleRate: 0.1,
  replaysOnErrorSampleRate: 1.0,
})
```

### Provider in `__root.tsx`

```typescript
import '#/integrations/sentry/init'
import * as Sentry from '@sentry/tanstackstart-react'

// Wrap shellComponent with Sentry error boundary
function RootDocument({ children }: { children: React.ReactNode }) {
  return (
    <html>
      <body>
        <Sentry.ErrorBoundary fallback={<ErrorFallback />}>
          {children}
        </Sentry.ErrorBoundary>
      </body>
    </html>
  )
}
```

## Setting User Context

```typescript
import * as Sentry from '@sentry/tanstackstart-react'

// After login
Sentry.setUser({ id: user.id, email: user.email })

// After selecting school
Sentry.setTag('school_id', schoolId)

// After logout
Sentry.setUser(null)
```

## Manual Error Capture

```typescript
import * as Sentry from '@sentry/tanstackstart-react'

// In catch blocks for non-thrown errors
try {
  await riskyOperation()
} catch (error) {
  Sentry.captureException(error, {
    tags: { feature: 'payments', schoolId },
    extra: { paymentId, amount },
  })
}
```

## Route Error Boundaries

```typescript
import * as Sentry from '@sentry/tanstackstart-react'

export const Route = createFileRoute('/_authed/$schoolId/students')({
  errorComponent: ({ error }) => {
    Sentry.captureException(error)
    return <RouteErrorFallback error={error} />
  },
})
```

## Breadcrumbs

Sentry auto-captures navigation, console, and XHR breadcrumbs. Add custom ones for important actions:

```typescript
Sentry.addBreadcrumb({
  category: 'user-action',
  message: 'Published evaluation',
  level: 'info',
  data: { evaluationId, subjectId },
})
```

## Env Vars

```env
VITE_SENTRY_DSN=https://xxx@sentry.io/xxx
```

## Rules

1. **ONLY** enable in production (`enabled: import.meta.env.PROD`)
2. **ALWAYS** set user context after auth — enables user-based error search
3. **ALWAYS** set `school_id` tag — enables school-scoped debugging
4. **DO NOT** capture expected auth/session probes or API denials (`401`, `403`, `404`) - they are control flow. Only capture unexpected failures such as `5xx` responses or unrecoverable client exceptions.
5. **USE** `Sentry.ErrorBoundary` at the root + route-level `errorComponent`
6. **NEVER** log sensitive data (passwords, tokens) in `extra` or `tags`
7. **KEEP** `tracesSampleRate` low in production (0.1–0.2) to control costs
