# Pages de zone (SEO local) — Design

Date : 2026-09-19
Statut : validé (design), en attente de plan d'implémentation
Origine : audit SEO du 19/09/2026 (rapport SXO) — réactivation de S-005 par Esteban

## Objectif

Être trouvé sur les recherches « agence IA + ville » (et « automatisation IA
artisan + ville ») dans le secteur d'intervention, sans créer de pages
satellites.

Le constat de l'audit : sur « agence IA La Baule Guérande », aucune agence IA
ne se classe ; sur « agence IA La Roche-Bernard / Muzillac / Férel », seules
des agences immobilières sortent. Les pages qui se classent sur ces requêtes
sont des pages de ville ou de département, alors qu'expia.fr n'a que deux
articles de blog géolocalisés.

Le volume de recherche reste faible (raison de l'abandon initial de S-005).
L'objectif est de capter les rares recherches locales et de renforcer la
présence dans la carte Google, pas de générer un gros trafic.

## Décisions cadrées (issues du brainstorming)

1. **Zones couvertes** : Esteban se déplace dans les 4 bassins suivants
   (environ 35 communes).
2. **Aucun client local à ce jour.** JR Aménagement (S-004) n'est pas encore
   client : il n'est cité nulle part.
3. **Approche retenue : 4 pages de zone maintenant, pages ville plus tard.**
   - Une page par bassin, qui cite toutes ses communes.
   - Une page dédiée à une ville (Vannes, Saint-Nazaire, La Baule…) ne sera
     créée que lorsqu'un vrai client ou projet existera dans cette ville.
   - Écarté : une page par commune (~35 pages identiques au nom près = pages
     satellites, contraire aux règles anti-spam de Google, au-delà du seuil
     d'alerte de 30 pages de l'outil d'audit).

## Les 4 pages

| Page | URL | Requête principale (title) | Communes citées |
|---|---|---|---|
| Presqu'île guérandaise | `/agence-ia-presquile-guerandaise.html` | agence IA La Baule – Guérande | Guérande, La Baule-Escoublac, Le Croisic, Batz-sur-Mer, Le Pouliguen, Pornichet, La Turballe, Piriac-sur-Mer, Mesquer, Saint-Molf |
| Pays de la Roche-Bernard | `/agence-ia-la-roche-bernard.html` | agence IA La Roche-Bernard – Férel | Férel, Camoël, Pénestin, La Roche-Bernard, Nivillac, Arzal, Marzan, Herbignac, Assérac, Saint-Lyphard |
| Muzillac – Vannes | `/agence-ia-vannes-muzillac.html` | agence IA Vannes | Muzillac, Damgan, Ambon, Sarzeau, Theix-Noyalo, Vannes |
| Saint-Nazaire – Brière | `/agence-ia-saint-nazaire.html` | agence IA Saint-Nazaire | Saint-Nazaire, Montoir-de-Bretagne, Trignac, Saint-André-des-Eaux, La Chapelle-des-Marais |

URLs à la racine, en `.html`, comme `a-propos.html` et `mentions-legales.html`.

### Articles de blog existants

- `/blog/agence-ia-presquile-guerandaise.html` → 301 vers
  `/agence-ia-presquile-guerandaise.html`
- `/blog/automatisation-ia-la-roche-bernard-sud-morbihan.html` → 301 vers
  `/agence-ia-la-roche-bernard.html`

Les fichiers d'article ne sont pas supprimés dans la PR de la page (contenu
protégé, limite de 3 fichiers) : la redirection Vercel s'applique avant le
fichier statique. Leur retrait de la liste du blog se fait dans la PR de
maillage.

## Contenu d'une page

Même plan pour les 4 pages. Les sections marquées ★ sont propres à la zone et
représentent au moins 60 % du texte.

1. **H1** — ex. « Automatisation IA pour les artisans du BTP à La Baule,
   Guérande et sur la presqu'île ».
2. **Qui je suis** (2–3 phrases) — Esteban Marteil, entreprise individuelle
   basée à Férel, se déplace sur les chantiers de la zone.
3. ★ **Les chantiers du secteur** — ce qui caractérise le territoire pour un
   artisan. Pistes à vérifier (voir « Faits locaux ») :
   - presqu'île : résidences secondaires, saisonnalité, abords de la cité
     de Guérande ;
   - Pays de la Roche-Bernard : cité de caractère, bords de Vilaine ;
   - Muzillac – Vannes : entreprises BTP plus grosses, centre historique de
     Vannes ;
   - Saint-Nazaire – Brière : chaumières et couvreurs chaumiers, Parc naturel
     régional de Brière, bassin industriel.
4. ★ **Ce que je peux automatiser pour vous ici** — 3 ou 4 cas reliés au
   contexte de la section 3 (ex. pics saisonniers → relance automatique des
   devis ; propriétaires absents → compte rendu de chantier envoyé
   automatiquement).
5. **Communes couvertes** — liste de la zone.
6. **Comment on travaille** (court) — un appel, une proposition avec un prix
   fixé, installation sur place ; « dès 397 € » (chiffre déjà publié sur le
   site).
7. **Appel à l'action** — téléphone (`tel:+33695274474`) et lien vers le
   formulaire de contact de l'accueil.
8. ★ **Liens** — vers les 3 autres pages de zone et 1 ou 2 guides du blog
   pertinents.

Longueur : 700 à 1 000 mots par page.

### Règles de rédaction

- Respect intégral de `CLAUDE.md` : vouvoiement, phrases courtes, vocabulaire
  de chantier, aucun mot interdit, pas de jargon (RAG, fine-tuning, ERP,
  time-to-market).
- **Aucun chiffre inventé.** Seul chiffre autorisé : « dès 397 € ».
- **Aucun faux client** : pas de « nos clients à Guérande », pas de
  témoignage, pas de référence à JR Aménagement.
- Première personne du singulier (« je »), jamais « nous ».

### Faits locaux

- Chaque fait sur un territoire (patrimoine, réglementation, économie locale)
  est vérifié sur une source publique : site de la commune, Parc naturel
  régional de Brière, CMA, CCI, INSEE, Petites Cités de Caractère…
- La description de chaque PR liste chaque fait avec son lien source.
- Esteban valide ces faits avant de merger ; tout fait non vérifiable est
  retiré plutôt qu'approximé.

## Technique

### Balises de chaque page

- `title` : 50–60 caractères ; `meta description` : 140–160 caractères.
- Un seul H1 ; `canonical` vers la page elle-même ; `robots: index, follow`.
- `og:*` et `twitter:*` repris du modèle de l'accueil, adaptés à la page.

### Données structurées (nouveau bloc, page par page)

- `WebPage` (`@id` = URL de la page).
- `Service` : `provider` = `{"@id": "https://expia.fr/#business"}`,
  `areaServed` = liste de `City`, `serviceType` en langage artisan.
- `BreadcrumbList` : Accueil (`https://expia.fr/`) → page de zone.
- Pas de `FAQPage`. Aucun bloc JSON-LD existant n'est modifié (fichiers
  protégés).

