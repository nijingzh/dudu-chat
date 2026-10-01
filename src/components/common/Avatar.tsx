interface AvatarProps {
  emoji: string;
  size?: number; // px
  ring?: boolean;
}

/** 圆形玻璃头像（emoji 占位，真实头像等「我的页」上传） */
export default function Avatar({ emoji, size = 44, ring = true }: AvatarProps) {
  return (
    <div
      className="avatar"
      style={{
        width: size,
        height: size,
        fontSize: size * 0.55,
        boxShadow: ring
          ? '0 0 0 2px rgba(255,255,255,0.65), 0 8px 24px rgba(255,182,193,0.35)'
          : undefined,
      }}
    >
      {emoji}
    </div>
  );
}
