# Component Rules

## Component Hierarchy

```
src/components/ui/         → shadcn/ui primitives (Button, Input, Card, Dialog, etc.)
src/components/form/       → Reusable form field wrappers
src/components/layout/     → App shell (AppSidebar, WorkspaceCard, NavProfile, AppHeader)
src/components/shared/     → Cross-feature components (DataTable, EmptyState, Skeleton)
src/components/brand/      → Lernn-specific compositions (Logo, KpiCard, GradeCell, PeriodSelector)
src/features/<name>/components/ → Feature-specific components
```

## shadcn/ui Usage (Radix UI primitives)

shadcn/ui components are built on top of **Radix UI** (`radix-ui` package) — headless, accessible primitives.

- Install: `pnpx shadcn@latest add <component>`
- Location: `src/components/ui/<component>.tsx`
- NEVER modify shadcn source files directly — extend via composition or wrapper components
- Available (to install as needed): Button, Input, Label, Card, Dialog, Drawer, Sheet, Table, Badge, Dropdown, Select, Tabs, Tooltip, Skeleton, Separator, Avatar, etc.

### Radix Rules
- **DO NOT** import from `@radix-ui/*` directly — always use the shadcn wrapper in `components/ui/`
- **DO NOT** install individual `@radix-ui/react-*` packages — use the bundled `radix-ui` package
- **ACCESSIBILITY**: Radix handles ARIA, focus management, keyboard nav — don't override with custom handlers
- **COMPOSITION**: Radix uses a Slot/asChild pattern — prefer `asChild` over wrapping with extra DOM nodes

## DataTable Pattern (TanStack Table)

Les listes de données utilisent TanStack Table via un composant `DataTable` réutilisable.

```typescript
// src/components/shared/data-table.tsx
import { flexRender, type Table as TTable } from '@tanstack/react-table'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '#/components/ui/table'

export function DataTable<T>({ table }: { table: TTable<T> }) {
  return (
    <Table>
      <TableHeader>
        {table.getHeaderGroups().map((hg) => (
          <TableRow key={hg.id}>
            {hg.headers.map((h) => (
              <TableHead key={h.id}>
                {flexRender(h.column.columnDef.header, h.getContext())}
              </TableHead>
            ))}
          </TableRow>
        ))}
      </TableHeader>
      <TableBody>
        {table.getRowModel().rows.map((row) => (
          <TableRow key={row.id}>
            {row.getVisibleCells().map((cell) => (
              <TableCell key={cell.id}>
                {flexRender(cell.column.columnDef.cell, cell.getContext())}
              </TableCell>
            ))}
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}
```

Voir le guide `tables.md` pour le pattern complet (colonnes, tri, pagination, filtres).

## Component Patterns

### Page Component (route-level)
```typescript
function StudentsPage() {
  const { data } = useSuspenseQuery(studentsQueryOptions(schoolId))

  return (
    <PageContainer title={m.title_students()} description={m.desc_students()}>
      <StudentsToolbar />
      <StudentsList students={data} />
    </PageContainer>
  )
}
```

### Feature Component
```typescript
export function StudentsList({ students }: { students: Student[] }) {
  if (students.length === 0) {
    return (
      <Empty>
        <EmptyHeader>
          <EmptyMedia>
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted text-muted-foreground">
              <Users className="h-5 w-5" />
            </div>
          </EmptyMedia>
          <EmptyTitle>{m.empty_no_students()}</EmptyTitle>
          <EmptyDescription>{m.empty_no_students_desc()}</EmptyDescription>
        </EmptyHeader>
        <EmptyContent>
          <Button size="sm">{m.action_add_student()}</Button>
        </EmptyContent>
      </Empty>
    )
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {students.map((s) => <StudentCard key={s.id} student={s} />)}
    </div>
  )
}
```

