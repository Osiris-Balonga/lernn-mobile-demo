# API Integration Rules

## API Client

A centralized fetch wrapper at `src/lib/api-client.ts` handles:
- Base URL resolution (`/api` prefix)
- `X-School-Context` header injection (from current route param `$schoolId`)
- Cookie-based auth (credentials: 'include')
- Error parsing (RFC 7807 format)
- Response unwrapping

```typescript
// src/lib/api-client.ts
const apiClient = {
  get<T>(path: string, options?: RequestOptions): Promise<T>
  post<T>(path: string, body: unknown, options?: RequestOptions): Promise<T>
  patch<T>(path: string, body: unknown, options?: RequestOptions): Promise<T>
  delete(path: string, options?: RequestOptions): Promise<void>
}

export { apiClient }
```

## Multitenancy — X-School-Context

Le `schoolId` est porté par l'URL (`/$schoolId/...`), PAS par la session.

Le layout `_authed.$schoolId.tsx` appelle `setSchoolIdGetter(() => params.schoolId)` au `beforeLoad`. Ensuite, TOUTES les requêtes via `apiClient` incluent automatiquement le header `X-School-Context`.

Pourquoi l'URL et pas la session :
- Multi-onglet safe : chaque onglet a son propre schoolId dans l'URL
- HTTP stateless : la requête porte son propre contexte
- Cache cloisonné : les query keys incluent le schoolId → pas de mélange de données

Pour les appels qui ne sont PAS dans un contexte school (ex: `/auth/me/profiles`), passer `schoolId: undefined` ou ne pas passer de schoolId :
```typescript
apiClient.get('/auth/me/profiles') // pas de X-School-Context
```

## Locale pour l'API backend

Le backend lernn-api supporte `?locale=fr` ou `?locale=en` (query param) et le header `Accept-Language` pour les réponses localisées (messages d'erreur, emails, etc.).

**Règle** : les messages d'erreur sont localisés **côté backend**, PAS côté frontend. Ne JAMAIS mapper un status HTTP à une clé i18n frontend pour les erreurs API. Afficher `ApiError.detail` directement — le backend renvoie déjà le bon message dans la bonne langue si on passe `locale`.

Passer la locale dans les options pour tout appel API dont la réponse contient des messages user-facing (erreurs, emails, labels) :
```typescript
import { getLocale } from '#/paraglide/runtime'

// Login — le backend renvoie "Email ou mot de passe incorrect." en FR
apiClient.post('/auth/login', data, {
  params: { locale: getLocale() },
})

// Création étudiant — les erreurs de validation sont localisées
apiClient.post('/students', data, {
  params: { locale: getLocale() },
})
```

**Anti-pattern** — NE PAS FAIRE :
```typescript
// ❌ MAUVAIS : dupliquer la traduction côté frontend
{error.status === 401 ? m.login_error_invalid() : m.error_generic()}

// ✅ BON : afficher le message localisé du backend
{error instanceof ApiError ? error.detail : m.login_error_generic()}
```

## Backend API Shape

The lernn-api returns:
- **Success**: `{ data: T }` or `{ data: T[], meta: { total, page, limit } }`
- **Error**: RFC 7807 `{ type, title, status, detail, instance }`

## Endpoint Mapping

Map features to API endpoints:

| Feature | Endpoints | Notes |
|---------|-----------|-------|
| Auth | `POST /auth/login`, `GET /auth/me`, `POST /auth/logout` | Cookie-based |
| Profiles | `GET /auth/me/profiles` | No school context |
| Students | `GET/POST /students`, `GET/PATCH/DELETE /students/:id` | Paginated list |
| Class Groups | `GET/POST /class-groups`, `GET/PATCH /class-groups/:id` | With teachers |
| Evaluations | `GET/POST /evaluations`, grades CRUD | Period-scoped |
| Payments | `GET/POST /payments`, installments, receipts | With stats |
| Presence | `GET/POST /presence`, daily records, stats | Date-scoped |
| Cards | `GET/POST /cards`, lifecycle events, orders | Status machine |
| Schedules | `GET /schedules` (view only in v1) | Read-only |
| School Years | `GET/POST /school-years`, periods | Config |
| Dashboard | `GET /dashboards/management` | Aggregated stats |

## Rules

1. **NEVER** call `fetch()` directly in components — always go through `apiClient`
2. **ALWAYS** type API responses with interfaces matching the backend DTOs
3. **HANDLE** pagination via query params: `?page=1&limit=20&search=...`
4. **HANDLE** errors globally in apiClient, show toast for user-facing errors
5. **USE** query key factories that include all filter/pagination params
6. **NEVER** hardcode API URLs — use the path constants or the apiClient methods
7. **INCLUDE** `schoolId` dans les query keys pour cloisonner le cache par école

## Error Handling

```typescript
// API errors bubble up as ApiError instances
class ApiError extends Error {
  status: number
  detail: string
  type: string
}

// In mutations:
useMutation({
  mutationFn: createStudent,
  onError: (error) => {
    if (error instanceof ApiError) {
      toast.error(error.detail)
    }
  },
})
```

## Pagination Pattern

```typescript
// Query options with pagination — schoolId in query key
export const studentsQueryOptions = (schoolId: string, params: { page: number; limit: number; search?: string }) =>
  queryOptions({
    queryKey: ['students', schoolId, params],
    queryFn: () => apiClient.get<PaginatedResponse<Student>>('/students', { params }),
  })

// Type
interface PaginatedResponse<T> {
  data: T[]
  meta: { total: number; page: number; limit: number; pageCount: number }
}
```
