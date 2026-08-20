# Commit Conventions (Conventional Commits)

## Format

```
<type>(<scope>): <description>

[optional body]

[optional footer]
```

## Types

| Type | Usage |
|------|-------|
| `feat` | New feature or capability |
| `fix` | Bug fix |
| `docs` | Documentation only (guides, README, CLAUDE.md) |
| `style` | Formatting, whitespace, semicolons — no logic change |
| `refactor` | Code restructuring without behavior change |
| `perf` | Performance improvement |
| `test` | Adding or updating tests |
| `chore` | Build config, dependencies, tooling |
| `ci` | CI/CD pipeline changes |
| `revert` | Revert a previous commit |

## Scope (optional)

Use the feature or module name: `auth`, `students`, `payments`, `evaluations`, `presence`, `cards`, `schedules`, `settings`, `pwa`, `i18n`, `ui`, `layout`, `api`, `db`.

## Rules

1. **Lowercase** — type and description start lowercase
2. **Imperative mood** — "add filter" not "added filter" or "adding filter"
3. **No period** at the end of the subject line
4. **50 char limit** on subject line (72 max)
5. **Blank line** between subject and body
6. **Body** explains WHY, not WHAT (the diff shows what)
7. **No AI attribution** — do not add Co-Authored-By or tool mentions
8. **One concern per commit** — don't mix unrelated changes
9. **Atomic commits** — each commit should leave the app in a working state

## Breaking Changes

Use `!` after type/scope and explain in footer:

```
feat(auth)!: replace cookie auth with JWT tokens

BREAKING CHANGE: all existing sessions are invalidated.
Clients must re-authenticate after deployment.
```

## Examples

```
feat(students): add enrollment status filter to list page
fix(payments): correct installment calculation for partial amounts
chore: upgrade TanStack Query to v5.62
refactor(auth): extract session validation into shared hook
docs(pwa): add caching strategy guide
style(ui): align button variants with design tokens
test(evaluations): add grade computation edge cases
perf(api): batch student queries to reduce waterfall
```

## Branch Naming

```
feat/<short-description>    → feature branches
fix/<short-description>     → bug fix branches
chore/<short-description>   → maintenance branches
```

Work happens on `dev`. Merge to `main` for releases only.
