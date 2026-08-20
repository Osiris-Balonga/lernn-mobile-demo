# State Management Rules

## State Categories

| Category | Tool | Example |
|----------|------|---------|
| Server state | TanStack Query | Students list, user session, dashboard stats |
| URL state | TanStack Router (search params) | Filters, pagination, active tab |
| URL context | TanStack Router (path params) | `$schoolId` (multitenancy), `$studentId` |
| Form state | TanStack Form | Input values, validation, dirty state |
| Ephemeral UI state | `useState` | Dialog open, tooltip visible |
| Shared UI state | TanStack Store | Sidebar collapsed, theme, notification count |
| Offline cache | TanStack React DB | Locally cached entities for offline |

## Decision Tree

```
"Where should I put this state?"

Is it the active school/workspace? → URL path param ($schoolId) — NEVER in session/store
Is it from the server? → TanStack Query (with schoolId in query key)
Is it in the URL? (filters, page) → Search params (Router)
Is it form input? → TanStack Form
Is it local to ONE component? → useState
Is it shared across multiple components? → TanStack Store
Does it need to survive page navigation? → URL or Store
Does it need offline persistence? → React DB
```

## Multitenancy — schoolId dans l'URL

Le `schoolId` DOIT être dans l'URL, JAMAIS dans un store ou en session.

Pourquoi :
- Multi-onglet safe : chaque onglet a son propre contexte school
- Si on stocke en session : ouvrir 2 écoles dans 2 onglets → le 2ème écrase le 1er
- L'URL rend chaque requête stateless

```
CORRECT :  /$schoolId/students → schoolId vient de Route.useParams()
INCORRECT : uiStore.activeSchoolId → écrasé par le dernier onglet
```

Le layout `_authed.$schoolId.tsx` extrait le param et l'injecte dans l'API client via `setSchoolIdGetter`.

## TanStack Store (Shared UI State)

Réservé aux états UI partagés entre composants qui ne sont PAS liés au serveur ni au routing.

```typescript
// src/stores/ui.store.ts
import { Store } from '@tanstack/store'

export const uiStore = new Store({
  sidebarCollapsed: false,
})

// In components:
import { useStore } from '@tanstack/react-store'

function Sidebar() {
  const collapsed = useStore(uiStore, (s) => s.sidebarCollapsed)

  return <aside className={cn('w-64', collapsed && 'w-16')}>...</aside>
}

// Update:
uiStore.setState((prev) => ({ ...prev, sidebarCollapsed: !prev.sidebarCollapsed }))
```

## Rules

1. **Server data belongs in Query** — NEVER copy query data into useState/store
2. **schoolId belongs in URL** — NEVER store in session, cookie, or TanStack Store
3. **URL is state** — Filters, pagination, selected tab = search params (shareable, bookmarkable)
4. **NO global state library** — No Redux, Zustand, Jotai, MobX. TanStack Store is enough.
5. **useState for ephemeral** — If it resets on unmount, `useState` is correct
6. **NEVER** lift state higher than necessary — keep it as close to usage as possible
7. **Derived state** — Compute from source, don't duplicate:
   ```typescript
   // WRONG: syncing query data to local state
   const [students, setStudents] = useState([])
   useEffect(() => { setStudents(queryData) }, [queryData])

   // RIGHT: use query data directly
   const { data: students } = useSuspenseQuery(studentsQueryOptions(schoolId))
   const activeStudents = students.filter(s => s.status === 'active') // derived
   ```

## URL State (Search Params)

Perfect for: filters, pagination, sorting, tabs, modal open state (deep-linkable)

```typescript
// Route definition
export const Route = createFileRoute('/_authed/$schoolId/students/')({
  validateSearch: z.object({
    page: z.number().default(1),
    limit: z.number().default(20),
    search: z.string().optional(),
    status: z.enum(['active', 'inactive', 'all']).default('all'),
  }),
})

// In component
function StudentsPage() {
  const { schoolId } = Route.useParams()
  const { page, search, status } = Route.useSearch()
  const navigate = Route.useNavigate()

  // Update search params (replaces URL, no full reload)
  const setPage = (p: number) => navigate({ search: { page: p } })
}
```
