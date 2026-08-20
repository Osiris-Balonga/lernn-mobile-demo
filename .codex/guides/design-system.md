# Design System — Émeraude (Lernn)

Lis ce guide **avant** de créer ou modifier un composant UI, une page, ou tout élément visuel.
Source autoritaire : `C:\Users\Lenovo\Downloads\Lernn Design System` + `claudedocs/DESIGN.md`.

---

## 1. Identité de marque

- **Wordmark** : `Lernn.` — "Lernn" en `--brand-dark` (`#00684A`), point en `--brand` (`#00ED64`). Toujours avec le point. Jamais "LERNN" ou "lernn".
- **Poids** : DM Sans 800, letter-spacing -0.5px.
- **Sur fond sombre** : "Lernn" en blanc, le point reste vert.
- **Pas d'icône séparée** — le point vert EST la marque.

---

## 2. Palette de couleurs

### Brand
| Token CSS          | Hex       | Classe Tailwind          | Usage |
|--------------------|-----------|--------------------------|-------|
| `--brand`          | `#00ED64` | `text-brand` / `bg-brand` | CTA principal, états actifs, le point du logo |
| `--brand-dark`     | `#00684A` | `text-brand-dark`        | Liens, nav active, texte sur fond brand-soft |
| `--brand-soft`     | `#E3FCF7` | `bg-brand-soft`          | Cards featured, highlights doux |
| `--brand-on`       | `#001E2B` | `text-brand-on`          | Texte sur fond brand |

### Surfaces
| Token CSS              | Hex       | Usage |
|------------------------|-----------|-------|
| `--canvas`             | `#FFFFFF` | Page & fond de card |
| `--canvas-alt`         | `#F7F8FA` | Lignes alternées, sections subtiles |
| `--surface`            | `#F9FBFA` | En-têtes de table, fills discrets |
| `--surface-feature`    | `#E3FCF7` | Cards promoted |
| `--hero-bg`            | `#001E2B` | Bands hero sombres |

### Texte
| Token CSS               | Hex       | Classe Tailwind            |
|-------------------------|-----------|----------------------------|
| `--text`                | `#001E2B` | `text-foreground`          |
| `--text-body`           | `#1C2D38` | `text-foreground`          |
| `--text-secondary`      | `#5C6C75` | `text-muted-foreground`    |
| `--text-muted`          | `#889397` | `text-muted-foreground`    |
| `--text-placeholder`    | `#B8C4C2` | `placeholder:text-...`     |

### Bordures
| Token CSS          | Hex       | Classe Tailwind   |
|--------------------|-----------|-------------------|
| `--border`         | `#E8EDEB` | `border-border`   |
| `--border-strong`  | `#C1C7C6` | `border-input`    |

### Sémantique
| Status  | Texte     | Fond      | Classe Badge Tailwind                        |
|---------|-----------|-----------|----------------------------------------------|
| Success | `#00684A` | `#E3FCF7` | `variant="success"` dans `<Badge>`           |
| Warning | `#C76C17` | `#FEF5E8` | `variant="warning"` dans `<Badge>`           |
| Danger  | `#CF4A22` | `#FCEEE8` | `variant="destructive"` dans `<Badge>`       |
| Neutral | `#5C6C75` | `#F0F2F1` | `variant="neutral"` dans `<Badge>`           |
| Brand   | `#00ED64` | `#001E2B` | `variant="brand"` dans `<Badge>`             |

**Hiérarchie statuts de paiement** (convention Lernn) :
- Payé → `success` (vert) — situation idéale
- Partiel → `warning` (orange) — en cours, quelque chose a été payé
- En attente → `warning` (orange) — rien payé, action requise
- `neutral` (gris) réservé aux statuts sans connotation d'urgence (ex : archivé, inactif)

