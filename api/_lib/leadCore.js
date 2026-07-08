import { validateLead } from './validation.js';

export async function handleLead(body, { sendMail }) {
  const lead = validateLead(body);
  await sendMail(lead);
  return { ok: true };
}
