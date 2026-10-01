import { useMemo } from 'react';
import { useSettingsStore } from '../../store/settingsStore';

const EMOJIS = ['💗', '🌟', '🌸', '✨'];

interface ParticleSpec {
  id: number;
  emoji: string;
  left: number; // %
  size: number; // px
  drift: number; // s（外层上浮一轮）
  sway: number; // s（内层摇摆一轮）
  delay: number; // s
}

/** 随机但稳定（种子化），避免每次渲染重排 */
function buildParticles(count: number): ParticleSpec[] {
  const list: ParticleSpec[] = [];
  let seed = 20261001;
  const rand = () => {
    seed = (seed * 1103515245 + 12345) % 2147483648;
    return seed / 2147483648;
  };
  for (let i = 0; i < count; i++) {
    list.push({
      id: i,
      emoji: EMOJIS[i % EMOJIS.length],
      left: 4 + rand() * 92,
      size: 12 + rand() * 16,
      drift: 18 + rand() * 22,
      sway: 3.2 + rand() * 3.2,
      delay: rand() * 24,
    });
  }
  return list;
}

/**
 * 4.2 甜蜜特效：背景飘浮粒子（💗🌟🌸✨）。
 * 双层结构（外层 particle 漂移 / 内层 particle-sway 摇摆），两层动画互不覆盖。
 * 只动 transform / opacity。设置页「粒子」开关控制显隐。
 */
export default function FloatingParticles({ count = 16 }: { count?: number }) {
  const enabled = useSettingsStore((s) => s.appearance.particles);
  const particles = useMemo(() => buildParticles(count), [count]);
  if (!enabled) return null;
  return (
    <div className="particles-layer" aria-hidden="true">
      {particles.map((p) => (
        <span
          key={p.id}
          className="particle"
          style={{
            left: `${p.left}%`,
            fontSize: `${p.size}px`,
            animationDuration: `${p.drift}s`,
            animationDelay: `-${p.delay}s`,
          }}
        >
          <span
            className="particle-sway"
            style={{ animationDuration: `${p.sway}s` }}
          >
            {p.emoji}
          </span>
        </span>
      ))}
    </div>
  );
}
