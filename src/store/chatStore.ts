/**
 * store/chatStore — P1B 纯 mock（localStorage 记住会话）。
 * Phase 2 只换数据层：消息收发改 Socket.io，UI 不动。
 */
import { create } from 'zustand';
import {
  AUTO_REPLIES,
  INVITE_CODES,
  minutesAgo,
  MOCK_ME,
  MOCK_OTHER,
  nowHHMM,
} from '../utils/constants';

export type MessageStatus = 'sent' | 'read' | 'recalled-me' | 'recalled-other';

export interface Message {
  id: string;
  from: 'me' | 'other';
  text: string;
  time: string;
  status: MessageStatus;
}

export type View = 'login' | 'chat';

interface ChatState {
  view: View;
  me: typeof MOCK_ME;
  other: typeof MOCK_OTHER;
  messages: Message[];
  otherTyping: boolean;
  login: (code: string) => boolean;
  logout: () => void;
  enterChat: () => void;
  sendMessage: (text: string) => void;
  recall: (id: string) => void;
  markAllRead: () => void;
  setOtherTyping: (v: boolean) => void;
  appendReply: () => void;
}

let seq = 0;
const nextId = () => `m${Date.now()}_${seq++}`;
let replyIdx = 0;

const seedMessages = (): Message[] => [
  { id: nextId(), from: 'other', text: '到家了吗？', time: minutesAgo(30), status: 'sent' },
  { id: nextId(), from: 'me', text: '刚到～今天好想你', time: minutesAgo(28), status: 'read' },
  { id: nextId(), from: 'other', text: '我也是！明天见 💗', time: minutesAgo(27), status: 'sent' },
];

export const useChatStore = create<ChatState>((set) => ({
  view: 'login',
  me: MOCK_ME,
  other: MOCK_OTHER,
  messages: seedMessages(),
  otherTyping: false,

  login: (code) => {
    const hit = INVITE_CODES[code.trim().toLowerCase()];
    if (!hit) return false;
    set({
      view: 'chat',
      me: { name: hit.name, avatar: hit.avatar },
      messages: seedMessages(),
    });
    localStorage.setItem('duduchat-session', code.trim().toLowerCase());
    return true;
  },

  logout: () => {
    localStorage.removeItem('duduchat-session');
    set({ view: 'login', otherTyping: false });
  },

  enterChat: () => set({ view: 'chat' }),

  sendMessage: (text) => {
    const t = text.trim();
    if (!t) return;
    const msg: Message = {
      id: nextId(),
      from: 'me',
      text: t,
      time: nowHHMM(),
      status: 'sent',
    };
    set((s) => ({ messages: [...s.messages, msg] }));
    // mock 已读回执：300ms 后对方「已读」
    window.setTimeout(() => {
      set((s) => ({
        messages: s.messages.map((m) =>
          m.id === msg.id ? { ...m, status: 'read' } : m,
        ),
      }));
    }, 300);
  },

  recall: (id) =>
    set((s) => ({
      messages: s.messages.map((m) =>
        m.id === id
          ? { ...m, status: 'recalled-me', text: '' }
          : m,
      ),
    })),

  markAllRead: () =>
    set((s) => ({
      messages: s.messages.map((m) =>
        m.from === 'me' && m.status === 'sent' ? { ...m, status: 'read' } : m,
      ),
    })),

  setOtherTyping: (v) => set({ otherTyping: v }),

  appendReply: () => {
    const text = AUTO_REPLIES[replyIdx % AUTO_REPLIES.length];
    replyIdx += 1;
    set((s) => ({
      otherTyping: false,
      messages: [
        ...s.messages,
        { id: nextId(), from: 'other', text, time: nowHHMM(), status: 'sent' },
      ],
    }));
  },
}));
