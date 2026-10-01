import { useEffect, useRef } from 'react';
import { useHaptics } from '../hooks/useHaptics';
import { useChatStore } from '../store/chatStore';
import { togetherDays } from '../utils/constants';
import Avatar from '../components/common/Avatar';
import GlassNav from '../components/glass/GlassNav';
import MessageBubble from '../components/chat/MessageBubble';
import TypingIndicator from '../components/chat/TypingIndicator';
import ChatInputBar from '../components/chat/ChatInputBar';

/**
 * 聊天主页（设计方案第五节 2）：顶部玻璃导航（昵称 + 在线状态 + 在一起天数）
 * → 消息气泡区（左白右粉）→ 底部玻璃输入栏。
 * mock 轨道：发消息 → 对方「正在输入」→ 自动回复（P2B 换 Socket.io）。
 */
export default function Chat() {
  const { fire } = useHaptics();
  const messages = useChatStore((s) => s.messages);
  const otherTyping = useChatStore((s) => s.otherTyping);
  const other = useChatStore((s) => s.other);
  const me = useChatStore((s) => s.me);
  const sendMessage = useChatStore((s) => s.sendMessage);
  const recall = useChatStore((s) => s.recall);
  const setOtherTyping = useChatStore((s) => s.setOtherTyping);
  const appendReply = useChatStore((s) => s.appendReply);
  const logout = useChatStore((s) => s.logout);
  const scrollRef = useRef<HTMLDivElement>(null);
  const timersRef = useRef<number[]>([]);

  // 新消息 / 正在输入 → 滚到底
  useEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [messages, otherTyping]);

  // 卸载时清掉 mock 轨道的定时器
  useEffect(
    () => () => {
      timersRef.current.forEach((t) => window.clearTimeout(t));
    },
    [],
  );

  const handleSend = (text: string) => {
    sendMessage(text);
    timersRef.current.push(
      window.setTimeout(() => setOtherTyping(true), 1200),
      window.setTimeout(() => {
        appendReply();
        void fire('receive');
      }, 2800),
    );
  };

  return (
    <div className="chat-page">
      <div className="chat-top">
        <GlassNav
          className="chat-nav"
          title={
            <span className="flex items-center gap-2">
              <Avatar emoji={other.avatar} size={28} ring={false} />
              {other.nickname}
            </span>
          }
          subtitle={
            <span className="flex items-center gap-1.5">
              <span
                className="inline-block h-2 w-2 rounded-full"
                style={{ background: 'var(--color-mint)' }}
              />
              {other.online ? '在线' : '离线'} · 在一起 {togetherDays()} 天
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
          <MessageBubble key={m.id} message={m} onRecall={recall} />
        ))}
        {otherTyping && <TypingIndicator />}
        <div className="chat-me">
          <Avatar emoji={me.avatar} size={22} ring={false} />
        </div>
      </div>

      <ChatInputBar
        onSend={(text) => {
          handleSend(text);
        }}
      />
    </div>
  );
}
