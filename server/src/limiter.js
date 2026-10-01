/**
 * 极简内存限速器（零依赖）：滑动窗口计数。
 * login 用严档（防邀请码爆破），/api 总体用宽档（防滥用）。
 */
export function rateLimit({ windowMs, max }) {
  const hits = new Map();
  return (req, res, next) => {
    const now = Date.now();
    const k = req.ip || 'unknown';
    let rec = hits.get(k);
    if (!rec || now - rec.start > windowMs) {
      rec = { start: now, count: 0 };
      hits.set(k, rec);
    }
    rec.count += 1;
    if (hits.size > 5000) {
      for (const [key, r] of hits) if (now - r.start > windowMs) hits.delete(key);
    }
    if (rec.count > max) {
      return res.status(429).json({ error: 'too many requests' });
    }
    next();
  };
}

/** 登录：每 IP 每分钟 5 次（邀请码 12 位，限速后爆破不可行） */
export const loginLimit = rateLimit({ windowMs: 60_000, max: 5 });
/** 全 API：每 IP 每分钟 240 次（正常自用远够） */
export const apiLimit = rateLimit({ windowMs: 60_000, max: 240 });
