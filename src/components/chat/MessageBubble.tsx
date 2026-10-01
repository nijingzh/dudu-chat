import { useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { useHaptics } from '../../hooks/useHaptics';
import { useChatStore, type Message } from '../../store/chatStore';
import { useEffectStore, type EffectKind } from '../../store/effectStore';

const REACTIONS = ['💕', '😂', '😮', '😢', '👍', '🔥'];

/** 反应表情 → 全屏特效映射（4.2）：💕撒娇 ｜ 😂开心 ｜ 😢不开心 */
const REACTION_FX: Record<string, EffectKind> = {
  '💕': 'spoil',
  '😂': 'celebrate',
  '😢': 'sad',
};

interface MessageBubbleProps {
  message: Message;
  onRecall: (id: string) => void;
}

/**
 * 消息气泡：入场弹性浮现（P1D）；长按 350ms → 反应表情条（💕😂😮😢👍🔥）
 * + 撤回（仅自己的文字消息，裁决：点击入口已撤、收进长按菜单）。
 * 图片/语音点击 → 消息详情页。
 */
export default function MessageBubble({ message, onRecall }: MessageBubbleProps) {
  const { fire } = useHaptics();
  const openDetail = useChatStore((s) => s.openDetail);
  const playFx = useEffectStore((s) => s.play);
  const [showBar, setShowBar] = useState(false);
  const [reaction, setReaction] = useState<string | null>(null);
  const [floatKey, setFloatKey] = useState(0);
  const holdTimer = useRef<number | undefined>(undefined);
  const longPressed = useRef(false);
  const mine = message.from === 'me';

  if (message.status === 'recalled-me') {
    return <div className="msg-recalled">你撤回了一条消息</div>;
  }
  if (message.status === 'recalled-other') {
    return <div className="msg-recalled">对方撤回了一条消息</div>;
  }

  const startHold = () => {
    longPressed.current = false;
    holdTimer.current = window.setTimeout(() => {
      longPressed.current = true;
      void fire('longPress');
      setShowBar(true);
    }, 350);
  };
  const endHold = () => window.clearTimeout(holdTimer.current);

  const pickReaction = (emoji: string) => {
    void fire('love');
    setReaction(emoji);
    setFloatKey((k) => k + 1);
    setShowBar(false);
    const fx = REACTION_FX[emoji];
    if (fx) playFx(fx);
  };

  return (
    <motion.div
      className={`msg-row ${mine ? 'msg-row--mine' : 'msg-row--other'}`}
      initial={{ opacity: 0, y: 14, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ type: 'spring', stiffness: 320, damping: 26 }}
    >
      {message.kind === 'image' && (
        <button
          type="button"
          className="msg-image"
          style={{
            background: `linear-gradient(135deg, ${message.meta?.tint ?? '#FFB3D9'}, rgba(255,255,255,0.5))`,
          }}
          onClick={() => {
            void fire('tap');
            openDetail(message);
          }}
        >
          {message.meta?.src ? (
            <img src={message.meta.src} alt="图片消息" />
          ) : (
            <span>{message.meta?.emoji ?? '📷'}</span>
          )}
        </button>
      )}
      {message.kind === 'voice' && (
        <button
          type="button"
          className="msg-voice"
          onClick={() => {
            void fire('tap');
            openDetail(message);
          }}
        >
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
          onPointerDown={startHold}
          onPointerUp={endHold}
          onPointerLeave={endHold}
          onPointerCancel={endHold}
          onClick={() => {
            if (longPressed.current) return;
            void fire('tap');
            setShowBar((v) => !v);
          }}
        >
          {message.text}
        </button>
      )}

      <div className="msg-bubble-wrap">
        {showBar && (
          <div className="reaction-bar glass-card">
            {REACTIONS.map((e) => (
              <button
                key={e}
                type="button"
                className="reaction-item"
                onClick={() => pickReaction(e)}
              >
                {e}
              </button>
            ))}
            {mine && message.kind === 'text' && (
              <button
                type="button"
                className="reaction-recall"
                onClick={() => {
                  onRecall(message.id);
                  setShowBar(false);
                }}
              >
                撤回
              </button>
            )}
          </div>
        )}
        {reaction && (
          <span key={floatKey} className="reaction-float">
            {reaction}
          </span>
        )}
      </div>

      <div className="msg-meta">
        {mine && message.status === 'read' && <span className="msg-read">已读</span>}
        <span className="msg-time">{message.time}</span>
      </div>
    </motion.div>
  );
}
