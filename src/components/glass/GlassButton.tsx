import type { ReactNode } from 'react';
import { useHaptics, type HapticKind } from '../../hooks/useHaptics';

interface GlassButtonProps {
  children: ReactNode;
  onClick?: () => void;
  variant?: 'glass' | 'primary';
  /** 触觉档位：默认通用按钮档「按钮轻触 Selection 轻」；发送键传 'send'（裁决 2026-10-01） */
  haptic?: HapticKind;
  className?: string;
}

/** 3.3 GlassButton：圆角 20px / 渐变叠加 / 按压 scale(0.96) */
export default function GlassButton({
  children,
  onClick,
  variant = 'glass',
  haptic = 'tap',
  className = '',
}: GlassButtonProps) {
  const { fire } = useHaptics();
  return (
    <button
      type="button"
      className={`glass-button ${variant === 'primary' ? 'glass-button--primary' : ''} ${className}`}
      onClick={() => {
        void fire(haptic);
        onClick?.();
      }}
    >
      {children}
    </button>
  );
}
