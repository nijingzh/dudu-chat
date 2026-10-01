import express from 'express';
import multer from 'multer';
import fs from 'node:fs';
import path from 'node:path';
import {
  requireAuth,
  ensureUser,
  ensurePair,
  signToken,
  newId,
  nowIso,
  userOut,
  messageOut,
  letterOut,
  roomOf,
} from './auth.js';
import { loginLimit } from './limiter.js';
import { query } from './db.js';
import { INVITE_CODES, TOGETHER_DATE, UPLOAD_DIR } from './config.js';

const upload = multer({
  storage: multer.diskStorage({
    destination: (_req, _file, cb) => {
      fs.mkdirSync(UPLOAD_DIR, { recursive: true });
      cb(null, UPLOAD_DIR);
    },
    filename: (_req, file, cb) => {
      const ext = path.extname(file.originalname) || '.bin';
      cb(null, `${newId()}${ext}`);
    },
  }),
  limits: { fileSize: 10 * 1024 * 1024 },
});

export function buildRoutes(io) {
  const r = express.Router();

  // 邀请码登录：码即账号，两码两号（严限速防爆破）
  r.post('/login', loginLimit, async (req, res) => {
    const code = String(req.body?.inviteCode || '');
    const user = await ensureUser(code);
    if (!user) return res.status(401).json({ error: '邀请码不对' });
    res.json({ token: signToken(user.id), user: userOut(user) });
  });

  // 启动同步包：我 / 对方 / 在一起日期 / 全部消息 / 慢递信
  r.get('/bootstrap', requireAuth, async (req, res) => {
    const meRows = await query('SELECT * FROM users WHERE id = $1', [req.userId]);
    const pair = await ensurePair(req.userId);
    let partner = null;
    let messages = [];
    let letters = [];
    if (pair) {
      const partnerId = pair.user_a === req.userId ? pair.user_b : pair.user_a;
      const pRows = await query('SELECT * FROM users WHERE id = $1', [partnerId]);
      partner = userOut(pRows[0]);
      const mRows = await query(
        'SELECT * FROM messages WHERE pair_id = $1 ORDER BY created_at ASC LIMIT 500',
        [pair.id],
      );
      messages = mRows.map(messageOut);
      // 到点未投的慢递信：开 App 即收
      const due = await query(
        'SELECT * FROM letters WHERE pair_id = $1 AND delivered_at IS NULL AND deliver_at <= $2',
        [pair.id, nowIso()],
      );
      for (const l of due) {
        await query('UPDATE letters SET delivered_at = $1 WHERE id = $2', [nowIso(), l.id]);
        l.delivered_at = nowIso();
      }
      const lRows = await query(
        'SELECT * FROM letters WHERE pair_id = $1 ORDER BY deliver_at ASC',
        [pair.id],
      );
      letters = lRows.map(letterOut);
    }
    res.json({
      user: userOut(meRows[0]),
      partner,
      togetherDate: pair?.together_date || TOGETHER_DATE,
      inviteCodes: INVITE_CODES.length,
      messages,
      letters,
    });
  });

  // 发消息：落库 + 推送对房
  r.post('/messages', requireAuth, async (req, res) => {
    const pair = await ensurePair(req.userId);
    if (!pair) return res.status(409).json({ error: '还没有配对' });
    const { kind = 'text', text = '', meta, clientTs } = req.body || {};
    if (kind === 'text' && !String(text).trim()) {
      return res.status(400).json({ error: 'empty text' });
    }
    const msg = {
      id: newId(),
      pair_id: pair.id,
      sender_id: req.userId,
      kind,
      text: String(text),
      meta: meta ? JSON.stringify(meta) : null,
      client_ts: clientTs || nowIso(),
      status: 'sent',
      created_at: nowIso(),
    };
    await query(
      `INSERT INTO messages (id, pair_id, sender_id, kind, text, meta, client_ts, status, created_at)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)`,
      [msg.id, msg.pair_id, msg.sender_id, msg.kind, msg.text, msg.meta, msg.client_ts, msg.status, msg.created_at],
    );
    const out = messageOut(msg);
    io.to(roomOf(pair.id)).emit('message:new', out);
    res.json(out);
  });

  // 已读回执
  r.post('/messages/:id/read', requireAuth, async (req, res) => {
    const pair = await ensurePair(req.userId);
    await query('UPDATE messages SET status = $1 WHERE id = $2 AND sender_id <> $3', [
      'read',
      req.params.id,
      req.userId,
    ]);
    if (pair) io.to(roomOf(pair.id)).emit('message:read', { id: req.params.id, by: req.userId });
    res.json({ ok: true });
  });

  // 撤回
  r.post('/messages/:id/recall', requireAuth, async (req, res) => {
    const pair = await ensurePair(req.userId);
    await query('UPDATE messages SET status = $1 WHERE id = $2 AND sender_id = $3', [
      'recalled',
      req.params.id,
      req.userId,
    ]);
    if (pair) io.to(roomOf(pair.id)).emit('message:recalled', { id: req.params.id, by: req.userId });
    res.json({ ok: true });
  });

  // 慢递信：到点投递（在线即时推；离线下次 bootstrap 收）
  r.post('/letters', requireAuth, async (req, res) => {
    const pair = await ensurePair(req.userId);
    if (!pair) return res.status(409).json({ error: '还没有配对' });
    const { text, deliverAt } = req.body || {};
    if (!String(text || '').trim() || !deliverAt) {
      return res.status(400).json({ error: 'need text + deliverAt' });
    }
    const letter = {
      id: newId(),
      pair_id: pair.id,
      from_user: req.userId,
      text: String(text),
      deliver_at: deliverAt,
      delivered_at: null,
    };
    await query(
      'INSERT INTO letters (id, pair_id, from_user, text, deliver_at, delivered_at) VALUES ($1,$2,$3,$4,$5,NULL)',
      [letter.id, letter.pair_id, letter.from_user, letter.text, letter.deliver_at],
    );
    req.app.get('scheduleLetter')(letterOut({ ...letter }), pair.id);
    res.json(letterOut(letter));
  });

  r.get('/letters', requireAuth, async (req, res) => {
    const pair = await ensurePair(req.userId);
    const rows = pair
      ? await query('SELECT * FROM letters WHERE pair_id = $1 ORDER BY deliver_at ASC', [pair.id])
      : [];
    res.json(rows.map(letterOut));
  });

  // 上传（图片/语音）：Phase 2B 前端换 URL
  r.post('/upload', requireAuth, upload.single('file'), (req, res) => {
    if (!req.file) return res.status(400).json({ error: 'no file' });
    res.json({ url: `/uploads/${req.file.filename}`, size: req.file.size });
  });

  return r;
}
