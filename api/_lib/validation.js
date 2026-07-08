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
