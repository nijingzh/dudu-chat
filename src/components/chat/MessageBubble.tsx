import { useState } from 'react';
import { useHaptics } from '../../hooks/useHaptics';
import { useChatStore, type Message } from '../../store/chatStore';

interface MessageBubbleProps {
  message: Message;
  onRecall: (id: string) => void;
}

/**
 * 消息气泡：自己右粉 / 对方左白（3.1）；支持文字 / 图片占位 / 语音波形。
 * 图片与语音点击 → 消息详情页；点自己的文字消息 → 撤回动作条
 * （P1D 长按手势上线后撤掉点击入口，撤回收进长按菜单）。
 */
export default function MessageBubble({ message, onRecall }: MessageBubbleProps) {
  const { fire } = useHaptics();
  const openDetail = useChatStore((s) => s.openDetail);
  const [showActions, setShowActions] = useState(false);
  const mine = message.from === 'me';

  if (message.status === 'recalled-me') {
    return <div className="msg-recalled">你撤回了一条消息</div>;
  }

  const open = () => {
    void fire('tap');
    openDetail(message);
  };

  return (
    <div className={`msg-row ${mine ? 'msg-row--mine' : 'msg-row--other'}`}>
      {message.kind === 'image' && (
        <button
          type="button"
          className="msg-image"
          style={{
            background: `linear-gradient(135deg, ${message.meta?.tint ?? '#FFB3D9'}, rgba(255,255,255,0.5))`,
          }}
          onClick={open}
        >
          <span>{message.meta?.emoji ?? '📷'}</span>
        </button>
      )}
      {message.kind === 'voice' && (
        <button type="button" className="msg-voice" onClick={open}>
          <span className="voice-play">▶</span>
          <span className="voice-wave">
            {Array.from({ length: 14 }).map((_, i) => (
              <i key={i} style={{ height: 5 + ((i * 7) % 13) }} />
            ))}
          </span>
          <span className="voice-dur">{message.meta?.duration ?? 0}″</span>
        </button>
      )}
      {message.kind === 'text' && (
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
      )}
      <div className="msg-meta">
        {mine && message.status === 'read' && <span className="msg-read">已读</span>}
        <span className="msg-time">{message.time}</span>
      </div>
      {showActions && mine && message.kind === 'text' && (
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
