import { useState, useEffect, useRef } from 'react';

// ──────────────────────────────────────────
// Dummy Data
// ──────────────────────────────────────────
const ACTIVITY_CARDS = {
  운동: [
    { id: 1, category: '운동', free: true,  distance: '1.2km', name: '마포구 공공 요가 클래스',  time: '매주 화·목 오전 10시',      place: '마포구민체육센터' },
    { id: 2, category: '운동', free: true,  distance: '0.8km', name: '한강 공원 단체 달리기',    time: '매주 토요일 오전 7시',       place: '여의도한강공원' },
    { id: 3, category: '운동', free: false, distance: '2.1km', name: '성인 수영 강습',            time: '평일 오후 7~8시',            place: '서대문 구립 수영장' },
  ],
  문화: [
    { id: 4, category: '문화', free: true,  distance: '3.2km', name: '서울역사박물관 특별전',    time: '화~일 오전 9시~오후 6시',    place: '서울역사박물관' },
    { id: 5, category: '문화', free: true,  distance: '1.5km', name: '마을 도서관 독서 모임',    time: '매주 수요일 오후 7시',       place: '망원동 마을 도서관' },
    { id: 6, category: '문화', free: false, distance: '4.0km', name: '국악 기초 강좌',            time: '매주 금요일 오후 2시',       place: '서울남산국악당' },
  ],
  취업: [
    { id: 7, category: '취업', free: true,  distance: '2.8km', name: '청년 취업 멘토링',         time: '이번 주 목요일 오후 2시',    place: '서울일자리센터 마포점' },
    { id: 8, category: '취업', free: true,  distance: '5.0km', name: 'IT 직업훈련 설명회',       time: '매월 첫째 주 월요일',        place: 'SBA 서울산업진흥원' },
  ],
  여가: [
    { id: 9,  category: '여가', free: true,  distance: '0.5km', name: '도시 텃밭 가꾸기',        time: '매주 토·일 오전 10시',       place: '용산가족공원 텃밭' },
    { id: 10, category: '여가', free: false, distance: '1.8km', name: '주말 플라워 클래스',       time: '매주 토요일 오후 1시',       place: '은평구 문화원' },
  ],
};

const QUICK_HINTS = [
  '이번 주 목요일 오후',
  '집 근처 무료 운동',
  '고령자 프로그램',
  '주말 문화 행사',
  '취업 지원 프로그램',
];

const CATEGORY_CHIPS = [
  { label: '🏃 운동', value: '운동' },
  { label: '📚 문화', value: '문화' },
  { label: '💼 취업', value: '취업' },
  { label: '🌿 여가', value: '여가' },
];

const INITIAL_MESSAGES = [
  {
    id: 1,
    sender: 'ai',
    type: 'text',
    content: '안녕하세요! 이번 주 비어있는 시간에 갈 수 있는 서울시 공공 활동을 찾아드릴게요 😊',
  },
  {
    id: 2,
    sender: 'ai',
    type: 'chips',
    content: '어떤 활동을 찾고 계세요?',
    chips: CATEGORY_CHIPS,
  },
];

const CATEGORY_COLORS = {
  운동: '#3b82f6',
  문화: '#8b5cf6',
  취업: '#f59e0b',
  여가: '#22c55e',
};

// ──────────────────────────────────────────
// Style injection (keyframes + font)
// ──────────────────────────────────────────
const CHAT_STYLES = `
@import url('https://fonts.googleapis.com/css2?family=Noto+Sans+KR:wght@400;500;700&display=swap');

@keyframes chat-fade-in {
  from { opacity: 0; transform: translateY(6px); }
  to   { opacity: 1; transform: translateY(0); }
}

@keyframes typing-bounce {
  0%, 80%, 100% { transform: translateY(0);    opacity: 0.4; }
  40%           { transform: translateY(-5px); opacity: 1;   }
}
`;

let _chatStylesInjected = false;
function injectChatStyles() {
  if (_chatStylesInjected || typeof document === 'undefined') return;
  _chatStylesInjected = true;
  const el = document.createElement('style');
  el.textContent = CHAT_STYLES;
  document.head.appendChild(el);
}

