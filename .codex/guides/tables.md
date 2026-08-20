# Tables Rules (TanStack Table)

## Quand utiliser TanStack Table

- Listes de données avec colonnes, tri, pagination, filtres
- Ex: liste élèves, paiements, évaluations, présences, cartes

Ne PAS utiliser pour des listes simples (ex: liste de notifications) — un simple `.map()` suffit.

## Architecture

```
src/components/shared/data-table.tsx     → Composant générique DataTable
src/features/<name>/components/columns.tsx → Définitions de colonnes par feature
```

## Définition des colonnes

Les colonnes sont définies dans `features/<name>/components/columns.tsx` :

```typescript
import { createColumnHelper } from '@tanstack/react-table'
import { Badge } from '#/components/ui/badge'
import { GradeCell } from '#/components/brand'
import * as m from '#/paraglide/messages'
import type { Student } from '../types'

const col = createColumnHelper<Student>()

export const studentColumns = [
  col.accessor('lastName', {
    header: () => m.col_last_name(),
    cell: (info) => <span className="font-medium">{info.getValue()}</span>,
  }),
  col.accessor('firstName', {
    header: () => m.col_first_name(),
  }),
  col.accessor('classGroup.name', {
    header: () => m.col_class(),
  }),
  col.accessor('status', {
    header: () => m.col_status(),
    cell: (info) => <Badge variant={info.getValue() === 'active' ? 'success' : 'neutral'}>{info.getValue()}</Badge>,
  }),
  col.accessor('average', {
    header: () => m.col_average(),
    cell: (info) => info.getValue() != null ? <GradeCell value={info.getValue()!} /> : '—',
  }),
]
```

## Pattern DataTable complet

### Composant DataTable réutilisable

```typescript
// src/components/shared/data-table.tsx
import { flexRender, type Table as TTable } from '@tanstack/react-table'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '#/components/ui/table'
import { Skeleton } from '#/components/ui/skeleton'

export function DataTable<T>({ table }: { table: TTable<T> }) {
  return (
    <div className="overflow-x-auto rounded-lg border border-border">
      <Table>
        <TableHeader>
          {table.getHeaderGroups().map((hg) => (
            <TableRow key={hg.id}>
              {hg.headers.map((h) => (
                <TableHead key={h.id}>
                  {h.isPlaceholder ? null : flexRender(h.column.columnDef.header, h.getContext())}
                </TableHead>
              ))}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>
          {table.getRowModel().rows.length === 0 ? (
            <TableRow>
              <TableCell colSpan={table.getAllColumns().length} className="h-24 text-center text-text-secondary">
                {m.empty_no_results()}
              </TableCell>
            </TableRow>
          ) : (
            table.getRowModel().rows.map((row) => (
              <TableRow key={row.id}>
                {row.getVisibleCells().map((cell) => (
                  <TableCell key={cell.id}>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  )
}

export function DataTableSkeleton({ columns, rows = 5 }: { columns: number; rows?: number }) {
  return (
    <div className="overflow-x-auto rounded-lg border border-border">
      <Table>
        <TableHeader>
          <TableRow>
            {Array.from({ length: columns }).map((_, i) => (
              <TableHead key={i}><Skeleton className="h-4 w-20" /></TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {Array.from({ length: rows }).map((_, i) => (
            <TableRow key={i}>
              {Array.from({ length: columns }).map((_, j) => (
                <TableCell key={j}><Skeleton className="h-4 w-full" /></TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
```

### Utilisation dans une page

```typescript
import { useReactTable, getCoreRowModel } from '@tanstack/react-table'
import { useSuspenseQuery } from '@tanstack/react-query'
import { DataTable } from '#/components/shared/data-table'
import { studentsQueryOptions } from '../queries'
import { studentColumns } from './columns'

export function StudentsTable({ schoolId }: { schoolId: string }) {
  const { page, limit, search } = Route.useSearch()
  const { data } = useSuspenseQuery(studentsQueryOptions(schoolId, { page, limit, search }))

  const table = useReactTable({
    data: data.data,
    columns: studentColumns,
    pageCount: data.meta.pageCount,
    manualPagination: true,
    getCoreRowModel: getCoreRowModel(),
    state: {
      pagination: { pageIndex: page - 1, pageSize: limit },
    },
  })

  return <DataTable table={table} />
}
```

