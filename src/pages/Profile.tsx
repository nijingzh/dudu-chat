import { useHaptics } from '../hooks/useHaptics';
import { useSettingsStore } from '../store/settingsStore';
import { CHAT_BGS, THEMES } from '../utils/constants';
import GlassCard from '../components/glass/GlassCard';
import Avatar from '../components/common/Avatar';
import { useChatStore } from '../store/chatStore';

interface Props {
  onBack: () => void;
}

/** 个人资料页（设计方案 5.5）：头像/昵称/签名 → 主题色 → 聊天背景 → 数据导出 */
export default function Profile({ onBack }: Props) {
  const { fire } = useHaptics();
  const me = useChatStore((s) => s.me);
  const { theme, chatBg, setTheme, setChatBg } = useSettingsStore();

  return (
    <main className="page-scroll">
      <button type="button" className="sub-back" onClick={onBack}>
        ‹ 返回
      </button>
      <h1 className="sub-title">个人资料</h1>

      <GlassCard className="profile-card">
        <Avatar emoji={me.avatar} size={72} />
        <div className="profile-fields">
          <div className="profile-row">
            <span>昵称</span>
            <span className="profile-val">{me.name}</span>
          </div>
          <div className="profile-row">
            <span>签名</span>
            <span className="profile-val">想和你一直一直在一起</span>
          </div>
          <p className="profile-note">头像上传 / 昵称编辑 P2B 接后端后实装</p>
        </div>
      </GlassCard>

      <section className="sec">
        <h2 className="sec-title">主题色</h2>
        <GlassCard className="swatch-card">
          {THEMES.map((t) => (
            <button
              key={t.key}
              type="button"
              className={`swatch ${theme === t.key ? 'swatch--on' : ''}`}
              onClick={() => {
                void fire('love');
                setTheme(t.key);
              }}
            >
              <span
                className="swatch-dot"
                style={{ background: `linear-gradient(135deg, ${t.from}, ${t.to})` }}
              />
              <span className="swatch-name">{t.name}</span>
            </button>
          ))}
        </GlassCard>
      </section>

      <section className="sec">
        <h2 className="sec-title">聊天背景</h2>
        <GlassCard className="swatch-card">
          {CHAT_BGS.map((b) => (
            <button
              key={b.key}
              type="button"
              className={`swatch ${chatBg === b.key ? 'swatch--on' : ''}`}
              onClick={() => {
                void fire('swipe');
                setChatBg(b.key);
              }}
            >
              <span
                className="swatch-dot"
                style={{ background: `linear-gradient(135deg, ${b.from}, ${b.to})` }}
              />
              <span className="swatch-name">{b.name}</span>
            </button>
          ))}
        </GlassCard>
      </section>
    </main>
  );
}
