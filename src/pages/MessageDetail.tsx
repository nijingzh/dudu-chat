import { useState } from 'react';
import { useChatStore } from '../store/chatStore';
import { useHaptics } from '../hooks/useHaptics';

/**
 * 消息详情页（设计方案 5.7）：全屏图片（可缩放）/ 语音播放（波形 + 进度 mock）/ 上下文预览。
 * mock 图片为渐变占位（不用 AI 图），语音播放进度是本地模拟。
 */
export default function MessageDetail() {
  const { fire } = useHaptics();
  const message = useChatStore((s) => s.detailMessage);
  const messages = useChatStore((s) => s.messages);
  const close = useChatStore((s) => s.closeDetail);
  const [zoom, setZoom] = useState(1);
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0);

  if (!message) return null;

  const idx = messages.findIndex((m) => m.id === message.id);
  const around = messages.slice(Math.max(0, idx - 2), idx + 3).filter((m) => m.id !== message.id);

  const togglePlay = () => {
    void fire('tap');
    if (playing) {
      setPlaying(false);
      return;
    }
    setPlaying(true);
    setProgress(0);
    const duration = (message.meta?.duration ?? 5) * 1000;
    const start = Date.now();
    const timer = window.setInterval(() => {
      const p = Math.min(1, (Date.now() - start) / duration);
      setProgress(p);
      if (p >= 1) {
        window.clearInterval(timer);
        setPlaying(false);
      }
    }, 100);
  };

  return (
    <div className="detail-page">
      <button
        type="button"
        className="detail-close"
        onClick={() => {
          void fire('page');
          close();
        }}
      >
        ✕
      </button>

      {message.kind === 'image' && (
        <div className="detail-image-wrap">
          <div
            className="detail-image"
            style={{
              transform: `scale(${zoom})`,
              background: `linear-gradient(135deg, ${message.meta?.tint ?? '#FFB3D9'}, rgba(255,255,255,0.5))`,
            }}
          >
            <span>{message.meta?.emoji ?? '📷'}</span>
          </div>
          <div className="detail-zoom">
            <button
              type="button"
              onClick={() => {
                void fire('swipe');
                setZoom((z) => Math.min(3, z + 0.3));
              }}
            >
              ＋
            </button>
            <span className="detail-zoom-num">{Math.round(zoom * 100)}%</span>
            <button
              type="button"
              onClick={() => {
                void fire('swipe');
                setZoom((z) => Math.max(1, z - 0.3));
              }}
            >
              －
            </button>
          </div>
        </div>
      )}

      {message.kind === 'voice' && (
        <div className="detail-voice-wrap">
          <button type="button" className="detail-play" onClick={togglePlay}>
            {playing ? '❚❚' : '▶'}
          </button>
          <div className="detail-wave">
            {Array.from({ length: 36 }).map((_, i) => (
              <i
                key={i}
                className={i / 36 < progress ? 'wave-on' : ''}
                style={{ height: 10 + ((i * 11) % 26) }}
              />
            ))}
          </div>
          <div className="detail-voice-time">
            {Math.round(progress * (message.meta?.duration ?? 0))}″ / {message.meta?.duration ?? 0}″
          </div>
        </div>
      )}

      {message.kind === 'text' && (
        <div className="detail-text">{message.text}</div>
      )}

      <div className="detail-context">
        <div className="detail-context-title">上下文预览</div>
        {around.map((m) => (
          <div key={m.id} className="detail-context-item">
            <span className="detail-context-from">{m.from === 'me' ? '我' : 'TA'}</span>
            <span className="detail-context-text">
              {m.kind === 'text' ? m.text : m.kind === 'image' ? '[图片]' : '[语音]'}
            </span>
            <span className="detail-context-time">{m.time}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
