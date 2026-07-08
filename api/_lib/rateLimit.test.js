import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createRateLimiter } from './rateLimit.js';

test('autorise jusqu’à max requêtes dans la fenêtre', () => {
  let t = 1000;
  const check = createRateLimiter({ windowMs: 60000, max: 3, now: () => t });
  assert.equal(check('ip'), true);
  assert.equal(check('ip'), true);
  assert.equal(check('ip'), true);
  assert.equal(check('ip'), false);
});

test('réinitialise après la fenêtre', () => {
  let t = 1000;
  const check = createRateLimiter({ windowMs: 60000, max: 1, now: () => t });
  assert.equal(check('ip'), true);
  assert.equal(check('ip'), false);
  t += 60001;
  assert.equal(check('ip'), true);
});

test('sépare les clés (IP) différentes', () => {
  const check = createRateLimiter({ windowMs: 60000, max: 1, now: () => 0 });
  assert.equal(check('a'), true);
  assert.equal(check('b'), true);
});
