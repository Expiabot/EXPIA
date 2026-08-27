# expia.fr — site vitrine EXPIA

## Contexte
Site statique HTML/CSS/JS, déployé sur Vercel via GitHub.
EXPIA = entreprise individuelle d'Esteban, automatisation IA pour
TPE du BTP. Zone : presqu'île guérandaise, sud Morbihan (44/56).

## Positionnement à respecter dans tout texte
- Cible : artisans et TPE du BTP (maçon, couvreur, plombier,
  électricien, menuisier, maître d'œuvre, paysagiste)
- Promesse : faire gagner du temps sur les devis, la relance client,
  la boîte mail, le suivi de chantier — pas "transformer l'entreprise"
- Preuve : cas client réel, pas de promesse chiffrée non vérifiable

## Ton de voix — impératif
- Vouvoiement, phrases courtes, vocabulaire concret
- Interdits : "révolutionner", "propulsé par l'IA", "solution
  innovante", "booster", "game changer", "à l'ère de l'IA"
- Interdits : superlatifs non prouvés ("le meilleur", "leader")
- Pas de chiffre inventé. Si un chiffre est utile, ouvrir une question
  dans la PR au lieu de l'inventer.
- Un artisan doit comprendre chaque phrase sans lever les yeux.

## Fichiers protégés — ne jamais modifier sans ticket explicite
- robots.txt
- llms.txt
- sitemap.xml
- les blocs JSON-LD existants (LocalBusiness, FAQPage, BlogPosting)
- le contenu des articles de blog existants
- tout fichier dans .github/

## Règles de travail
- Une branche par ticket : `seo/<id-ticket>-<slug>`
- Jamais de commit direct sur `main`
- Maximum 3 fichiers modifiés par PR
- Aucune nouvelle dépendance, aucun framework, aucun build step
- Aucune modification de la structure HTML au-delà du strict nécessaire
- Si le ticket est ambigu : ouvrir la PR en draft avec la question,
  ne pas deviner

## Contraintes SEO techniques
- title : 50-60 caractères
- meta description : 140-160 caractères
- un seul H1 par page
- ne pas casser les ancres et liens internes existants

## Définition de "terminé"
- Le critère d'acceptation du ticket est rempli
- La preview Vercel s'affiche sans erreur console
- Les liens internes de la page modifiée fonctionnent
- La PR décrit : quoi, pourquoi, quoi vérifier visuellement
- Un humain merge. Jamais un agent.
