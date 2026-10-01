import jwt from 'jsonwebtoken';
import { JWT_SECRET } from './config.js';
import { nowIso, ensurePair, roomOf } from './auth.js';

/**
 * Socket.io：鉴权握手（JWT）→ 进 pair 房。
 * 在线状态 / 正在输入 走 socket；消息走 REST 落库后由服务端推房。
 */
export function initSocket(io) {
  /** userId → 在线连接数 */
  const online = new Map();

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
    const partnerId = pair.user_a === socket.userId ? pair.user_b : pair.user_a;
    socket.join(room);
    // 先告诉新来者：对方现在在不在线
    socket.emit('presence:update', {
      userId: partnerId,
      online: (online.get(partnerId) || 0) > 0,
      at: nowIso(),
    });
    online.set(socket.userId, (online.get(socket.userId) || 0) + 1);
    socket.to(room).emit('presence:update', { userId: socket.userId, online: true, at: nowIso() });

    socket.on('typing', () => {
      socket.to(room).emit('typing', { userId: socket.userId });
    });

    socket.on('disconnect', () => {
      const n = (online.get(socket.userId) || 1) - 1;
      online.set(socket.userId, Math.max(0, n));
      if (n <= 0) {
        socket.to(room).emit('presence:update', { userId: socket.userId, online: false, at: nowIso() });
      }
    });
  });
}