## Pagination côté serveur

La pagination est TOUJOURS gérée côté serveur (manualPagination). Le frontend :
1. Envoie `?page=X&limit=Y` via les search params de l'URL
2. Reçoit `{ data: T[], meta: { total, page, limit, pageCount } }`
3. Passe `pageCount` à TanStack Table

```typescript
// Composant pagination
import { Button } from '#/components/ui/button'
import { ChevronLeft, ChevronRight } from 'lucide-react'

export function DataTablePagination<T>({ table }: { table: TTable<T> }) {
  const navigate = Route.useNavigate()

  return (
    <div className="flex items-center justify-between px-2 py-4">
      <p className="text-sm text-text-secondary">
        {m.pagination_info({ page: table.getState().pagination.pageIndex + 1, total: table.getPageCount() })}
      </p>
      <div className="flex gap-2">
        <Button
          variant="outline"
          size="sm"
          disabled={!table.getCanPreviousPage()}
          onClick={() => navigate({ search: (prev) => ({ ...prev, page: table.getState().pagination.pageIndex }) })}
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <Button
          variant="outline"
          size="sm"
          disabled={!table.getCanNextPage()}
          onClick={() => navigate({ search: (prev) => ({ ...prev, page: table.getState().pagination.pageIndex + 2 }) })}
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}
```

## Tri côté serveur

Si la table supporte le tri, passer `sort` et `order` en search params :

```typescript
validateSearch: z.object({
  page: z.number().default(1),
  limit: z.number().default(20),
  sort: z.string().optional(),
  order: z.enum(['asc', 'desc']).default('asc'),
})
```

## Client-Side Fuzzy Search (match-sorter-utils)

Pour les petites listes déjà chargées (ex: dropdown de sélection, filtrage local), utiliser `@tanstack/match-sorter-utils` :

```typescript
import { rankItem } from '@tanstack/match-sorter-utils'
import { filterFns } from '@tanstack/react-table'

// Custom fuzzy filter function
const fuzzyFilter = (row, columnId, value, addMeta) => {
  const itemRank = rankItem(row.getValue(columnId), value)
  addMeta({ itemRank })
  return itemRank.passed
}

// Usage in table config
const table = useReactTable({
  data,
  columns,
  filterFns: { fuzzy: fuzzyFilter },
  globalFilterFn: 'fuzzy',
  getCoreRowModel: getCoreRowModel(),
  getFilteredRowModel: getFilteredRowModel(),
  getSortedRowModel: getSortedRowModel(),
})
```

**Quand utiliser** :
- Combobox / autocomplete avec données locales
- Filtrage client d'une liste < 100 items déjà chargée
- **JAMAIS** pour remplacer la recherche serveur sur les DataTables paginées

## Rules

1. **TOUJOURS** pagination côté serveur (manualPagination) — jamais charger toutes les données
2. **COLONNES** définies dans un fichier séparé `columns.tsx` par feature
3. **i18n** : les headers de colonnes utilisent `m.col_xxx()` — jamais de strings hardcodées
4. **SKELETON** : chaque DataTable a un `DataTableSkeleton` correspondant
5. **EMPTY STATE** : géré dans le DataTable (row "aucun résultat")
6. **RESPONSIVE** : wrapper `overflow-x-auto` pour scroll horizontal sur mobile
7. **SEARCH PARAMS** : pagination et tri dans l'URL (deep-linkable, bookmarkable)
8. **QUERY KEY** : inclure schoolId + tous les params (page, limit, search, sort, order)
9. **FUZZY SEARCH** : `match-sorter-utils` pour filtrage client uniquement (listes courtes, combobox)
