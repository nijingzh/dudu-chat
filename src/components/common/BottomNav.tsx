import { useHaptics } from '../../hooks/useHaptics';
import { useUiStore, type Tab } from '../../store/uiStore';

const TABS: { key: Tab; icon: string; label: string }[] = [
  { key: 'chat', icon: '💬', label: '聊天' },
  { key: 'sweet', icon: '💗', label: '甜蜜时光' },
  { key: 'surprises', icon: '🎁', label: '小惊喜' },
  { key: 'me', icon: '👤', label: '我的' },
];

/** 3.3 GlassNav 底部导航：blur 32px / 顶部渐变高光 / 圆角 28px */
export default function BottomNav() {
  const tab = useUiStore((s) => s.tab);
  const setTab = useUiStore((s) => s.setTab);
  const { fire } = useHaptics();

  return (
    <nav className="bottom-nav glass-nav">
      {TABS.map((t) => (
        <button
          key={t.key}
          type="button"
          className={`nav-item ${tab === t.key ? 'nav-item--active' : ''}`}
          onClick={() => {
            void fire('page');
            setTab(t.key);
          }}
        >
          <span className="nav-icon">{t.icon}</span>
          <span className="nav-label">{t.label}</span>
        </button>
      ))}
    </nav>
  );
}
