import { useState } from 'react';
import GlassCard from '../components/glass/GlassCard';
import GlassButton from '../components/glass/GlassButton';
import GlassNav from '../components/glass/GlassNav';
import GlassInput from '../components/glass/GlassInput';
import { HAPTIC_SPECS, useHaptics, type HapticKind } from '../hooks/useHaptics';

const GRADIENTS = [
  { name: '主渐变', from: '#FFB6C1', to: '#E8A0BF' },
  { name: '柔和渐变', from: '#F7CEC5', to: '#F8E8EE' },
  { name: '梦幻渐变', from: '#D4A5FF', to: '#FFB3D9' },
];

const AUX_COLORS = [
  { name: '金色', hex: '#FFD700', use: '装饰' },
  { name: '樱花白', hex: '#FFF5F7', use: '背景' },
  { name: '薰衣草紫', hex: '#C8A2FF', use: '强调' },
  { name: '薄荷绿', hex: '#A8E6CF', use: '在线状态' },
  { name: '珊瑚红', hex: '#FF6B6B', use: '未读/心跳' },
];

const HAPTIC_ORDER: HapticKind[] = [
  'send',
  'receive',
  'love',
  'longPress',
  'swipe',
  'special',
  'sweet',
  'page',
];

function SectionTitle({ children, hint }: { children: string; hint?: string }) {
  return (
    <div className="mb-3 mt-8 flex items-baseline gap-2">
      <h2 className="uikit-sec-title text-[15px]">{children}</h2>
      {hint && <span className="text-[11px] opacity-70">{hint}</span>}
    </div>
  );
}

/**
 * /ui 演示页：设计系统集中验收（P1A 交付物）。
 * 色彩 / 玻璃组件 / 气泡 / 触觉映射，全部按设计方案 3.1–3.4 实数。
 */
export default function UiKit() {
  const [text, setText] = useState('');
  const { fire } = useHaptics();

  return (
    <main className="uikit-page">
      <header className="pt-6">
        <h1 className="uikit-title text-[28px] leading-tight">
          duduchat <span className="text-[15px] font-normal opacity-75">· UI Kit</span>
        </h1>
        <p className="mt-1 text-[13px] opacity-75">
          Liquid Glass 甜蜜风设计系统 · 按设计方案 3.1–3.4 实数落地
        </p>
      </header>

      {/* ---------- 色彩 ---------- */}
      <SectionTitle hint="3.1 色彩">色彩</SectionTitle>
      <div className="space-y-2.5">
        {GRADIENTS.map((g) => (
          <div key={g.name} className="glass-card px-4 py-3">
            <div
              className="h-12 rounded-[14px]"
              style={{ background: `linear-gradient(135deg, ${g.from}, ${g.to})` }}
            />
            <div className="mt-2 flex items-center justify-between">
              <span className="text-[13px]">{g.name}</span>
              <span className="uikit-hex opacity-75">
                {g.from} → {g.to} · 135deg
              </span>
            </div>
          </div>
        ))}
        <GlassCard className="px-4 py-3">
          <div className="text-[13px]">辅助色</div>
          <div className="mt-2 space-y-1.5">
            {AUX_COLORS.map((c) => (
              <div key={c.hex} className="flex items-center gap-2.5">
                <span
                  className="h-5 w-5 shrink-0 rounded-full"
                  style={{
                    background: c.hex,
                    boxShadow: 'inset 0 0 0 1px rgba(255,255,255,0.5)',
                  }}
                />
                <span className="text-[12px]">{c.name}</span>
                <span className="uikit-hex ml-auto opacity-75">{c.hex}</span>
                <span className="w-16 text-right text-[11px] opacity-60">{c.use}</span>
              </div>
            ))}
          </div>
        </GlassCard>
      </div>

      {/* ---------- 玻璃组件 ---------- */}
      <SectionTitle hint="3.3 组件规范">玻璃组件</SectionTitle>
      <div className="space-y-3">
        <GlassCard className="px-5 py-4">
          <div className="uikit-title text-[15px]">GlassCard</div>
          <p className="mt-1.5 text-[12px] leading-relaxed opacity-80">
            bg rgba(255,255,255,0.22) · blur 28px · 圆角 24px
            <br />
            边框 1px rgba(255,255,255,0.35) · 粉色柔光
          </p>
        </GlassCard>

        <GlassNav
          title="嘟嘟"
          subtitle="在线 · 在一起 520 天"
          right={
            <span
              className="inline-block h-2.5 w-2.5 rounded-full"
              style={{ background: 'var(--color-mint)' }}
            />
          }
        />

        <div className="flex flex-wrap items-center gap-2.5">
          <GlassButton className="px-5 py-2.5 text-[13px] font-medium">GlassButton</GlassButton>
          <GlassButton variant="primary" className="px-5 py-2.5 text-[13px] font-medium">
            发送 💗
          </GlassButton>
        </div>
        <p className="text-[11px] opacity-70">
          圆角 20px · 渐变叠加 · 按压 scale(0.96)（点按会触发发送触觉）
        </p>

        <GlassInput
          value={text}
          onChange={setText}
          placeholder="GlassInput · 聚焦有薰衣草紫光环"
        />
      </div>

      {/* ---------- 消息气泡 ---------- */}
      <SectionTitle hint="3.1 消息气泡">消息气泡</SectionTitle>
      <div className="space-y-2.5">
        <div className="flex justify-end">
          <div className="bubble-self max-w-[75%] px-4 py-2.5 text-[13px]">
            今天也好想你呀 💗
          </div>
        </div>
        <div className="flex justify-start">
          <div className="bubble-other max-w-[75%] px-4 py-2.5 text-[13px]">
            我也是！下班给你带奶茶 🧋
          </div>
        </div>
        <p className="text-[11px] opacity-70">
          自己：#FF8FAB → #FF6B8A 渐变粉 ｜ 对方：rgba(255,255,255,0.55) + 彩色描边
        </p>
      </div>

      {/* ---------- 触觉反馈 ---------- */}
      <SectionTitle hint="3.4 · 点按测试">触觉反馈</SectionTitle>
      <GlassCard className="px-4 py-3">
        <div className="space-y-1">
          {HAPTIC_ORDER.map((kind) => {
            const spec = HAPTIC_SPECS[kind];
            return (
              <button
                key={kind}
                type="button"
                className="flex w-full items-center gap-2 rounded-[12px] px-2 py-2 text-left transition-colors hover:bg-white/25"
                onClick={() => void fire(kind)}
              >
                <span className="w-[72px] shrink-0 text-[12px]">{spec.label}</span>
                <span className="uikit-hex opacity-75">
                  {spec.type} {spec.intensity}
                </span>
                <span className="ml-auto text-[10px] opacity-55">点按测试</span>
              </button>
            );
          })}
        </div>
      </GlassCard>
      <p className="mt-2 text-[11px] leading-relaxed opacity-70">
        浏览器震不起来，点按后顶部胶囊显示「此处会震 + 强度」（debug
        视觉替身）；iOS 真机走 @capacitor/haptics 实震。
      </p>

      <SectionTitle hint="4.2">飘浮粒子</SectionTitle>
      <p className="text-[11px] leading-relaxed opacity-70">
        背景 💗🌟🌸✨ 共 16 颗常驻飘浮（本页背后即是实况），双层动画：外层上浮
        18–40s / 内层摇摆 3.2–6.4s，只动 transform / opacity。
      </p>
    </main>
  );
}
