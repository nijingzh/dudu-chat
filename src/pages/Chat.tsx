import { useEffect, useRef } from 'react';
import { useHaptics } from '../hooks/useHaptics';
import { useChatStore, pingTyping } from '../store/chatStore';
import { togetherDays } from '../utils/constants';
import { api } from '../api/client';
import GlassNav from '../components/glass/GlassNav';
import Avatar from '../components/common/Avatar';
import MessageBubble from '../components/chat/MessageBubble';
import TypingIndicator from '../components/chat/TypingIndicator';
import ChatInputBar from '../components/chat/ChatInputBar';

/**
 * 聊天主页 —— P2B：服务端实时（Socket.io 在线状态 / 正在输入 / 已读）。
 */
export default function Chat() {
  const { fire } = useHaptics();
  const messages = useChatStore((s) => s.messages);
  const otherTyping = useChatStore((s) => s.otherTyping);
  const partnerOnline = useChatStore((s) => s.partnerOnline);
  const other = useChatStore((s) => s.other);
  const sendMessage = useChatStore((s) => s.sendMessage);
  const retrySend = useChatStore((s) => s.retrySend);
  const recall = useChatStore((s) => s.recall);
  const markAllRead = useChatStore((s) => s.markAllRead);
  const logout = useChatStore((s) => s.logout);
  const scrollRef = useRef<HTMLDivElement>(null);
  const lastCount = useRef(0);

  // 新消息 / 正在输入 → 滚到底
  useEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [messages, otherTyping]);

  // 收到对方消息 → 触觉 + 已读回执
  useEffect(() => {
    const last = messages[messages.length - 1];
    if (messages.length > lastCount.current && last?.from === 'other') {
      void fire('receive');
      markAllRead();
    }
    lastCount.current = messages.length;
  }, [messages, fire, markAllRead]);

  return (
    <div className="chat-page">
      <div className="chat-top">
        <GlassNav
          className="chat-nav"
          title={
            <span className="flex items-center gap-2">
              <Avatar emoji={other.avatar} size={28} ring={false} />
              {other.name}
            </span>
          }
          subtitle={
            <span className="flex items-center gap-1.5">
              <span
                className="inline-block h-2 w-2 rounded-full"
                style={{
                  background:
                    (partnerOnline ?? false) ? 'var(--color-mint)' : 'rgba(160,160,175,0.8)',
                }}
              />
              {(partnerOnline ?? false) ? '在线' : '离线'} · 在一起 {togetherDays()} 天
            </span>
          }
          right={
            <button type="button" className="chat-logout" onClick={logout}>
              退出
            </button>
          }
        />
      </div>

      <div className="chat-scroll" ref={scrollRef}>
        <div className="chat-day">今天</div>
        {messages.map((m) => (
          <MessageBubble key={m.id} message={m} onRecall={recall} onRetry={retrySend} />
        ))}
        {otherTyping && <TypingIndicator />}
      </div>

      <ChatInputBar
        onSend={(text) => {
          sendMessage(text);
          pingTyping();
        }}
        onSendVoice={(duration) => {
          sendMessage('', 'voice', { duration });
        }}
        onSendImage={async (dataUrl) => {
          try {
            const { url } = await api.uploadDataUrl(dataUrl);
            sendMessage('', 'image', { src: url.startsWith('http') ? url : `http://us.nijingzh.top:3000${url}` });
          } catch {
            sendMessage('', 'image', { src: dataUrl }); // 上传失败先本地显示
          }
        }}
        onEffect={(_kind, label) => {
          sendMessage(label);
        }}
      />
    </div>
  );
}
