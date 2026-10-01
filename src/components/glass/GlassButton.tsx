import type { ReactNode } from 'react';
import { useHaptics } from '../../hooks/useHaptics';

interface GlassButtonProps {
  children: ReactNode;
  onClick?: () => void;
  variant?: 'glass' | 'primary';
  className?: string;
}

/** 3.3 GlassButton：圆角 20px / 渐变叠加 / 按压 scale(0.96)；按下回 3.4「发送消息 Impact Light」 */
export default function GlassButton({
  children,
  onClick,
  variant = 'glass',
  className = '',
}: GlassButtonProps) {
  const { fire } = useHaptics();
  return (
    <button
      type="button"
      className={`glass-button ${variant === 'primary' ? 'glass-button--primary' : ''} ${className}`}
      onClick={() => {
        void fire('send');
        onClick?.();
      }}
    >
      {children}
    </button>
  );
}
