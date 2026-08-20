# Lernn Mobile — Démo

Reproduction statique des espaces élève et parent de Lernn Mobile, destinée aux démonstrations commerciales. Le site fonctionne sans API ni base de données : les comptes, cartes et données scolaires de démonstration sont fournis par des fixtures locales.

## Démonstration

Une fois GitHub Pages activé, le site est publié à l’adresse :

<https://osiris-balonga.github.io/lernn-mobile-demo/>

La connexion est disponible par identifiants classiques ainsi que par carte Lernn, via saisie du code public ou scan du QR code. La caméra nécessite un navigateur moderne et une origine sécurisée ; GitHub Pages est servi en HTTPS.

### Identifiants de démonstration

| Cycle    | Élève           | Email                                  | Mot de passe     | Code de carte    |
| -------- | --------------- | -------------------------------------- | ---------------- | ---------------- |
| Primaire | Clara Makaya    | `clara.makaya.demo@ndg.lernn.local`    | `DemoLernn2026!` | `NDG01-STU-0013` |
| Collège  | Boris Mbemba    | `boris.mbemba.demo@ndg.lernn.local`    | `DemoLernn2026!` | `NDG01-STU-0501` |
| Lycée    | Mireille Nsimba | `mireille.nsimba.demo@ndg.lernn.local` | `DemoLernn2026!` | `NDG01-STU-1201` |

Le compte Parent unifié `sandrine.makaya.demo@ndg.lernn.local` utilise le même mot de passe et donne accès aux données consolidées de Clara Makaya et Boris Mbemba. Les noms et codes des trois élèves restent strictement identiques aux cartes imprimées.

Ces identifiants sont exclusivement destinés à la démonstration. Les QR imprimés sont reconnus par leur empreinte SHA-256 : leur secret brut n’est pas publié dans le dépôt. Aucune donnée réelle ou sensible ne doit être ajoutée au dépôt.

## Développement local

Prérequis : Node.js 22, Corepack et pnpm 10.

```bash
corepack enable
pnpm install
pnpm dev
```

Les portraits enseignants sont sélectionnés depuis Random User avec des
identifiants stables puis conservés localement pour fiabiliser la démo :

```bash
pnpm demo:sync-teacher-avatars
```

Le détail des barèmes, matières, pondérations et dates se trouve dans
[`DEMO_DATA_CONGO.md`](./DEMO_DATA_CONGO.md).

Le serveur de développement écoute sur <http://localhost:7610/>. Il utilise la base `/`, sans proxy et sans appel à Lernn API.

## Vérifications

```bash
pnpm test
pnpm typecheck
pnpm lint
pnpm build
pnpm test:pages
```

Le build de production utilise automatiquement la base `/lernn-mobile-demo/`. Pour vérifier localement le résultat destiné à GitHub Pages :

```bash
pnpm build
pnpm preview
```

Puis ouvrir <http://localhost:7610/lernn-mobile-demo/>.

## Déploiement GitHub Pages

Le workflow [`.github/workflows/pages.yml`](.github/workflows/pages.yml) vérifie, construit et publie `dist/` après chaque push sur `main`. Dans les paramètres du dépôt GitHub `Osiris-Balonga/lernn-mobile-demo`, sélectionner **GitHub Actions** comme source de GitHub Pages.

Le build génère également :

- `dist/404.html`, repli SPA pour les ouvertures directes d’une route ;
- `dist/.nojekyll`, afin que GitHub Pages serve les fichiers Vite sans transformation Jekyll.

## Stack

- React 19 et TypeScript ;
- Vite ;
- Tailwind CSS ;
- TanStack Router ;
- données de démonstration locales uniquement.
