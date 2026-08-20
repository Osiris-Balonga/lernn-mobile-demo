# Environment Configuration Rules

## Rule: Only VITE_ prefixed vars are exposed to the browser

Vite only exposes env vars prefixed with `VITE_` to the client bundle.
Non-prefixed vars (like `DATABASE_URL`) are NEVER available at runtime in a
Vite app — do not add them to `.env.local`.

### ❌ Forbidden — credentials that don't belong in a frontend env file

```
DATABASE_URL=postgresql://...   # backend only, never in frontend
SMTP_PASS=secret                # backend only
API_SECRET=sk-live-xxx          # backend only
```

### ✅ Correct — only frontend-relevant vars

```
VITE_API_URL=http://localhost:7600
VITE_POSTHOG_KEY=phc_...
VITE_SENTRY_DSN=https://...
SENTRY_AUTH_TOKEN=...           # build-time only, not exposed to browser
```

## Rule: No production values as fallbacks in code

### ❌ Forbidden

```typescript
const apiUrl = import.meta.env.VITE_API_URL || 'https://api.lernn.io';
const key = import.meta.env.VITE_POSTHOG_KEY || 'phc_live_xxxx';
```

### ✅ Correct — fail visibly or use safe non-production defaults

```typescript
const apiUrl = import.meta.env.VITE_API_URL;
if (!apiUrl) throw new Error('VITE_API_URL is required');

// Or for optional features: let them be disabled when var is absent
const posthogKey = import.meta.env.VITE_POSTHOG_KEY ?? '';
if (posthogKey) posthog.init(posthogKey, { ... });
```

## Rule: .env.local must declare all vars

Every `import.meta.env.VITE_X` reference in the codebase must have a
corresponding entry in `.env.local`, even if left empty.

## Checklist before adding a new env var

- [ ] Prefixed with `VITE_` if it needs to be accessible in the browser
- [ ] Added to `.env.local` with a dev value (or empty if optional)
- [ ] Added to `.env.example` so other devs know it exists
- [ ] No fallback to a production URL, key, or credential in the code
