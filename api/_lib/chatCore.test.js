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
