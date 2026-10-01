/**
 * utils/constants — mock 数据与文案（P1B）
 * 邀请码 / 昵称 / 纪念日天数都是占位值，真实值等江衍裁决后替换。
 */

export const APP_NAME = 'duduchat';

/** 邀请码机制（裁决：两码两账号，输对即登录）——真值（2026-10-01 江衍提供） */
export const INVITE_CODES: Record<string, { name: string; avatar: string }> = {
  [REDACTED]: { name: '衍', avatar: '🐱' },
  [REDACTED]: { name: '她', avatar: '🐰' },
};

/** mock 资料（昵称/头像为占位） */
export const MOCK_ME = { name: '衍', avatar: '🐱' };
export const MOCK_OTHER = { nickname: '她', avatar: '🐰', online: true };

/** 在一起的日子：2026-08-19（真值）。口径 = 含首日计数（8/19 是第 1 天） */
export function togetherDays(): number {
  const start = new Date(2026, 7, 19); // 月份 0-based：7 = 8 月
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  return Math.floor((today.getTime() - start.getTime()) / 86_400_000) + 1;
}

/** 发消息后的 mock 自动回复（循环取） */
export const AUTO_REPLIES = [
  '收到啦～正在想你 💭',
  '嘿嘿，这句话我要截图保存 📸',
  '等我忙完就找你！',
  '你今天怎么这么甜 🍬',
  '（蹭蹭）',
];

/** 快捷表情（4.2 反应表情条同源） */
export const QUICK_EMOJIS = ['💗', '😂', '😮', '😢', '👍', '🔥', '🥰', '🧋'];

/** 登录页底部文案（占位） */
export const LOGIN_FOOTER = '只属于我们两个人的小世界';

export function nowHHMM(): string {
  const d = new Date();
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
}

/** n 分钟前的 HH:MM（mock 种子消息用，避免时间戳倒流） */
export function minutesAgo(n: number): string {
  return nowHHMM2(new Date(Date.now() - n * 60_000));
}

function nowHHMM2(d: Date): string {
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
}
