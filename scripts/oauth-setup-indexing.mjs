#!/usr/bin/env node
// Consentement OAuth UNIQUE pour l'Indexing API de Google.
// Reutilise le client OAuth existant (pas de compte de service, pas de cle a telecharger).
// A lancer une seule fois : ouvre une page de consentement Google, recupere un
// "refresh token" longue duree, et l'enregistre dans .gsc-indexing-token.json (gitignore).
// Ensuite, ping-indexing.mjs s'authentifie tout seul avec ce refresh token.
//
// Prerequis : le compte Google qui donne le consentement doit etre PROPRIETAIRE
// de la propriete Search Console (esteban@expia.fr l'est deja).
//
// Usage :
//   node scripts/oauth-setup-indexing.mjs
//
// Le fichier client_secrets.json du client OAuth "Agents Seo" est lu depuis
// GSC_OAUTH_CLIENT_SECRETS_FILE, ou a defaut C:/Users/emart/seo-tools/mcp-gsc/client_secrets.json

import { createServer } from 'node:http';
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { exec } from 'node:child_process';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const DEFAULT_SECRETS = 'C:/Users/emart/seo-tools/mcp-gsc/client_secrets.json';
const REDIRECT_URI = 'http://127.0.0.1:8765/oath2callback'; // doit correspondre EXACTEMENT au client (typo "oath" incluse)
const PORT = 8765;
const SCOPE = 'https://www.googleapis.com/auth/indexing';
const AUTH_URL = 'https://accounts.google.com/o/oauth2/v2/auth';
const TOKEN_URL = 'https://oauth2.googleapis.com/token';
const TOKEN_FILE = join(ROOT, '.gsc-indexing-token.json');

function loadClientSecrets() {
  const path = process.env.GSC_OAUTH_CLIENT_SECRETS_FILE || DEFAULT_SECRETS;
  if (!existsSync(path)) {
    throw new Error(`client_secrets.json introuvable: ${path}. Definis GSC_OAUTH_CLIENT_SECRETS_FILE.`);
  }
  const raw = JSON.parse(readFileSync(path, 'utf8'));
  const c = raw.web || raw.installed;
  if (!c) throw new Error('Format client_secrets.json inattendu (ni "web" ni "installed").');
  return { client_id: c.client_id, client_secret: c.client_secret };
}

async function exchangeCode(code, creds) {
  const res = await fetch(TOKEN_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      code,
      client_id: creds.client_id,
      client_secret: creds.client_secret,
      redirect_uri: REDIRECT_URI,
      grant_type: 'authorization_code',
    }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(`token ${res.status}: ${JSON.stringify(data)}`);
  return data;
}

function main() {
  const creds = loadClientSecrets();
  const authUrl =
    `${AUTH_URL}?` +
    new URLSearchParams({
      client_id: creds.client_id,
      redirect_uri: REDIRECT_URI,
      response_type: 'code',
      scope: SCOPE,
      access_type: 'offline',
      prompt: 'consent',
    }).toString();

  const server = createServer(async (req, res) => {
    if (!req.url.startsWith('/oath2callback')) {
      res.writeHead(404).end('Not found');
      return;
    }
    const url = new URL(req.url, `http://127.0.0.1:${PORT}`);
    const code = url.searchParams.get('code');
    const error = url.searchParams.get('error');
    if (error) {
      res.writeHead(400, { 'Content-Type': 'text/html; charset=utf-8' })
        .end(`<h1>Echec du consentement</h1><p>${error}</p>`);
      console.error(`Consentement refuse: ${error}`);
      server.close();
      process.exit(1);
    }
    try {
      const tokens = await exchangeCode(code, creds);
      if (!tokens.refresh_token) {
        throw new Error('Pas de refresh_token renvoye (reessaie, le consentement doit etre "offline").');
      }
      writeFileSync(
        TOKEN_FILE,
        JSON.stringify({ refresh_token: tokens.refresh_token, scope: SCOPE, saved_at: new Date().toISOString() }, null, 2)
      );
      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' }).end(
        '<h1>Autorisation reussie</h1><p>Tu peux fermer cet onglet et revenir au terminal.</p>'
      );
      console.log(`\nOK. Refresh token enregistre dans ${TOKEN_FILE}`);
      console.log('Tu peux maintenant lancer : npm run index-ping -- <url>');
      server.close();
      process.exit(0);
    } catch (e) {
      res.writeHead(500, { 'Content-Type': 'text/html; charset=utf-8' })
        .end(`<h1>Erreur</h1><pre>${e.message}</pre>`);
      console.error(`Echec: ${e.message}`);
      server.close();
      process.exit(1);
    }
  });

  server.listen(PORT, '127.0.0.1', () => {
    console.log('Ouvre cette URL dans ton navigateur (connecte en esteban@expia.fr) et autorise :\n');
    console.log(authUrl + '\n');
    // tentative d'ouverture auto (Windows/macOS/Linux)
    const opener = process.platform === 'win32' ? 'start ""' : process.platform === 'darwin' ? 'open' : 'xdg-open';
    exec(`${opener} "${authUrl}"`, () => {});
    console.log('En attente du retour de Google sur 127.0.0.1:8765 ...');
  });
}

try {
  main();
} catch (e) {
  console.error(`Echec: ${e.message}`);
  process.exit(1);
}
