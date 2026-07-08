export function createRateLimiter({ windowMs = 60000, max = 8, now = () => Date.now() } = {}) {
  const hits = new Map();
  return function check(key) {
    const t = now();
    const recent = (hits.get(key) || []).filter((ts) => t - ts < windowMs);
    recent.push(t);
    hits.set(key, recent);
    return recent.length <= max;
  };
}
