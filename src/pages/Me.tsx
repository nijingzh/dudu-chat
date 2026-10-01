import { useHaptics } from '../hooks/useHaptics';
import { useChatStore } from '../store/chatStore';
import { useUiStore } from '../store/uiStore';
import { togetherDays } from '../utils/constants';
import GlassCard from '../components/glass/GlassCard';
import Avatar from '../components/common/Avatar';

const ENTRIES = [
  { sub: 'profile', icon: '🎨', label: '个人资料 / 主题 / 聊天背景' },
  { sub: 'settings', icon: '⚙️', label: '设置（触觉 / 通知 / 外观 / 隐私）' },
  { sub: 'anniversary', icon: '📅', label: '纪念日管理' },
] as const;

/** 我的页（设计方案 4.1「我的页」= 资料 + 设置入口 + 数据导出） */
export default function Me() {
  const { fire } = useHaptics();
  const openSub = useUiStore((s) => s.openSub);
  const logout = useChatStore((s) => s.logout);
  const me = useChatStore((s) => s.me);

  const exportData = () => {
    void fire('tap');
    const dump = {
      messages: useChatStore.getState().messages,
      settings: localStorage.getItem('duduchat-settings'),
      sweet: {
        mood: localStorage.getItem('duduchat-mood'),
        diary: localStorage.getItem('duduchat-diary'),
        anniversaries: localStorage.getItem('duduchat-anniversaries'),
      },
      exportedAt: new Date().toISOString(),
    };
    const blob = new Blob([JSON.stringify(dump, null, 2)], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `duduchat-export-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(a.href);
  };

  return (
    <main className="page-scroll">
      <GlassCard className="me-card">
        <Avatar emoji={me.avatar} size={64} />
        <div className="me-info">
          <div className="me-name">{me.name}</div>
          <div className="me-sign">在一起 {togetherDays()} 天 · 只属于我们俩</div>
        </div>
      </GlassCard>

      <section className="sec">
        {ENTRIES.map((e) => (
          <button
            key={e.sub}
            type="button"
            className="me-entry glass-card"
            onClick={() => {
              void fire('page');
              openSub(e.sub);
            }}
          >
            <span className="me-entry-icon">{e.icon}</span>
            <span className="me-entry-label">{e.label}</span>
            <span className="me-entry-arrow">›</span>
          </button>
        ))}
        <button type="button" className="me-entry glass-card" onClick={exportData}>
          <span className="me-entry-icon">📤</span>
          <span className="me-entry-label">数据导出（JSON）</span>
          <span className="me-entry-arrow">›</span>
        </button>
      </section>

      <button type="button" className="me-logout" onClick={logout}>
        退出登录
      </button>
    </main>
  );
}
