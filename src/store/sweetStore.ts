/**
 * store/sweetStore — 甜蜜时光 / 小惊喜 mock 数据（P1C）。
 * 心情打卡 / 爱情日记 / 纪念日 / 蜜语便签 / 慢递信，localStorage 持久化。
 */
import { create } from 'zustand';
import { DEFAULT_ANNIVERSARIES } from '../utils/constants';

export interface DiaryEntry {
  id: string;
  author: string;
  date: string;
  text: string;
}
export interface Anniversary {
  id: string;
  name: string;
  month: number;
  day: number;
}
export interface Note {
  id: string;
  from: string;
  text: string;
  date: string;
}
export interface SlowLetter {
  id: string;
  from: string;
  text: string;
  deliverDate: string; // YYYY-MM-DD
}

interface SweetState {
  mood: { date: string; key: string } | null;
  diary: DiaryEntry[];
  anniversaries: Anniversary[];
  notes: Note[];
  letters: SlowLetter[];
  quoteIdx: number;
  setMood: (key: string) => void;
  addDiary: (author: string, text: string) => void;
  upsertAnniversary: (a: Anniversary) => void;
  removeAnniversary: (id: string) => void;
  addNote: (from: string, text: string) => void;
  addLetter: (from: string, text: string, deliverDate: string) => void;
  nextQuote: () => void;
}

function today(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function load<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (raw) return JSON.parse(raw) as T;
  } catch {
    // 坏数据回默认
  }
  return fallback;
}

function save(key: string, v: unknown) {
  localStorage.setItem(key, JSON.stringify(v));
}

let seq = 0;
const nextId = () => `s${Date.now()}_${seq++}`;

export const useSweetStore = create<SweetState>((set, get) => ({
  mood: load('duduchat-mood', null),
  diary: load<DiaryEntry[]>('duduchat-diary', [
    {
      id: 'd1',
      author: '她',
      date: '2026-08-20',
      text: '第一天记日记～以后这里就是我们的小角落。',
    },
    {
      id: 'd2',
      author: '衍',
      date: '2026-08-24',
      text: '今天一起吃了火锅，回来路上的风很舒服。',
    },
  ]),
  anniversaries: load<Anniversary[]>('duduchat-anniversaries', DEFAULT_ANNIVERSARIES),
  notes: load<Note[]>('duduchat-notes', []),
  letters: load<SlowLetter[]>('duduchat-letters', []),
  quoteIdx: 0,

  setMood: (key) => {
    set({ mood: { date: today(), key } });
    save('duduchat-mood', get().mood);
  },

  addDiary: (author, text) => {
    const entry: DiaryEntry = { id: nextId(), author, date: today(), text: text.trim() };
    if (!entry.text) return;
    const diary = [...get().diary, entry];
    set({ diary });
    save('duduchat-diary', diary);
  },

  upsertAnniversary: (a) => {
    const list = get().anniversaries;
    const exists = list.some((x) => x.id === a.id);
    const anniversaries = exists ? list.map((x) => (x.id === a.id ? a : x)) : [...list, a];
    set({ anniversaries });
    save('duduchat-anniversaries', anniversaries);
  },

  removeAnniversary: (id) => {
    const anniversaries = get().anniversaries.filter((x) => x.id !== id);
    set({ anniversaries });
    save('duduchat-anniversaries', anniversaries);
  },

  addNote: (from, text) => {
    const note: Note = { id: nextId(), from, text: text.trim(), date: today() };
    if (!note.text) return;
    const notes = [note, ...get().notes];
    set({ notes });
    save('duduchat-notes', notes);
  },

  addLetter: (from, text, deliverDate) => {
    const letter: SlowLetter = { id: nextId(), from, text: text.trim(), deliverDate };
    if (!letter.text) return;
    const letters = [...get().letters, letter];
    set({ letters });
    save('duduchat-letters', letters);
  },

  nextQuote: () => set({ quoteIdx: get().quoteIdx + 1 }),
}));

/** 距下一个纪念日的天数（含当天=0 的语义：今天就是 0 天） */
export function daysUntil(a: Anniversary, from = new Date()): number {
  const now = new Date(from.getFullYear(), from.getMonth(), from.getDate());
  let target = new Date(now.getFullYear(), a.month - 1, a.day);
  if (target.getTime() < now.getTime()) {
    target = new Date(now.getFullYear() + 1, a.month - 1, a.day);
  }
  return Math.round((target.getTime() - now.getTime()) / 86_400_000);
}
