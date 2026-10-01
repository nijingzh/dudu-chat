import fs from 'node:fs';
import path from 'node:path';
import { BACKUP_DIR } from './config.js';
import { dataFiles } from './db.js';

/**
 * 每日备份：PGlite → 整目录拷到 backups/devdb-<date>；
 * 生产 PostgreSQL 不在此处备份（VPS 上配 pg_dump cron，见 docs/落地方案.md）。
 */
export async function backupOnce() {
  const src = dataFiles();
  if (!src) {
    console.log('[backup] 生产库模式：请在 VPS 配 pg_dump cron');
    return;
  }
  const ts = new Date().toISOString().slice(0, 10);
  const dest = path.join(BACKUP_DIR, `devdb-${ts}`);
  await fs.promises.mkdir(BACKUP_DIR, { recursive: true });
  await fs.promises.cp(src, dest, { recursive: true, force: true });
  console.log('[backup] 备份完成 →', dest);
}

export function startBackupSchedule() {
  backupOnce().catch((e) => console.error('[backup]', e.message));
  setInterval(() => backupOnce().catch((e) => console.error('[backup]', e.message)), 24 * 3600 * 1000);
}
