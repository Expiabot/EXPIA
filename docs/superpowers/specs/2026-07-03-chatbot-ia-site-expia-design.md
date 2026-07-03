# Chatbot IA pour le site EXPIA — Design

Date : 2026-07-03
Statut : validé (design), en attente de plan d'implémentation

## Objectif

Ajouter un assistant conversationnel IA sur le site vitrine EXPIA (site statique
hébergé sur Vercel). L'assistant répond aux questions des visiteurs en restant
cadré sur l'activité d'EXPIA, et capture des leads qualifiés en proposant au
visiteur de laisser ses coordonnées, envoyées par email à `esteban@expia.fr`.

Double intérêt pour EXPIA : outil de génération de leads **et** démonstration
concrète du savoir-faire IA de l'agence auprès des visiteurs.

## Décisions cadrées (issues du brainstorming)

1. **Type** : assistant IA conversationnel (pas un bot à scénarios ni un simple
   formulaire).
2. **Périmètre de connaissance** : EXPIA uniquement (services, zone
   Morbihan / presqu'île guérandaise, façon de travailler, contact). Redirige
   poliment les hors-sujets.
3. **Objectif business** : capture de contact. Quand le visiteur pose une vraie
   question projet, l'assistant propose de laisser nom + email/téléphone.
4. **Moteur** : API Claude, modèle **Haiku 4.5** (`claude-haiku-4-5`).
5. **Livraison des leads** : email vers `esteban@expia.fr` via **Mailjet**
   (compte existant du propriétaire ; offre gratuite ; adresse/domaine `expia.fr`
   validé, envoi depuis `noreply@expia.fr`).
6. **Style visuel** : fenêtre blanche épurée qui contraste sur le fond sombre du
   site, accents en dégradé bleu-violet.
7. **Bouton d'appel** : pilule « Discuter avec l'assistant » en bas à droite.

## Architecture

Le site reste un site statique sur Vercel. On ajoute deux fonctions serverless
Vercel. Le navigateur du visiteur ne parle jamais directement à l'API Claude :
il passe par les fonctions, qui seules détiennent les secrets.

```
Visiteur (widget) ──> /api/chat (Vercel) ──> API Claude (Haiku 4.5)
                            │
                            └──> /api/lead (Vercel) ──> Mailjet ──> esteban@expia.fr
```

### Composants

| Composant | Rôle | Dépendances |
|---|---|---|
| `chat-widget.js` + CSS | Widget front-end autonome, chargé en une ligne dans les pages | Aucune (vanilla JS) |
| `/api/chat` | Proxy vers l'API Claude ; détient `ANTHROPIC_API_KEY` ; applique le system prompt et les garde-fous | SDK `@anthropic-ai/sdk` |
| `/api/lead` | Reçoit un lead et envoie l'email via Mailjet ; détient `MAILJET_API_KEY` + `MAILJET_SECRET_KEY` | SDK `node-mailjet` |

### Widget (`chat-widget.js`)

Fichier JS autonome + CSS, intégré via une balise `<script>` dans les pages
(a minima `index.html`). Responsabilités :

- Pilule « Discuter avec l'assistant » en bas à droite (fenêtre blanche, accents
  bleu-violet, cohérente avec l'identité EXPIA).
- Fenêtre de conversation : liste des messages, saisie, indicateur « en train
  d'écrire… ».
- Message d'accueil de départ + 2-3 suggestions cliquables (« Vous faites
  quoi ? », « Combien ça coûte ? », « Vous intervenez sur le Morbihan ? »).
- Mini-formulaire de capture (nom + email/téléphone) affiché dans le fil de
  conversation quand l'assistant propose d'être recontacté ; envoie vers
  `/api/lead`.
- Phrase de consentement RGPD + lien vers les mentions légales sous le
  formulaire de capture.

L'historique de la conversation vit **uniquement dans le navigateur** (mémoire
de session, pas de `localStorage` persistant nécessaire). Rien n'est stocké
côté serveur. À chaque appel `/api/chat`, le widget renvoie l'historique borné.

### `/api/chat`

- Reçoit `{ messages: [...] }` (historique de la conversation, rôles
  `user`/`assistant`, texte uniquement).
