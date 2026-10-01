import { useRef, useState } from 'react';
import { useHaptics } from '../../hooks/useHaptics';
import { useEffectStore, type EffectKind } from '../../store/effectStore';
import { QUICK_EMOJIS } from '../../utils/constants';
import { compressImage } from '../../utils/image';
import { pingTyping } from '../../store/chatStore';
import GlassInput from '../glass/GlassInput';

interface ChatInputBarProps {
  onSend: (text: string) => void;
  onSendVoice: (duration: number) => void;
  onSendImage: (src: string) => void;
  onEffect: (kind: EffectKind, label: string) => void;
}

const FX_ITEMS: { kind: EffectKind; icon: string; label: string; line: string }[] = [
  { kind: 'spoil', icon: '💗', label: '撒娇模式', line: '人家想撒个娇～💗' },
  { kind: 'missYou', icon: '🌧️', label: '想你了', line: '想你了 🌧️' },
  { kind: 'celebrate', icon: '🎉', label: '庆祝一下', line: '要庆祝一下 🎉' },
];

/**
 * 底部玻璃输入栏（P1D 版）：表情 / 文本 / 按住说话（上滑取消）/ 图片占位 / ✨特效 / 发送。
 * 特效入口发消息 + 播全屏特效（4.2 消息特效）。
 */
export default function ChatInputBar({ onSend, onSendVoice, onSendImage, onEffect }: ChatInputBarProps) {
  const { fire } = useHaptics();
  const playFx = useEffectStore((s) => s.play);
  const [text, setText] = useState('');
  const [emojiOpen, setEmojiOpen] = useState(false);
  const [fxOpen, setFxOpen] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const [holding, setHolding] = useState(false);
  const [cancelled, setCancelled] = useState(false);
  const holdStart = useRef(0);
  const startY = useRef(0);
  const imgRef = useRef<HTMLInputElement>(null);

  const toast = (s: string) => {
    setNotice(s);
    window.setTimeout(() => setNotice(null), 1600);
  };

  const send = () => {
    if (!text.trim()) return;
    onSend(text);
    setText('');
    setEmojiOpen(false);
  };

  const startHold = (e: React.PointerEvent) => {
    void fire('tap');
    holdStart.current = Date.now();
    startY.current = e.clientY;
    setCancelled(false);
    setHolding(true);
    setEmojiOpen(false);
    setFxOpen(false);
  };
  const moveHold = (e: React.PointerEvent) => {
    if (!holding) return;
    setCancelled(startY.current - e.clientY > 60);
  };
  const endHold = () => {
    if (!holding) return;
    setHolding(false);
    if (cancelled) {
      void fire('swipe');
      toast('松手取消了');
      return;
    }
    const secs = Math.max(1, Math.round((Date.now() - holdStart.current) / 1000));
    void fire('send');
    onSendVoice(secs);
    toast(`语音 ${secs}″ 已发出（mock）`);
  };

  return (
    <div className="chat-input-area">
      {notice && <div className="app-toast">{notice}</div>}
      {holding && (
        <div className={`hold-overlay glass-card ${cancelled ? 'hold-overlay--cancel' : ''}`}>
          <span className="hold-icon">🎤</span>
          <span>{cancelled ? '松手取消' : '松开发送 · 上滑取消'}</span>
          <span className="hold-dots">
            <i />
            <i />
            <i />
          </span>
        </div>
      )}
      {emojiOpen && (
        <div className="emoji-panel glass-card">
          {QUICK_EMOJIS.map((e) => (
            <button key={e} type="button" className="emoji-item" onClick={() => setText((t) => t + e)}>
              {e}
            </button>
          ))}
        </div>
      )}
      {fxOpen && (
        <div className="fx-menu glass-card">
          {FX_ITEMS.map((f) => (
            <button
              key={f.kind}
              type="button"
              className="fx-menu-item"
              onClick={() => {
                void fire('special');
                playFx(f.kind);
                onEffect(f.kind, f.line);
                setFxOpen(false);
              }}
            >
              <span>{f.icon}</span>
              <span>{f.label}</span>
            </button>
          ))}
        </div>
      )}
      <div className="chat-bar glass-nav">
        <button
          type="button"
          className="bar-btn"
          aria-label="表情"
          onClick={() => {
            void fire('tap');
            setFxOpen(false);
            setEmojiOpen((v) => !v);
          }}
        >
          😊
        </button>
        <GlassInput
          value={text}
          onChange={(v) => {
            setText(v);
            if (v.trim()) pingTyping();
          }}
          onEnter={send}
          placeholder="说点什么…"
          className="flex-1"
        />
        <button
          type="button"
          className={`bar-btn ${holding ? 'bar-btn--holding' : ''}`}
          aria-label="按住说话"
          onPointerDown={startHold}
          onPointerMove={moveHold}
          onPointerUp={endHold}
          onPointerCancel={endHold}
          onContextMenu={(e) => e.preventDefault()}
        >
          🎤
        </button>
        <button
          type="button"
          className="bar-btn"
          aria-label="图片"
          onClick={() => {
            void fire('tap');
            imgRef.current?.click();
          }}
        >
          🖼️
        </button>
        <input
          ref={imgRef}
          type="file"
          accept="image/*"
          hidden
          onChange={async (e) => {
            const f = e.target.files?.[0];
            e.target.value = '';
            if (!f) return;
            void fire('send');
            onSendImage(await compressImage(f));
          }}
        />
        <button
          type="button"
          className="bar-btn"
          aria-label="甜蜜特效"
          onClick={() => {
            void fire('tap');
            setEmojiOpen(false);
            setFxOpen((v) => !v);
          }}
        >
          ✨
        </button>
        <button
          type="button"
          className="bar-send"
          aria-label="发送"
          onClick={() => {
            if (!text.trim()) return;
            void fire('send');
            send();
          }}
        >
          ➤
        </button>
      </div>
    </div>
  );
}
