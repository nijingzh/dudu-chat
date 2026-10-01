import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import FloatingParticles from './components/effects/FloatingParticles';
import HapticDebugToast from './components/common/HapticDebugToast';
import UiKit from './pages/UiKit';
import Login from './pages/Login';
import Chat from './pages/Chat';
import { useChatStore } from './store/chatStore';
import { INVITE_CODES } from './utils/constants';

/** 页面过渡（P1B 先用简洁淡入浮出，编排级转场归 P1D） */
const pageMotion = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -8 },
  transition: { duration: 0.3, ease: [0.22, 0.8, 0.3, 1] as const },
};

export default function App() {
  const view = useChatStore((s) => s.view);
  const enterChat = useChatStore((s) => s.enterChat);
  const [hash, setHash] = useState(window.location.hash);

  // #ui → 演示页；hash 变化跟随
  useEffect(() => {
    const onHash = () => setHash(window.location.hash);
    window.addEventListener('hashchange', onHash);
    return () => window.removeEventListener('hashchange', onHash);
  }, []);

  // 记住会话：有合法邀请码记录直接进聊天
  useEffect(() => {
    const saved = localStorage.getItem('duduchat-session');
    if (saved && INVITE_CODES[saved]) enterChat();
  }, [enterChat]);

  return (
    <>
      <div className="duduchat-bg" aria-hidden="true" />
      <FloatingParticles />
      <HapticDebugToast />
      {hash === '#ui' ? (
        <motion.div key="ui" {...pageMotion}>
          <UiKit />
        </motion.div>
      ) : (
        <AnimatePresence mode="wait">
          {view === 'login' ? (
            <motion.div key="login" {...pageMotion}>
              <Login />
            </motion.div>
          ) : (
            <motion.div key="chat" {...pageMotion}>
              <Chat />
            </motion.div>
          )}
        </AnimatePresence>
      )}
    </>
  );
}