### Encodage Catégorie (domaines scolaires)
| Domaine   | Hex       | Classe Tailwind     | Usage |
|-----------|-----------|---------------------|-------|
| Academic  | `#006DC6` | `bg-cat-academic`   | Bordure top 4px, tag |
| Finance   | `#C76C17` | `bg-cat-finance`    | Bordure top 4px, tag |
| Presence  | `#00684A` | `bg-cat-presence`   | Bordure top 4px, tag |
| Admin     | `#6C40BF` | `bg-cat-admin`      | Bordure top 4px, tag |

### Encodage Rôle
| Rôle      | Texte     | Fond      | Variant Badge              |
|-----------|-----------|-----------|----------------------------|
| Director  | `#6C40BF` | `#F1EBFF` | `variant="director"`       |
| Teacher   | `#006DC6` | `#E1F1FF` | `variant="teacher"`        |
| Parent    | `#C76C17` | `#FEF5E8` | `variant="parent"`         |
| Student   | `#00684A` | `#E3FCF7` | `variant="student"`        |
| Staff     | `#5C6C75` | `#F0F2F1` | `variant="staff"`          |

### Encodage Notes (/20)
| Plage     | Texte     | Fond      | Variant Badge       |
|-----------|-----------|-----------|---------------------|
| ≥ 14/20   | `#00684A` | `#E3FCF7` | `variant="grade-good"` |
| 10–13.9   | `#C76C17` | `#FEF5E8` | `variant="grade-mid"`  |
| < 10/20   | `#CF4A22` | `#FCEEE8` | `variant="grade-bad"`  |

---

## 3. Typographie

**Polices** :
- **Corps + titres** : `DM Sans` (400/500/600/700/800)
- **Nombres, montants, IDs, notes** : `JetBrains Mono` — toujours avec `tabular-nums`

**Échelle** :

| Niveau    | Taille                    | Poids | Tracking  | Line-h |
|-----------|---------------------------|-------|-----------|--------|
| Display   | `clamp(32px, 5vw, 52px)` | 700   | -1px      | 1.1    |
| H1        | 28px                      | 700   | -1px      | 1.1    |
| H2        | 20px                      | 600   | -0.3px    | 1.1    |
| H3        | 16px                      | 600   | 0         | 1.1    |
| Body      | 14px                      | 400   | 0         | 1.5    |
| Caption   | 12px                      | 400   | 0         | 1.4    |
| Eyebrow   | 11px                      | 600   | 1.5px, uppercase | — |
| Button    | 14px                      | 600   | 0         | —      |
| Mono      | 14px                      | 500   | 0         | —      |

**Règles Tailwind** :
```tsx
// Eyebrow (section header)
<p className="text-[11px] font-semibold uppercase tracking-[1.5px] text-muted-foreground">

// Body principal
<p className="text-[14px] text-foreground">

// Valeur numérique (toujours mono)
<span className="font-mono tabular-nums text-foreground">

// Caption / méta info
<p className="text-[12px] text-muted-foreground">
```

---

## 4. Radii — règles strictes

| Élément               | Radius     | Classe Tailwind      |
|-----------------------|------------|----------------------|
| Bouton / Badge statut | `9999px`   | `rounded-full`       |
| Card / Surface        | `12px`     | `rounded-xl`         |
| Input                 | `8px`      | `rounded-lg`         |
| Tag catégorie         | `4px`      | `rounded-[4px]`      |
| Cellule note          | `6px`      | `rounded-[6px]`      |

**Règle absolue** : boutons et badges de statut sont TOUJOURS `rounded-full`. Jamais carré.

---

## 5. Ombres

| Token        | Valeur                                       | Usage                            |
|--------------|----------------------------------------------|----------------------------------|
| `shadow-sm`  | `0 1px 2px rgba(0,30,43,0.06)`              | Composants subtils               |
| `shadow-md`  | `0 4px 12px rgba(0,30,43,0.08)`             | Cards au hover (200ms)           |
| `shadow-lg`  | `0 12px 24px -4px rgba(0,30,43,0.12)`       | Dropdowns, popovers              |
| `shadow-xl`  | `0 16px 48px -8px rgba(0,30,43,0.16)`       | Modals                           |

**Cards** : pas d'ombre par défaut — `border border-border` uniquement. Ombre `shadow-md` au `:hover` (transition 200ms).

