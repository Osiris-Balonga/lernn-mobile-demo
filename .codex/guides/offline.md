# Offline & Local DB (TanStack React DB)

## Packages

- `@tanstack/react-db` — reactive local collections with schema validation
- `@tanstack/query-db-collection` — bridge between TanStack Query cache and local DB collections

## Architecture

```
src/db-collections/           → Collection definitions (schemas + config)
src/db-collections/index.ts   → Barrel export for all collections
```

## Defining a Collection

```typescript
import { createCollection, localOnlyCollectionOptions } from '@tanstack/react-db'
import { z } from 'zod'

const StudentSchema = z.object({
  id: z.string(),
  firstName: z.string(),
  lastName: z.string(),
  classGroupId: z.string(),
  status: z.enum(['active', 'inactive', 'transferred']),
})

export type Student = z.infer<typeof StudentSchema>

export const studentsCollection = createCollection(
  localOnlyCollectionOptions({
    getKey: (student) => student.id,
    schema: StudentSchema,
  }),
)
```

## Reading from a Collection

```typescript
import { useCollection } from '@tanstack/react-db'
import { studentsCollection } from '#/db-collections'

function StudentsList() {
  const students = useCollection(studentsCollection)

  return (
    <ul>
      {students.map((s) => <li key={s.id}>{s.firstName} {s.lastName}</li>)}
    </ul>
  )
}
```

## Writing to a Collection

```typescript
import { studentsCollection } from '#/db-collections'

// Insert
studentsCollection.insert({ id: '1', firstName: 'John', lastName: 'Doe', classGroupId: 'cg1', status: 'active' })

// Update
studentsCollection.update('1', (prev) => ({ ...prev, status: 'inactive' }))

// Delete
studentsCollection.delete('1')
```

## Syncing with TanStack Query

Use `@tanstack/query-db-collection` to hydrate collections from server queries:

```typescript
import { createQueryDbCollection } from '@tanstack/query-db-collection'
import { studentsQueryOptions } from '#/features/students/queries'

export const studentsDbCollection = createQueryDbCollection({
  collection: studentsCollection,
  queryOptions: (schoolId: string) => studentsQueryOptions(schoolId),
  select: (response) => response.data,
})
```

## Filtering & Sorting

```typescript
import { useCollection } from '@tanstack/react-db'
import { studentsCollection } from '#/db-collections'

function ActiveStudents({ classGroupId }: { classGroupId: string }) {
  const students = useCollection(studentsCollection, {
    filter: (s) => s.status === 'active' && s.classGroupId === classGroupId,
    sort: (a, b) => a.lastName.localeCompare(b.lastName),
  })

  return <StudentsList students={students} />
}
```

## Rules

1. **SCHEMA REQUIRED**: Every collection must have a Zod schema for runtime validation
2. **COLLECTIONS** are app-wide singletons — define in `src/db-collections/`, export from index
3. **USE** `localOnlyCollectionOptions` for offline-first data (no server sync needed)
4. **USE** `createQueryDbCollection` when data must stay in sync with server (TanStack Query bridge)
5. **NEVER** store sensitive data (tokens, passwords) in collections — they persist in browser
6. **KEY FUNCTION**: `getKey` must return a unique, stable identifier
7. **IMMUTABLE UPDATES**: `update()` callback receives previous value, return new object
8. **REACTIVE**: `useCollection` re-renders when collection data changes — no manual refresh needed
