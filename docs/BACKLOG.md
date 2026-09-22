# Backlog site expia.fr

## S-001 — Balises SEO de la page d'accueil
**Priorité** : 1
**Statut** : à faire
**Fichiers** : index.html
**Description** : le title, la meta description et le H1 ne portent
aucun mot-clé BTP ni géographique.
**Critères d'acceptation** :
- title contient "BTP" et une référence géographique (Morbihan ou
  Loire-Atlantique ou presqu'île guérandaise), 50-60 caractères
- meta description mentionne au moins deux métiers du bâtiment,
  140-160 caractères
- H1 unique, nommant explicitement le BTP
- Aucun autre contenu de la page modifié

## S-002 — Accroche de la page d'accueil
**Priorité** : 2
**Statut** : bloqué par S-001
**Fichiers** : index.html
**Description** : l'accroche parle d'"artisans et TPE". Elle doit
nommer le BTP et des métiers précis.
**Critères d'acceptation** :
- L'accroche nomme le BTP et cite au moins trois métiers
- Le sous-titre décrit un bénéfice concret (temps gagné sur une
  tâche identifiable), sans chiffre inventé
- Respect du ton défini dans CLAUDE.md
- Proposer 2 variantes dans la PR, laisser Esteban trancher

## S-003 — Balises SEO des pages secondaires
**Priorité** : 3
**Statut** : bloqué par S-001
**Fichiers** : max 3 par PR — découper si nécessaire
**Critères d'acceptation** : mêmes règles que S-001, adaptées au
sujet de chaque page.

## S-004 — Cas client JR Aménagement en page d'accueil
**Priorité** : 4
**Statut** : bloqué — attend validation d'Esteban sur le contenu
**Note** : ne pas démarrer. Aucun détail client ne doit être inventé
ni extrapolé.

## S-005 — Pages métier/ville
**Priorité** : basse
**Statut** : réactivé le 19/09/2026 par Esteban, sous forme de 4 pages
de zone (voir S-006 à S-012) — pas de pages métier × ville
**Note** : écarté à l'origine pour volume de recherche insuffisant. Le
volume reste faible ; l'audit SEO du 19/09 montre qu'aucune agence IA
ne se classe sur « agence IA La Baule Guérande ». Pages ville
individuelles : seulement quand un vrai client existe dans la ville.
**Spec** : docs/superpowers/specs/2026-09-19-pages-zones-design.md

## S-006 — Page de zone Presqu'île guérandaise
**Priorité** : 5
**Statut** : à faire — bloqué par le merge des PR #9 à #13
**Fichiers** : agence-ia-presquile-guerandaise.html, sitemap.xml, vercel.json
**Critères d'acceptation** : voir la spec ; redirection permanente depuis
/blog/agence-ia-presquile-guerandaise.html ; faits locaux sourcés dans la PR

## S-007 — Page de zone Pays de la Roche-Bernard
**Priorité** : 6
**Statut** : bloqué par S-006
**Fichiers** : agence-ia-la-roche-bernard.html, sitemap.xml, vercel.json
**Critères d'acceptation** : voir la spec ; redirection permanente depuis
/blog/automatisation-ia-la-roche-bernard-sud-morbihan.html

## S-008 — Page de zone Saint-Nazaire – Brière
**Priorité** : 7
**Statut** : bloqué par S-007
**Fichiers** : agence-ia-saint-nazaire.html, sitemap.xml

## S-009 — Page de zone Muzillac – Vannes
**Priorité** : 8
**Statut** : bloqué par S-008
**Fichiers** : agence-ia-vannes-muzillac.html, sitemap.xml

## S-010 — Maillage des pages de zone
**Priorité** : 9
**Statut** : bloqué par S-009
**Fichiers** : index.html, blog/index.html
**Description** : bloc « Zones d'intervention » sur l'accueil (corps +
pied de page) ; retrait des 2 articles redirigés de la liste du blog

## S-011 — llms.txt : pages de zone
**Priorité** : 10
**Statut** : bloqué par S-010
**Fichiers** : llms.txt (fichier protégé — ticket explicite)

## S-012 — Liens retour entre pages de zone
**Priorité** : 11
**Statut** : bloqué par S-011
**Fichiers** : agence-ia-presquile-guerandaise.html, agence-ia-la-roche-bernard.html,
agence-ia-saint-nazaire.html
**Description** : chaque page de zone lie les 3 autres

## S-013 — Fiche Google Business Profile dans le JSON-LD
**Priorité** : 12
**Statut** : à faire
**Fichiers** : index.html (bloc JSON-LD protégé — ticket explicite)
**Description** : la fiche GBP existe (confirmée par Esteban le 20/09).
Ajout de openingHoursSpecification (lun-ven 9h-12h et 13h30-18h) et du
lien Maps stable (cid) en hasMap et sameAs
**Reste à faire hors dépôt** : obtenir 3 à 5 avis, vérifier la catégorie
principale et les zones desservies de la fiche

## S-015 — Offre création de site sur l'accueil
**Priorité** : 13
**Statut** : à faire
**Fichiers** : index.html
**Description** : 4e carte dans la section Services, angle « site qui
ramène des demandes » (site + formulaire qui qualifie + assistant), et
non « création de site web » générique, pour ne pas diluer le
positionnement BTP.
**Contraintes respectées** : aucun client cité (un site fait pour un
proche, non rémunéré, et le site d'EXPIA), aucun prix affiché.
**Suite possible** : page dédiée /site-internet-artisan-btp.html visant
« création site internet artisan + ville », quand un premier client
payant aura validé l'offre.