---

## 6. Composants — recettes Tailwind + shadcn

### Badges de statut (`src/components/ui/badge.tsx`)

Toujours utiliser les variants de `<Badge>`. Ne jamais recréer manuellement avec des classes Tailwind ad hoc.

```tsx
import { Badge } from '#/components/ui/badge'

// Avec dot indicator (pattern standard pour les statuts)
<Badge variant="success">
  <span className="size-1.5 rounded-full bg-current" />
  {m.status_paid()}
</Badge>

<Badge variant="warning">
  <span className="size-1.5 rounded-full bg-current" />
  {m.status_partial()}
</Badge>

<Badge variant="neutral">
  <span className="size-1.5 rounded-full bg-current" />
  {m.status_pending()}
</Badge>

<Badge variant="destructive">
  <span className="size-1.5 rounded-full bg-current" />
  {m.status_overdue()}
</Badge>
```

**Variants disponibles** : `default`, `secondary`, `outline`, `destructive`, `success`, `warning`, `neutral`, `brand`, `director`, `teacher`, `parent`, `student`, `staff`, `cat-academic`, `cat-finance`, `cat-presence`, `cat-admin`, `grade-good`, `grade-mid`, `grade-bad`

**Tags catégorie** (pas des badges de statut — radius 4px, uppercase, blanc sur couleur) :
```tsx
<Badge variant="cat-academic">Académique</Badge>
<Badge variant="cat-finance">Finance</Badge>
```

### Cards (`src/components/ui/card.tsx`)

```tsx
// Card standard
<Card className="p-6">...</Card>

// Card featured (fond vert doux)
<Card className="border-brand-dark bg-brand-soft p-6">...</Card>

// Card encodée par catégorie (bordure top 4px)
<Card className="border-t-4 border-t-[#006DC6] p-6">...</Card>  // academic

// Hover shadow (optionnel, pour cards cliquables)
<Card className="p-6 transition-shadow hover:shadow-md cursor-pointer">...</Card>
```

### Boutons (`src/components/ui/button.tsx`)

Toujours `rounded-full` (déjà appliqué via shadcn). Variants :
- `default` → CTA principal (vert brand)
- `outline` → Action secondaire
- `ghost` → Toolbar, filtres
- `destructive` → Suppression

```tsx
// Bouton async — TOUJOURS avec spinner + disabled
<Button disabled={isPending}>
  {isPending
    ? <><Loader2 className="h-4 w-4 animate-spin" />{m.saving()}</>
    : m.save()
  }
</Button>
```

### Inputs

Focus ring : border brand-dark + ring brand-soft 3px. Déjà géré par shadcn si les CSS vars sont correctes.

### Cellules de note

```tsx
// Utiliser le variant grade-* du Badge
<Badge variant={score >= 14 ? 'grade-good' : score >= 10 ? 'grade-mid' : 'grade-bad'}>
  {score.toFixed(1)}/20
</Badge>
```

### Sélecteur de période (T1/T2/T3)

```tsx
// Pattern pill-toggle
<div className="inline-flex gap-1 rounded-full bg-muted p-1">
  {['T1', 'T2', 'T3'].map(t => (
    <button key={t} className={cn(
      'rounded-full px-4 py-1.5 text-[13px] font-semibold transition-all',
      active === t
        ? 'bg-brand text-brand-on'
        : 'text-muted-foreground hover:text-foreground'
    )}>
      {t}
    </button>
  ))}
</div>
```

### Progress bar

```tsx
<div className="h-1.5 overflow-hidden rounded-full bg-muted">
  <div
    className="h-full rounded-full bg-brand transition-all duration-[600ms]"
    style={{ width: `${pct}%` }}
  />
</div>
```

### KPI Card

```tsx
<Card className="border-t-4 border-t-[<cat-color>] p-6">
  <p className="text-[11px] font-semibold uppercase tracking-[1.5px] text-muted-foreground">
    {m.kpi_label()}
  </p>
  <p className="font-mono text-2xl font-semibold tabular-nums text-foreground">
    {value}
  </p>
  <ProgressBar value={pct} />
</Card>
```

