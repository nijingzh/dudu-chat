/**
 * chatStore —— P2B：服务端驱动（REST 落库 + Socket.io 实时）。
 * 旧 mock 层已换：消息/已读/撤回/正在输入/在线/慢递信全走 duduchat-server。
 */
import { create } from 'zustand';
import { api, setToken, getToken, type ServerMessage, type ServerLetter } from '../api/client';
import { connectSocket, disconnectSocket, emitTyping } from '../api/socket';

export type MessageKind = 'text' | 'image' | 'voice';
export type MessageStatus = 'sent' | 'read' | 'recalled-me' | 'recalled-other';

export interface Message {
  id: string;
  from: 'me' | 'other';
  kind: MessageKind;
  text: string;
  /** image：url 或本地压缩 dataURL；voice：时长秒数 */
  meta?: { tint?: string; emoji?: string; duration?: number; src?: string };
  time: string;
  status: MessageStatus;
}

export type View = 'login' | 'chat';

export interface Person {
  id?: string;
  name: string;
  avatar: string;
}

const AVATARS: Record<string, string> = { 衍: '🐱', 她: '🐰' };
const avatarOf = (name: string) => AVATARS[name] || '🐱';

const hhmm = (iso: string) => {
  const d = new Date(iso);
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
};

interface ChatState {
  view: View;
  me: Person;
  other: Person;
  messages: Message[];
  otherTyping: boolean;
  partnerOnline: boolean | null;
  connected: boolean;
  detailMessage: Message | null;
  login: (code: string) => Promise<boolean>;
  restoreSession: () => Promise<boolean>;
  logout: () => void;
  enterChat: () => void;
  sendMessage: (text: string, kind?: MessageKind, meta?: Message['meta']) => void;
  recall: (id: string) => void;
  markAllRead: () => void;
  setOtherTyping: (v: boolean) => void;
  openDetail: (m: Message) => void;
  closeDetail: () => void;
}

let myId = '';
let typingTimer = 0;

const toLocal = (m: ServerMessage): Message => ({
  id: m.id,
  from: m.senderId === myId ? 'me' : 'other',
  kind: m.kind,
  text: m.text,
  meta: m.meta,
  time: hhmm(m.createdAt),
  status:
    m.status === 'recalled'
      ? m.senderId === myId
        ? 'recalled-me'
        : 'recalled-other'
      : (m.status as MessageStatus),
});

function wire(set: (p: Partial<ChatState>) => void, get: () => ChatState) {
  connectSocket({
    onMessage: (m) => {
      if (m.senderId === myId) return; // 自己的走乐观更新
      set({
        messages: [...get().messages.filter((x) => x.id !== m.id), toLocal(m)],
        otherTyping: false,
      });
    },
    onRead: ({ id }) =>
      set({
        messages: get().messages.map((m) =>
          m.from === 'me' && m.id === id ? { ...m, status: 'read' as const } : m,
        ),
      }),
    onRecalled: ({ id }) =>
      set({
        messages: get().messages.map((m) =>
          m.id === id
            ? { ...m, status: m.from === 'me' ? ('recalled-me' as const) : ('recalled-other' as const) }
            : m,
        ),
      }),
    onTyping: () => {
      set({ otherTyping: true });
      window.clearTimeout(typingTimer);
      typingTimer = window.setTimeout(() => set({ otherTyping: false }), 2600);
    },
    onPresence: ({ online }) => set({ partnerOnline: online }),
    onLetter: (l: ServerLetter) => {
      // 慢递信到点：Web 通知 + （前台时）内嵌提示
      if ('Notification' in window && Notification.permission === 'granted') {
        new Notification('💌 慢递信到了', { body: l.text.slice(0, 40) });
      }
    },
    onConnect: async () => {
      set({ connected: true });
      // 离线补偿：重连后拉全量「合并」（保留未确认的乐观消息，防吞）
      try {
        const boot = await api.bootstrap();
        myId = boot.user.id;
        const serverMsgs = boot.messages.map(toLocal);
        const pending = get().messages.filter((m) => m.id.startsWith('tmp_'));
        set({
          messages: [...serverMsgs, ...pending],
          other: boot.partner
            ? { id: boot.partner.id, name: boot.partner.name, avatar: avatarOf(boot.partner.name) }
            : get().other,
        });
      } catch {
        /* 网络抖动：下轮重连再补 */
      }
    },
    onDisconnect: () => set({ connected: false }),
  });
}

