import { useState } from 'react';
import GlassCard from '../components/glass/GlassCard';
import GlassButton from '../components/glass/GlassButton';
import GlassInput from '../components/glass/GlassInput';
import Avatar from '../components/common/Avatar';
import { useChatStore } from '../store/chatStore';
import { APP_NAME, LOGIN_FOOTER, MOCK_ME, MOCK_OTHER } from '../utils/constants';

/**
 * 登录页（设计方案第五节 1）：渐变粉紫背景 + 飘浮粒子（App 层）
 * → 情侣头像 → duduchat 大标题 → 玻璃卡片输入邀请码 → 玻璃按钮进入 → 底部文案。
 * 邀请码（裁决）：两码两账号，输对即登录，本地记住会话。
 */
export default function Login() {
  const login = useChatStore((s) => s.login);
  const [code, setCode] = useState('');
  const [error, setError] = useState(false);
  const [shakeKey, setShakeKey] = useState(0);

  const enter = () => {
    const ok = login(code);
    if (!ok) {
      setError(true);
      setShakeKey((k) => k + 1);
    }
  };

  return (
    <main className="login-page">
      <div className="login-avatars">
        <Avatar emoji={MOCK_ME.avatar} size={72} />
        <Avatar emoji={MOCK_OTHER.avatar} size={72} />
      </div>

      <h1 className="login-title">{APP_NAME}</h1>
      <p className="login-sub">专属于两个人的甜蜜私密聊天空间</p>

      <GlassCard key={shakeKey} className={`login-card ${error ? 'shake' : ''}`}>
        <label className="login-label" htmlFor="invite">
          邀请码
        </label>
        <GlassInput
          value={code}
          onChange={(v) => {
            setCode(v);
            setError(false);
          }}
          onEnter={enter}
          placeholder="输入属于我们的邀请码"
        />
        {error && <p className="login-error">邀请码不对哦，再看看？</p>}
        <GlassButton onClick={enter} className="login-enter">
          进入小世界
        </GlassButton>
      </GlassCard>

      <footer className="login-footer">
        <p>{LOGIN_FOOTER} 💌</p>
        <a className="login-uikit-link" href="#ui">
          UI Kit
        </a>
      </footer>
    </main>
  );
}
