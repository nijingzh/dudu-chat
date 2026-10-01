/**
 * chatStore —— P2B：服务端驱动（REST 落库 + Socket.io 实时）。
 * 旧 mock 层已换：消息/已读/撤回/正在输入/在线/慢递信全走 duduchat-server。
 */
import { create } from 'zustand';
import { api, setToken, getToken, type ServerMessage, type ServerLetter } from '../api/client';
import { connectSocket, disconnectSocket, emitTyping } from '../api/socket';

export type MessageKind = 'text' | 'image' | 'voice';
export type MessageStatus = 'sent' | 'read' | 'recalled-me' | 'recalled-other' | 'failed';

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

/** 本地缓存：断网启动保会话用（最近 200 条 + 资料档） */
const CACHE_MSGS = 'duduchat-cache-msgs';
const CACHE_PROFILE = 'duduchat-cache-profile';
function saveCache(key: string, data: unknown) {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch {
    /* 满了就算了 */
  }
}
function loadCache<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

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
  retrySend: (id: string) => void;
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
      const profile = {
        me: { id: boot.user.id, name: boot.user.name, avatar: avatarOf(boot.user.name) },
        other: boot.partner
          ? { id: boot.partner.id, name: boot.partner.name, avatar: avatarOf(boot.partner.name) }
          : { name: 'TA', avatar: '🐰' },
      };
      saveCache(CACHE_PROFILE, profile);
      set({
        view: 'chat',
        ...profile,
        messages: boot.messages.map(toLocal),
      });
      wire(set, get);
      return true;
    } catch (e) {
      // 401 = token 失效才回登录页；网络问题保留 token 用本地缓存进聊天页（联网自动补拉）
      if (String(e).includes('401')) {
        setToken(null);
        return false;
      }
      const cached = loadCache<{ me: Person; other: Person } | null>(CACHE_PROFILE, null);
      set({
        view: 'chat',
        me: cached?.me ?? get().me,
        other: cached?.other ?? get().other,
        messages: loadCache<Message[]>(CACHE_MSGS, get().messages),
      });
      wire(set, get); // socket 自动重连，连上即 onConnect 补拉
      return true;
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
            x.id === tmpId ? { ...x, status: 'failed' as const } : x,
          ),
        }),
      );
  },

  retrySend: (id) => {
    const msg = get().messages.find((m) => m.id === id);
    if (!msg || msg.status !== 'failed') return;
    const newTmpId = `tmp_${Date.now()}`;
    set({
      messages: get().messages.map((m) =>
        m.id === id ? { ...m, status: 'sent' as const, id: newTmpId } : m,
      ),
    });
    api
      .sendMessage({
        kind: msg.kind,
        text: msg.text,
        meta: msg.meta,
        clientTs: new Date().toISOString(),
      })
      .then((m) =>
        set({
          messages: get().messages.map((x) => (x.id === newTmpId ? toLocal(m) : x)),
        }),
      )
      .catch(() =>
        set({
          messages: get().messages.map((x) =>
            x.id === newTmpId ? { ...x, status: 'failed' as const } : x,
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

/** 消息本地缓存（引用变化才写，最近 200 条）——断网启动显示本地记录用 */
let lastMessages: Message[] | null = null;
useChatStore.subscribe((s) => {
  if (s.messages !== lastMessages) {
    lastMessages = s.messages;
    saveCache(CACHE_MSGS, s.messages.slice(-200));
  }
});
