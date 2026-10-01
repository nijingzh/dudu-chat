import { useState } from 'react';
import { useHaptics } from '../hooks/useHaptics';
import { useSweetStore, daysUntil, type Anniversary } from '../store/sweetStore';
import GlassCard from '../components/glass/GlassCard';
import GlassButton from '../components/glass/GlassButton';

interface Props {
  onBack: () => void;
}

/** 纪念日管理页（设计方案 5.8）：列表 + 倒计时 + 添加/编辑/删除 */
export default function AnniversaryPage({ onBack }: Props) {
  const { fire } = useHaptics();
  const { anniversaries, upsertAnniversary, removeAnniversary } = useSweetStore();
  const [editing, setEditing] = useState<Anniversary | null>(null);
  const [name, setName] = useState('');
  const [month, setMonth] = useState('1');
  const [day, setDay] = useState('1');

  const startEdit = (a: Anniversary) => {
    void fire('tap');
    setEditing(a);
    setName(a.name);
    setMonth(String(a.month));
    setDay(String(a.day));
  };

  const save = () => {
    if (!name.trim()) return;
    void fire('send');
    upsertAnniversary({
      id: editing?.id ?? `a${Date.now()}`,
      name: name.trim(),
      month: Math.min(12, Math.max(1, Number(month) || 1)),
      day: Math.min(31, Math.max(1, Number(day) || 1)),
    });
    setEditing(null);
    setName('');
  };

  return (
    <main className="page-scroll">
      <button type="button" className="sub-back" onClick={onBack}>
        ‹ 返回
      </button>
      <h1 className="sub-title">纪念日管理</h1>

      {anniversaries.map((a) => (
        <GlassCard key={a.id} className="anni-card">
          <div className="anni-info">
            <div className="anni-name">{a.name}</div>
            <div className="anni-date">
              {a.month} 月 {a.day} 日
            </div>
          </div>
          <div className="anni-right">
            <div className="anni-left">{daysUntil(a)} 天</div>
            <div className="anni-actions">
              <button type="button" onClick={() => startEdit(a)}>
                编辑
              </button>
              <button
                type="button"
                className="anni-del"
                onClick={() => {
                  void fire('swipe');
                  removeAnniversary(a.id);
                }}
              >
                删除
              </button>
            </div>
          </div>
        </GlassCard>
      ))}

      <GlassCard className="anni-form">
        <div className="anni-form-title">{editing ? '编辑纪念日' : '添加纪念日'}</div>
        <input
          className="note-input"
          value={name}
          placeholder="名字，比如「第一次约会」"
          onChange={(e) => setName(e.target.value)}
        />
        <div className="anni-form-row">
          <input
            className="anni-num"
            value={month}
            onChange={(e) => setMonth(e.target.value)}
            placeholder="月"
          />
          <input
            className="anni-num"
            value={day}
            onChange={(e) => setDay(e.target.value)}
            placeholder="日"
          />
          <GlassButton className="anni-save" onClick={save}>
            {editing ? '保存' : '添加'}
          </GlassButton>
          {editing && (
            <button type="button" className="anni-cancel" onClick={() => setEditing(null)}>
              取消
            </button>
          )}
        </div>
      </GlassCard>
    </main>
  );
}