export const useChatStore = create<ChatState>((set, get) => ({
  view: 'login',
  me: { name: '我', avatar: '🐱' },
  other: { name: 'TA', avatar: '🐰' },
  messages: [],
  otherTyping: false,
  partnerOnline: null,
  connected: false,
  detailMessage: null,

  login: async (code) => {
    try {
      const { token, user } = await api.login(code);
      setToken(token);
      const boot = await api.bootstrap();
      myId = boot.user.id;
      set({
        view: 'chat',
        me: { id: boot.user.id, name: boot.user.name, avatar: avatarOf(boot.user.name) },
        other: boot.partner
          ? { id: boot.partner.id, name: boot.partner.name, avatar: avatarOf(boot.partner.name) }
          : { name: 'TA', avatar: '🐰' },
        messages: boot.messages.map(toLocal),
      });
      void user;
      wire(set, get);
      if ('Notification' in window && Notification.permission === 'default') {
        void Notification.requestPermission();
      }
      return true;
    } catch {
      return false;
    }
  },

  restoreSession: async () => {
    if (!getToken()) return false;
    try {
      const boot = await api.bootstrap();
      myId = boot.user.id;
      set({
        view: 'chat',
        me: { id: boot.user.id, name: boot.user.name, avatar: avatarOf(boot.user.name) },
        other: boot.partner
          ? { id: boot.partner.id, name: boot.partner.name, avatar: avatarOf(boot.partner.name) }
          : { name: 'TA', avatar: '🐰' },
        messages: boot.messages.map(toLocal),
      });
      wire(set, get);
      return true;
    } catch {
      setToken(null);
      return false;
    }
  },

  logout: () => {
    disconnectSocket();
    setToken(null);
    set({ view: 'login', messages: [], partnerOnline: null, connected: false });
  },

  enterChat: () => set({ view: 'chat' }),

  sendMessage: (text, kind = 'text', meta) => {
    const t = text.trim();
    if (!t && kind === 'text') return;
    const tmpId = `tmp_${Date.now()}`;
    const local: Message = {
      id: tmpId,
      from: 'me',
      kind,
      text: t,
      meta,
      time: hhmm(new Date().toISOString()),
      status: 'sent',
    };
    set({ messages: [...get().messages, local] });
    api
      .sendMessage({ kind, text: t, meta, clientTs: new Date().toISOString() })
      .then((m) =>
        set({
          messages: get().messages.map((x) => (x.id === tmpId ? toLocal(m) : x)),
        }),
      )
      .catch(() =>
        set({
          messages: get().messages.map((x) =>
            x.id === tmpId ? { ...x, status: 'recalled-me', text: '（发送失败）' } : x,
          ),
        }),
      );
  },

  recall: (id) => {
    set({
      messages: get().messages.map((m) =>
        m.id === id ? { ...m, status: 'recalled-me' as const } : m,
      ),
    });
    api.recall(id).catch(() => undefined);
  },

  markAllRead: () => {
    const unread = get().messages.filter((m) => m.from === 'other' && m.status === 'sent');
    for (const m of unread) api.markRead(m.id).catch(() => undefined);
    set({
      messages: get().messages.map((m) =>
        m.from === 'other' && m.status === 'sent' ? { ...m, status: 'read' as const } : m,
      ),
    });
  },

  setOtherTyping: (v) => set({ otherTyping: v }),

  openDetail: (m) => set({ detailMessage: m }),
  closeDetail: () => set({ detailMessage: null }),
}));

/** 输入即报「正在输入」（内部节流 2s 一次） */
let lastTyping = 0;
export function pingTyping() {
  const now = Date.now();
  if (now - lastTyping < 2000) return;
  lastTyping = now;
  emitTyping();
}
