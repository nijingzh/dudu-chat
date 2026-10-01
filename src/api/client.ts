/**
 * API 客户端：REST 接 duduchat-server（P2B）。
 * token 存 localStorage 'duduchat-token'；登录态 = 有 token。
 */
export const API_BASE = import.meta.env?.VITE_API_BASE || 'http://us.nijingzh.top:3000';

const TOKEN_KEY = 'duduchat-token';

export interface ServerUser {
  id: string;
  name: string;
  inviteCode: string;
}

export interface ServerMessage {
  id: string;
  senderId: string;
  kind: 'text' | 'image' | 'voice';
  text: string;
  meta?: { duration?: number; src?: string; tint?: string; emoji?: string };
  clientTs: string;
  status: 'sent' | 'read' | 'recalled';
  createdAt: string;
}

export interface ServerLetter {
  id: string;
  fromUserId: string;
  text: string;
  deliverAt: string;
  deliveredAt: string | null;
}

export interface Bootstrap {
  user: ServerUser;
  partner: ServerUser | null;
  togetherDate: string;
  messages: ServerMessage[];
  letters: ServerLetter[];
}

export const getToken = () => localStorage.getItem(TOKEN_KEY);
export const setToken = (t: string | null) => {
  if (t) localStorage.setItem(TOKEN_KEY, t);
  else localStorage.removeItem(TOKEN_KEY);
};

async function call<T>(path: string, init: RequestInit = {}): Promise<T> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(init.headers as Record<string, string>),
  };
  const token = getToken();
  if (token) headers.Authorization = `Bearer ${token}`;
  const res = await fetch(`${API_BASE}${path}`, { ...init, headers });
  if (!res.ok) throw new Error(`api ${path} ${res.status}`);
  return res.json() as Promise<T>;
}

export const api = {
  login: (inviteCode: string) =>
    call<{ token: string; user: ServerUser }>('/api/login', {
      method: 'POST',
      body: JSON.stringify({ inviteCode }),
    }),

  bootstrap: () => call<Bootstrap>('/api/bootstrap'),

  sendMessage: (payload: { kind: string; text?: string; meta?: unknown; clientTs?: string }) =>
    call<ServerMessage>('/api/messages', { method: 'POST', body: JSON.stringify(payload) }),

  markRead: (id: string) =>
    call<{ ok: true }>(`/api/messages/${id}/read`, { method: 'POST' }),

  recall: (id: string) =>
    call<{ ok: true }>(`/api/messages/${id}/recall`, { method: 'POST' }),

  letters: () => call<ServerLetter[]>('/api/letters'),

  sendLetter: (text: string, deliverAt: string) =>
    call<ServerLetter>('/api/letters', {
      method: 'POST',
      body: JSON.stringify({ text, deliverAt }),
    }),

  /** dataURL → Blob 上传 → {url} */
  uploadDataUrl: async (dataUrl: string) => {
    const blob = await (await fetch(dataUrl)).blob();
    const form = new FormData();
    form.append('file', blob, 'img.jpg');
    const token = getToken();
    const res = await fetch(`${API_BASE}/api/upload`, {
      method: 'POST',
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      body: form,
    });
    if (!res.ok) throw new Error(`upload ${res.status}`);
    return res.json() as Promise<{ url: string }>;
  },
};
