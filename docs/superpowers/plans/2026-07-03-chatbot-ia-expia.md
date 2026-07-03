# Chatbot IA EXPIA — Plan d'implémentation

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ajouter au site statique EXPIA un assistant IA (Claude Haiku 4.5) qui répond aux visiteurs en restant cadré sur EXPIA, et capture des leads envoyés par email à `esteban@expia.fr` via Mailjet.

**Architecture:** Site statique inchangé sur Vercel + deux fonctions serverless Node (`/api/chat`, `/api/lead`) qui détiennent seules les secrets. Le navigateur parle aux fonctions, jamais directement aux API tierces. Un widget JS vanilla autonome fournit l'interface de chat.

**Tech Stack:** Node.js (fonctions Vercel, ESM), `@anthropic-ai/sdk`, `node-mailjet`, tests avec le runner intégré `node --test`, front-end en JavaScript vanilla + CSS.

Référence spec : `docs/superpowers/specs/2026-07-03-chatbot-ia-site-expia-design.md`

---

## Structure des fichiers

| Fichier | Responsabilité |
|---|---|
| `package.json` | Déclare les dépendances et le script de test. ESM (`"type": "module"`). |
| `.env.example` | Documente les variables d'environnement attendues. |
| `api/_lib/validation.js` | Fonctions pures de validation/nettoyage (messages, lead, email). `_lib` est ignoré par Vercel (pas un endpoint). |
| `api/_lib/validation.test.js` | Tests des fonctions de validation. |
| `api/_lib/rateLimit.js` | Limiteur de débit en mémoire, avec horloge injectable. |
| `api/_lib/rateLimit.test.js` | Tests du limiteur. |
| `api/_lib/systemPrompt.js` | Le system prompt qui cadre l'assistant sur EXPIA. |
| `api/_lib/chatCore.js` | Logique de `/api/chat`, client Anthropic injecté (testable sans réseau). |
| `api/_lib/chatCore.test.js` | Tests avec un faux client Anthropic. |
| `api/_lib/leadCore.js` | Logique de `/api/lead`, fonction d'envoi injectée. |
| `api/_lib/leadCore.test.js` | Tests avec un faux `sendMail`. |
| `api/chat.js` | Handler Vercel `/api/chat` : instancie le client Anthropic, applique le rate-limit, appelle `chatCore`. |
| `api/lead.js` | Handler Vercel `/api/lead` : instancie Mailjet, applique le rate-limit, appelle `leadCore`. |
| `chat-widget.css` | Style du widget (fenêtre blanche, pilule dégradée). |
| `chat-widget.js` | Widget front-end autonome. |
| `index.html` | Modifié : ajoute le `<link>` CSS et le `<script>` du widget. |
| `.gitignore` | Modifié : ignore `node_modules/` et `.env`. |

> **CSP :** `vercel.json` autorise déjà `connect-src 'self'` et `script-src 'self'` — les appels vers `/api/*` (même origine) et le chargement de `/chat-widget.js` passent sans modification des en-têtes.

---

### Task 1 : Scaffolding du projet Node

**Files:**
- Create: `package.json`
- Create: `.env.example`
- Modify: `.gitignore`

- [ ] **Step 1 : Créer `package.json`**

```json
{
  "name": "expia-site",
  "version": "1.0.0",
  "private": true,
  "type": "module",
  "scripts": {
    "test": "node --test"
  }
}
```

- [ ] **Step 2 : Installer les dépendances**

Run: `npm install @anthropic-ai/sdk node-mailjet`
Expected: `package.json` gagne un bloc `dependencies` avec les deux paquets ; `node_modules/` et `package-lock.json` sont créés.

- [ ] **Step 3 : Créer `.env.example`**

```
# Clé API Anthropic (console.anthropic.com)
ANTHROPIC_API_KEY=sk-ant-xxxxx

# Identifiants Mailjet (compte existant)
MAILJET_API_KEY=xxxxx
MAILJET_SECRET_KEY=xxxxx
```

- [ ] **Step 4 : Ajouter les exclusions à `.gitignore`**

Ajouter ces lignes à la fin de `.gitignore` :

```
node_modules/
.env
package-lock.json
```

- [ ] **Step 5 : Vérifier que le runner de test fonctionne**

