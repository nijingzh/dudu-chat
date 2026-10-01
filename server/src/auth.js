import crypto from 'node:crypto';
import jwt from 'jsonwebtoken';
import { JWT_SECRET, INVITE_CODES, NAMES } from './config.js';
import { query } from './db.js';

export const nowIso = () => new Date().toISOString();
export const newId = () => crypto.randomUUID();
export const roomOf = (pairId) => `pair:${pairId}`;

export function signToken(userId) {
  return jwt.sign({ sub: userId }, JWT_SECRET, { expiresIn: '30d' });
}

export function requireAuth(req, res, next) {
  const h = req.headers.authorization || '';
  const token = h.startsWith('Bearer ') ? h.slice(7) : null;
  if (!token) return res.status(401).json({ error: 'no token' });
  try {
    req.userId = jwt.verify(token, JWT_SECRET).sub;
    next();
  } catch {
    res.status(401).json({ error: 'bad token' });
  }
}

/** 邀请码 → 用户（没有则建号；编号即账号，两码两号） */
export async function ensureUser(inviteCode) {
  const idx = INVITE_CODES.indexOf(inviteCode);
  if (idx === -1) return null;
  const found = await query('SELECT * FROM users WHERE invite_code = $1', [inviteCode]);
  if (found.length) return found[0];
  const user = {
    id: newId(),
    invite_code: inviteCode,
    name: NAMES[idx] || `账号${idx + 1}`,
    created_at: nowIso(),
  };
  await query('INSERT INTO users (id, invite_code, name, created_at) VALUES ($1,$2,$3,$4)', [
    user.id,
    user.invite_code,
    user.name,
    user.created_at,
  ]);
  return user;
}

/** 取/建情侣对（两账号互绑，单一 pair） */
export async function ensurePair(userId) {
  const rows = await query('SELECT * FROM pairs WHERE user_a = $1 OR user_b = $1', [userId]);
  if (rows.length) return rows[0];
  const other = await query('SELECT * FROM users WHERE id <> $1 LIMIT 1', [userId]);
  if (!other.length) return null; // 只有一人登录过，等对方
  const pair = {
    id: newId(),
    user_a: userId,
    user_b: other[0].id,
    together_date: process.env.TOGETHER_DATE || '2026-08-19',
  };
  await query(
    'INSERT INTO pairs (id, user_a, user_b, together_date) VALUES ($1,$2,$3,$4)',
    [pair.id, pair.user_a, pair.user_b, pair.together_date],
  );
  return pair;
}

export function userOut(u) {
  return u ? { id: u.id, name: u.name, inviteCode: u.invite_code } : null;
}

export function messageOut(m) {
  return {
    id: m.id,
    senderId: m.sender_id,
    kind: m.kind,
    text: m.text,
    meta: m.meta ? JSON.parse(m.meta) : undefined,
    clientTs: m.client_ts,
    status: m.status,
    createdAt: m.created_at,
  };
}

export function letterOut(l) {
  return {
    id: l.id,
    fromUserId: l.from_user,
    text: l.text,
    deliverAt: l.deliver_at,
    deliveredAt: l.delivered_at,
  };
}
