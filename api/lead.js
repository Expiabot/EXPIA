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
