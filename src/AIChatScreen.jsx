import { useState, useEffect, useRef } from 'react';

// ──────────────────────────────────────────
// Dummy Data
// ──────────────────────────────────────────
const DUMMY_ACTIVITIES = {
  운동: [
    { id:'a1', title:'퇴근길 한강 산책', datetime:'오늘 20:00',
      location:'여의도 한강공원', distance:'1.2km', isFree:true,
      category:'운동', tags:['#산책','#혼자가능','#부담적음'],
      description:'산책 중심이라 처음 가도 부담이 적은 편이야. 대화를 많이 해야 하는 모임이라기보다는 같이 걷는 분위기에 가까워서, 혼자 신청해도 비교적 어색함이 덜할 수 있어.' },
    { id:'a2', title:'마포 배드민턴 교실', datetime:'목 14:00',
      location:'마포체육관', distance:'0.8km', isFree:true,
      category:'운동', tags:['#운동','#실내','#무료'],
      description:'공개 강좌라 혼자 참여하는 분도 많아. 초보자도 쉽게 배울 수 있는 클래스야!' }
  ],
  독서: [
    { id:'b1', title:'주말 아침 독서 모임', datetime:'토 10:00',
      location:'망원동 카페', distance:'2.5km', isFree:false,
      category:'독서', tags:['#독서','#소규모','#주말'],
      description:'조용히 각자 책을 읽고 짧게 감상을 나누는 모임이야. 부담 없이 참여하기 좋아.' },
  ],
  '가까운 곳': [
    { id:'c1', title:'동네 한바퀴 걷기', datetime:'내일 19:00',
      location:'연남동 골목', distance:'0.3km', isFree:true,
      category:'산책', tags:['#가까운곳','#가볍게','#저녁'],
      description:'집 근처에서 가볍게 걷는 모임이야.' }
  ],
  '무료 활동': [
    { id:'d1', title:'무료 전시 관람', datetime:'금 15:00',
      location:'서울시립미술관', distance:'4.0km', isFree:true,
      category:'문화', tags:['#무료','#전시','#조용한'],
      description:'무료로 진행되는 특별 전시 관람이야.' }
  ],
  '혼자 가도 괜찮은 활동': [
    { id:'e1', title:'1인 가구 요리 교실', datetime:'수 18:30',
      location:'마포 요리공방', distance:'1.5km', isFree:false,
      category:'취미', tags:['#혼자','#요리','#실용적'],
      description:'혼자 오시는 분들이 대부분이라 어색하지 않게 요리를 배울 수 있어.' }
  ],
  '부담 적은 것부터': [
    { id:'f1', title:'한강 멍때리기', datetime:'일 16:00',
      location:'망원 한강공원', distance:'1.0km', isFree:true,
      category:'휴식', tags:['#부담적음','#휴식','#야외'],
      description:'그냥 앉아서 쉬는 모임이야. 아무것도 안 해도 괜찮아.' }
  ]
};

const GREETING_CHIPS = [
  { label: '운동', value: '운동' },
  { label: '독서', value: '독서' },
  { label: '가까운 곳', value: '가까운 곳' },
  { label: '무료 활동', value: '무료 활동' },
  { label: '혼자 가도 괜찮은 활동', value: '혼자 가도 괜찮은 활동' },
  { label: '부담 적은 것부터', value: '부담 적은 것부터' },
];

const CONSULT_CHIPS = [
  { label: '혼자 가도 괜찮아?', value: '혼자 가도 괜찮아?' },
  { label: '준비물 있어?', value: '준비물 있어?' },
  { label: '신청 전에 확인할게', value: '신청 전에 확인할게' },
  { label: '찜해둘래', value: '찜해둘래' },
];