### Hero Band

```tsx
<section className="bg-[#001E2B] px-6 py-12 text-white">
  {/* radial glow 6% opacity en haut à droite */}
  <div className="pointer-events-none absolute inset-0"
       style={{ background: 'radial-gradient(ellipse at 80% 0%, rgba(0,237,100,0.06) 0%, transparent 70%)' }} />
  <p className="text-[11px] font-semibold uppercase tracking-[1.5px] text-brand">
    {eyebrow}
  </p>
  <h1 className="mt-2 text-4xl font-bold tracking-tight text-white">{title}</h1>
</section>
```

### Empty State

Utiliser le composant `<Empty>` de `src/components/ui/empty.tsx` :

```tsx
import { Empty, EmptyHeader, EmptyMedia, EmptyTitle, EmptyDescription, EmptyContent } from '#/components/ui/empty'
import { SomeIcon } from 'lucide-react'

<Empty>
  <EmptyHeader>
    <EmptyMedia>
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted text-muted-foreground">
        <SomeIcon className="h-5 w-5" />
      </div>
    </EmptyMedia>
    <EmptyTitle>{m.empty_title()}</EmptyTitle>
    <EmptyDescription>{m.empty_desc()}</EmptyDescription>
  </EmptyHeader>
  <EmptyContent>  {/* optionnel — pour un bouton CTA */}
    <Button>{m.empty_action()}</Button>
  </EmptyContent>
</Empty>
```

**Règle** : toute liste, table ou section de données DOIT avoir un empty state. Jamais de conteneur vide.

---

## 7. Iconographie

- **Source unique** : `lucide-react` — jamais d'emoji, pas de Material Icons, pas de FontAwesome.
- **Tailles** : `h-[18px] w-[18px]` sidebar, `h-[22px] w-[22px]` bottom nav, `h-4 w-4` inline.
- **Stroke** : 2px (défaut Lucide).
- **Couleur** : hérite du texte. Actif = opacité 100%, inactif = opacité 60%.

---

## 8. Layout

| Workspace  | Pattern                                      |
|------------|----------------------------------------------|
| Management | 260px sidebar fixe + contenu max 1100px      |
| Mobile     | Pleine largeur + bottom nav 60px (max 5 items)|

**Grids** :
- KPI : `grid-cols-[repeat(auto-fit,minmax(220px,1fr))] gap-4`
- Cards : `grid-cols-[repeat(auto-fit,minmax(280px,1fr))] gap-4`

**Espacement** :
- Page padding : `p-6`
- Card padding : `p-6`
- Section gap : `gap-14` (56px)
- Éléments : `gap-4`, tight : `gap-2`
- Base unit : 4px

**Navigation Sidebar** (desktop) :
- Active item : `bg-brand-soft text-brand-dark` + border-left 3px brand
- Headings de section : eyebrow 11px uppercase tracking-[1.5px]
- Logo en haut, user footer en bas

---

## 9. Animations / Transitions

- Durée : `duration-150` à `duration-[350ms]` — `ease` cubic-bezier(0.4,0,0.2,1)
- Button hover : `hover:brightness-105 hover:-translate-y-px`
- Card hover : `hover:shadow-md` (200ms)
- Progress bars : `duration-[600ms]`
- Focus ring : 3px ring brand-soft + border brand-dark (géré par shadcn)
- **Jamais** de spring, parallax, ou scroll-triggered animation
- Disabled : `opacity-50 cursor-not-allowed`

---

## 10. Règles Copy (contenu affiché)

> Ces règles s'appliquent aux textes UX — les clés i18n doivent les respecter.

