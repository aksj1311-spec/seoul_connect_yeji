import { useState, useEffect } from 'react';

const KEYFRAMES = `
@import url('https://fonts.googleapis.com/css2?family=Noto+Sans+KR:wght@400;500;700&display=swap');
@keyframes ai-pulse-ring {
  0%   { transform: scale(1); opacity: 0.8; }
  100% { transform: scale(2.6); opacity: 0; }
}
`;

let _stylesInjected = false;
function injectStyles() {
  if (_stylesInjected || typeof document === 'undefined') return;
  _stylesInjected = true;
  const el = document.createElement('style');
  el.textContent = KEYFRAMES;
  document.head.appendChild(el);
}

// Props: onClick, hasBadge (optional)
export default function AIFloatButton({ onClick, hasBadge = false }) {
  const [pulsing, setPulsing] = useState(true);
  const [hovered, setHovered] = useState(false);
  const [pressed, setPressed] = useState(false);

  useEffect(() => {
    injectStyles();
    const t = setTimeout(() => setPulsing(false), 5000);
    return () => clearTimeout(t);
  }, []);

  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => { setHovered(false); setPressed(false); }}
      onMouseDown={() => setPressed(true)}
      onMouseUp={() => setPressed(false)}
      onTouchStart={() => setPressed(true)}
      onTouchEnd={() => setPressed(false)}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        width: '100%',
        padding: '14px 16px',
        background: 'linear-gradient(135deg, #0052cc 0%, #1a6ef7 60%, #4facfe 100%)',
        border: 'none',
        borderRadius: 20,
        cursor: 'pointer',
        position: 'relative',
        opacity: hovered ? 0.92 : 1,
        transform: pressed ? 'scale(0.98)' : 'scale(1)',
        transition: 'opacity 0.15s, transform 0.1s',
        fontFamily: "'Noto Sans KR', sans-serif",
        boxShadow: '0 4px 16px rgba(26,110,247,0.30)',
        boxSizing: 'border-box',
      }}
    >
      {/* AI Avatar */}
      <div style={{
        width: 42,
        height: 42,
        borderRadius: '50%',
        background: 'rgba(255,255,255,0.18)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
        position: 'relative',
      }}>
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
          <circle cx="12" cy="12" r="10" stroke="white" strokeWidth="1.5" />
          <circle cx="9" cy="10.5" r="1.3" fill="white" />
          <circle cx="15" cy="10.5" r="1.3" fill="white" />
          <path d="M8.5 14.5 Q12 17.5 15.5 14.5" stroke="white" strokeWidth="1.5" strokeLinecap="round" fill="none" />
        </svg>

        {hasBadge && (
          <div style={{
            position: 'absolute',
            top: -1,
            right: -1,
            width: 11,
            height: 11,
            borderRadius: '50%',
            background: '#ef4444',
            border: '1.5px solid white',
          }} />
        )}
      </div>

      {/* Text */}
      <div style={{ flex: 1, textAlign: 'left' }}>
        <div style={{ fontSize: 14, fontWeight: 700, color: '#fff', lineHeight: '1.35' }}>
          AI 활동 추천받기
        </div>
        <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.8)', marginTop: 2, lineHeight: '1.35' }}>
          내 일정에 딱 맞는 서울 공공활동 찾기
        </div>
      </div>

      {/* Arrow */}
      <span style={{ fontSize: 22, color: 'rgba(255,255,255,0.75)', flexShrink: 0, lineHeight: 1 }}>
        ›
      </span>

      {/* Pulse Dot (absolute, top-right) */}
      <div style={{ position: 'absolute', top: 10, right: 14, width: 10, height: 10 }}>
        {pulsing && (
          <div style={{
            position: 'absolute',
            inset: 0,
            borderRadius: '50%',
            background: '#22c55e',
            animation: 'ai-pulse-ring 1.3s ease-out infinite',
          }} />
        )}
        <div style={{
          position: 'absolute',
          inset: 0,
          borderRadius: '50%',
          background: '#22c55e',
        }} />
      </div>
    </button>
  );
}
