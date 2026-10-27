/** In-memory limiter for minting Bolna calls. Resets when the server restarts. */
const g = globalThis as unknown as { __bharatCallLimit?: Map<string, number[]> };
const hits = (g.__bharatCallLimit ??= new Map<string, number[]>());

const num = (v: string | undefined, d: number) => {
  const n = Number(v);
  return Number.isFinite(n) && n > 0 ? n : d;
};

function checkLimit(key: string, max: number, windowMs: number): { ok: boolean; retryAfterSec: number } {
  const now = Date.now();
  const arr = (hits.get(key) ?? []).filter((t) => now - t < windowMs);
  if (arr.length >= max) {
    hits.set(key, arr);
    return { ok: false, retryAfterSec: Math.ceil((windowMs - (now - arr[0])) / 1000) };
  }
  arr.push(now);
  hits.set(key, arr);
  return { ok: true, retryAfterSec: 0 };
}

export function checkCallLimits(ip: string) {
  const perIp = num(process.env.CALLS_PER_IP_PER_HOUR, 6);
  const perDay = num(process.env.CALLS_PER_DAY, 100);
  const a = checkLimit(`ip:${ip}`, perIp, 60 * 60 * 1000);
  if (!a.ok) return { ok: false as const, retryAfterSec: a.retryAfterSec, reason: "You've started a lot of calls recently. Please try again later." };
  const b = checkLimit("site:day", perDay, 24 * 60 * 60 * 1000);
  if (!b.ok) return { ok: false as const, retryAfterSec: b.retryAfterSec, reason: "The daily limit of voice calls for this demo has been reached. Please try again tomorrow." };
  return { ok: true as const, retryAfterSec: 0, reason: "" };
}
