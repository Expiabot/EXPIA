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
