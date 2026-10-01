import FloatingParticles from './components/effects/FloatingParticles';
import HapticDebugToast from './components/common/HapticDebugToast';
import UiKit from './pages/UiKit';

/**
 * P1A：App 入口 = 背景氛围层 + /ui 演示页。
 * 页面切换 / 路由在 P1B 引入（zustand 视图状态 + AnimatePresence 转场）。
 */
export default function App() {
  return (
    <>
      <div className="duduchat-bg" aria-hidden="true" />
      <FloatingParticles />
      <HapticDebugToast />
      <UiKit />
    </>
  );
}
