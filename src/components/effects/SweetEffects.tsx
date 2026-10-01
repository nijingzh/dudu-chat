import { useEffect, useMemo } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  EFFECT_DURATION,
  useEffectStore,
  type EffectKind,
} from '../../store/effectStore';

/**
 * 4.2 全屏甜蜜特效：
 * spoil 撒娇 = 粉脉冲环 + 飘心上浮｜missYou 想你 = 全屏飘落爱心
 * celebrate 庆祝 = 烟花绽放 + confetti｜sad 不开心 = 灰调 + 雨滴
 * 只动 transform / opacity；每次播放换随机布局（seq 作 key）。
 */
export default function SweetEffects() {
  const current = useEffectStore((s) => s.current);
  const seq = useEffectStore((s) => s.seq);
  const clear = useEffectStore((s) => s.clear);

  useEffect(() => {
    if (!current) return;
    const t = window.setTimeout(clear, EFFECT_DURATION[current]);
    return () => window.clearTimeout(t);
  }, [current, seq, clear]);

  return (
    <AnimatePresence>
      {current && (
        <motion.div
          key={seq}
          className="fx-layer"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.4 }}
        >
          <EffectBody kind={current} />
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function rand(seed: number) {
  let s = seed;
  return () => {
    s = (s * 1103515245 + 12345) % 2147483648;
    return s / 2147483648;
  };
}

function EffectBody({ kind }: { kind: EffectKind }) {
  const layout = useMemo(() => buildLayout(kind), [kind]);

  if (kind === 'spoil') {
    return (
      <>
        {[0, 1].map((i) => (
          <span
            key={`ring${i}`}
            className="fx-ring"
            style={{ animationDelay: `${i * 380}ms` }}
          />
        ))}
        {layout.hearts.map((h, i) => (
          <span
            key={i}
            className="fx-heart-up"
            style={{
              left: `${h.left}%`,
              fontSize: `${h.size}px`,
              animationDuration: `${h.dur}ms`,
              animationDelay: `${h.delay}ms`,
            }}
          >
            💗
          </span>
        ))}
      </>
    );
  }

  if (kind === 'missYou') {
    return (
      <>
        {layout.hearts.map((h, i) => (
          <span
            key={i}
            className="fx-heart-fall"
            style={{
              left: `${h.left}%`,
              fontSize: `${h.size}px`,
              animationDuration: `${h.dur}ms`,
              animationDelay: `${h.delay}ms`,
            }}
          >
            {['💗', '🌸', '✨'][i % 3]}
          </span>
        ))}
      </>
    );
  }

  if (kind === 'celebrate') {
    return (
      <>
        {layout.bursts.map((b, bi) => (
          <span key={`b${bi}`} className="fx-burst" style={{ left: `${b.x}%`, top: `${b.y}%` }}>
            {b.particles.map((p, pi) => (
              <i
                key={pi}
                className="fx-spark"
                style={
                  {
                    background: p.color,
                    '--tx': `${p.tx}px`,
                    '--ty': `${p.ty}px`,
                    animationDelay: `${b.delay}ms`,
                  } as React.CSSProperties
                }
              />
            ))}
          </span>
        ))}
        {layout.confetti.map((c, i) => (
          <i
            key={i}
            className="fx-confetti"
            style={{
              left: `${c.left}%`,
              width: c.w,
              height: c.h,
              background: c.color,
              animationDuration: `${c.dur}ms`,
              animationDelay: `${c.delay}ms`,
            }}
          />
        ))}
      </>
    );
  }

  // sad
  return (
    <>
      <span className="fx-gray" />
      {layout.rain.map((r, i) => (
        <i
          key={i}
          className="fx-drop"
          style={{
            left: `${r.left}%`,
            animationDuration: `${r.dur}ms`,
            animationDelay: `${r.delay}ms`,
          }}
        />
      ))}
    </>
  );
}

interface Layout {
  hearts: { left: number; size: number; dur: number; delay: number }[];
  bursts: {
    x: number;
    y: number;
    delay: number;
    particles: { tx: number; ty: number; color: string }[];
  }[];
  confetti: { left: number; w: number; h: number; color: string; dur: number; delay: number }[];
  rain: { left: number; dur: number; delay: number }[];
}

const PALETTE = ['#FF8FAB', '#FFD700', '#C8A2FF', '#FFF5F7', '#FFB3D9'];

function buildLayout(kind: EffectKind): Layout {
  const r = rand(20260819 + kind.length * 77);
  const hearts = Array.from({ length: kind === 'missYou' ? 15 : 9 }).map(() => ({
    left: 4 + r() * 92,
    size: 14 + r() * 15,
    dur: (kind === 'missYou' ? 2200 : 1500) + r() * 1300,
    delay: r() * 700,
  }));
  const bursts =
    kind === 'celebrate'
      ? [0, 1, 2].map((i) => ({
          x: 22 + i * 28 + r() * 8,
          y: 24 + r() * 18,
          delay: i * 320,
          particles: Array.from({ length: 13 }).map((_, j) => {
            const ang = (Math.PI * 2 * j) / 13 + r() * 0.3;
            const dist = 52 + r() * 58;
            return {
              tx: Math.cos(ang) * dist,
              ty: Math.sin(ang) * dist,
              color: PALETTE[j % PALETTE.length],
            };
          }),
        }))
      : [];
  const confetti =
    kind === 'celebrate'
      ? Array.from({ length: 18 }).map(() => ({
          left: 6 + r() * 88,
          w: 5 + r() * 4,
          h: 9 + r() * 7,
          color: PALETTE[Math.floor(r() * PALETTE.length)],
          dur: 1400 + r() * 900,
          delay: r() * 600,
        }))
      : [];
  const rain =
    kind === 'sad'
      ? Array.from({ length: 16 }).map(() => ({
          left: 4 + r() * 92,
          dur: 1000 + r() * 700,
          delay: r() * 800,
        }))
      : [];
  return { hearts, bursts, confetti, rain };
}