// ──────────────────────────────────────────
// AI Response Logic
// ──────────────────────────────────────────
function getAIResponses(text) {
  for (const [keyword, cards] of Object.entries(ACTIVITY_CARDS)) {
    if (text.includes(keyword)) {
      return [
        { type: 'text',  content: `"${keyword}" 관련 서울시 공공 활동을 찾았어요! 📍` },
        { type: 'cards', cards: cards.slice(0, 2) },
      ];
    }
  }

  const timeKeywords = ['월요일', '화요일', '수요일', '목요일', '금요일', '토요일', '일요일', '오늘', '내일', '이번 주', '주말'];
  if (timeKeywords.some(k => text.includes(k))) {
    return [
      { type: 'text',  content: '해당 시간대에 맞는 활동을 찾을게요! 어떤 종류의 활동을 원하시나요?' },
      { type: 'chips', content: '카테고리를 선택해주세요', chips: CATEGORY_CHIPS },
    ];
  }

  return [
    { type: 'text',  content: '원하시는 활동 카테고리를 선택해 주세요. 가까운 서울시 공공 활동을 찾아드릴게요!' },
    { type: 'chips', content: '카테고리를 선택해주세요', chips: CATEGORY_CHIPS },
  ];
}

// ──────────────────────────────────────────
// Sub-components
// ──────────────────────────────────────────
function AIAvatar({ size = 30 }) {
  const s = size;
  return (
    <div style={{
      width: s,
      height: s,
      borderRadius: '50%',
      background: 'linear-gradient(135deg, #0052cc, #4facfe)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      flexShrink: 0,
    }}>
      <svg width={s * 0.5} height={s * 0.5} viewBox="0 0 24 24" fill="none">
        <circle cx="12" cy="12" r="10" stroke="white" strokeWidth="1.5" />
        <circle cx="9" cy="10.5" r="1.3" fill="white" />
        <circle cx="15" cy="10.5" r="1.3" fill="white" />
        <path d="M8.5 14.5 Q12 17.5 15.5 14.5" stroke="white" strokeWidth="1.5" strokeLinecap="round" fill="none" />
      </svg>
    </div>
  );
}

