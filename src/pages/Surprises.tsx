import { useState } from 'react';
import { motion } from 'framer-motion';
import { useHaptics } from '../hooks/useHaptics';
import { useSweetStore } from '../store/sweetStore';
import { api } from '../api/client';
import { DATE_IDEAS, LOVE_QUOTES, PLAYLIST } from '../utils/constants';
import GlassCard from '../components/glass/GlassCard';
import GlassButton from '../components/glass/GlassButton';

/**
 * 小惊喜页（设计方案 5.4）：写封蜜语 / 慢递信 / 约会转盘 / 一起听歌 / 今日情话。
 * 慢递信 = 裁决近似口径：到达时本地通知（P2B 实装），此处先存列表。
 */
export default function Surprises() {
  const { fire } = useHaptics();
  const { notes, letters, quoteIdx, addNote, addLetter, nextQuote } = useSweetStore();
  const [noteText, setNoteText] = useState('');
  const [letterText, setLetterText] = useState('');
  const [letterDate, setLetterDate] = useState('');
  const [spinning, setSpinning] = useState(false);
  const [angle, setAngle] = useState(0);
  const [result, setResult] = useState<string | null>(null);

  const spin = () => {
    if (spinning) return;
    void fire('special');
    setSpinning(true);
    setResult(null);
    const idx = Math.floor(Math.random() * DATE_IDEAS.length);
    const seg = 360 / DATE_IDEAS.length;
    setAngle((a) => a + 360 * 3 + (360 - idx * seg - seg / 2) - (a % 360));
    window.setTimeout(() => {
      setSpinning(false);
      setResult(DATE_IDEAS[idx]);
      void fire('sweet');
    }, 1600);
  };

  return (
    <main className="page-scroll">
      {/* 今日情话 */}
      <GlassCard className="quote-card">
        <div className="quote-label">今日情话</div>
        <p className="quote-text">{LOVE_QUOTES[quoteIdx % LOVE_QUOTES.length]}</p>
        <GlassButton
          className="quote-btn"
          onClick={() => {
            void fire('swipe');
            nextQuote();
          }}
        >
          换一条 ↻
        </GlassButton>
      </GlassCard>

      {/* 约会转盘 */}
      <section className="sec">
        <h2 className="sec-title">约会转盘</h2>
        <GlassCard className="wheel-card">
          <div className="wheel-wrap">
            <div className="wheel-pointer">▾</div>
            <motion.div
              className="wheel"
              animate={{ rotate: angle }}
              transition={{ duration: 1.6, ease: [0.16, 0.9, 0.24, 1] }}
            >
              {DATE_IDEAS.map((_, i) => (
                <div
                  key={i}
                  className="wheel-seg"
                  style={{
                    transform: `rotate(${(360 / DATE_IDEAS.length) * i}deg)`,
                    background: i % 2 ? 'rgba(255,255,255,0.32)' : 'rgba(255,143,171,0.32)',
                  }}
                >
                  <span>{['🍳', '🌇', '🎬', '🛒', '🎮', '🍰', '🚲', '🎨'][i]}</span>
                </div>
              ))}
            </motion.div>
            <button type="button" className="wheel-center" onClick={spin}>
              转
            </button>
          </div>
          <p className="wheel-result">
            {result ? `就决定是：${result}` : spinning ? '转呀转…' : '不知道去干嘛？转一转'}
          </p>
        </GlassCard>
      </section>

      {/* 写封蜜语 */}
      <section className="sec">
        <h2 className="sec-title">写封蜜语</h2>
        <GlassCard className="note-card">
          <input
            className="note-input"
            value={noteText}
            placeholder="写张便签给 TA…"
            onChange={(e) => setNoteText(e.target.value)}
          />
          <GlassButton
            className="note-btn"
            onClick={() => {
              if (!noteText.trim()) return;
              void fire('send');
              addNote('衍', noteText);
              setNoteText('');
            }}
          >
            放进蜜语罐
          </GlassButton>
          {notes.length > 0 && (
            <div className="note-list">
              {notes.map((n) => (
                <div key={n.id} className="note-item">
                  <span className="note-from">{n.from}</span>
                  <span className="note-text">{n.text}</span>
                  <span className="note-date">{n.date}</span>
                </div>
              ))}
            </div>
          )}
        </GlassCard>
      </section>

      {/* 慢递信 */}
      <section className="sec">
        <h2 className="sec-title">
          慢递信 <span className="sec-hint">（到点本地通知 · P2B）</span>
        </h2>
        <GlassCard className="note-card">
          <input
            className="note-input"
            value={letterText}
            placeholder="写封信，到那天再送达…"
            onChange={(e) => setLetterText(e.target.value)}
          />
          <div className="letter-row">
            <input
              type="date"
              className="letter-date"
              value={letterDate}
              onChange={(e) => setLetterDate(e.target.value)}
            />
            <GlassButton
              className="note-btn"
              onClick={() => {
                if (!letterText.trim() || !letterDate) return;
                void fire('send');
                addLetter('衍', letterText, letterDate);
                // 双写：服务器排程（在线到点推 / 离线开 App 兜底）
                api
                  .sendLetter(letterText.trim(), `${letterDate}T09:00:00`)
                  .catch(() => undefined);
                setLetterText('');
                setLetterDate('');
              }}
            >
              封存慢递
            </GlassButton>
          </div>
          {letters.length > 0 && (
            <div className="note-list">
              {letters.map((l) => (
                <div key={l.id} className="note-item">
                  <span className="note-from">📮 {l.deliverDate}</span>
                  <span className="note-text">{l.text}</span>
                </div>
              ))}
            </div>
          )}
        </GlassCard>
      </section>

      {/* 一起听歌 */}
      <section className="sec">
        <h2 className="sec-title">
          一起听歌 <span className="sec-hint">（占位歌单 · P2B 接真实歌单）</span>
        </h2>
        <GlassCard className="song-card">
          {PLAYLIST.map((s, i) => (
            <div key={i} className="song-row">
              <span className="song-no">{String(i + 1).padStart(2, '0')}</span>
              <span className="song-title">{s.title}</span>
              <span className="song-artist">{s.artist}</span>
            </div>
          ))}
        </GlassCard>
      </section>
    </main>
  );
}
