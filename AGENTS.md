# Lernn Mobile Demo

- Ce dépôt est une démonstration statique et autonome de l'espace élève Lernn Mobile.
- Il ne doit effectuer aucun appel réseau vers Lernn API, une base de données ou un service d'authentification.
- L'interface de référence est le projet sibling `lernn-education/lernn-mobile` : préserver ses couleurs, composants, espacements et comportements.
- Les seuls profils autorisés sont des élèves de démonstration. Ne pas réintroduire les espaces parent, enseignant, administration ou compagnon.
- Les identifiants et données sont publics par nature. Ne jamais ajouter de secret, cookie réel, jeton QR brut ou identifiant provenant d'une production.
- Les QR opaques sont reconnus uniquement par empreinte SHA-256 dans le navigateur.
- L'application doit rester compatible GitHub Pages et fonctionner sans backend après `pnpm build`.
- Conserver l'expérience mobile-first, les safe areas, les bottom sheets, les skeletons et des cibles tactiles d'au moins 44 px.
- Toute interaction de démonstration doit rester fonctionnelle après actualisation grâce à un état local explicite et limité.
