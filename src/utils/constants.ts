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

/** 登录页底部文案（裁决：不改） */
export const LOGIN_FOOTER = '只属于我们两个人的小世界';

/* ---------- P1C：甜蜜时光 / 小惊喜 mock 数据 ---------- */

/** 每日心情打卡选项 */
export const MOODS = [
  { key: 'happy', emoji: '😊', label: '开心' },
  { key: 'miss', emoji: '🥺', label: '想你' },
  { key: 'calm', emoji: '😌', label: '平淡' },
  { key: 'tired', emoji: '😪', label: '累了' },
  { key: 'sad', emoji: '😢', label: '难过' },
  { key: 'angry', emoji: '😤', label: '生气' },
];

/** 约会转盘点子 */
export const DATE_IDEAS = [
  '一起做饭 🍳',
  '散步看日落 🌇',
  '窝着看电影 🎬',
  '去逛超市 🛒',
  '打游戏双排 🎮',
  '探店吃甜品 🍰',
  '公园骑车 🚲',
  '给对方画画 🎨',
];

/** 今日情话池（可换） */
export const LOVE_QUOTES = [
  '今天也想把最好的都给你。',
  '遇见你之后，每天都值得纪念。',
  '想和你一起浪费时间，比如一辈子。',
  '你笑起来的样子，是我见过最好的风景。',
  '不管多晚，回家的灯我都给你留着。',
];

/** 共享歌单（占位，P2B 接真实歌单） */
export const PLAYLIST = [
  { title: '我们的歌（占位一）', artist: '—' },
  { title: '我们的歌（占位二）', artist: '—' },
  { title: '我们的歌（占位三）', artist: '—' },
  { title: '我们的歌（占位四）', artist: '—' },
];

/** 照片墙占位（真实照片等你俩拍；不用 AI 图） */
export const PHOTO_SLOTS = [
  { height: 150, emoji: '🌷', tint: '#FFB3D9' },
  { height: 190, emoji: '🐱', tint: '#D4A5FF' },
  { height: 160, emoji: '🧋', tint: '#F7CEC5' },
  { height: 200, emoji: '🌇', tint: '#FFB6C1' },
  { height: 170, emoji: '🎮', tint: '#C8A2FF' },
  { height: 140, emoji: '💗', tint: '#FF8FAB' },
];

/** 默认纪念日（真值：在一起 2026-08-19；其余示例可改可删） */
export const DEFAULT_ANNIVERSARIES = [
  { id: 'a1', name: '在一起纪念日', month: 8, day: 19 },
  { id: 'a2', name: '她的生日', month: 9, day: 17 },
  { id: 'a3', name: '我的生日', month: 10, day: 14 },
];

/** 主题色板（改 --color-bubble-self-from/to，气泡+发送钮+标题联动） */
export const THEMES = [
  { key: 'pink', name: '蜜桃粉', from: '#FF8FAB', to: '#FF6B8A' },
  { key: 'purple', name: '薰衣草', from: '#C8A2FF', to: '#A58BE6' },
  { key: 'peach', name: '落日橘', from: '#FFB199', to: '#FF8A70' },
  { key: 'mint', name: '薄荷汽水', from: '#8FD9BD', to: '#5FBFA0' },
];

/** 聊天背景预设（改 --bg-gradient-from/to） */
export const CHAT_BGS = [
  { key: 'main', name: '主渐变', from: '#FFB6C1', to: '#E8A0BF' },
  { key: 'soft', name: '柔和', from: '#F7CEC5', to: '#F8E8EE' },
  { key: 'dream', name: '梦幻', from: '#D4A5FF', to: '#FFB3D9' },
  { key: 'sakura', name: '樱花白', from: '#FFF5F7', to: '#F8E8EE' },
];

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
