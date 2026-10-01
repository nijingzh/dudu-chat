/**
 * 数据层：DATABASE_URL 有值 → pg.Pool（生产 PostgreSQL）；
 * 空 → PGlite（WASM 真 Postgres，本地开发免编译）。
 * 两侧同一套 SQL（$1 占位），query() 返回 rows。
 */
import fs from 'node:fs';
import path from 'node:path';
import { PGlite } from '@electric-sql/pglite';
import pg from 'pg';
import { DATABASE_URL, DATA_DIR } from './config.js';

let pool = null;
let lite = null;

export async function initDb() {
  if (DATABASE_URL) {
    pool = new pg.Pool({ connectionString: DATABASE_URL });
  } else {
    fs.mkdirSync(DATA_DIR, { recursive: true });
    lite = new PGlite(path.join(DATA_DIR, 'devdb'));
    await lite.ready;
  }
  await exec(SCHEMA);
}

export async function query(text, params = []) {
  if (pool) {
    const r = await pool.query(text, params);
    return r.rows;
  }
  const r = await lite.query(text, params);
  return r.rows;
}

/** 多语句执行（建表用） */
export async function exec(sql) {
  if (pool) await pool.query(sql);
  else await lite.exec(sql);
}

/** 备份用：PGlite 数据目录（生产为空，走 pg_dump） */
export function dataFiles() {
  return lite ? path.join(DATA_DIR, 'devdb') : null;
}

const SCHEMA = `
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  invite_code TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  created_at TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS pairs (
  id TEXT PRIMARY KEY,
  user_a TEXT NOT NULL,
  user_b TEXT NOT NULL,
  together_date TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS messages (
  id TEXT PRIMARY KEY,
  pair_id TEXT NOT NULL,
  sender_id TEXT NOT NULL,
  kind TEXT NOT NULL,
  text TEXT NOT NULL DEFAULT '',
  meta TEXT,
  client_ts TEXT,
  status TEXT NOT NULL DEFAULT 'sent',
  created_at TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS letters (
  id TEXT PRIMARY KEY,
  pair_id TEXT NOT NULL,
  from_user TEXT NOT NULL,
  text TEXT NOT NULL,
  deliver_at TEXT NOT NULL,
  delivered_at TEXT
);
CREATE TABLE IF NOT EXISTS attachments (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  url TEXT NOT NULL,
  mime TEXT,
  created_at TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_messages_pair ON messages(pair_id, created_at);
CREATE INDEX IF NOT EXISTS idx_letters_pair ON letters(pair_id, deliver_at);
`;
