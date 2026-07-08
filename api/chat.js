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