### Gabarit

- En-tête, pied de page et classes CSS repris de l'accueil / d'`a-propos.html`.
- **Aucune modification de `styles.css`** : une PR de page atteint déjà la
  limite de 3 fichiers (page + `sitemap.xml` + `vercel.json`).
- Si une mise en page nécessite du CSS nouveau, elle fait l'objet d'une PR
  séparée, avant les pages.

### Prérequis

Les PR #9 à #13 (corrections de l'audit) sont mergées sur `main` avant de
créer les branches des pages : les pages héritent ainsi du bouton d'appel
mobile et du sitemap corrigé.

## Découpage en tickets / PR

| Ticket | PR | Fichiers |
|---|---|---|
| S-006 | Page Presqu'île guérandaise + 301 de l'article | page, `sitemap.xml`, `vercel.json` |
| S-007 | Page Pays de la Roche-Bernard + 301 de l'article | page, `sitemap.xml`, `vercel.json` |
| S-008 | Page Saint-Nazaire – Brière | page, `sitemap.xml` |
| S-009 | Page Muzillac – Vannes | page, `sitemap.xml` |
| S-010 | Maillage : bloc « Zones d'intervention » dans le corps et le pied de page de l'accueil, retrait des 2 articles de la liste du blog | `index.html`, `blog/index.html` |
| S-011 | `llms.txt` : pages de zone à la place des 2 articles | `llms.txt` |

Branches : `seo/S-00X-<slug>`. Une PR par ticket, mergée par Esteban.

## Vérifications avant chaque PR

- Rendu Playwright à 375 et 1366 px : pas de débordement, CTA visibles.
- JSON-LD : blocs parsés sans erreur ; `@id` du prestataire correct.
- `title` et `meta description` dans les longueurs.
- Tous les liens internes de la page répondent 200 (en local).
- **Unicité** : similarité textuelle avec chaque page de zone déjà écrite
  < 40 % (chevauchement de 5-grammes) ; au-delà, réécriture.
- Sur la preview Vercel : redirection 301 des articles (S-006, S-007),
  aucune erreur console.

## Mesure du résultat

Nécessite Google Search Console (action d'Esteban, hors de ce projet).

- Échec : une page non indexée 4 semaines après le merge.
- Indicateur : impressions et position sur « agence IA + ville » à 60–90 jours.
- Déclencheur de l'étape suivante (pages ville) : premier client réel dans
  une ville de la zone.

## Hors périmètre

- Pages métier (couvreur, plombier…) et pages ville individuelles.
- Fiche Google Business Profile, avis, annuaires (actions d'Esteban).
- Fusion des entités JSON-LD de l'accueil (ticket séparé).
- Liens « Zones d'intervention » dans le pied de page des autres pages
  (`a-propos.html`, articles) : ticket ultérieur si besoin.
