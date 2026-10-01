import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export const PORT = Number(process.env.PORT || 3000);
export const JWT_SECRET = process.env.JWT_SECRET || 'duduchat-dev-secret-change-in-prod';
/** 有值走生产 PostgreSQL；空走本地 PGlite（WASM 真 Postgres，免编译） */
export const DATABASE_URL = process.env.DATABASE_URL || '';
export const DATA_DIR = process.env.DATA_DIR || path.join(__dirname, '..', 'data');
export const UPLOAD_DIR = path.join(DATA_DIR, 'uploads');
export const BACKUP_DIR = path.join(DATA_DIR, 'backups');
/** 两枚邀请码 → 两个账号（生产用环境变量覆盖） */
export const INVITE_CODES = (process.env.INVITE_CODES || '[REDACTED],[REDACTED]')
  .split(',')
  .map((s) => s.trim());
export const NAMES = (process.env.ACCOUNT_NAMES || '衍,她').split(',');
export const TOGETHER_DATE = process.env.TOGETHER_DATE || '2026-08-19';