### Empty State avec avatar group (quand la donnée manquante représente des personnes)
```typescript
<Empty className="flex-1">
  <EmptyHeader>
    <EmptyMedia>
      <div className="flex -space-x-3">
        <Avatar className="size-12 ring-2 ring-background grayscale">
          <AvatarImage src="https://randomuser.me/api/portraits/women/44.jpg" alt="" />
          <AvatarFallback>P1</AvatarFallback>
        </Avatar>
        <Avatar className="size-12 ring-2 ring-background grayscale">
          <AvatarImage src="https://randomuser.me/api/portraits/men/32.jpg" alt="" />
          <AvatarFallback>P2</AvatarFallback>
        </Avatar>
      </div>
    </EmptyMedia>
    <EmptyTitle>{m.student_detail_no_parent()}</EmptyTitle>
    <EmptyDescription>{m.student_detail_no_parent_desc()}</EmptyDescription>
  </EmptyHeader>
</Empty>
```

> **Règle** : `EmptyMedia` est un conteneur neutre (`flex items-center justify-center`). C'est l'appelant qui décide du contenu : icône dans un cercle `bg-muted` ou groupe d'avatars superposés. Les cards qui contiennent un Empty doivent être `flex flex-col` avec `Empty className="flex-1"` pour que le contenu soit verticalement centré.

### Skeleton (Loading State)
```typescript
export function StudentsListSkeleton() {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: 6 }).map((_, i) => (
        <Card key={i}>
          <CardHeader>
            <Skeleton className="h-5 w-[200px]" />
            <Skeleton className="h-4 w-[150px]" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-4 w-full" />
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
```

## Rules

1. **NAMED EXPORTS ONLY**: `export function StudentCard()` — no `export default`
2. **PROPS OVER CONTEXT**: Pass data as props. Use context only for deeply shared state (auth, theme)
3. **NO PROP DRILLING >2 LEVELS**: If a prop passes through 3+ components, extract a context or restructure
4. **MAX 150 LINES**: Split large components into smaller sub-components
5. **COLOCATION**: Feature components live in their feature folder, NOT in global `components/`
6. **COMPOSITION**: Prefer composition (`children`, render props) over mega-components
7. **ACCESSIBILITY**: All interactive elements need accessible labels. Use Radix/shadcn primitives.
8. **RESPONSIVE**: Mobile-first. Test at 375px, 768px, 1024px, 1440px breakpoints.
9. **LOADING STATES**: Every async component MUST have a skeleton/pending state
10. **EMPTY STATES**: Every list/table/card MUST handle the empty case with the `Empty` compound component (`src/components/ui/empty.tsx`). Ne jamais laisser un conteneur vide sans feedback. Toujours : `Empty > EmptyHeader > EmptyMedia + EmptyTitle + EmptyDescription`.
11. **i18n**: NEVER hardcode user-facing strings — always use `m.key()` via Paraglide
12. **NO DUPLICATED HELPERS**: Les fonctions utilitaires auth/profile (`getProfileRoute`, `getProfileIcon`, `getUserInitials`, `getUserDisplayName`) vivent dans `features/auth/helpers.ts`. **JAMAIS** les recréer localement.
13. **NAVIGATION CONFIG CENTRALISÉE**: La configuration de navigation sidebar vit dans `features/workspace/navigation.ts` via `getNavSections()`. **JAMAIS** hardcoder des items de navigation dans les composants layout.
14. **WORKSPACE-ADAPTIVE COMPONENTS**: Les composants layout (`AppSidebar`) acceptent un `workspaceType` prop et s'adaptent. Ne pas créer de composants sidebar séparés par workspace.

## Icons (Lucide React)

`lucide-react` is the ONLY icon library allowed. Do NOT install `react-icons`, `heroicons`, or others.

```typescript
import { Users, Plus, Search, MoreHorizontal } from 'lucide-react'

// Size: match text size
<Users className="h-4 w-4" />       // Inline with text, sidebar items
<Users className="h-5 w-5" />       // In buttons, toolbar actions
<Users className="h-8 w-8" />       // Empty states, headers, page icons
```

### Rules
- **TREE-SHAKING**: Import individual icons, never `import * as Icons from 'lucide-react'`
- **SIZING**: Always set explicit `h-X w-X` classes — never rely on default size
- **COLOR**: Icons inherit `currentColor` — control via parent `text-*` class
- **STROKE**: Default stroke-width is 2. Don't override unless necessary
- **NAMING**: Icons use PascalCase: `ChevronLeft`, `MoreHorizontal`, `CalendarCheck`

