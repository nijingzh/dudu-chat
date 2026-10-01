import type { ReactNode } from 'react';

interface GlassNavProps {
  /** 左侧主信息（如对方昵称） */
  title?: ReactNode;
  /** 副信息（如在线状态 · 在一起天数） */
  subtitle?: ReactNode;
  /** 右侧插槽 */
  right?: ReactNode;
  children?: ReactNode;
  className?: string;
}

/** 3.3 GlassNav：blur 32px / 顶部渐变高光 / 圆角 28px */
export default function GlassNav({
  title,
  subtitle,
  right,
  children,
  className = '',
}: GlassNavProps) {
  return (
    <nav className={`glass-nav ${className}`}>
      <div className="flex items-center gap-3 px-4 py-3">
        {title !== undefined || subtitle !== undefined ? (
          <div className="min-w-0 flex-1">
            {title !== undefined && (
              <div className="uikit-title truncate text-[15px]">{title}</div>
            )}
            {subtitle !== undefined && (
              <div className="mt-0.5 text-xs opacity-80">{subtitle}</div>
            )}
          </div>
        ) : null}
        {children}
        {right !== undefined && <div className="shrink-0">{right}</div>}
      </div>
    </nav>
  );
}
