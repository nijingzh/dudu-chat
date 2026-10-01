import { useState } from 'react';
import { useHaptics } from '../../hooks/useHaptics';
import { QUICK_EMOJIS } from '../../utils/constants';
import GlassInput from '../glass/GlassInput';

interface ChatInputBarProps {
  onSend: (text: string) => void;
}

/** 底部玻璃输入栏：表情 / 文本 / 语音 / 图片 / 发送（语音与图片 P1B 占位，P2B 接上传） */
export default function ChatInputBar({ onSend }: ChatInputBarProps) {
  const { fire } = useHaptics();
  const [text, setText] = useState('');
  const [emojiOpen, setEmojiOpen] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);

  const placeholder = (s: string) => {
    setNotice(s);
    window.setTimeout(() => setNotice(null), 1600);
  };

  const send = () => {
    if (!text.trim()) return;
    onSend(text);
    setText('');
    setEmojiOpen(false);
  };

  return (
    <div className="chat-input-area">
      {notice && <div className="app-toast">{notice}</div>}
      {emojiOpen && (
        <div className="emoji-panel glass-card">
          {QUICK_EMOJIS.map((e) => (
            <button
              key={e}
              type="button"
              className="emoji-item"
              onClick={() => {
                setText((t) => t + e);
              }}
            >
              {e}
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
            setEmojiOpen((v) => !v);
          }}
        >
          😊
        </button>
        <GlassInput
          value={text}
          onChange={setText}
          onEnter={send}
          placeholder="说点什么…"
          className="flex-1"
        />
        <button
          type="button"
          className="bar-btn"
          aria-label="语音"
          onClick={() => {
            void fire('tap');
            placeholder('语音消息 P1B 占位 · P2B 接上传');
          }}
        >
          🎤
        </button>
        <button
          type="button"
          className="bar-btn"
          aria-label="图片"
          onClick={() => {
            void fire('tap');
            placeholder('图片消息 P1B 占位 · P2B 接上传');
          }}
        >
          🖼️
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