- **Sentence case** partout (boutons, labels, titres). Pas de Title Case.
- **UPPERCASE** réservé aux eyebrows (11px, tracking 1.5px) et tags catégorie (10px).
- **Pas d'emoji** dans l'UI produit. Lucide uniquement.
- **Pas de "nous"** — le produit est le locuteur, pas une équipe.
- **Pas de "!" sauf** dans les empty/error states pour adoucir ("Tout est à jour !").
- **Liens = le nom de l'action** : "Voir le bulletin" (pas "Cliquez ici").
- **Nombres en mono** toujours : "94,6 %", "125 000 FCFA", "17,5/20".
- **Pas de point d'interrogation** collé : "Enregistrer ?" → espace insécable avant "?" (convention FR).

---

## 11. Do / Don't

### ✅ DO
- Boutons et badges de statut toujours `rounded-full`
- Encodage catégorie = **bordure top 4px** sur les cards (jamais bordure gauche)
- Nombres, montants, IDs, notes = `font-mono tabular-nums`
- `<Badge variant="success|warning|neutral|destructive">` pour tous les statuts
- `<Badge variant="cat-*">` pour les tags de domaine (radius 4px, uppercase)
- `<Badge variant="grade-*">` pour les cellules de note
- Cards = `border border-border rounded-xl` sans ombre — ombre seulement au hover
- Tous les boutons async = spinner `<Loader2>` + `disabled={isPending}`
- Toutes les listes = `<Empty>` si données vides
- Toutes les sections async = `<Skeleton>` pendant le chargement
- Lucide pour les icônes, taille `h-4 w-4` inline

### ❌ DON'T
- Pas de dark mode toggle (light-mode uniquement)
- Pas d'ombre par défaut sur les cards
- Pas de boutons carrés
- Pas de polices serif
- Pas de plus de 5 items dans le bottom nav mobile
- Pas de couleurs hors palette (jamais de hex inventé)
- Pas d'emoji en production
- Pas de `toLocaleDateString()` / `toLocaleTimeString()` inline → utiliser `fmtDate()` / `fmtTime()` de `src/lib/format.ts`
- Pas de `[#hexcode]` Tailwind arbitraires quand un token de design system existe
- Pas de gradient en fond de page (le seul effet atmo = radial glow 6% dans le hero band)
- Pas de `border-l-4` pour l'encodage catégorie — c'est `border-t-4`
- Pas de styles inline — Tailwind uniquement
- Pas de `styled-components`, `emotion`, ou CSS modules

---

## 12. Tokens Tailwind disponibles dans le codebase

Ces classes sont définies dans `src/styles.css` via `@theme` :

```
bg-brand / text-brand
bg-brand-dark / text-brand-dark
bg-brand-soft / text-brand-soft
text-brand-on

bg-canvas / bg-canvas-alt / bg-surface

text-foreground (= --text-body)
text-muted-foreground (= --text-secondary)

border-border / border-input

text-success / bg-success (= --color-success / bg 10%)
text-warning / bg-warning
text-danger / bg-danger

bg-cat-academic / bg-cat-finance / bg-cat-presence / bg-cat-admin
bg-role-director-bg / text-role-director  (etc.)
bg-grade-good-bg / text-grade-good  (etc.)
```

Pour les valeurs non tokenisées dans Tailwind (fond de badge sémantique), utiliser les variants du composant `<Badge>` — ils embarquent les hex corrects.

---

## 13. Checklist avant de soumettre un composant UI

- [ ] Tous les boutons sont `rounded-full`
- [ ] Pas de couleur hors palette
- [ ] Les nombres utilisent `font-mono tabular-nums`
- [ ] Les statuts utilisent `<Badge variant="success|warning|neutral|destructive">`
- [ ] Les listes ont un `<Empty>` en cas de données vides
- [ ] Les sections async ont un `<Skeleton>` pendant le loading
- [ ] Les boutons async ont `<Loader2>` + `disabled={isPending}`
- [ ] L'encodage catégorie est une **bordure top** (pas gauche)
- [ ] Pas d'emoji dans l'UI
- [ ] Toutes les chaînes affichées passent par Paraglide `m.key()`
- [ ] Les dates/heures utilisent `fmtDate()` / `fmtTime()` de `src/lib/format.ts`
- [ ] Les montants utilisent `fmtFCFA()` de `src/lib/format.ts`
