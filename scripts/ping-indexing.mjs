#!/usr/bin/env node
// Notifie l'Indexing API de Google qu'une ou plusieurs URL doivent etre (re)explorees.
// Zero dependance : signature JWT RS256 via node:crypto, appels via fetch natif (Node 18+).
//
// Prerequis (a faire une seule fois) :
//   1. Un compte de service Google Cloud avec l'API "Indexing API" activee.
//   2. L'email du compte de service ajoute comme PROPRIETAIRE de la propriete
//      Search Console (Parametres > Utilisateurs et autorisations > Ajouter > Proprietaire).
//   3. La cle JSON du compte de service disponible localement, fournie par l'une de ces voies :
//        - variable d'env GCP_INDEXING_SA_KEY_JSON  (le JSON brut)
//        - variable d'env GCP_INDEXING_SA_KEY_B64   (le JSON encode en base64)
//        - fichier ./gcp-indexing-sa.json           (gitignore)
//
// Usage :
//   node scripts/ping-indexing.mjs https://expia.fr/blog/mon-article.html [autre-url ...]
//   node scripts/ping-indexing.mjs --sitemap        (pousse toutes les URL blog/ du sitemap.xml)
//
// Sortie : une ligne par URL, "OK" ou "ERREUR <detail>". Code de sortie 1 si au moins une erreur.

import { createSign } from 'node:crypto';
import { readFileSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const TOKEN_URL = 'https://oauth2.googleapis.com/token';
const INDEXING_URL = 'https://indexing.googleapis.com/v3/urlNotifications:publish';
const SCOPE = 'https://www.googleapis.com/auth/indexing';

// --- Chargement minimal de .env.local puis .env (sans dependance) ---
function loadEnvFile(name) {
  const p = join(ROOT, name);
  if (!existsSync(p)) return;
  for (const line of readFileSync(p, 'utf8').split('\n')) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/i);
    if (!m) continue;
    let v = m[2];
    if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) {
      v = v.slice(1, -1);
    }
    if (process.env[m[1]] === undefined) process.env[m[1]] = v;
  }
}
loadEnvFile('.env.local');
loadEnvFile('.env');

// --- Lecture de la cle du compte de service ---
function loadServiceAccount() {
  if (process.env.GCP_INDEXING_SA_KEY_JSON) {
    return JSON.parse(process.env.GCP_INDEXING_SA_KEY_JSON);
  }
  if (process.env.GCP_INDEXING_SA_KEY_B64) {
    return JSON.parse(Buffer.from(process.env.GCP_INDEXING_SA_KEY_B64, 'base64').toString('utf8'));
  }
  const filePath = join(ROOT, 'gcp-indexing-sa.json');
  if (existsSync(filePath)) {
    return JSON.parse(readFileSync(filePath, 'utf8'));
  }
  throw new Error(
    'Cle du compte de service introuvable. Definis GCP_INDEXING_SA_KEY_JSON, ' +
    'GCP_INDEXING_SA_KEY_B64, ou place gcp-indexing-sa.json a la racine.'
  );
}

const b64url = (buf) =>
  Buffer.from(buf).toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');

// --- Echange JWT -> access token OAuth2 ---
async function getAccessToken(sa) {
  const now = Math.floor(Date.now() / 1000);
  const header = { alg: 'RS256', typ: 'JWT' };
  const claims = {
    iss: sa.client_email,
    scope: SCOPE,
    aud: TOKEN_URL,
    iat: now,
    exp: now + 3600,
  };
  const signingInput = `${b64url(JSON.stringify(header))}.${b64url(JSON.stringify(claims))}`;
  const signature = createSign('RSA-SHA256').update(signingInput).sign(sa.private_key);
  const jwt = `${signingInput}.${b64url(signature)}`;

  const res = await fetch(TOKEN_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
      assertion: jwt,
    }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(`token ${res.status}: ${JSON.stringify(data)}`);
  return data.access_token;
}

// --- Notification d'une URL ---
async function notifyUrl(token, url, type = 'URL_UPDATED') {
  const res = await fetch(INDEXING_URL, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ url, type }),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(`${res.status}: ${JSON.stringify(data)}`);
  return data;
}

// --- Recuperation des URL blog depuis sitemap.xml (option --sitemap) ---
function urlsFromSitemap() {
  const xml = readFileSync(join(ROOT, 'sitemap.xml'), 'utf8');
  return [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)]
    .map((m) => m[1].trim())
    .filter((u) => u.includes('/blog/') && u.endsWith('.html'));
}

async function main() {
  let args = process.argv.slice(2);
  if (args.length === 0) {
    console.error('Usage: node scripts/ping-indexing.mjs <url> [url ...] | --sitemap');
    process.exit(2);
  }
  const urls = args[0] === '--sitemap' ? urlsFromSitemap() : args;
  if (urls.length === 0) {
    console.error('Aucune URL a notifier.');
    process.exit(2);
  }

  const sa = loadServiceAccount();
  const token = await getAccessToken(sa);

  let hadError = false;
  for (const url of urls) {
    try {
      await notifyUrl(token, url);
      console.log(`OK    ${url}`);
    } catch (e) {
      hadError = true;
      console.log(`ERREUR ${url} -> ${e.message}`);
    }
  }
  process.exit(hadError ? 1 : 0);
}

main().catch((e) => {
  console.error(`Echec: ${e.message}`);
  process.exit(1);
});