// ──────────────────────────────────────────
// Style injection
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
// Components
// ──────────────────────────────────────────
function AIAvatar({ size = 30 }) {
  const s = size;
  return (
    <div style={{
      width: s, height: s, borderRadius: '50%',
      background: 'linear-gradient(135deg, #1a6ef7, #4facfe)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
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

// ──────────────────────────────────────────
// Main Component
// ──────────────────────────────────────────
export default function AIChatScreen({ onBack, initialActivity }) {
  const [chatStep, setChatStep] = useState(initialActivity ? 'consult' : 'greeting'); // 'greeting' | 'category' | 'recommend' | 'consult'
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [selectedActivity, setSelectedActivity] = useState(initialActivity || null);
  const [likedActivities, setLikedActivities] = useState({});
  const chatEndRef = useRef(null);
  const nextId = useRef(1);
  const hasInitialized = useRef(false);

  useEffect(() => { injectChatStyles(); }, []);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping, chatStep]);

  // STEP 1. greeting (첫 진입)
  useEffect(() => {
    if (chatStep === 'greeting' && messages.length === 0 && !initialActivity && !hasInitialized.current) {
      hasInitialized.current = true;
      setMessages([{
        id: nextId.current++, sender: 'ai', type: 'chips',
        content: '안녕! 오늘은 어떤 느낌의 활동이 끌려?',
        chips: GREETING_CHIPS
      }]);
    }
  }, [chatStep, messages.length, initialActivity]);

  // Initial Consult Mode
  useEffect(() => {
    if (initialActivity && messages.length === 0 && !hasInitialized.current) {
      hasInitialized.current = true;
      setMessages([{ id: nextId.current++, sender: 'user', type: 'text', content: `'${initialActivity.title}' 상담 시작할게` }]);
      setIsTyping(true);
      
      setTimeout(() => {
        setIsTyping(false);
        setMessages(prev => [
          ...prev,
          { id: nextId.current++, sender: 'ai', type: 'text', content: initialActivity.description },
          { id: nextId.current++, sender: 'ai', type: 'chips', content: '무엇이 궁금해?', chips: CONSULT_CHIPS }
        ]);
      }, 800);
    }
  }, [initialActivity, messages.length]);

  function handleAction(text) {
    const trimmed = text.trim();
    if (!trimmed) return;

    // 사용자 메시지 추가
    setMessages(prev => [...prev, { id: nextId.current++, sender: 'user', type: 'text', content: trimmed }]);
    setInputText('');
    
    if (chatStep === 'greeting' || chatStep === 'category') {
      setChatStep('category');
      setIsTyping(true);
      
      // STEP 2 -> STEP 3
      setTimeout(() => {
        setIsTyping(false);
        const activities = DUMMY_ACTIVITIES[trimmed] || DUMMY_ACTIVITIES['운동']; // Fallback
        
        setMessages(prev => [
          ...prev,
          { id: nextId.current++, sender: 'ai', type: 'text', content: '이런 활동 어때? 하나 골라봐 😊' },
          { id: nextId.current++, sender: 'ai', type: 'cards', cards: activities }
        ]);
        setChatStep('recommend');
      }, 1300); // 800ms 딜레이 후 인디케이터, 500ms 후 추천카드 (총 1300ms 딜레이 구현)
    } else if (chatStep === 'consult') {
      setIsTyping(true);
      setTimeout(() => {
        setIsTyping(false);
        let aiResponse = '';
        let showLink = false;

        if (trimmed === '혼자 가도 괜찮아?') {
          aiResponse = '응! 이 활동은 혼자 신청한 사람도 많아. 전혀 어색하지 않을 거야.';
        } else if (trimmed === '준비물 있어?') {
          aiResponse = '따로 준비물은 없어. 편한 신발 정도면 충분해.';
        } else if (trimmed === '신청 전에 확인할게') {
          aiResponse = '신청 링크 바로 연결해줄게!';
          showLink = true;
        } else if (trimmed === '찜해둘래') {
          aiResponse = '저장했어! 나중에 마이페이지에서 볼 수 있어.';
          if(selectedActivity) {
            setLikedActivities(prev => ({ ...prev, [selectedActivity.id]: true }));
          }
        } else {
          aiResponse = '그 부분은 내가 조금 더 알아봐야 할 것 같아!';
        }

        const newMsgs = [{ id: nextId.current++, sender: 'ai', type: 'text', content: aiResponse }];
        if (showLink) {
          newMsgs.push({ id: nextId.current++, sender: 'ai', type: 'link', content: '신청하기', url: '#' });
        } else if (trimmed !== '찜해둘래') { 
          newMsgs.push({ id: nextId.current++, sender: 'ai', type: 'chips', content: '더 궁금한 거 있어?', chips: CONSULT_CHIPS });
        }

        setMessages(prev => [...prev, ...newMsgs]);
      }, 800);
    }
  }

  function handleKeyDown(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleAction(inputText);
    }
  }

  function startConsult(card) {
    setSelectedActivity(card);
    setChatStep('consult');
    setMessages(prev => [...prev, { id: nextId.current++, sender: 'user', type: 'text', content: `'${card.title}' 상담 시작할게` }]);
    setIsTyping(true);
    
    setTimeout(() => {
      setIsTyping(false);
      setMessages(prev => [
        ...prev,
        { id: nextId.current++, sender: 'ai', type: 'text', content: card.description },
        { id: nextId.current++, sender: 'ai', type: 'chips', content: '무엇이 궁금해?', chips: CONSULT_CHIPS }
      ]);
    }, 800);
  }

  function toggleLike(id) {
    setLikedActivities(prev => ({ ...prev, [id]: !prev[id] }));
  }

  // ── Renderers ──────────────────────────
  function renderTextBubble(msg) {
    const isAI = msg.sender === 'ai';
    return (
      <div key={msg.id} style={{ display: 'flex', justifyContent: isAI ? 'flex-start' : 'flex-end', alignItems: 'flex-end', gap: 8, marginBottom: 8, animation: 'chat-fade-in 0.28s ease-out' }}>
        {isAI && <AIAvatar size={30} />}
        <div style={{
          maxWidth: '72%', padding: '10px 14px', borderRadius: 14,
          borderBottomLeftRadius: isAI ? 4 : 14, borderBottomRightRadius: isAI ? 14 : 4,
          background: isAI ? '#fff' : '#1a6ef7',
          border: isAI ? '0.5px solid #d0e1fd' : 'none',
          color: isAI ? '#2D2020' : '#fff',
          fontSize: 14, lineHeight: '1.6', fontFamily: "'Noto Sans KR', sans-serif", wordBreak: 'keep-all',
        }}>
          {msg.content}
        </div>
      </div>
    );
  }

  function renderChips(msg) {
    return (
      <div key={msg.id} style={{ marginBottom: 12, animation: 'chat-fade-in 0.28s ease-out' }}>
        <div style={{ display: 'flex', alignItems: 'flex-end', gap: 8, marginBottom: 8 }}>
          <AIAvatar size={30} />
          <div style={{
            maxWidth: '72%', padding: '10px 14px', borderRadius: 14, borderBottomLeftRadius: 4,
            background: '#fff', border: '0.5px solid #d0e1fd', color: '#2D2020', fontSize: 14, lineHeight: '1.6'
          }}>{msg.content}</div>
        </div>
        <div style={{ paddingLeft: 38, display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          {msg.chips.map(chip => (
            <button key={chip.value} onClick={() => handleAction(chip.value)} style={{
              padding: '7px 14px', borderRadius: 20, border: '1px solid #1a6ef7', background: '#fff',
              color: '#1a6ef7', fontSize: 13, fontWeight: 500, cursor: 'pointer', transition: 'all 0.15s'
            }}
            onMouseOver={(e) => { e.currentTarget.style.background = '#1a6ef7'; e.currentTarget.style.color = '#fff'; }}
            onMouseOut={(e) => { e.currentTarget.style.background = '#fff'; e.currentTarget.style.color = '#1a6ef7'; }}
            >
              {chip.label}
            </button>
          ))}
        </div>
      </div>
    );
  }

  function renderCards(msg) {
    return (
      <div key={msg.id} style={{ paddingLeft: 38, marginBottom: 12, animation: 'chat-fade-in 0.28s ease-out' }}>
        {msg.cards.map(card => {
          const isLiked = likedActivities[card.id];
          return (
            <div key={card.id} style={{
              background: '#fff', border: '0.5px solid #d0e1fd', borderRadius: 14, padding: '16px', marginBottom: 12,
              fontFamily: "'Noto Sans KR', sans-serif", boxShadow: '0 2px 8px rgba(0,0,0,0.04)'
            }}>
              {/* ① 상단: 카테고리 뱃지 + 무료/유료 뱃지 (우측 정렬) */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 6, marginBottom: 8 }}>
                <span style={{ fontSize: 10, fontWeight: 700, color: '#1a6ef7', background: '#e8f0fe', borderRadius: 6, padding: '2px 7px' }}>
                  {card.category}
                </span>
                <span style={{ fontSize: 10, fontWeight: 700, color: card.isFree ? '#22c55e' : '#8A6F6F', background: card.isFree ? '#22c55e18' : '#f0f0f0', borderRadius: 6, padding: '2px 7px' }}>
                  {card.isFree ? '무료' : '유료'}
                </span>
              </div>
              
              {/* ② 활동명 */}
              <div style={{ fontSize: 16, fontWeight: 700, color: '#2D2020', marginBottom: 6 }}>{card.title}</div>
              
              {/* ③ 시간 · 장소 · 거리 */}
              <div style={{ fontSize: 12, color: '#8A6F6F', marginBottom: 8 }}>
                {card.datetime} · {card.location} · {card.distance}
              </div>
              
              {/* ④ 태그 목록 */}
              <div style={{ display: 'flex', gap: 6, marginBottom: 12, flexWrap: 'wrap' }}>
                {card.tags.map(tag => (
                  <span key={tag} style={{ fontSize: 11, color: '#1a6ef7', background: '#e8f0fe', borderRadius: 12, padding: '3px 8px' }}>
                    {tag}
                  </span>
                ))}
              </div>
              
              {/* ⑤ 구분선 */}
              <div style={{ height: '0.5px', background: '#d0e1fd', marginBottom: 12 }} />
              
              {/* ⑥ 버튼 3개 */}
              <div style={{ display: 'flex', gap: 8 }}>
                <button onClick={() => startConsult(card)} style={{
                  flex: 1, padding: '8px 0', borderRadius: 8, background: '#1a6ef7', color: '#fff', border: 'none',
                  fontSize: 13, fontWeight: 600, cursor: 'pointer'
                }}>AI 상세 상담 시작</button>
                <button onClick={() => toggleLike(card.id)} style={{
                  padding: '8px 12px', borderRadius: 8, background: '#fff', border: '1px solid #d0e1fd', color: isLiked ? '#1a6ef7' : '#8A6F6F',
                  fontSize: 13, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center'
                }}>
                  {isLiked ? '♥' : '♡'}
                </button>
                <button style={{
                  padding: '8px 12px', borderRadius: 8, background: '#fff', border: '1px solid #d0e1fd', color: '#8A6F6F',
                  fontSize: 13, fontWeight: 500, cursor: 'pointer'
                }}>상세 보기</button>
              </div>
            </div>
          );
        })}
        {/* [다른 활동 볼게] 버튼 */}
        <button onClick={() => handleAction('운동')} style={{
          width: '100%', padding: '10px', borderRadius: 8, background: '#f4f9ff', border: '1px solid #e8f0fe', color: '#1a6ef7',
          fontSize: 13, fontWeight: 600, cursor: 'pointer', marginTop: 4
        }}>다른 활동 볼게</button>
      </div>
    );
  }

  function renderLink(msg) {
    return (
       <div key={msg.id} style={{ paddingLeft: 38, marginBottom: 12, animation: 'chat-fade-in 0.28s ease-out' }}>
         <a href={msg.url} style={{
           display: 'inline-block', padding: '10px 16px', background: '#1a6ef7', color: '#fff', textDecoration: 'none',
           borderRadius: 8, fontSize: 14, fontWeight: 600
         }}>{msg.content}</a>
       </div>
    );
  }

  function renderMessage(msg) {
    if (msg.type === 'text')  return renderTextBubble(msg);
    if (msg.type === 'chips') return renderChips(msg);
    if (msg.type === 'cards') return renderCards(msg);
    if (msg.type === 'link')  return renderLink(msg);
    return null;
  }

  // ── Layout ────────────────────────────
  return (
    <div style={{ height: '100dvh', display: 'flex', flexDirection: 'column', background: '#f4f6fa', fontFamily: "'Noto Sans KR', sans-serif", maxWidth: 480, margin: '0 auto', position: 'relative' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 16px', background: '#fff', borderBottom: '0.5px solid #d0e1fd', flexShrink: 0 }}>
        <button onClick={onBack} style={{ width: 36, height: 36, borderRadius: '50%', border: 'none', background: 'transparent', cursor: 'pointer', fontSize: 20, color: '#2D2020' }}>←</button>
        <div style={{ flex: 1, fontSize: 16, fontWeight: 700, color: '#2D2020' }}>AI 잇다</div>
      </div>

      {/* Chat Body */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '16px 16px 8px' }}>
        {messages.map(renderMessage)}

        {isTyping && (
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: 8, marginBottom: 8, animation: 'chat-fade-in 0.28s ease-out' }}>
            <AIAvatar size={30} />
            <div style={{ background: '#fff', border: '0.5px solid #d0e1fd', borderRadius: 14, borderBottomLeftRadius: 4, padding: '12px 14px', display: 'flex', gap: 5 }}>
              {[0, 1, 2].map(i => <div key={i} style={{ width: 7, height: 7, borderRadius: '50%', background: '#1a6ef7', animation: `typing-bounce 1.2s ease-in-out ${i * 0.2}s infinite` }} />)}
            </div>
          </div>
        )}
        <div ref={chatEndRef} />
      </div>

      {/* Input Area */}
      <div style={{ padding: '10px 16px 16px', background: '#fff', borderTop: '1px solid #d0e1fd' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <input
            value={inputText}
            onChange={e => setInputText(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={chatStep === 'greeting' ? "버튼을 선택하거나 직접 입력해도 돼" : "메시지를 입력하세요..."}
            style={{ flex: 1, padding: '11px 16px', borderRadius: 20, border: '1px solid #d0e1fd', background: '#f4f6fa', fontSize: 14, color: '#2D2020', outline: 'none' }}
          />
          <button
            onClick={() => handleAction(inputText)}
            disabled={!inputText.trim()}
            style={{ width: 42, height: 42, borderRadius: '50%', border: 'none', background: inputText.trim() ? '#1a6ef7' : '#d0e1fd', color: '#fff', cursor: inputText.trim() ? 'pointer' : 'default', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'background 0.2s' }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <path d="M22 2L11 13" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M22 2L15 22L11 13L2 9L22 2Z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        </div>
      </div>

      {/* STEP 4: Bottom sticky action buttons */}
      {chatStep === 'consult' && selectedActivity && (
        <div style={{ padding: '12px 16px', background: '#fff', borderTop: '1px solid #d0e1fd', display: 'flex', gap: 8 }}>
          <button style={{ flex: 1, padding: '10px 0', borderRadius: 8, background: '#fff', color: '#2D2020', border: '1px solid #d0e1fd', fontSize: 14, fontWeight: 600 }}>상세 보기</button>
          <button onClick={() => toggleLike(selectedActivity.id)} style={{ flex: 1, padding: '10px 0', borderRadius: 8, background: likedActivities[selectedActivity.id] ? '#1a6ef7' : '#fff', color: likedActivities[selectedActivity.id] ? '#fff' : '#2D2020', border: '1px solid #d0e1fd', fontSize: 14, fontWeight: 600 }}>
            {likedActivities[selectedActivity.id] ? '♥ 찜 취소' : '♡ 찜하기'}
          </button>
          <button style={{ flex: 1, padding: '10px 0', borderRadius: 8, background: '#fff', color: '#2D2020', border: '1px solid #d0e1fd', fontSize: 14, fontWeight: 600 }}>나중에 보기</button>
        </div>
      )}
    </div>
  );
}