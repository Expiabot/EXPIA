#!/usr/bin/env node
// Notifie l'Indexing API de Google qu'une ou plusieurs URL doivent etre (re)explorees.
// Zero dependance : node:crypto + fetch natif (Node 18+).
//
// Deux modes d'authentification, dans cet ordre de priorite :
//   A. OAuth (recommande, aucune cle a telecharger) : refresh token obtenu via
//      scripts/oauth-setup-indexing.mjs et stocke dans .gsc-indexing-token.json.
//      Le client OAuth est lu depuis GSC_OAUTH_CLIENT_SECRETS_FILE (voir ce script).
//   B. Compte de service (fallback) : cle JSON via GCP_INDEXING_SA_KEY_JSON,
//      GCP_INDEXING_SA_KEY_B64, ou fichier ./gcp-indexing-sa.json.
//
// Dans les deux cas, le compte qui autorise doit etre PROPRIETAIRE de la propriete
// Search Console. Pour l'OAuth c'est esteban@expia.fr (deja proprietaire).
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
const OAUTH_TOKEN_FILE = join(ROOT, '.gsc-indexing-token.json');
const DEFAULT_SECRETS = 'C:/Users/emart/seo-tools/mcp-gsc/client_secrets.json';

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
  return null;
}

const b64url = (buf) =>
  Buffer.from(buf).toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');

// --- Mode A : OAuth (refresh token) -> access token ---
async function getAccessTokenOAuth() {
  if (!existsSync(OAUTH_TOKEN_FILE)) return null;
  const { refresh_token } = JSON.parse(readFileSync(OAUTH_TOKEN_FILE, 'utf8'));
  if (!refresh_token) return null;

  const secretsPath = process.env.GSC_OAUTH_CLIENT_SECRETS_FILE || DEFAULT_SECRETS;
  if (!existsSync(secretsPath)) {
    throw new Error(`client_secrets.json introuvable: ${secretsPath}`);
  }
  const raw = JSON.parse(readFileSync(secretsPath, 'utf8'));
  const c = raw.web || raw.installed;

  const res = await fetch(TOKEN_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id: c.client_id,
      client_secret: c.client_secret,
      refresh_token,
      grant_type: 'refresh_token',
    }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(`oauth refresh ${res.status}: ${JSON.stringify(data)}`);
  return data.access_token;
}

// --- Mode B : compte de service (JWT RS256) -> access token ---
async function getAccessTokenSA(sa) {
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

  let token = await getAccessTokenOAuth();
  if (!token) {
    const sa = loadServiceAccount();
    if (!sa) {
      throw new Error(
        'Aucune authentification disponible. Lance d\'abord "node scripts/oauth-setup-indexing.mjs" ' +
        '(OAuth), ou fournis une cle de compte de service.'
      );
    }
    token = await getAccessTokenSA(sa);
  }

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
