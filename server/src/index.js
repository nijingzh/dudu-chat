import express from 'express';
import cors from 'cors';
import http from 'node:http';
import { Server } from 'socket.io';
import { PORT, UPLOAD_DIR, INVITE_CODES } from './config.js';
import { initDb, query } from './db.js';
import { buildRoutes } from './routes.js';
import { initSocket } from './socket.js';
import { startBackupSchedule } from './backup.js';
import { letterOut, roomOf, nowIso } from './auth.js';

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: '*' } });

app.use(cors());
app.disable('x-powered-by'); // 不给扫描器递指纹
app.use(express.json({ limit: '15mb' }));
app.use('/uploads', express.static(UPLOAD_DIR));

/** 慢递信到点投递：在线即时推；到点没人的由 bootstrap 兜底 */
function scheduleLetter(letter, pairId) {
  const delay = new Date(letter.deliverAt).getTime() - Date.now();
  const fire = async () => {
    await query('UPDATE letters SET delivered_at = $1 WHERE id = $2 AND delivered_at IS NULL', [
      nowIso(),
      letter.id,
    ]);
    io.to(roomOf(pairId)).emit('letter:due', letterOut({ ...letter, delivered_at: nowIso() }));
  };
  if (delay <= 0) return void fire();
  setTimeout(fire, Math.min(delay, 2 ** 31 - 1));
}
app.set('scheduleLetter', scheduleLetter);

app.use('/api', buildRoutes(io));

app.get('/health', (_req, res) => res.json({ ok: true, at: nowIso() }));

initSocket(io);

// 重启后把未投慢递信重新排上；再接每日备份
async function restoreLetters() {
  const rows = await query('SELECT * FROM letters WHERE delivered_at IS NULL');
  for (const l of rows) {
    scheduleLetter(l, l.pair_id);
  }
  console.log(`[letters] 恢复排程 ${rows.length} 封`);
}

initDb()
  .then(restoreLetters)
  .then(() => {
    startBackupSchedule();
    if (INVITE_CODES.length === 0) {
      console.warn('[warn] INVITE_CODES 未配置——所有登录将被拒绝（fail-closed）');
    }
    server.listen(PORT, () => console.log(`duduchat-server :${PORT}（${process.env.DATABASE_URL ? 'PostgreSQL' : 'PGlite 本地库'}）`));
  })
  .catch((e) => {
    console.error('启动失败', e);
    process.exit(1);
  });
