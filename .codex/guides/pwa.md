# PWA Rules (vite-plugin-pwa + Workbox)

## Stack

- `vite-plugin-pwa` — Generates service worker + manifest at build time
- `workbox` — Runtime caching strategies (bundled by the plugin)
- `virtual:pwa-register/react` — React hook for SW registration + update prompt

## Architecture

```
vite.config.ts                              → VitePWA() plugin config (manifest, caching)
src/components/shared/pwa-reload-prompt.tsx  → Update notification (sonner toast)
src/routes/__root.tsx                        → PWA meta tags in head(), mounts PwaReloadPrompt
public/logo192.png                          → App icon 192x192
public/logo512.png                          → App icon 512x512 (also maskable)
```

The plugin generates these at build time (NOT in `public/`):
- `manifest.webmanifest` — Web app manifest
- `sw.js` — Service worker (Workbox generateSW)

## Manifest

Defined in `vite.config.ts` inside `VitePWA({ manifest: { ... } })`. Do NOT create a `public/manifest.json` — the plugin generates it.

```typescript
manifest: {
  name: 'Lernn',
  short_name: 'Lernn',
  description: 'Plateforme de gestion scolaire',
  start_url: '/',
  display: 'standalone',
  theme_color: '#00684A',
  background_color: '#FFFFFF',
  icons: [
    { src: '/logo192.png', sizes: '192x192', type: 'image/png' },
    { src: '/logo512.png', sizes: '512x512', type: 'image/png' },
    { src: '/logo512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
  ],
}
```

## Service Worker Registration

Registration uses `virtual:pwa-register/react` hook (SSR-safe):

```typescript
import { useRegisterSW } from 'virtual:pwa-register/react'

const {
  needRefresh: [needRefresh],
  updateServiceWorker,
} = useRegisterSW({
  onRegisteredSW(_swUrl, registration) {
    if (!registration) return
    // Check for updates every hour
    setInterval(() => registration.update(), 1000 * 60 * 60)
  },
})
```

- `registerType: 'prompt'` — User must confirm updates (via sonner toast)
- `injectRegister: null` — No auto-injection, the React hook handles it
- Hourly background check for new SW versions

## Caching Strategies

Configured in `vite.config.ts` under `workbox.runtimeCaching`:

| Pattern | Strategy | Cache Name | TTL |
|---------|----------|------------|-----|
| Static assets (JS, CSS, HTML, images) | Precache | workbox-precache | Build-time |
| Google Fonts (stylesheets) | CacheFirst | google-fonts-cache | 1 year |
| Google Fonts (font files) | CacheFirst | gstatic-fonts-cache | 1 year |
| API calls (`/api/*`) | NetworkFirst | api-cache | 24h, 10s timeout |

## Update Flow

1. User opens app → SW registers, caches assets
2. New deployment → Workbox detects new precache manifest
3. `needRefresh` becomes `true` → sonner toast appears
4. User clicks "Recharger" → `updateServiceWorker(true)` → page reloads with new version

## Adding New Caching Rules

Add entries to `workbox.runtimeCaching` in `vite.config.ts`:

```typescript
{
  urlPattern: /\/images\/.*/i,
  handler: 'CacheFirst',
  options: {
    cacheName: 'images-cache',
    expiration: { maxEntries: 50, maxAgeSeconds: 60 * 60 * 24 * 30 },
    cacheableResponse: { statuses: [0, 200] },
  },
}
```

Available handlers: `CacheFirst`, `NetworkFirst`, `StaleWhileRevalidate`, `NetworkOnly`, `CacheOnly`

## Meta Tags

PWA meta tags are in `__root.tsx` `head()`:

```typescript
meta: [
  { name: 'theme-color', content: '#00684A' },
  { name: 'apple-mobile-web-app-capable', content: 'yes' },
  { name: 'apple-mobile-web-app-status-bar-style', content: 'default' },
],
links: [
  { rel: 'manifest', href: '/manifest.webmanifest' },
  { rel: 'apple-touch-icon', href: '/logo192.png' },
],
```

## Rules

1. **MANIFEST** in `vite.config.ts` only — no `public/manifest.json`
2. **REGISTER** via `virtual:pwa-register/react` hook — no manual `navigator.serviceWorker`
3. **PROMPT** mode for updates — never auto-reload (user might be mid-action)
4. **API** calls use `NetworkFirst` — offline falls back to cached response
5. **STATIC** assets use precache — automatically versioned per build
6. **FONTS** use `CacheFirst` — they rarely change
7. **ICONS** must include 192x192 and 512x512 (one with `purpose: 'maskable'`)
8. **i18n** for update toast — use `m.pwa_update_*()` keys
9. **NO** `navigateFallback` — TanStack Start handles routing server-side