function ActivityCard({ card, isHovered, onHover }) {
  const color = CATEGORY_COLORS[card.category] || '#1a6ef7';
  return (
    <div
      onMouseEnter={() => onHover(card.id)}
      onMouseLeave={() => onHover(null)}
      style={{
        background: '#fff',
        border: `0.5px solid ${isHovered ? '#1a6ef7' : '#e8eaf0'}`,
        borderRadius: 14,
        padding: '12px 14px',
        marginBottom: 8,
        cursor: 'pointer',
        transition: 'border-color 0.2s',
        fontFamily: "'Noto Sans KR', sans-serif",
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
        <span style={{
          fontSize: 10, fontWeight: 700, color,
          background: `${color}18`, borderRadius: 6, padding: '2px 7px',
        }}>
          {card.category}
        </span>
        {card.free && (
          <span style={{
            fontSize: 10, fontWeight: 700, color: '#22c55e',
            background: '#22c55e18', borderRadius: 6, padding: '2px 7px',
          }}>
            무료
          </span>
        )}
        <span style={{ fontSize: 11, color: '#aaa', marginLeft: 'auto' }}>{card.distance}</span>
      </div>
      <div style={{ fontSize: 14, fontWeight: 700, color: '#1a1a2e', marginBottom: 4 }}>
        {card.name}
      </div>
      <div style={{ fontSize: 12, color: '#666' }}>🕐 {card.time}</div>
      <div style={{ fontSize: 12, color: '#666', marginTop: 2 }}>📍 {card.place}</div>
    </div>
  );
}

// ──────────────────────────────────────────
// Main Component
// ──────────────────────────────────────────

// Props: onBack (optional)
export default function AIChatScreen({ onBack }) {
  const [messages, setMessages]       = useState(INITIAL_MESSAGES);
  const [inputText, setInputText]     = useState('');
  const [isTyping, setIsTyping]       = useState(false);
  const [hoveredCard, setHoveredCard] = useState(null);
  const [hoveredHint, setHoveredHint] = useState(null);
  const chatEndRef = useRef(null);
  const nextId     = useRef(INITIAL_MESSAGES.length + 1);

  useEffect(() => { injectChatStyles(); }, []);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  function sendMessage(text) {
    const trimmed = text.trim();
    if (!trimmed) return;

    setMessages(prev => [...prev, {
      id: nextId.current++,
      sender: 'user',
      type: 'text',
      content: trimmed,
    }]);
    setInputText('');
    setIsTyping(true);

    setTimeout(() => {
      setIsTyping(false);
      const responses = getAIResponses(trimmed);
      setMessages(prev => [
        ...prev,
        ...responses.map(r => ({ id: nextId.current++, sender: 'ai', ...r })),
      ]);
    }, 900);
  }

  function handleKeyDown(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage(inputText);
    }
  }

  // ── Message Renderers ──────────────────
  function renderTextBubble(msg) {
    const isAI = msg.sender === 'ai';
    return (
      <div key={msg.id} style={{
        display: 'flex',
        justifyContent: isAI ? 'flex-start' : 'flex-end',
        alignItems: 'flex-end',
        gap: 8,
        marginBottom: 8,
        animation: 'chat-fade-in 0.28s ease-out',
      }}>
        {isAI && <AIAvatar size={30} />}
        <div style={{
          maxWidth: '72%',
          padding: '10px 14px',
          borderRadius: 14,
          borderBottomLeftRadius:  isAI ? 4 : 14,
          borderBottomRightRadius: isAI ? 14 : 4,
          background: isAI ? '#fff' : '#1a6ef7',
          border: isAI ? '0.5px solid #e8eaf0' : 'none',
          color: isAI ? '#1a1a2e' : '#fff',
          fontSize: 14,
          lineHeight: '1.6',
          fontFamily: "'Noto Sans KR', sans-serif",
          wordBreak: 'keep-all',
        }}>
          {msg.content}
        </div>
      </div>
    );
  }

  function renderChips(msg) {
    return (
      <div key={msg.id} style={{ marginBottom: 12, animation: 'chat-fade-in 0.28s ease-out' }}>
        {/* AI text bubble */}
        <div style={{ display: 'flex', alignItems: 'flex-end', gap: 8, marginBottom: 8 }}>
          <AIAvatar size={30} />
          <div style={{
            maxWidth: '72%',
            padding: '10px 14px',
            borderRadius: 14,
            borderBottomLeftRadius: 4,
            background: '#fff',
            border: '0.5px solid #e8eaf0',
            color: '#1a1a2e',
            fontSize: 14,
            lineHeight: '1.6',
            fontFamily: "'Noto Sans KR', sans-serif",
          }}>
            {msg.content}
          </div>
        </div>
        {/* Chip buttons */}
        <div style={{ paddingLeft: 38, display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          {msg.chips.map(chip => (
            <ChipButton key={chip.value} label={chip.label} onClick={() => sendMessage(chip.value)} />
          ))}
        </div>
      </div>
    );
  }

  function renderCards(msg) {
    return (
      <div key={msg.id} style={{ paddingLeft: 38, marginBottom: 12, animation: 'chat-fade-in 0.28s ease-out' }}>
        {msg.cards.map(card => (
          <ActivityCard
            key={card.id}
            card={card}
            isHovered={hoveredCard === card.id}
            onHover={setHoveredCard}
          />
        ))}
      </div>
    );
  }

  function renderMessage(msg) {
    if (msg.type === 'text')  return renderTextBubble(msg);
    if (msg.type === 'chips') return renderChips(msg);
    if (msg.type === 'cards') return renderCards(msg);
    return null;
  }

  // ── Layout ────────────────────────────
  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      display: 'flex',
      flexDirection: 'column',
      background: '#f4f6fa',
      fontFamily: "'Noto Sans KR', sans-serif",
      zIndex: 100,
    }}>

      {/* ① Header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        padding: '10px 16px',
        background: '#fff',
        borderBottom: '0.5px solid #e8eaf0',
        flexShrink: 0,
      }}>
        {/* Back */}
        <button
          onClick={onBack}
          style={{
            width: 36, height: 36,
            borderRadius: '50%',
            border: 'none',
            background: 'transparent',
            cursor: 'pointer',
            fontSize: 20,
            color: '#1a1a2e',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}
        >
          ←
        </button>

        {/* Avatar with online dot */}
        <div style={{ position: 'relative', flexShrink: 0 }}>
          <div style={{
            width: 38, height: 38,
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #0052cc, #4facfe)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="10" stroke="white" strokeWidth="1.5" />
              <circle cx="9" cy="10.5" r="1.3" fill="white" />
              <circle cx="15" cy="10.5" r="1.3" fill="white" />
              <path d="M8.5 14.5 Q12 17.5 15.5 14.5" stroke="white" strokeWidth="1.5" strokeLinecap="round" fill="none" />
            </svg>
          </div>
          <div style={{
            position: 'absolute',
            bottom: 1, right: 1,
            width: 9, height: 9,
            borderRadius: '50%',
            background: '#22c55e',
            border: '1.5px solid #fff',
          }} />
        </div>

        {/* Title + Status */}
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 15, fontWeight: 700, color: '#1a1a2e', lineHeight: '1.2' }}>
            서울잇다 AI
          </div>
          <div style={{ fontSize: 11, color: '#22c55e', marginTop: 1 }}>
            ● 활동 추천 중
          </div>
        </div>

        {/* Badge */}
        <div style={{
          padding: '4px 10px',
          borderRadius: 12,
          background: '#e8f0fe',
          color: '#1a6ef7',
          fontSize: 10,
          fontWeight: 600,
          flexShrink: 0,
          whiteSpace: 'nowrap',
        }}>
          공공데이터 기반
        </div>
      </div>

      {/* ② Chat Body */}
      <div style={{
        flex: 1,
        overflowY: 'auto',
        padding: '16px 16px 8px',
      }}>
        {messages.map(renderMessage)}

        {/* Typing Indicator */}
        {isTyping && (
          <div style={{
            display: 'flex',
            alignItems: 'flex-end',
            gap: 8,
            marginBottom: 8,
            animation: 'chat-fade-in 0.28s ease-out',
          }}>
            <AIAvatar size={30} />
            <div style={{
              background: '#fff',
              border: '0.5px solid #e8eaf0',
              borderRadius: 14,
              borderBottomLeftRadius: 4,
              padding: '12px 14px',
              display: 'flex',
              alignItems: 'center',
              gap: 5,
            }}>
              {[0, 1, 2].map(i => (
                <div key={i} style={{
                  width: 7, height: 7,
                  borderRadius: '50%',
                  background: '#1a6ef7',
                  animation: `typing-bounce 1.2s ease-in-out ${i * 0.2}s infinite`,
                }} />
              ))}
            </div>
          </div>
        )}

        <div ref={chatEndRef} />
      </div>

      {/* ③ Quick Hints */}
      <div style={{
        display: 'flex',
        gap: 8,
        padding: '8px 16px',
        overflowX: 'auto',
        background: '#fff',
        borderTop: '0.5px solid #e8eaf0',
        flexShrink: 0,
        scrollbarWidth: 'none',
        msOverflowStyle: 'none',
      }}>
        {QUICK_HINTS.map((hint, i) => (
          <button
            key={i}
            onClick={() => sendMessage(hint)}
            onMouseEnter={() => setHoveredHint(i)}
            onMouseLeave={() => setHoveredHint(null)}
            style={{
              whiteSpace: 'nowrap',
              flexShrink: 0,
              padding: '6px 13px',
              borderRadius: 16,
              border: `1px solid ${hoveredHint === i ? '#1a6ef7' : '#e8eaf0'}`,
              background: hoveredHint === i ? '#e8f0fe' : '#f4f6fa',
              color: hoveredHint === i ? '#1a6ef7' : '#666',
              fontSize: 12,
              cursor: 'pointer',
              fontFamily: "'Noto Sans KR', sans-serif",
              transition: 'all 0.15s',
            }}
          >
            {hint}
          </button>
        ))}
      </div>

      {/* ④ Input Area */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        padding: '10px 16px 16px',
        background: '#fff',
        flexShrink: 0,
      }}>
        <input
          value={inputText}
          onChange={e => setInputText(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="활동이나 시간을 입력해보세요..."
          style={{
            flex: 1,
            padding: '11px 16px',
            borderRadius: 20,
            border: '0.5px solid #e8eaf0',
            background: '#f4f6fa',
            fontSize: 14,
            color: '#1a1a2e',
            outline: 'none',
            fontFamily: "'Noto Sans KR', sans-serif",
          }}
        />
        <button
          onClick={() => sendMessage(inputText)}
          disabled={!inputText.trim()}
          style={{
            width: 42, height: 42,
            borderRadius: '50%',
            border: 'none',
            background: inputText.trim() ? '#1a6ef7' : '#d0d7e8',
            color: '#fff',
            cursor: inputText.trim() ? 'pointer' : 'default',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
            transition: 'background 0.2s',
          }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
            <path d="M22 2L11 13" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M22 2L15 22L11 13L2 9L22 2Z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      </div>
    </div>
  );
}

// ── Chip Button (internal helper) ─────────
function ChipButton({ label, onClick }) {
  const [hovered, setHovered] = useState(false);
  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        padding: '7px 14px',
        borderRadius: 20,
        border: `1px solid ${hovered ? '#0052cc' : '#1a6ef7'}`,
        background: hovered ? '#1a6ef7' : '#fff',
        color: hovered ? '#fff' : '#1a6ef7',
        fontSize: 13,
        fontWeight: 500,
        cursor: 'pointer',
        fontFamily: "'Noto Sans KR', sans-serif",
        transition: 'all 0.15s',
      }}
    >
      {label}
    </button>
  );
}
