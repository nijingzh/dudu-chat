import jwt from 'jsonwebtoken';
import { JWT_SECRET } from './config.js';
import { nowIso, ensurePair, roomOf } from './auth.js';

/**
 * Socket.io：鉴权握手（JWT）→ 进 pair 房。
 * 在线状态 / 正在输入 走 socket；消息走 REST 落库后由服务端推房。
 */
export function initSocket(io) {
  io.use((socket, next) => {
    try {
      socket.userId = jwt.verify(socket.handshake.auth?.token || '', JWT_SECRET).sub;
      next();
    } catch {
      next(new Error('unauthorized'));
    }
  });

  io.on('connection', async (socket) => {
    const pair = await ensurePair(socket.userId);
    if (!pair) return;
    const room = roomOf(pair.id);
    socket.join(room);
    socket.to(room).emit('presence:update', { userId: socket.userId, online: true, at: nowIso() });

    socket.on('typing', () => {
      socket.to(room).emit('typing', { userId: socket.userId });
    });

    socket.on('disconnect', () => {
      socket.to(room).emit('presence:update', { userId: socket.userId, online: false, at: nowIso() });
    });
  });
}
