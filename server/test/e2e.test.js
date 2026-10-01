/**
 * P2A 端到端自测：登录/配对/同步/实时消息/已读/撤回/在线/正在输入/慢递信/上传/备份。
 * 跑法：node test/e2e.test.js（需先 npm start 起服务，或本文件自起）。
 */
import { spawn } from 'node:child_process';
import path from 'node:path';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';
import { io as ioClient } from 'socket.io-client';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const BASE = 'http://127.0.0.1:3001';
const results = [];
const check = (name, ok, extra = '') => {
  results.push({ name, ok });
  console.log(`${ok ? '✓' : '✗'} ${name}${extra ? ' — ' + extra : ''}`);
};

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function waitHealth(timeoutMs = 8000) {
  const t0 = Date.now();
  while (Date.now() - t0 < timeoutMs) {
    try {
      const r = await fetch(`${BASE}/health`);
      if (r.ok) return true;
    } catch {}
    await sleep(250);
  }
  return false;
}

async function main() {
  // 自起服务（干净数据目录）
  const dataDir = path.join(__dirname, 'testdata');
  await fs.promises.rm(dataDir, { recursive: true, force: true });
  const srv = spawn(process.execPath, [path.join(__dirname, '..', 'src', 'index.js')], {
    env: { ...process.env, PORT: '3001', DATA_DIR: dataDir },
    stdio: 'inherit',
  });

  try {
    check('服务启动 /health', await waitHealth());

    // 1. 两码登录
    const login = async (code) => {
      const r = await fetch(`${BASE}/api/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ inviteCode: code }),
      });
      return r.json();
    };
    const a = await login('[REDACTED]');
    const b = await login('[REDACTED]');
    check('邀请码 A 登录拿 token', !!a.token);
    check('邀请码 B 登录拿 token', !!b.token);
    const bad = await login('wrong-code');
    check('错误邀请码 401', !bad.token && bad.error !== undefined);

    const authH = (t) => ({ Authorization: `Bearer ${t}`, 'Content-Type': 'application/json' });

    // 2. bootstrap 配对
    const bootA = await (await fetch(`${BASE}/api/bootstrap`, { headers: authH(a.token) })).json();
    const bootB = await (await fetch(`${BASE}/api/bootstrap`, { headers: authH(b.token) })).json();
    check('bootstrap 配对成功（A 见到 B）', bootA.partner?.id === b.user.id);
    check('在一起日期 2026-08-19', bootA.togetherDate === '2026-08-19');

    // 3. socket 双连 + 在线状态
    const sockA = ioClient(BASE, { auth: { token: a.token } });
    const sockB = ioClient(BASE, { auth: { token: b.token } });
    const presence = new Promise((r) => sockA.once('presence:update', r));
    const typingP = new Promise((r) => sockA.once('typing', r));
    const msgP = new Promise((r) => sockB.once('message:new', r));
    const readP = new Promise((r) => sockA.once('message:read', r));
    await sleep(400);
    const seen = await Promise.race([presence, sleep(2000).then(() => null)]);
    check('在线状态推送 presence:update', seen?.online === true);

    // 4. A 发消息 → B 实时收
    const sendR = await (
      await fetch(`${BASE}/api/messages`, {
        method: 'POST',
        headers: authH(a.token),
        body: JSON.stringify({ kind: 'text', text: 'P2A 实测：你好呀' }),
      })
    ).json();
    const got = await Promise.race([msgP, sleep(2500).then(() => null)]);
    check('A 发消息 B 实时收到', got?.text === 'P2A 实测：你好呀' && got?.id === sendR.id);

    // 5. B 正在输入 → A 收
    sockB.emit('typing');
    const typed = await Promise.race([typingP, sleep(2000).then(() => null)]);
    check('正在输入事件透传', typed?.userId === b.user.id);

    // 6. B 已读 → A 收回执
    await fetch(`${BASE}/api/messages/${sendR.id}/read`, { method: 'POST', headers: authH(b.token) });
    const read = await Promise.race([readP, sleep(2000).then(() => null)]);
    check('已读回执 message:read', read?.id === sendR.id && read?.by === b.user.id);

    // 7. 撤回
    const rec = await (
      await fetch(`${BASE}/api/messages/${sendR.id}/recall`, { method: 'POST', headers: authH(a.token) })
    ).json();
    const boot2 = await (await fetch(`${BASE}/api/bootstrap`, { headers: authH(a.token) })).json();
    check('撤回落库 status=recalled', boot2.messages.find((m) => m.id === sendR.id)?.status === 'recalled' && rec.ok);

    // 8. 图片消息（含 meta.src）
    const img = await (
      await fetch(`${BASE}/api/messages`, {
        method: 'POST',
        headers: authH(b.token),
        body: JSON.stringify({ kind: 'image', meta: { tint: '#FFB3D9', src: 'data:image/png;base64,x' } }),
      })
    ).json();
    check('图片消息带 meta 落库', img.kind === 'image' && img.meta?.src?.startsWith('data:image'));

    // 9. 慢递信 1.5s 后到点 → B 收 letter:due
    const letterP = new Promise((r) => sockB.once('letter:due', r));
    const deliverAt = new Date(Date.now() + 1500).toISOString();
    await fetch(`${BASE}/api/letters`, {
      method: 'POST',
      headers: authH(a.token),
      body: JSON.stringify({ text: '到点啦', deliverAt }),
    });
    const letter = await Promise.race([letterP, sleep(3500).then(() => null)]);
    check('慢递信到点投递 letter:due', letter?.text === '到点啦');

    // 10. 上传
    const form = new FormData();
    form.append('file', new Blob([new Uint8Array([137, 80, 78, 71])]), 't.png');
    const up = await (
      await fetch(`${BASE}/api/upload`, { method: 'POST', headers: { Authorization: `Bearer ${b.token}` }, body: form })
    ).json();
    check('上传接口返回 /uploads URL', typeof up.url === 'string' && up.url.startsWith('/uploads/'));

    // 11. 离线兜底：关 B 的 socket，A 发一封“已到点”信 → B 下次 bootstrap 收
    sockB.disconnect();
    await sleep(200);
    await fetch(`${BASE}/api/letters`, {
      method: 'POST',
      headers: authH(a.token),
      body: JSON.stringify({ text: '离线兜底信', deliverAt: new Date(Date.now() - 1000).toISOString() }),
    });
    const boot3 = await (await fetch(`${BASE}/api/bootstrap`, { headers: authH(b.token) })).json();
    check(
      '离线慢递信开 App 即收（bootstrap 兜底）',
      boot3.letters.some((l) => l.text === '离线兜底信' && l.deliveredAt),
    );

    // 12. 备份目录
    const backups = path.join(dataDir, 'backups');
    await sleep(300);
    check('每日备份已产出 devdb-<date>', fs.existsSync(backups) && fs.readdirSync(backups).length > 0);

    sockA.disconnect();
  } finally {
    srv.kill();
    await fs.promises.rm(path.join(__dirname, 'testdata'), { recursive: true, force: true }).catch(() => {});
  }

  const failed = results.filter((r) => !r.ok).length;
  console.log(`\n${results.length - failed}/${results.length} 通过`);
  process.exit(failed ? 1 : 0);
}

main().catch((e) => {
  console.error('测试崩了', e);
  process.exit(1);
});
