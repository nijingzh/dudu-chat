/** 正在输入… 动画：三点呼吸（只 opacity/transform，缓入缓出不跳字） */
export default function TypingIndicator() {
  return (
    <div className="msg-row msg-row--other">
      <div className="bubble bubble-other typing-bubble" aria-label="正在输入">
        <span className="typing-dot" style={{ animationDelay: '0ms' }} />
        <span className="typing-dot" style={{ animationDelay: '180ms' }} />
        <span className="typing-dot" style={{ animationDelay: '360ms' }} />
      </div>
    </div>
  );
}
