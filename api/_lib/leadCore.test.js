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
