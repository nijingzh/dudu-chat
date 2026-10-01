import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { HAPTIC_DEBUG_EVENT } from '../../hooks/useHaptics';

interface DebugInfo {
  label: string;
  type: string;
  intensity: string;
}

/**
 * 触觉 debug 提示：浏览器震不了，用一枚玻璃小胶囊显示「此处会震 + 强度」。
 * 浮现—停留—淡出（只 opacity/transform），真机阶段验证后可整体移除。
 * 居中位移放 framer 的 x（CSS transform 会被动画帧覆盖）。
 */
export default function HapticDebugToast() {
  const [info, setInfo] = useState<DebugInfo | null>(null);

  useEffect(() => {
    let timer: number | undefined;
    const onHaptic = (e: Event) => {
      const detail = (e as CustomEvent<DebugInfo>).detail;
      setInfo(detail);
      window.clearTimeout(timer);
      timer = window.setTimeout(() => setInfo(null), 1400);
    };
    window.addEventListener(HAPTIC_DEBUG_EVENT, onHaptic);
    return () => {
      window.removeEventListener(HAPTIC_DEBUG_EVENT, onHaptic);
      window.clearTimeout(timer);
    };
  }, []);

  return (
    <AnimatePresence>
      {info && (
        <motion.div
          className="haptic-debug"
          style={{ x: '-50%' }}
          initial={{ opacity: 0, y: -10, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -8, scale: 0.97 }}
          transition={{ duration: 0.32, ease: [0.22, 0.8, 0.3, 1] }}
        >
          🩷 {info.label} · {info.type} {info.intensity}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
