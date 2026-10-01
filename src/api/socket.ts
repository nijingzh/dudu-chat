/**
 * Socket.io 客户端：JWT 握手，实时事件 → 回调。
 * 断线自动重连；onConnect 里做离线补偿（拉 bootstrap 合并）。
 */
import { io, Socket } from 'socket.io-client';
import { API_BASE, getToken, type ServerLetter, type ServerMessage } from './client';

export interface SocketHandlers {
  onMessage: (m: ServerMessage) => void;
  onRead: (payload: { id: string; by: string }) => void;
  onRecalled: (payload: { id: string; by: string }) => void;
  onTyping: () => void;
  onPresence: (payload: { userId: string; online: boolean }) => void;
  onLetter: (l: ServerLetter) => void;
  onConnect: () => void;
  onDisconnect: () => void;
}

let socket: Socket | null = null;

export function connectSocket(handlers: SocketHandlers) {
  disconnectSocket();
  const token = getToken();
  if (!token) return;
  socket = io(API_BASE, {
    auth: { token },
    reconnection: true,
    reconnectionDelay: 1000,
    reconnectionDelayMax: 8000,
  });
  socket.on('connect', handlers.onConnect);
  socket.on('disconnect', handlers.onDisconnect);
  socket.on('message:new', handlers.onMessage);
  socket.on('message:read', handlers.onRead);
  socket.on('message:recalled', handlers.onRecalled);
  socket.on('typing', handlers.onTyping);
  socket.on('presence:update', handlers.onPresence);
  socket.on('letter:due', handlers.onLetter);
}

export function disconnectSocket() {
  socket?.disconnect();
  socket = null;
}

export const emitTyping = () => socket?.emit('typing');
export const socketConnected = () => !!socket?.connected;