- Appelle l'API Claude en **streaming** vers le widget pour un rendu fluide
  (ou non-streaming en v1 si plus simple ; à trancher au plan).
- Modèle : `claude-haiku-4-5`, `max_tokens` raisonnable (ex. 1024).
- **System prompt** : décrit EXPIA (activité, zone, ton), cadre l'assistant sur
  le périmètre EXPIA, l'instruit de rediriger poliment les hors-sujets, et de
  proposer de laisser des coordonnées quand une intention projet est détectée.
- Renvoie la réponse de l'assistant au widget.

### `/api/lead`

- Reçoit `{ name, contact, message? }` (contact = email ou téléphone).
- Valide les champs (présence, format email basique, longueurs plafonnées).
- Envoie un email via Mailjet depuis `noreply@expia.fr` vers `esteban@expia.fr`,
  contenant le nom, le moyen de contact, et éventuellement le contexte de la
  conversation.
- Renvoie un statut succès/erreur au widget.

## Flux de données

1. Visiteur ouvre le widget, tape un message.
2. Widget POST `/api/chat` avec l'historique borné.
3. `/api/chat` appelle Claude Haiku avec le system prompt EXPIA, renvoie la
   réponse.
4. Widget affiche la réponse.
5. Quand l'assistant propose le recontact et que le visiteur accepte, le widget
   affiche le mini-formulaire.
6. Visiteur remplit nom + contact, coche/accepte le consentement.
7. Widget POST `/api/lead` → Mailjet → email à `esteban@expia.fr`.
8. Widget affiche une confirmation.

## Sécurité, coûts et RGPD

- **Secrets** : `ANTHROPIC_API_KEY`, `MAILJET_API_KEY` et `MAILJET_SECRET_KEY`
  uniquement dans les variables d'environnement Vercel. Jamais dans le code livré
  au navigateur.
- **Anti-abus** (`/api/chat` et `/api/lead` sont publics) :
  - Limitation du débit par visiteur (ex. quelques messages par minute, par IP).
  - Longueur de message entrant plafonnée.
  - Historique borné (nombre de messages max renvoyés à chaque appel) pour
    éviter de gonfler les coûts et le contexte.
- **Cadrage** : le system prompt maintient l'assistant sur EXPIA et lui fait
  refuser/rediriger les demandes hors périmètre.
- **RGPD** :
  - Phrase de consentement sur le formulaire de capture (« En laissant vos
    coordonnées, vous acceptez d'être recontacté par EXPIA. »).
  - Lien vers `mentions-legales.html`.
  - Pas de base de données : les leads transitent par email uniquement.

## Gestion des erreurs

- **`/api/chat`** : en cas d'erreur API Claude (rate limit, panne), renvoyer un
  message d'erreur propre ; le widget affiche « Désolé, une erreur est survenue,
  réessayez dans un instant » et propose le contact direct (email) en secours.
- **`/api/lead`** : en cas d'échec Mailjet, renvoyer une erreur claire ; le
  widget invite le visiteur à écrire directement à l'adresse de contact.
- **Validation** : entrées invalides (message vide, email malformé) rejetées
  côté fonction avec un code 400 et un message exploitable par le widget.
- **Réseau côté widget** : timeouts et échecs gérés avec un message de repli, pas
  de plantage silencieux.

## Hors périmètre (YAGNI)

- Pas de base de données ni de persistance serveur des conversations.
- Pas de conseil IA généraliste ni de mode « ouvert » à la ChatGPT.
- Pas de prise de RDV / Calendly en v1 (peut venir plus tard).
- Pas de tableau de bord admin ni d'analytics dédié en v1.

## Prérequis à fournir par le propriétaire

- Créer une clé API Anthropic et l'ajouter comme `ANTHROPIC_API_KEY` sur Vercel,
  avec un petit budget.
- Dans le compte Mailjet existant : valider l'adresse/domaine expéditeur
  (`noreply@expia.fr`), récupérer la clé API et la clé secrète, et les ajouter
  comme `MAILJET_API_KEY` et `MAILJET_SECRET_KEY` sur Vercel.
