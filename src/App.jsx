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
  { id: 'b1', tag: '무료', title: '한강 공원 주말 야외 영화제', time: '토요일 오후 7시', place: '반포한강공원', description: '탁 트인 한강공원에서 영화를 볼 수 있는 행사야. 밤에는 쌀쌀할 수 있으니 겉옷이나 돗자리를 챙겨오면 좋아!' },
  { id: 'b2', tag: '선착순', title: '마포구 봄 사진 전시 투어',  time: '매주 일요일 오전 10시', place: '홍대 문화공간', description: '따뜻한 봄을 주제로 한 사진 전시를 해설사님과 함께 관람하는 투어야. 가볍게 산책하듯 즐기기 좋아.' },
];

export default function App() {
  const [showAIChat, setShowAIChat] = useState(false);
  const [initialConsultActivity, setInitialConsultActivity] = useState(null);
  const [showReminder, setShowReminder] = useState(false);

  if (showAIChat) return <AIChatScreen onBack={() => { setShowAIChat(false); setInitialConsultActivity(null); }} initialActivity={initialConsultActivity} />;

  return (
    <div style={{
      minHeight: '100dvh',
      background: '#f4f6fa',
      fontFamily: "'Noto Sans KR', system-ui, sans-serif",
      maxWidth: 480,
      margin: '0 auto',
      paddingBottom: 20,
    }}>

      {/* Header Background & Search */}
      <div style={{
        background: '#1a6ef7',
        padding: '24px 20px 48px',
        position: 'relative',
        color: '#fff',
        borderBottomLeftRadius: 16,
        borderBottomRightRadius: 16,
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: 20,
        }}>
          <div>
            <div style={{ fontSize: 22, fontWeight: 700, letterSpacing: '-0.3px' }}>
              서울잇다
            </div>
            <div style={{ fontSize: 13, color: '#e8f0fe', marginTop: 2 }}>서울 공공활동 연결 플랫폼</div>
          </div>
          <div 
            onClick={() => setShowReminder(!showReminder)}
            style={{
            width: 36, height: 36,
            borderRadius: '50%',
            background: 'rgba(255,255,255,0.2)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 18, cursor: 'pointer', position: 'relative',
          }}>
            🔔
            <div style={{
              position: 'absolute', top: -2, right: -2,
              background: '#E07070', color: '#fff', fontSize: 10, fontWeight: 700,
              width: 16, height: 16, borderRadius: '50%',
              display: 'flex', alignItems: 'center', justifyContent: 'center', border: '2px solid #1a6ef7'
            }}>1</div>

            {showReminder && (
              <div style={{
                position: 'absolute', top: 46, right: 0,
                background: '#fff', color: '#333', fontSize: 13,
                padding: '12px 16px', borderRadius: 12, width: 240,
                boxShadow: '0 4px 12px rgba(0,0,0,0.15)', zIndex: 10,
                textAlign: 'left', lineHeight: '1.4', fontFamily: "'Noto Sans KR', sans-serif"
              }}>
                <div style={{ fontWeight: 700, marginBottom: 4, color: '#1a6ef7' }}>💡 리마인드</div>
                어제 찾아보던 "한강 산책" 활동 예약할 시간이에요!
                <div style={{
                  position: 'absolute', top: -4, right: 12,
                  width: 12, height: 12, background: '#fff',
                  transform: 'rotate(45deg)'
                }} />
              </div>
            )}
          </div>
        </div>
        
        {/* Floating Search Bar */}
        <div style={{
          position: 'absolute',
          bottom: -24,
          left: 20,
          right: 20,
          background: '#fff',
          borderRadius: 24,
          padding: '14px 20px',
          display: 'flex',
          alignItems: 'center',
          boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
          gap: 10,
        }}>
          <span style={{ fontSize: 18 }}>🔍</span>
          <input 
            placeholder="활동, 장소 검색" 
            style={{ 
              flex: 1, 
              border: 'none', 
              outline: 'none', 
              fontSize: 15,
              color: '#333',
              background: 'transparent'
            }} 
          />
        </div>
      </div>

      {/* Spacing for floating search bar */}
      <div style={{ height: 40 }} />

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

      {/* Recommendation Banner */}
      <div style={{ padding: '0 20px 20px' }}>
        <div style={{ fontSize: 16, fontWeight: 700, color: '#1a1a2e', marginBottom: 14 }}>
          추천 카드
        </div>
        {BANNER_ACTIVITIES.map((a, i) => (
          <div key={i} style={{
            background: '#fff',
            borderRadius: 14,
            border: '0.5px solid #e8eaf0',
            padding: '16px',
            marginBottom: 12,
            cursor: 'pointer',
            boxShadow: '0 2px 8px rgba(0,0,0,0.04)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
              <span style={{
                fontSize: 10, fontWeight: 700,
                color: '#1a6ef7', background: '#e8f0fe',
                borderRadius: 6, padding: '3px 8px',
              }}>
                {a.tag}
              </span>
            </div>
            <div style={{ fontSize: 15, fontWeight: 700, color: '#1a1a2e', marginBottom: 6 }}>
              {a.title}
            </div>
            <div style={{ fontSize: 12, color: '#666', marginBottom: 2 }}>🕐 {a.time}</div>
            <div style={{ fontSize: 12, color: '#666', marginBottom: 12 }}>📍 {a.place}</div>
            
            <button 
              onClick={() => {
                setInitialConsultActivity({
                  id: a.id,
                  title: a.title,
                  datetime: a.time,
                  location: a.place,
                  distance: '가까움',
                  isFree: a.tag === '무료',
                  category: '문화',
                  tags: ['#' + a.tag],
                  description: a.description
                });
                setShowAIChat(true);
              }}
              style={{
              width: '100%',
              padding: '10px 0',
              borderRadius: 8,
              background: '#1a6ef7',
              color: '#fff',
              border: 'none',
              fontSize: 14,
              fontWeight: 600,
              cursor: 'pointer'
            }}>
              AI 상세 상담
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}