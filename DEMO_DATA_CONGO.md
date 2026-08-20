# Référentiel des données scolaires de démonstration

Les fixtures suivent l’année scolaire 2025-2026 et la règle produit demandée :
du 1er octobre 2025 au 30 juin 2026, en trois trimestres.

## Barèmes et pondérations

- CE1 : notes sur 10. Les matières reprennent les domaines du programme
  congolais. Les coefficients sont une pondération pédagogique propre à la
  démonstration, car les textes consultés ne fixent pas de coefficients
  nationaux de bulletin pour le CE1.
- 5e : notes sur 20. Les pondérations reproduisent les masses horaires
  hebdomadaires du régime pédagogique officiel : français 6,
  histoire-géographie 4, anglais 4, mathématiques 5, sciences physiques 2,
  SVT 2, dessin 1, musique 1 et EPS 2. L’éducation civique et morale complète
  la masse hebdomadaire avec une pondération de 1.
- Terminale D : notes sur 20. Les coefficients suivent l’annexe I du décret
  n° 2012-69 : SVT 5, sciences physiques 5, mathématiques 4,
  français ou philosophie 3, anglais 3, histoire ou géographie 3 et EPS 2.

Toutes les moyennes de matière, de trimestre et d’année sont calculées à
partir des notes et de ces pondérations, puis arrondies au dixième.

## Évaluations et présence

Pour chaque matière et chaque trimestre, une note correspond exactement à une
évaluation : devoir régulier au premier mois, devoir départemental au deuxième
mois et composition au troisième mois. Les dates sont réparties sur plusieurs
jours ouvrés. Une absence est enregistrée à la fois par le statut `Absent` et
par une note de zéro afin de conserver des calculs explicites et vérifiables.
Les présences sont datées sur des jours de classe. Les emplois du temps vont du
lundi au vendredi, avec le samedi uniquement pour la Terminale D, classe
d’examen.

## Profil parent

Le compte de Sandrine Makaya regroupe Clara Makaya et Boris Mbemba sans
modifier leurs identités ni leurs codes de carte imprimés. Le tableau de bord
additionne les soldes de la famille et conserve la ventilation par enfant ;
les notes, présences, matières et emplois du temps sont accessibles grâce au
sélecteur d’enfant de l’interface mobile d’origine.

## Avatars enseignants

Les portraits sont sélectionnés de façon reproductible dans le catalogue
Random User grâce à `pnpm demo:sync-teacher-avatars`, puis copiés dans les assets du site. La
démo déployée ne dépend donc pas d’un appel réseau au moment de l’affichage.

## Sources de référence

- Journal officiel de la République du Congo, décret n° 2012-69 :
  https://www.sgg.cg/JO/2012/congo-jo-2012-09.pdf
- Programmes éducatifs et guides pédagogiques de SVT 6e-5e :
  https://ecolesaucongo.com/images/epreuves/6-Congo-Guide_SVT-College.pdf
- Calendrier scolaire MEPPSA 2025-2026 :
  https://ecolesaucongo.com/article.php?id=29-annee-scolaire-2025-2026-meppsa-calendrier
- Documentation Random User : https://randomuser.me/documentation