Run: `npm test`
Expected: sortie « tests 0 … » sans erreur de configuration (aucun test pour l'instant, exit 0).

- [ ] **Step 6 : Commit**

```bash
git add package.json .env.example .gitignore
git commit -m "Ajoute le scaffolding Node pour les fonctions serverless du chatbot"
```

---

### Task 2 : Fonctions de validation (TDD)

**Files:**
- Create: `api/_lib/validation.js`
- Test: `api/_lib/validation.test.js`

- [ ] **Step 1 : Écrire les tests qui échouent**

`api/_lib/validation.test.js` :

```js
import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  sanitizeMessages,
  isValidEmail,
  validateLead,
  ValidationError,
  MAX_MESSAGE_LENGTH,
  MAX_HISTORY,
} from './validation.js';

test('sanitizeMessages garde uniquement user/assistant et borne la longueur', () => {
  const out = sanitizeMessages([
    { role: 'system', content: 'ignore' },
    { role: 'assistant', content: 'salut' },
    { role: 'user', content: 'x'.repeat(MAX_MESSAGE_LENGTH + 50) },
  ]);
  assert.equal(out.length, 2);
  assert.equal(out[1].content.length, MAX_MESSAGE_LENGTH);
});

test('sanitizeMessages borne l’historique à MAX_HISTORY', () => {
  const many = Array.from({ length: MAX_HISTORY + 5 }, () => ({ role: 'user', content: 'hi' }));
  assert.equal(sanitizeMessages(many).length, MAX_HISTORY);
});

test('sanitizeMessages rejette une entrée non tableau', () => {
  assert.throws(() => sanitizeMessages('nope'), ValidationError);
});

test('sanitizeMessages rejette si le dernier message n’est pas de l’utilisateur', () => {
  assert.throws(() => sanitizeMessages([{ role: 'assistant', content: 'fin' }]), ValidationError);
});

test('isValidEmail', () => {
  assert.equal(isValidEmail('a@b.fr'), true);
  assert.equal(isValidEmail('nope'), false);
});

test('validateLead accepte un lead complet', () => {
  const lead = validateLead({ name: 'Jean', contact: 'jean@x.fr', consent: true, message: 'devis' });
  assert.equal(lead.name, 'Jean');
  assert.equal(lead.contact, 'jean@x.fr');
});

test('validateLead exige le consentement', () => {
  assert.throws(() => validateLead({ name: 'Jean', contact: 'jean@x.fr', consent: false }), ValidationError);
});

test('validateLead rejette un nom vide', () => {
  assert.throws(() => validateLead({ name: '  ', contact: 'jean@x.fr', consent: true }), ValidationError);
});
```

- [ ] **Step 2 : Lancer les tests pour vérifier qu'ils échouent**

Run: `node --test api/_lib/validation.test.js`
Expected: FAIL (module `./validation.js` introuvable).

- [ ] **Step 3 : Implémenter `api/_lib/validation.js`**

```js
export const MAX_MESSAGE_LENGTH = 2000;
export const MAX_HISTORY = 20;

export class ValidationError extends Error {}

export function sanitizeMessages(raw) {
  if (!Array.isArray(raw)) throw new ValidationError('Le champ « messages » doit être un tableau.');
  const cleaned = raw
    .filter((m) => m && (m.role === 'user' || m.role === 'assistant') && typeof m.content === 'string')
    .map((m) => ({ role: m.role, content: m.content.slice(0, MAX_MESSAGE_LENGTH) }));
  if (cleaned.length === 0) throw new ValidationError('Aucun message valide.');
  if (cleaned[cleaned.length - 1].role !== 'user') {
    throw new ValidationError('Le dernier message doit venir de l’utilisateur.');
  }
  return cleaned.slice(-MAX_HISTORY);
}

export function isValidEmail(s) {
  return typeof s === 'string' && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s);
}

export function validateLead(body) {
  const name = typeof body?.name === 'string' ? body.name.trim() : '';
  const contact = typeof body?.contact === 'string' ? body.contact.trim() : '';
  const consent = body?.consent === true;
  if (name.length < 1 || name.length > 100) throw new ValidationError('Nom invalide.');
  if (contact.length < 3 || contact.length > 200) throw new ValidationError('Coordonnées invalides.');
  if (!consent) throw new ValidationError('Le consentement est requis.');
  const message = typeof body?.message === 'string' ? body.message.slice(0, 2000) : '';
  return { name, contact, message };
}
```

- [ ] **Step 4 : Lancer les tests pour vérifier qu'ils passent**

Run: `node --test api/_lib/validation.test.js`
Expected: PASS (tous les tests verts).

- [ ] **Step 5 : Commit**

```bash
git add api/_lib/validation.js api/_lib/validation.test.js
git commit -m "Ajoute les fonctions de validation des entrees du chatbot"
```

---

### Task 3 : Limiteur de débit (TDD)

**Files:**
- Create: `api/_lib/rateLimit.js`
- Test: `api/_lib/rateLimit.test.js`

> Note : en serverless, la mémoire n'est pas partagée entre instances — ce limiteur est un garde-fou « best effort », pas une protection stricte. Suffisant pour un site vitrine ; une version robuste (Vercel KV / Upstash) est hors périmètre v1.

- [ ] **Step 1 : Écrire les tests qui échouent**

`api/_lib/rateLimit.test.js` :

```js
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createRateLimiter } from './rateLimit.js';

test('autorise jusqu’à max requêtes dans la fenêtre', () => {
  let t = 1000;
  const check = createRateLimiter({ windowMs: 60000, max: 3, now: () => t });
  assert.equal(check('ip'), true);
  assert.equal(check('ip'), true);
  assert.equal(check('ip'), true);
  assert.equal(check('ip'), false);
});

test('réinitialise après la fenêtre', () => {
  let t = 1000;
  const check = createRateLimiter({ windowMs: 60000, max: 1, now: () => t });
  assert.equal(check('ip'), true);
  assert.equal(check('ip'), false);
  t += 60001;
  assert.equal(check('ip'), true);
});

test('sépare les clés (IP) différentes', () => {
  const check = createRateLimiter({ windowMs: 60000, max: 1, now: () => 0 });
  assert.equal(check('a'), true);
  assert.equal(check('b'), true);
});
```

- [ ] **Step 2 : Lancer les tests pour vérifier qu'ils échouent**

Run: `node --test api/_lib/rateLimit.test.js`
Expected: FAIL (module introuvable).

- [ ] **Step 3 : Implémenter `api/_lib/rateLimit.js`**

```js
export function createRateLimiter({ windowMs = 60000, max = 8, now = () => Date.now() } = {}) {
  const hits = new Map();
  return function check(key) {
    const t = now();
    const recent = (hits.get(key) || []).filter((ts) => t - ts < windowMs);
    recent.push(t);
    hits.set(key, recent);
    return recent.length <= max;
  };
}
```

- [ ] **Step 4 : Lancer les tests pour vérifier qu'ils passent**

Run: `node --test api/_lib/rateLimit.test.js`
Expected: PASS.

- [ ] **Step 5 : Commit**

```bash
git add api/_lib/rateLimit.js api/_lib/rateLimit.test.js
git commit -m "Ajoute un limiteur de debit en memoire"
```

---

### Task 4 : System prompt EXPIA

**Files:**
- Create: `api/_lib/systemPrompt.js`

> Le contenu ci-dessous est un point de départ solide. L'implémenteur peut l'enrichir avec les détails réels du site (`index.html`, `llms.txt`) sans changer la structure.

- [ ] **Step 1 : Créer `api/_lib/systemPrompt.js`**

```js
export const SYSTEM_PROMPT = `Tu es l'assistant virtuel d'EXPIA, une agence spécialisée dans l'automatisation et l'intelligence artificielle pour les TPE et PME.

Zone d'intervention : Morbihan, presqu'île guérandaise et sud Loire-Atlantique.

Ton rôle :
- Répondre clairement et chaleureusement aux questions des visiteurs sur EXPIA : services proposés, façon de travailler, zone géographique, comment être recontacté.
- Rester STRICTEMENT dans le périmètre d'EXPIA. Pour toute question hors sujet (actualité, autres entreprises, aide générale sans lien avec EXPIA), redirige poliment : « Je suis là pour vous renseigner sur EXPIA et l'automatisation de votre activité. »
- Quand un visiteur exprime un besoin concret ou un intérêt pour un projet, invite-le naturellement à laisser ses coordonnées via le bouton « Être recontacté » du chat, pour qu'Esteban le recontacte.

Style : phrases courtes, ton professionnel et accessible, en français. Pas de jargon inutile. Ne promets jamais de tarif ou de délai précis : invite plutôt à un échange direct.`;
```

- [ ] **Step 2 : Vérifier l'import (smoke test manuel)**

Run: `node -e "import('./api/_lib/systemPrompt.js').then(m => console.log(m.SYSTEM_PROMPT.length > 100))"`
Expected: `true`

- [ ] **Step 3 : Commit**

```bash
git add api/_lib/systemPrompt.js
git commit -m "Ajoute le system prompt cadrant l'assistant sur EXPIA"
```

---

### Task 5 : Logique de chat (TDD)

**Files:**
- Create: `api/_lib/chatCore.js`
- Test: `api/_lib/chatCore.test.js`

- [ ] **Step 1 : Écrire les tests qui échouent**

`api/_lib/chatCore.test.js` :

```js
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { handleChat } from './chatCore.js';
import { ValidationError } from './validation.js';

function fakeAnthropic(reply) {
  return {
    messages: {
      create: async (params) => {
        fakeAnthropic.lastParams = params;
        return { content: [{ type: 'text', text: reply }] };
      },
    },
  };
}

test('handleChat renvoie le texte de la réponse', async () => {
  const anthropic = fakeAnthropic('Bonjour !');
  const result = await handleChat({ messages: [{ role: 'user', content: 'salut' }] }, { anthropic });
  assert.equal(result.reply, 'Bonjour !');
});

test('handleChat utilise le modèle Haiku et un system prompt', async () => {
  const anthropic = fakeAnthropic('ok');
  await handleChat({ messages: [{ role: 'user', content: 'salut' }] }, { anthropic });
  assert.equal(fakeAnthropic.lastParams.model, 'claude-haiku-4-5');
  assert.ok(fakeAnthropic.lastParams.system.length > 0);
});

test('handleChat rejette une entrée invalide', async () => {
  const anthropic = fakeAnthropic('ok');
  await assert.rejects(() => handleChat({ messages: [] }, { anthropic }), ValidationError);
});
```

- [ ] **Step 2 : Lancer les tests pour vérifier qu'ils échouent**

Run: `node --test api/_lib/chatCore.test.js`
Expected: FAIL (module introuvable).

- [ ] **Step 3 : Implémenter `api/_lib/chatCore.js`**

```js
import { sanitizeMessages } from './validation.js';
import { SYSTEM_PROMPT } from './systemPrompt.js';

export async function handleChat(body, { anthropic }) {
  const messages = sanitizeMessages(body?.messages);
  const response = await anthropic.messages.create({
    model: 'claude-haiku-4-5',
    max_tokens: 1024,
    system: SYSTEM_PROMPT,
    messages,
  });
  const reply = response.content
    .filter((b) => b.type === 'text')
    .map((b) => b.text)
    .join('');
  return { reply };
}
```

- [ ] **Step 4 : Lancer les tests pour vérifier qu'ils passent**

Run: `node --test api/_lib/chatCore.test.js`
Expected: PASS.

- [ ] **Step 5 : Commit**

```bash
git add api/_lib/chatCore.js api/_lib/chatCore.test.js
git commit -m "Ajoute la logique d'appel a Claude Haiku pour le chat"
```

---

### Task 6 : Handler Vercel `/api/chat`

**Files:**
- Create: `api/chat.js`

> Handler fin (câblage). Vérifié en bout de chaîne à la Task 12 avec `vercel dev`.

- [ ] **Step 1 : Créer `api/chat.js`**

```js
import Anthropic from '@anthropic-ai/sdk';
import { handleChat } from './_lib/chatCore.js';
import { createRateLimiter } from './_lib/rateLimit.js';
import { ValidationError } from './_lib/validation.js';

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
const rateLimit = createRateLimiter({ windowMs: 60000, max: 8 });

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Méthode non autorisée.' });
    return;
  }
  const ip = (req.headers['x-forwarded-for'] || '').split(',')[0].trim() || 'unknown';
  if (!rateLimit(ip)) {
    res.status(429).json({ error: 'Trop de messages, patientez un instant.' });
    return;
  }
  try {
    const result = await handleChat(req.body, { anthropic });
    res.status(200).json(result);
  } catch (e) {
    if (e instanceof ValidationError) {
      res.status(400).json({ error: e.message });
      return;
    }
    console.error('Erreur /api/chat:', e);
    res.status(502).json({ error: 'Erreur de l’assistant, réessayez dans un instant.' });
  }
}
```

- [ ] **Step 2 : Vérifier que la suite de tests reste verte**

Run: `npm test`
Expected: PASS (les tests existants passent ; `api/chat.js` n'est pas importé par les tests).

- [ ] **Step 3 : Commit**

```bash
git add api/chat.js
git commit -m "Ajoute le handler Vercel /api/chat"
```

---

### Task 7 : Logique de lead (TDD)

**Files:**
- Create: `api/_lib/leadCore.js`
- Test: `api/_lib/leadCore.test.js`

- [ ] **Step 1 : Écrire les tests qui échouent**

`api/_lib/leadCore.test.js` :

```js
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { handleLead } from './leadCore.js';
import { ValidationError } from './validation.js';

test('handleLead appelle sendMail avec le lead validé', async () => {
  let sent = null;
  const sendMail = async (lead) => { sent = lead; };
  const result = await handleLead(
    { name: 'Jean', contact: 'jean@x.fr', consent: true, message: 'devis' },
    { sendMail },
  );
  assert.deepEqual(result, { ok: true });
  assert.equal(sent.name, 'Jean');
  assert.equal(sent.contact, 'jean@x.fr');
});

test('handleLead rejette sans consentement et n’envoie rien', async () => {
  let called = false;
  const sendMail = async () => { called = true; };
  await assert.rejects(
    () => handleLead({ name: 'Jean', contact: 'jean@x.fr', consent: false }, { sendMail }),
    ValidationError,
  );
  assert.equal(called, false);
});
```

- [ ] **Step 2 : Lancer les tests pour vérifier qu'ils échouent**

Run: `node --test api/_lib/leadCore.test.js`
Expected: FAIL (module introuvable).

- [ ] **Step 3 : Implémenter `api/_lib/leadCore.js`**

```js
import { validateLead } from './validation.js';

export async function handleLead(body, { sendMail }) {
  const lead = validateLead(body);
  await sendMail(lead);
  return { ok: true };
}
```

- [ ] **Step 4 : Lancer les tests pour vérifier qu'ils passent**

Run: `node --test api/_lib/leadCore.test.js`
Expected: PASS.

- [ ] **Step 5 : Commit**

```bash
git add api/_lib/leadCore.js api/_lib/leadCore.test.js
git commit -m "Ajoute la logique de traitement des leads"
```

---

### Task 8 : Handler Vercel `/api/lead`

**Files:**
- Create: `api/lead.js`

- [ ] **Step 1 : Créer `api/lead.js`**

```js
import Mailjet from 'node-mailjet';
import { handleLead } from './_lib/leadCore.js';
import { createRateLimiter } from './_lib/rateLimit.js';
import { ValidationError } from './_lib/validation.js';

const mailjet = new Mailjet({
  apiKey: process.env.MAILJET_API_KEY,
  apiSecret: process.env.MAILJET_SECRET_KEY,
});
const rateLimit = createRateLimiter({ windowMs: 60000, max: 3 });

async function sendMail(lead) {
  await mailjet.post('send', { version: 'v3.1' }).request({
    Messages: [
      {
        From: { Email: 'noreply@expia.fr', Name: 'Assistant EXPIA' },
        To: [{ Email: 'esteban@expia.fr', Name: 'Esteban' }],
        Subject: `Nouveau contact chatbot — ${lead.name}`,
        TextPart:
          `Nom : ${lead.name}\n` +
          `Coordonnées : ${lead.contact}\n\n` +
          `Contexte de la conversation :\n${lead.message || '(aucun)'}`,
      },
    ],
  });
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Méthode non autorisée.' });
    return;
  }
  const ip = (req.headers['x-forwarded-for'] || '').split(',')[0].trim() || 'unknown';
  if (!rateLimit(ip)) {
    res.status(429).json({ error: 'Trop de tentatives, patientez un instant.' });
    return;
  }
  try {
    const result = await handleLead(req.body, { sendMail });
    res.status(200).json(result);
  } catch (e) {
    if (e instanceof ValidationError) {
      res.status(400).json({ error: e.message });
      return;
    }
    console.error('Erreur /api/lead:', e);
    res.status(502).json({ error: 'Envoi impossible pour le moment, écrivez-nous à esteban@expia.fr.' });
  }
}
```

- [ ] **Step 2 : Vérifier que la suite de tests reste verte**

Run: `npm test`
Expected: PASS.

- [ ] **Step 3 : Commit**

```bash
git add api/lead.js
git commit -m "Ajoute le handler Vercel /api/lead avec envoi Mailjet"
```

---

### Task 9 : Style du widget

**Files:**
- Create: `chat-widget.css`

- [ ] **Step 1 : Créer `chat-widget.css`**

```css
#expia-chat { position: fixed; bottom: 20px; right: 20px; z-index: 9999; font-family: system-ui, -apple-system, sans-serif; }

#expia-launcher {
  display: flex; align-items: center; gap: 8px;
  background: linear-gradient(135deg, #3b82f6, #8b5cf6);
  color: #fff; font-size: 14px; font-weight: 600; border: none;
  padding: 12px 18px; border-radius: 30px; cursor: pointer;
  box-shadow: 0 8px 24px rgba(139, 92, 246, 0.45);
}

#expia-panel {
  width: 340px; max-width: calc(100vw - 40px); height: 480px; max-height: calc(100vh - 40px);
  display: flex; flex-direction: column; overflow: hidden;
  background: #fff; border-radius: 16px; box-shadow: 0 20px 50px rgba(0, 0, 0, 0.35);
}

#expia-head {
  display: flex; align-items: center; justify-content: space-between;
  padding: 12px 14px; border-bottom: 1px solid #eef0f4; background: #fff;
}
.expia-head-info strong { display: block; font-size: 14px; color: #0f172a; }
.expia-head-info span { font-size: 11px; color: #22c55e; }
.expia-head-actions { display: flex; align-items: center; gap: 6px; }
#expia-lead-btn { background: #f1f3f6; border: none; border-radius: 16px; padding: 6px 10px; font-size: 11px; cursor: pointer; color: #334155; }
#expia-close { background: none; border: none; font-size: 16px; cursor: pointer; color: #94a3b8; }

#expia-messages { flex: 1; overflow-y: auto; padding: 12px; display: flex; flex-direction: column; gap: 8px; background: #f7f8fa; }
.expia-msg { max-width: 82%; padding: 8px 11px; font-size: 13px; line-height: 1.4; border-radius: 12px; white-space: pre-wrap; }
.expia-msg.bot { align-self: flex-start; background: #fff; color: #1e293b; border: 1px solid #eef0f4; border-bottom-left-radius: 3px; }
.expia-msg.user { align-self: flex-end; background: #3b82f6; color: #fff; border-bottom-right-radius: 3px; }

.expia-suggestions { display: flex; flex-wrap: wrap; gap: 6px; }
.expia-suggestions button { background: #fff; border: 1px solid #dbe2ea; color: #334155; font-size: 12px; padding: 6px 10px; border-radius: 16px; cursor: pointer; }

#expia-form { display: flex; gap: 6px; align-items: center; padding: 8px 10px; border-top: 1px solid #eef0f4; background: #fff; }
#expia-input { flex: 1; border: 1px solid #dbe2ea; border-radius: 20px; padding: 8px 12px; font-size: 13px; outline: none; }
#expia-form button[type="submit"] { width: 34px; height: 34px; border-radius: 50%; border: none; background: linear-gradient(135deg, #3b82f6, #8b5cf6); color: #fff; cursor: pointer; }

.expia-lead-form { display: flex; flex-direction: column; gap: 6px; background: #fff; border: 1px solid #eef0f4; border-radius: 12px; padding: 10px; }
.expia-lead-form input { border: 1px solid #dbe2ea; border-radius: 8px; padding: 7px 9px; font-size: 13px; }
.expia-lead-form label { font-size: 11px; color: #64748b; display: flex; gap: 6px; align-items: flex-start; }
.expia-lead-form button { background: linear-gradient(135deg, #3b82f6, #8b5cf6); color: #fff; border: none; border-radius: 8px; padding: 8px; font-size: 13px; cursor: pointer; }
.expia-lead-form a { color: #3b82f6; }
```

- [ ] **Step 2 : Commit**

```bash
git add chat-widget.css
git commit -m "Ajoute le style du widget de chat"
```

---

### Task 10 : Widget front-end

**Files:**
- Create: `chat-widget.js`

- [ ] **Step 1 : Créer `chat-widget.js`**

```js
(function () {
  'use strict';

  var GREETING = "Bonjour ! Je suis l'assistant d'EXPIA. Comment puis-je vous aider ?";
  var SUGGESTIONS = ['Vous faites quoi exactement ?', 'Combien ça coûte ?', 'Vous intervenez sur le Morbihan ?'];
  var history = [];

  var root = document.createElement('div');
  root.id = 'expia-chat';
  root.innerHTML =
    '<button id="expia-launcher" aria-label="Discuter avec l\'assistant">✦ Discuter avec l\'assistant</button>' +
    '<div id="expia-panel" hidden>' +
      '<header id="expia-head">' +
        '<div class="expia-head-info"><strong>Assistant EXPIA</strong><span>● En ligne</span></div>' +
        '<div class="expia-head-actions">' +
          '<button id="expia-lead-btn" type="button">📩 Être recontacté</button>' +
          '<button id="expia-close" type="button" aria-label="Fermer">✕</button>' +
        '</div>' +
      '</header>' +
      '<div id="expia-messages"></div>' +
      '<form id="expia-form">' +
        '<input id="expia-input" type="text" placeholder="Écrire un message…" autocomplete="off" maxlength="2000" />' +
        '<button type="submit" aria-label="Envoyer">➤</button>' +
      '</form>' +
    '</div>';
  document.body.appendChild(root);

  var $ = function (sel) { return root.querySelector(sel); };
  var launcher = $('#expia-launcher');
  var panel = $('#expia-panel');
  var messagesEl = $('#expia-messages');
  var form = $('#expia-form');
  var input = $('#expia-input');
  var started = false;

  function scrollDown() { messagesEl.scrollTop = messagesEl.scrollHeight; }

  function addMessage(role, text) {
    var el = document.createElement('div');
    el.className = 'expia-msg ' + (role === 'user' ? 'user' : 'bot');
    el.textContent = text;
    messagesEl.appendChild(el);
    scrollDown();
    return el;
  }

  function addSuggestions() {
    var wrap = document.createElement('div');
    wrap.className = 'expia-suggestions';
    SUGGESTIONS.forEach(function (s) {
      var b = document.createElement('button');
      b.type = 'button';
      b.textContent = s;
      b.onclick = function () { wrap.remove(); send(s); };
      wrap.appendChild(b);
    });
    messagesEl.appendChild(wrap);
    scrollDown();
  }

  function startConversation() {
    if (started) return;
    started = true;
    addMessage('bot', GREETING);
    addSuggestions();
  }

  function send(text) {
    text = (text || '').trim();
    if (!text) return;
    addMessage('user', text);
    history.push({ role: 'user', content: text });
    input.value = '';

    var typing = addMessage('bot', '…');
    fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ messages: history }),
    })
      .then(function (r) { return r.json().then(function (d) { return { ok: r.ok, d: d }; }); })
      .then(function (res) {
        if (!res.ok) throw new Error(res.d.error || 'Erreur');
        typing.textContent = res.d.reply;
        history.push({ role: 'assistant', content: res.d.reply });
        scrollDown();
      })
      .catch(function () {
        typing.textContent = "Désolé, une erreur est survenue. Vous pouvez aussi nous écrire à esteban@expia.fr.";
      });
  }

  function showLeadForm() {
    if (root.querySelector('.expia-lead-form')) return;
    var box = document.createElement('div');
    box.className = 'expia-lead-form';
    box.innerHTML =
      '<input class="expia-lead-name" type="text" placeholder="Votre nom" maxlength="100" />' +
      '<input class="expia-lead-contact" type="text" placeholder="Email ou téléphone" maxlength="200" />' +
      '<label><input class="expia-lead-consent" type="checkbox" /> ' +
        'J\'accepte d\'être recontacté par EXPIA (<a href="/mentions-legales.html" target="_blank">mentions légales</a>).</label>' +
      '<button type="button" class="expia-lead-send">Envoyer mes coordonnées</button>';
    messagesEl.appendChild(box);
    scrollDown();

    box.querySelector('.expia-lead-send').onclick = function () {
      var payload = {
        name: box.querySelector('.expia-lead-name').value,
        contact: box.querySelector('.expia-lead-contact').value,
        consent: box.querySelector('.expia-lead-consent').checked,
        message: history.map(function (m) { return m.role + ': ' + m.content; }).join('\n'),
      };
      var btn = box.querySelector('.expia-lead-send');
      btn.disabled = true;
      btn.textContent = 'Envoi…';
      fetch('/api/lead', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
        .then(function (r) { return r.json().then(function (d) { return { ok: r.ok, d: d }; }); })
        .then(function (res) {
          if (!res.ok) throw new Error(res.d.error || 'Erreur');
          box.remove();
          addMessage('bot', 'Merci ! Esteban vous recontactera très vite.');
        })
        .catch(function (e) {
          btn.disabled = false;
          btn.textContent = 'Envoyer mes coordonnées';
          addMessage('bot', e.message || 'Envoi impossible, écrivez-nous à esteban@expia.fr.');
        });
    };
  }

  launcher.onclick = function () {
    panel.hidden = false;
    launcher.hidden = true;
    startConversation();
    input.focus();
  };
  $('#expia-close').onclick = function () {
    panel.hidden = true;
    launcher.hidden = false;
  };
  $('#expia-lead-btn').onclick = showLeadForm;
  form.onsubmit = function (e) { e.preventDefault(); send(input.value); };
})();
```

- [ ] **Step 2 : Commit**

```bash
git add chat-widget.js
git commit -m "Ajoute le widget de chat front-end"
```

---

### Task 11 : Intégrer le widget dans `index.html`

**Files:**
- Modify: `index.html`

- [ ] **Step 1 : Ajouter le lien CSS dans le `<head>`**

Juste avant la balise fermante `</head>` de `index.html`, ajouter :

```html
<link rel="stylesheet" href="/chat-widget.css">
```

- [ ] **Step 2 : Ajouter le script avant `</body>`**

Juste avant la balise fermante `</body>` de `index.html`, ajouter :

```html
<script src="/chat-widget.js" defer></script>
```

- [ ] **Step 3 : Vérifier l'affichage statique (sans backend)**

Run: ouvrir `index.html` dans le navigateur (double-clic ou serveur statique).
Expected: la pilule « ✦ Discuter avec l'assistant » apparaît en bas à droite ; un clic ouvre la fenêtre blanche avec le message d'accueil et les 3 suggestions. (L'envoi de message échouera tant que `/api` n'est pas servi — normal, vérifié à la Task 12.)

- [ ] **Step 4 : Commit**

```bash
git add index.html
git commit -m "Integre le widget de chat dans la page d'accueil"
```

---

### Task 12 : Vérification de bout en bout

**Files:** aucun (test manuel).

> Nécessite le CLI Vercel (`npm i -g vercel`) et les vraies clés dans un fichier `.env` local (copié de `.env.example`), ainsi qu'un domaine/adresse expéditeur validé dans Mailjet.

- [ ] **Step 1 : Lancer toute la suite de tests unitaires**

Run: `npm test`
Expected: PASS (tous les fichiers `*.test.js` verts).

- [ ] **Step 2 : Démarrer l'environnement local Vercel**

Run: `vercel dev`
Expected: serveur local démarré (ex. `http://localhost:3000`), variables d'environnement chargées depuis `.env`.

- [ ] **Step 3 : Tester une conversation**

Ouvrir `http://localhost:3000`, ouvrir le chat, envoyer « Vous faites quoi ? ».
Expected: une réponse de l'assistant cadrée sur EXPIA s'affiche.

- [ ] **Step 4 : Tester le hors-sujet**

Envoyer « Quelle est la météo à Paris ? ».
Expected: l'assistant redirige poliment vers le périmètre EXPIA.

- [ ] **Step 5 : Tester la capture de lead**

Cliquer « 📩 Être recontacté », remplir nom + email, cocher le consentement, envoyer.
Expected: message de confirmation dans le chat ; un email arrive sur `esteban@expia.fr`.

- [ ] **Step 6 : Tester le refus sans consentement**

Rouvrir le formulaire, remplir sans cocher le consentement, envoyer.
Expected: le message reste, l'envoi est refusé (pas d'email).

- [ ] **Step 7 : Déploiement**

Une fois validé, s'assurer que `ANTHROPIC_API_KEY`, `MAILJET_API_KEY`, `MAILJET_SECRET_KEY` sont définies dans les variables d'environnement du projet Vercel (Production), puis pousser sur `main` (déploiement automatique) ou lancer `vercel --prod`.

---

## Résumé des vérifications

- Validation, limiteur, chatCore, leadCore : couverts par des tests unitaires (`node --test`).
- Handlers Vercel + widget + Mailjet + Claude réel : couverts par la vérification manuelle de bout en bout (Task 12).
- Sécurité : secrets uniquement côté serveur ; rate-limit et bornage des entrées en place ; CSP existante compatible (même origine).
- RGPD : consentement obligatoire (testé), lien mentions légales dans le formulaire, aucun stockage serveur.
