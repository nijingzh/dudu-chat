import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import FloatingParticles from './components/effects/FloatingParticles';
import HapticDebugToast from './components/common/HapticDebugToast';
import BottomNav from './components/common/BottomNav';
import UiKit from './pages/UiKit';
import Login from './pages/Login';
import Chat from './pages/Chat';
import SweetMoments from './pages/SweetMoments';
import Surprises from './pages/Surprises';
import Me from './pages/Me';
import Profile from './pages/Profile';
import Settings from './pages/Settings';
import AnniversaryPage from './pages/AnniversaryPage';
import MessageDetail from './pages/MessageDetail';
import { useChatStore } from './store/chatStore';
import { useUiStore } from './store/uiStore';
import { applySettingsToCSS, useSettingsStore } from './store/settingsStore';
import { INVITE_CODES } from './utils/constants';

/** 页面过渡（编排级转场归 P1D） */
const pageMotion = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -8 },
  transition: { duration: 0.3, ease: [0.22, 0.8, 0.3, 1] as const },
};

export default function App() {
  const view = useChatStore((s) => s.view);
  const detail = useChatStore((s) => s.detailMessage);
  const enterChat = useChatStore((s) => s.enterChat);
  const tab = useUiStore((s) => s.tab);
  const sub = useUiStore((s) => s.sub);
  const closeSub = useUiStore((s) => s.closeSub);
  const settings = useSettingsStore();
  const [hash, setHash] = useState(window.location.hash);

  useEffect(() => {
    const onHash = () => setHash(window.location.hash);
    window.addEventListener('hashchange', onHash);
    return () => window.removeEventListener('hashchange', onHash);
  }, []);

  // 记住会话：首登填码后启动免登录
  useEffect(() => {
    const saved = localStorage.getItem('duduchat-session');
    if (saved && INVITE_CODES[saved]) enterChat();
  }, [enterChat]);

  // 主题色 / 聊天背景 / 气泡柔光 → CSS 变量
  useEffect(() => {
    applySettingsToCSS(settings);
  }, [settings]);

  const pageBody = () => {
    if (sub === 'profile') return <Profile onBack={closeSub} />;
    if (sub === 'settings') return <Settings onBack={closeSub} />;
    if (sub === 'anniversary') return <AnniversaryPage onBack={closeSub} />;
    if (tab === 'chat') return <Chat />;
    if (tab === 'sweet') return <SweetMoments />;
    if (tab === 'surprises') return <Surprises />;
    return <Me />;
  };

  return (
    <>
      <div className="duduchat-bg" aria-hidden="true" />
      <FloatingParticles />
      <HapticDebugToast />
      {hash === '#ui' ? (
        <motion.div key="ui" {...pageMotion}>
          <UiKit />
        </motion.div>
      ) : view === 'login' ? (
        <motion.div key="login" {...pageMotion}>
          <Login />
        </motion.div>
      ) : (
        <>
          <div className="app-shell">
            <AnimatePresence mode="wait">
              <motion.div
                key={`${tab}-${sub}`}
                className="app-body"
                {...pageMotion}
              >
                {pageBody()}
              </motion.div>
            </AnimatePresence>
            {!sub && !detail && <BottomNav />}
          </div>
          <AnimatePresence>{detail && <MessageDetail key="detail" />}</AnimatePresence>
        </>
      )}
    </>
  );
}
