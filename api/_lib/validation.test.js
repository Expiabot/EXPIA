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
