import { useState } from 'react';
import { useHaptics } from '../../hooks/useHaptics';
import type { Message } from '../../store/chatStore';

interface MessageBubbleProps {
  message: Message;
  onRecall: (id: string) => void;
}

/**
 * 消息气泡：自己右粉 / 对方左白（3.1）。
 * 点自己的消息 → 撤回动作条（长按手势与反应表情条归 P1D）。
 */
export default function MessageBubble({ message, onRecall }: MessageBubbleProps) {
  const { fire } = useHaptics();
  const [showActions, setShowActions] = useState(false);
  const mine = message.from === 'me';

  if (message.status === 'recalled-me') {
    return <div className="msg-recalled">你撤回了一条消息</div>;
  }

  return (
    <div className={`msg-row ${mine ? 'msg-row--mine' : 'msg-row--other'}`}>
      <button
        type="button"
        className={`bubble ${mine ? 'bubble-self' : 'bubble-other'}`}
        onClick={() => {
          if (!mine) return;
          void fire('longPress');
          setShowActions((v) => !v);
        }}
      >
        {message.text}
      </button>
      <div className="msg-meta">
        {mine && message.status === 'read' && <span className="msg-read">已读</span>}
        <span className="msg-time">{message.time}</span>
      </div>
      {showActions && mine && (
        <button
          type="button"
          className="msg-recall-btn"
          onClick={() => {
            onRecall(message.id);
            setShowActions(false);
          }}
        >
          撤回
        </button>
      )}
    </div>
  );
}
