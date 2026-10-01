/**
 * P2B 双端联调脚本（第二客户端 = 她）：
 * 1) REST 登录 test-b → 2) socket 连入 3) 等 A 的消息并打印
 * 4) 发 typing → 5) 回一条消息 → 6) 打已读回执
 */
import { io } from 'socket.io-client';

const BASE = process.env.BASE || 'http://127.0.0.1:3001';
const code = process.env.CODE || 'test-invite-b';
const log = (...a) => console.log('[她]', ...a);

const loginRes = await fetch(`${BASE}/api/login`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ inviteCode: code }),
});
const { token, user } = await loginRes.json();
log('登录', user.name);

const sock = io(BASE, { auth: { token } });
sock.on('connect', () => log('socket 已连'));
sock.on('presence:update', (p) => log('对方在线状态', p.online));
sock.on('message:new', async (m) => {
  if (m.senderId === user.id) return;
  log('收到 A 的消息:', m.kind, m.text || m.meta?.src?.slice(0, 30) || '');
  // 已读回执
  await fetch(`${BASE}/api/messages/${m.id}/read`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
  });
  log('已发已读回执');
  // 正在输入 → 回一条
  sock.emit('typing');
  await new Promise((r) => setTimeout(r, 800));
  const r = await fetch(`${BASE}/api/messages`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify({ kind: 'text', text: '收到啦，我在这边看着呢 💗' }),
  });
  log('已回消息', r.status);
});

setTimeout(() => {
  log('联调脚本收工');
  sock.disconnect();
  process.exit(0);
}, 15000);
