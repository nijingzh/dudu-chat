/**
 * store/settingsStore — 我的/设置页状态（P1C）。
 * localStorage 持久化；触觉/粒子/心跳开关真实生效，主题色与聊天背景改 CSS 变量。
 */
import { create } from 'zustand';
import { CHAT_BGS, THEMES } from '../utils/constants';

export interface Settings {
  /** 3.4 触觉分档开关 */
  haptics: { send: boolean; receive: boolean; effect: boolean };
  notify: { message: boolean; missYou: boolean; anniversary: boolean };
  appearance: { particles: boolean; bubbles: boolean; heartbeat: boolean };
  privacy: { messageLock: boolean };
  theme: string;
  chatBg: string;
}

const DEFAULTS: Settings = {
  haptics: { send: true, receive: true, effect: true },
  notify: { message: true, missYou: true, anniversary: true },
  appearance: { particles: true, bubbles: true, heartbeat: true },
  privacy: { messageLock: false },
  theme: 'pink',
  chatBg: 'main',
};

function load(): Settings {
  try {
    const raw = localStorage.getItem('duduchat-settings');
    if (raw) return { ...DEFAULTS, ...JSON.parse(raw) };
  } catch {
    // 坏数据回默认
  }
  return DEFAULTS;
}

interface SettingsState extends Settings {
  toggle: (
    group: 'haptics' | 'notify' | 'appearance' | 'privacy',
    key: string,
  ) => void;
  setTheme: (key: string) => void;
  setChatBg: (key: string) => void;
}

export const useSettingsStore = create<SettingsState>((set, get) => ({
  ...load(),
  toggle: (group, key) => {
    const s = get();
    const next = {
      ...s[group],
      [key]: !s[group][key as keyof (typeof s)[typeof group]],
    } as Settings[typeof group];
    set({ [group]: next } as Partial<SettingsState>);
    persist(get);
  },
  setTheme: (key) => {
    set({ theme: key });
    persist(get);
  },
  setChatBg: (key) => {
    set({ chatBg: key });
    persist(get);
  },
}));

function persist(get: () => SettingsState) {
  const { haptics, notify, appearance, privacy, theme, chatBg } = get();
  localStorage.setItem(
    'duduchat-settings',
    JSON.stringify({ haptics, notify, appearance, privacy, theme, chatBg }),
  );
}

/** 把主题色 / 聊天背景写进 CSS 变量（App 挂载时 + 每次变更后调用） */
export function applySettingsToCSS(s: {
  theme: string;
  chatBg: string;
  appearance: { bubbles: boolean };
}) {
  const root = document.documentElement;
  const theme = THEMES.find((t) => t.key === s.theme) ?? THEMES[0];
  const bg = CHAT_BGS.find((b) => b.key === s.chatBg) ?? CHAT_BGS[0];
  root.style.setProperty('--color-bubble-self-from', theme.from);
  root.style.setProperty('--color-bubble-self-to', theme.to);
  root.style.setProperty('--bg-gradient-from', bg.from);
  root.style.setProperty('--bg-gradient-to', bg.to);
  root.style.setProperty(
    '--bubble-shadow',
    s.appearance.bubbles ? '0 6px 20px rgba(255, 107, 138, 0.35)' : 'none',
  );
}
