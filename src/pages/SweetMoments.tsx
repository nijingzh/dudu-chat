import { useRef, useState } from 'react';
import { useHaptics } from '../hooks/useHaptics';
import { useSettingsStore } from '../store/settingsStore';
import { useSweetStore, daysUntil, type Photo } from '../store/sweetStore';
import { MOODS, togetherDays } from '../utils/constants';
import GlassCard from '../components/glass/GlassCard';

/** 图片压到长边 ≤900px 的 JPEG dataURL（localStorage 友好） */
async function compressImage(file: File): Promise<string> {
  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, 900 / Math.max(bitmap.width, bitmap.height));
  const canvas = document.createElement('canvas');
  canvas.width = Math.round(bitmap.width * scale);
  canvas.height = Math.round(bitmap.height * scale);
  canvas.getContext('2d')!.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  return canvas.toDataURL('image/jpeg', 0.72);
}

/**
 * 甜蜜时光页（设计方案 5.3）：在一起天数大数字 + 心跳动画 / 纪念日倒计时 /
 * 每日心情打卡 / 爱情日记（双人协作 mock）/ 甜蜜照片墙（瀑布流占位）。
 */
export default function SweetMoments() {
  const { fire } = useHaptics();
  const heartbeat = useSettingsStore((s) => s.appearance.heartbeat);
  const { mood, diary, anniversaries, photos, setMood, addDiary, addPhotos, removePhoto } =
    useSweetStore();
  const me = '衍';
  const [text, setText] = useState('');
  const fileRef = useRef<HTMLInputElement>(null);

  const importFiles = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    void fire('love');
    const list: Photo[] = [];
    for (const f of Array.from(files).slice(0, 6)) {
      if (!f.type.startsWith('image/')) continue;
      list.push({ id: `p${Date.now()}_${list.length}`, src: await compressImage(f), date: f.name });
    }
    if (list.length) addPhotos(list);
  };

  const next = anniversaries
    .map((a) => ({ ...a, left: daysUntil(a) }))
    .sort((a, b) => a.left - b.left)[0];

  return (
    <main className="page-scroll">
      {/* 在一起天数 */}
      <section className="day-block">
        <div className={`day-num ${heartbeat ? 'heartbeat' : ''}`}>{togetherDays()}</div>
        <div className="day-label">我们在一起的日子 · 起点 2026-08-19</div>
      </section>

      {/* 纪念日倒计时 */}
      {next && (
        <GlassCard className="count-card">
          <div className="count-name">{next.name}倒计时</div>
          <div className="count-row">
            <span className="count-num">{next.left}</span>
            <span className="count-unit">天后</span>
          </div>
          <div className="count-date">
            {next.month} 月 {next.day} 日
          </div>
        </GlassCard>
      )}

      {/* 每日心情打卡 */}
      <section className="sec">
        <h2 className="sec-title">今日心情</h2>
        <GlassCard className="mood-card">
          <div className="mood-row">
            {MOODS.map((m) => (
              <button
                key={m.key}
                type="button"
                className={`mood-item ${mood?.key === m.key ? 'mood-item--on' : ''}`}
                onClick={() => {
                  void fire('love');
                  setMood(m.key);
                }}
              >
                <span className="mood-emoji">{m.emoji}</span>
                <span className="mood-label">{m.label}</span>
              </button>
            ))}
          </div>
          <p className="mood-tip">
            {mood ? `今天记下啦：${MOODS.find((x) => x.key === mood.key)?.label}` : '点一下记录今天的心情'}
          </p>
        </GlassCard>
      </section>

      {/* 爱情日记 */}
      <section className="sec">
        <h2 className="sec-title">爱情日记</h2>
        <GlassCard className="diary-card">
          <div className="diary-list">
            {diary.map((d) => (
              <div key={d.id} className="diary-entry">
                <div className="diary-meta">
                  <span className="diary-author">{d.author}</span>
                  <span className="diary-date">{d.date}</span>
                </div>
                <p className="diary-text">{d.text}</p>
              </div>
            ))}
          </div>
          <div className="diary-input-row">
            <input
              className="diary-input"
              value={text}
              placeholder="写点什么留在这…"
              onChange={(e) => setText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && text.trim()) {
                  void fire('send');
                  addDiary(me, text);
                  setText('');
                }
              }}
            />
            <button
              type="button"
              className="diary-add"
              onClick={() => {
                if (!text.trim()) return;
                void fire('send');
                addDiary(me, text);
                setText('');
              }}
            >
              记下
            </button>
          </div>
        </GlassCard>
      </section>

      {/* 照片墙：导入 / 删除 */}
      <section className="sec">
        <h2 className="sec-title">
          甜蜜照片墙{' '}
          <button
            type="button"
            className="photo-import-btn"
            onClick={() => fileRef.current?.click()}
          >
            ＋ 导入
          </button>
        </h2>
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          multiple
          hidden
          onChange={(e) => {
            void importFiles(e.target.files);
            e.target.value = '';
          }}
        />
        <div className="photo-wall">
          {photos.length === 0 && (
            <button type="button" className="photo-empty" onClick={() => fileRef.current?.click()}>
              <span>📷</span>
              <span>导入我们的照片</span>
            </button>
          )}
          {photos.map((p) => (
            <div key={p.id} className="photo-tile">
              <img src={p.src} alt={p.date} />
              <button
                type="button"
                className="photo-del"
                aria-label="删除照片"
                onClick={() => {
                  void fire('swipe');
                  removePhoto(p.id);
                }}
              >
                ✕
              </button>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
