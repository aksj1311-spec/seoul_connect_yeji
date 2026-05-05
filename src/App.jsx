import { useState } from 'react';
import AIFloatButton from './AIFloatButton';
import AIChatScreen from './AIChatScreen';

const QUICK_MENUS = [
  { icon: '🗺️', label: '지도' },
  { icon: '📅', label: '시간표' },
  { icon: '👥', label: '커뮤니티' },
  { icon: '⭐', label: '즐겨찾기' },
];

const BANNER_ACTIVITIES = [
  { tag: '무료', title: '한강 공원 주말 야외 영화제', time: '토요일 오후 7시', place: '반포한강공원' },
  { tag: '선착순', title: '마포구 봄 사진 전시 투어',  time: '매주 일요일 오전 10시', place: '홍대 문화공간' },
];

export default function App() {
  const [showAIChat, setShowAIChat] = useState(false);

  if (showAIChat) return <AIChatScreen onBack={() => setShowAIChat(false)} />;

  return (
    <div style={{
      minHeight: '100dvh',
      background: '#f4f6fa',
      fontFamily: "'Noto Sans KR', system-ui, sans-serif",
      maxWidth: 480,
      margin: '0 auto',
    }}>

      {/* Header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '16px 20px 12px',
        background: '#fff',
        borderBottom: '0.5px solid #e8eaf0',
      }}>
        <div>
          <div style={{ fontSize: 20, fontWeight: 700, color: '#1a6ef7', letterSpacing: '-0.3px' }}>
            서울잇다
          </div>
          <div style={{ fontSize: 12, color: '#666', marginTop: 1 }}>서울 공공활동 연결 플랫폼</div>
        </div>
        <div style={{
          width: 36, height: 36,
          borderRadius: '50%',
          background: '#e8f0fe',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 18, cursor: 'pointer',
        }}>
          🔔
        </div>
      </div>

      {/* Welcome */}
      <div style={{ padding: '20px 20px 0' }}>
        <div style={{ fontSize: 18, fontWeight: 700, color: '#1a1a2e' }}>
          안녕하세요 👋
        </div>
        <div style={{ fontSize: 14, color: '#666', marginTop: 4 }}>
          오늘도 서울에서 새로운 활동을 찾아보세요
        </div>
      </div>

      {/* Quick Menu Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(4, 1fr)',
        gap: 12,
        padding: '16px 20px',
      }}>
        {QUICK_MENUS.map(m => (
          <div key={m.label} style={{
            background: '#fff',
            borderRadius: 14,
            border: '0.5px solid #e8eaf0',
            padding: '14px 0',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 6,
            cursor: 'pointer',
          }}>
            <span style={{ fontSize: 22 }}>{m.icon}</span>
            <span style={{ fontSize: 12, color: '#444', fontWeight: 500 }}>{m.label}</span>
          </div>
        ))}
      </div>

      {/* AI Float Button */}
      <div style={{ padding: '0 20px 16px' }}>
        <AIFloatButton onClick={() => setShowAIChat(true)} />
      </div>

      {/* Activity Banner */}
      <div style={{ padding: '0 20px 20px' }}>
        <div style={{ fontSize: 15, fontWeight: 700, color: '#1a1a2e', marginBottom: 12 }}>
          이번 주 인기 활동
        </div>
        {BANNER_ACTIVITIES.map((a, i) => (
          <div key={i} style={{
            background: '#fff',
            borderRadius: 14,
            border: '0.5px solid #e8eaf0',
            padding: '14px 16px',
            marginBottom: 10,
            cursor: 'pointer',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
              <span style={{
                fontSize: 10, fontWeight: 700,
                color: '#1a6ef7', background: '#e8f0fe',
                borderRadius: 6, padding: '2px 7px',
              }}>
                {a.tag}
              </span>
            </div>
            <div style={{ fontSize: 14, fontWeight: 700, color: '#1a1a2e', marginBottom: 4 }}>
              {a.title}
            </div>
            <div style={{ fontSize: 12, color: '#666' }}>🕐 {a.time}</div>
            <div style={{ fontSize: 12, color: '#666', marginTop: 2 }}>📍 {a.place}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
