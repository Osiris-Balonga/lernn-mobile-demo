# Analytics (PostHog)

## Setup (already configured)

- Provider: `src/integrations/posthog/provider.tsx` — wraps the app in `__root.tsx`
- Init: client-side only (`typeof window !== 'undefined'`), `identified_only` mode
- Env vars: `VITE_POSTHOG_KEY`, `VITE_POSTHOG_HOST` (defaults to `https://us.i.posthog.com`)
- `capture_pageview: false` — page views are tracked manually for SPA accuracy

## Identifying Users

Identify after successful login (in auth flow):

```typescript
import posthog from 'posthog-js'

// After login success (e.g., in useLogin hook onSuccess)
posthog.identify(user.id, {
  email: user.email,
  name: `${user.firstName} ${user.lastName}`,
})

// After logout
posthog.reset()
```

## Tracking Events

```typescript
import posthog from 'posthog-js'

// Track custom events
posthog.capture('student_created', { schoolId, classGroupId })
posthog.capture('payment_recorded', { schoolId, amount })
posthog.capture('evaluation_published', { schoolId, subjectId, studentCount })
```

## Page Views (SPA)

Track page views on route changes using TanStack Router:

```typescript
import posthog from 'posthog-js'
import { useRouterState } from '@tanstack/react-router'
import { useEffect } from 'react'

export function usePageView() {
  const location = useRouterState({ select: (s) => s.location })

  useEffect(() => {
    posthog.capture('$pageview', { $current_url: location.href })
  }, [location.href])
}
```

Place `usePageView()` in the authed layout component.

## Feature Flags

```typescript
import { useFeatureFlagEnabled } from '@posthog/react'

function MyComponent() {
  const showNewFeature = useFeatureFlagEnabled('new-dashboard-v2')

  if (!showNewFeature) return null
  return <NewDashboard />
}
```

## Group Analytics (School Context)

```typescript
// After selecting a school profile
posthog.group('school', schoolId, { name: schoolName })
```

## Rules

1. **NEVER** track PII (names, emails) in event properties — use `identify()` only
2. **ALWAYS** include `schoolId` in event properties for multi-tenant filtering
3. **DO NOT** track every UI interaction — focus on business-meaningful events
4. **USE** feature flags for progressive rollouts, not env vars or code comments
5. **RESET** on logout: `posthog.reset()` to clear the identified user
6. **SPA pageviews**: Since `capture_pageview: false`, manually track in route changes
