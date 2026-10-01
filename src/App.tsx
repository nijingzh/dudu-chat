import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import FloatingParticles from './components/effects/FloatingParticles';
import SweetEffects from './components/effects/SweetEffects';
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
import { useUiStore, type Tab } from './store/uiStore';
import { applySettingsToCSS, useSettingsStore } from './store/settingsStore';
import { useHaptics } from './hooks/useHaptics';

/** tab 顺序（决定转场方向） */
const TAB_ORDER: Tab[] = ['chat', 'sweet', 'surprises', 'me'];

/** 页面过渡：按 tab 方向滑入（编排级转场细节归 P1D 收尾） */
function pageMotion(dir: number) {
  return {
    initial: { opacity: 0, x: dir * 26, y: 6 },
    animate: { opacity: 1, x: 0, y: 0 },
    exit: { opacity: 0, x: dir * -18, y: -4 },
    transition: { duration: 0.32, ease: [0.22, 0.8, 0.3, 1] as const },
  };
}

export default function App() {
  const view = useChatStore((s) => s.view);
  const detail = useChatStore((s) => s.detailMessage);
  const tab = useUiStore((s) => s.tab);
  const sub = useUiStore((s) => s.sub);
  const setTab = useUiStore((s) => s.setTab);
  const closeSub = useUiStore((s) => s.closeSub);
  const settings = useSettingsStore();
  const { fire } = useHaptics();
  const [hash, setHash] = useState(window.location.hash);
  const dirRef = useRef(1);
  const swipeStart = useRef<{ x: number; y: number } | null>(null);
  const prevTabRef = useRef<Tab>('chat');

  // 滑动切 tab：横向 60px 且明显偏水平才触发（P1D 手势）
  const onSwipeStart = (e: React.PointerEvent) => {
    if (sub || detail) return;
    if ((e.target as HTMLElement).closest('input, textarea')) return;
    swipeStart.current = { x: e.clientX, y: e.clientY };
  };
  const onSwipeEnd = (e: React.PointerEvent) => {
    const s = swipeStart.current;
    swipeStart.current = null;
    if (!s || sub || detail) return;
    const dx = e.clientX - s.x;
    const dy = e.clientY - s.y;
    if (Math.abs(dx) < 60 || Math.abs(dx) < Math.abs(dy) * 2) return;
    const idx = TAB_ORDER.indexOf(tab);
    const next = idx + (dx < 0 ? 1 : -1);
    if (next < 0 || next >= TAB_ORDER.length) return;
    void fire('swipe');
    setTab(TAB_ORDER[next]);
  };

  // 转场方向：右→左为前进，左→右为返回
  if (prevTabRef.current !== tab) {
    const prevIdx = TAB_ORDER.indexOf(prevTabRef.current);
    const nextIdx = TAB_ORDER.indexOf(tab);
    dirRef.current = nextIdx >= prevIdx ? 1 : -1;
    prevTabRef.current = tab;
  }

  useEffect(() => {
    const onHash = () => setHash(window.location.hash);
    window.addEventListener('hashchange', onHash);
    return () => window.removeEventListener('hashchange', onHash);
  }, []);

  // 记住会话：有 token 直接恢复（服务端校验）
  useEffect(() => {
    void useChatStore.getState().restoreSession();
  }, []);

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
      <SweetEffects />
      <HapticDebugToast />
      {hash === '#ui' ? (
        <motion.div key="ui" {...pageMotion(1)}>
          <UiKit />
        </motion.div>
      ) : view === 'login' ? (
        <motion.div key="login" {...pageMotion(1)}>
          <Login />
        </motion.div>
      ) : (
        <>
          <div
            className="app-shell"
            onPointerDown={onSwipeStart}
            onPointerUp={onSwipeEnd}
          >
            <AnimatePresence mode="wait">
              <motion.div
                key={`${tab}-${sub}`}
                className="app-body"
                {...pageMotion(sub ? 1 : dirRef.current)}
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