## Sidebar Architecture (shadcn sidebar-07)

Le layout principal utilise le pattern **sidebar-07** de shadcn. L'`AppSidebar` s'adapte au type de workspace.

### Structure

```
SidebarProvider
├── AppSidebar (workspaceType)
│   ├── SidebarHeader
│   │   ├── LernnLogo
│   │   └── WorkspaceCard (label + subtitle)
│   ├── SidebarContent
│   │   └── NavSections (adapté au workspaceType)
│   ├── SidebarFooter
│   │   └── NavProfile (user info + profile switcher + logout)
│   └── SidebarRail
└── SidebarInset
    ├── AppHeader (breadcrumb + actions)
    └── <Outlet /> (page content)
```

### AppSidebar (`components/layout/app-sidebar.tsx`)

- Accepte un prop `workspaceType?: WorkspaceType` (default: `'school'`)
- Récupère les sections de navigation via `getNavSections(workspaceType)` depuis `features/workspace`
- Construit les liens dynamiquement : `/${params.schoolId}${item.path}` ou `/org/${params.orgId}${item.path}`
- **JAMAIS** de config de navigation hardcodée dans le sidebar — toujours via `getNavSections()`

### Navigation Config (`features/workspace/navigation.ts`)

La config de navigation est un registre centralisé. Pour ajouter un lien :

1. Ajouter l'item dans `SCHOOL_NAV` ou `ORG_NAV` dans `features/workspace/navigation.ts`
2. Ajouter la clé i18n dans `messages/fr.json` et `messages/en.json`
3. Créer le fichier route correspondant

```typescript
// features/workspace/navigation.ts
const SCHOOL_NAV: NavSection[] = [
  {
    label: () => m.nav_section_school(),
    items: [
      { label: () => m.nav_dashboard(), icon: LayoutDashboard, path: '/dashboard' },
      { label: () => m.nav_students(), icon: Users, path: '/students' },
      // Ajouter ici pour la section "Établissement"
    ],
  },
  // ... autres sections
]

export function getNavSections(workspace: WorkspaceType): NavSection[] {
  return workspace === 'org' ? ORG_NAV : SCHOOL_NAV
}
```

### WorkspaceCard (`components/layout/workspace-card.tsx`)

Composant pur qui affiche le contexte workspace actuel dans le `SidebarHeader` :
- Badge sombre avec initiales + nom de l'école/org + sous-titre (année scolaire)
- **Aucune logique** — juste de l'affichage. Les données viennent du parent.

### NavProfile (`components/layout/nav-profile.tsx`)

Footer du sidebar avec DropdownMenu :
- Affiche avatar + nom complet + email (via `getUserInitials`, `getUserDisplayName`)
- Section "Basculer vers" : liste les autres profils (filtrés par workspace actuel)
- Bouton logout
- **Importe** `getProfileIcon`, `getProfileRoute` depuis `features/auth/helpers` — **ne duplique JAMAIS** cette logique

### Workspace Feature Module (`features/workspace/`)

```
src/features/workspace/
├── types.ts          → WorkspaceType, NavItem, NavSection
├── navigation.ts     → SCHOOL_NAV, ORG_NAV, getNavSections()
└── index.ts          → Barrel exports
```

Règles :
- **TOUTE** la config de navigation vit ici — pas dans les composants layout
- Pour ajouter un workspace type, modifier `WorkspaceType` dans `types.ts` et ajouter un nouveau `*_NAV` dans `navigation.ts`
- Les items de navigation utilisent des fonctions `() => m.key()` pour le lazy loading i18n

## Modal/Drawer Pattern (Responsive)

```typescript
import { useMediaQuery } from '#/hooks/use-media-query'

export function StudentFormModal({ open, onOpenChange, student }) {
  const isDesktop = useMediaQuery('(min-width: 768px)')

  if (isDesktop) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent>
          <StudentForm student={student} onSuccess={() => onOpenChange(false)} />
        </DialogContent>
      </Dialog>
    )
  }

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent>
        <StudentForm student={student} onSuccess={() => onOpenChange(false)} />
      </DrawerContent>
    </Drawer>
  )
}
```
