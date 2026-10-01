import type { ReactNode } from 'react';

interface GlassCardProps {
  children: ReactNode;
  className?: string;
}

/** 3.3 GlassCard：rgba(255,255,255,0.22) / blur 28px / 圆角 24px / 边框 rgba(255,255,255,0.35) */
export default function GlassCard({ children, className = '' }: GlassCardProps) {
  return <div className={`glass-card ${className}`}>{children}</div>;
}
