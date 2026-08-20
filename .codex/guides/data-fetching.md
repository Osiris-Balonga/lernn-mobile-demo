# Data Fetching Rules (TanStack Query)

## Query Options Factory Pattern

All queries MUST be defined as reusable `queryOptions()` factories in `features/<name>/queries.ts`:

```typescript
import { queryOptions } from '@tanstack/react-query'
import { apiClient } from '#/lib/api-client'
import type { Student, StudentFilters } from './types'

export const studentsQueryOptions = (schoolId: string, filters?: StudentFilters) =>
  queryOptions({
    queryKey: ['students', schoolId, filters],
    queryFn: () => apiClient.get<Student[]>('/students', { params: filters }),
    staleTime: 2 * 60 * 1000,
  })

export const studentQueryOptions = (schoolId: string, id: string) =>
  queryOptions({
    queryKey: ['students', schoolId, id],
    queryFn: () => apiClient.get<Student>(`/students/${id}`),
  })
```

## Cloisonnement du cache par schoolId

TOUJOURS inclure le `schoolId` dans les query keys pour cloisonner les données par école. Sans ça, changer d'école afficherait les données de l'ancienne école en cache.

```typescript
// CORRECT — cloisonné par école
queryKey: ['students', schoolId, filters]

// INCORRECT — mélange les données entre écoles
queryKey: ['students', filters]
```

Exception : les queries globales (auth, profiles) qui ne sont pas liées à une école :
```typescript
queryKey: ['auth', 'session']    // pas de schoolId
queryKey: ['auth', 'profiles']   // pas de schoolId
```

## Cache Configuration

| Data Type | staleTime | gcTime | Refetch |
|-----------|-----------|--------|---------|
| Lists (students, payments) | 2 min | 30 min | On window focus |
| Single entity | 5 min | 30 min | On window focus |
| Config/Settings | 30 min | 60 min | Manual only |
| Dashboard stats | 1 min | 5 min | On window focus |
| Auth/Session | Infinity | Infinity | Manual only |

## Mutations Pattern

```typescript
import { useMutation, useQueryClient } from '@tanstack/react-query'

export function useCreateStudent(schoolId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: CreateStudentInput) =>
      apiClient.post<Student>('/students', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['students', schoolId] })
    },
  })
}
```

## Intégration avec TanStack Table

Pour les listes paginées qui utilisent TanStack Table, le pattern combine query + table :

```typescript
// La query gère le fetch, la table gère l'affichage
const { data } = useSuspenseQuery(studentsQueryOptions(schoolId, { page, limit, search }))

const table = useReactTable({
  data: data.data,
  columns,
  pageCount: data.meta.pageCount,
  manualPagination: true,
  // ... voir guide tables.md pour le détail
})
```

Voir le guide `tables.md` pour le pattern complet DataTable.

## Rules

1. **NEVER** fetch in `useEffect` — always use `useQuery`/`useSuspenseQuery`
2. **NEVER** store server data in local state — Query IS the cache
3. **ALWAYS** invalidate related queries after mutations
4. **ALWAYS** define query keys as arrays, most-specific last: `['students', schoolId, id, 'grades']`
5. **ALWAYS** include `schoolId` in query keys for school-scoped data
6. **PREFER** `useSuspenseQuery` in route components (loader handles loading state)
7. **USE** `useQuery` only when you need conditional fetching (`enabled: false`)
8. **NEVER** use `queryClient.fetchQuery` in components — it doesn't subscribe to updates

## Optimistic Updates

For instant UX on mutations:

```typescript
useMutation({
  mutationFn: updateStudent,
  onMutate: async (newData) => {
    await queryClient.cancelQueries({ queryKey: ['students', schoolId, id] })
    const previous = queryClient.getQueryData(['students', schoolId, id])
    queryClient.setQueryData(['students', schoolId, id], newData)
    return { previous }
  },
  onError: (_, __, context) => {
    queryClient.setQueryData(['students', schoolId, id], context?.previous)
  },
  onSettled: () => {
    queryClient.invalidateQueries({ queryKey: ['students', schoolId, id] })
  },
})
```

## Server Functions (SSR Data)

For data that needs server-side access (cookies, secrets):

```typescript
import { createServerFn } from '@tanstack/react-start'

export const getSchoolContext = createServerFn({ method: 'GET' })
  .validator(z.object({ schoolId: z.string().uuid() }))
  .handler(async ({ data }) => {
    // Server-only: read cookies, call internal APIs
    return fetchSchoolData(data.schoolId)
  })
```

Use in route loaders:
```typescript
loader: async ({ params }) => {
  return getSchoolContext({ data: { schoolId: params.schoolId } })
}
```
