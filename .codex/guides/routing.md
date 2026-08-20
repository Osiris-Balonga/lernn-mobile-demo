# Routing Rules (TanStack Router + Start)

## File-Based Routing

Routes are auto-generated from `src/routes/`. The generated tree lives in `src/routeTree.gen.ts` — NEVER edit it manually.

## Route File Requirements

Every route file MUST:
1. Export `Route` via `createFileRoute(path)({ ... })`
2. Use the exact path string that matches its file location
3. Define `component` (and optionally `errorComponent`, `pendingComponent`)

```typescript
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_authed/$schoolId/students/')({
  loader: ({ context: { queryClient } }) =>
    queryClient.ensureQueryData(studentsQueryOptions()),
  component: StudentsPage,
  pendingComponent: () => <StudentsSkeleton />,
  errorComponent: ({ error }) => <RouteError error={error} />,
})
```

## Layout Routes

- Prefix with `_` for pathless layouts: `_authed.tsx` (doesn't add URL segment)
- Must render `<Outlet />` for child routes
- Use `beforeLoad` for guards (auth, permissions)

```typescript
// _authed.tsx — protects all child routes
export const Route = createFileRoute('/_authed')({
  beforeLoad: async () => {
    const session = await getSession()
    if (!session) throw redirect({ to: '/login' })
  },
  component: AuthedLayout,
})
```

## Multitenancy — schoolId dans l'URL

Le `schoolId` est TOUJOURS dans l'URL (`/$schoolId/...`), JAMAIS en session ou en store global.

Pourquoi :
- Un utilisateur peut ouvrir plusieurs écoles dans des onglets différents
- Si le schoolId est en session, un onglet écrase le contexte de l'autre
- L'URL rend chaque requête HTTP stateless — le client indique le workspace cible

```
/_authed/$schoolId/dashboard     → gestion d'une école
/_authed/$schoolId/students      → élèves de cette école
/_authed/personal/...            → espace personnel (pas de schoolId)
/_authed/org/$orgId/...          → espace organisation
```

Le layout `_authed.$schoolId.tsx` :
1. Extrait `schoolId` des params
2. Injecte le getter dans l'API client (`setSchoolIdGetter`)
3. Enveloppe les enfants avec le shell (sidebar + header)

Le backend vérifie systématiquement que l'utilisateur a accès au school demandé via le header `X-School-Context`.

## i18n — Locale dans l'URL

Paraglide JS gère la locale via la stratégie `['url', 'baseLocale']` :
- Locale de base (`fr`) : pas de prefix → `/dashboard`, `/students`
- Autre locale (`en`) : prefix → `/en/dashboard`, `/en/students`

Paraglide gère automatiquement le rewriting. Le `<Link>` de TanStack Router fonctionne normalement — Paraglide intercepte la navigation.

Pour les appels API backend qui ont besoin de la locale (emails, messages localisés), passer `?locale=fr` ou `?locale=en` en query param. Voir le guide `api-integration.md`.

## Data Loading

- **ALWAYS** load data in `route.loader` for SSR support
- Use `queryClient.ensureQueryData()` in loaders (not `fetchQuery`)
- Access loader data via `useSuspenseQuery` in components (deduped automatically)
- NEVER fetch data in `useEffect` — use query hooks instead

## Dynamic Segments

- `$schoolId` → `Route.useParams()` gives `{ schoolId: string }`
- Validate params with Zod in `params` option if needed:
  ```typescript
  params: { parse: (p) => ({ schoolId: z.string().uuid().parse(p.schoolId) }) }
  ```

## Search Params (Filters, Pagination)

- Define with `validateSearch` using Zod:
  ```typescript
  validateSearch: z.object({
    page: z.number().default(1),
    search: z.string().optional(),
  })
  ```
- Access via `Route.useSearch()`
- Update via `navigate({ search: { page: 2 } })`

## Workspace Routing

L'app supporte deux types de workspace, chacun avec son layout et sa navigation :

| Workspace | Route pattern | Layout route | Sidebar |
|-----------|---------------|--------------|---------|
| School | `/_authed/$schoolId/...` | `_authed.$schoolId.tsx` | `<AppSidebar workspaceType="school" />` |
| Organization | `/_authed/org/$orgId/...` | `_authed.org.$orgId.tsx` | `<AppSidebar workspaceType="org" />` |

Chaque layout workspace :
1. Rend `<SidebarProvider>` + `<AppSidebar workspaceType={type} />` + `<SidebarInset>` + `<Outlet />`
2. L'`AppSidebar` adapte automatiquement la navigation selon le `workspaceType`

```typescript
// _authed.org.$orgId.tsx
export const Route = createFileRoute('/_authed/org/$orgId')({
  component: OrgLayout,
})

function OrgLayout() {
  return (
    <SidebarProvider>
      <AppSidebar workspaceType="org" />
      <SidebarInset>
        <Outlet />
      </SidebarInset>
    </SidebarProvider>
  )
}
```

## Auth Flow — Login → Profile → Workspace

Le flux d'authentification suit toujours cette séquence :

```
Login → API /auth/login → profileCount > 1 ? → /select-profile
                         → profileCount === 1 ? → redirect direct vers workspace
```

### Profile-Based Routing (`getProfileRoute`)

**TOUTE** la logique de redirection basée sur un profil passe par `getProfileRoute()` dans `features/auth/helpers.ts`. C'est la **source unique de vérité** pour le mapping Profile → Route.

```typescript
import { getProfileRoute } from '#/features/auth/helpers'

const route = getProfileRoute(profile)
navigate({ to: route.to as '/', params: route.params })
```

Règles :
- **JAMAIS** de logique de routing inline basée sur le type/rôle d'un profil
- **JAMAIS** de duplication de la logique `if schoolId → school, if orgRole → org` dans plusieurs fichiers
- **TOUJOURS** utiliser `getProfileRoute()` — dans `useLogin`, `select-profile`, `nav-profile`, et partout ailleurs
- Si un nouveau type de workspace est ajouté, **un seul fichier** à modifier : `auth/helpers.ts`

### Select Profile Page

La page `/select-profile` :
1. Charge les profils via `profilesQueryOptions()`
2. Affiche chaque profil avec `getProfileIcon(profile)` pour l'icône
3. Au clic, redirige via `getProfileRoute(profile)`

### Auth Helpers — Source Unique (`features/auth/helpers.ts`)

Ces 4 fonctions sont exportées depuis `features/auth` et réutilisées partout :

| Fonction | Usage |
|----------|-------|
| `getProfileRoute(profile)` | Mapping Profile → `{ to, params }` |
| `getProfileIcon(profile)` | Mapping Profile → icône Lucide |
| `getUserInitials(first, last)` | Initiales pour Avatar |
| `getUserDisplayName(first, last, fallback)` | Nom complet ou fallback |

**JAMAIS** dupliquer ces fonctions. Toujours importer depuis `#/features/auth/helpers`.

## Navigation

- Use `<Link to="..." />` for declarative navigation
- Use `useNavigate()` for programmatic navigation
- Always use type-safe paths: `<Link to="/$schoolId/students" params={{ schoolId }} />`
- Preloading is enabled by default (`defaultPreload: 'intent'`)
