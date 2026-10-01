interface GlassInputProps {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  onEnter?: () => void;
  className?: string;
}

/** 玻璃输入框：白玻璃 0.28 / 边框 rgba(255,255,255,0.45) / 圆角 20px，聚焦薰衣草紫光环 */
export default function GlassInput({
  value,
  onChange,
  placeholder,
  onEnter,
  className = '',
}: GlassInputProps) {
  return (
    <div className={`glass-input flex items-center px-4 py-2.5 ${className}`}>
      <input
        className="w-full bg-transparent text-sm outline-none placeholder:text-[#8a6f83]/60"
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter') onEnter?.();
        }}
      />
    </div>
  );
}
