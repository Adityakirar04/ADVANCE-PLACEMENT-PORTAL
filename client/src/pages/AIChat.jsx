 import { useState, useRef, useEffect } from 'react';
import { useAuth } from '../context/AuthContext.jsx';

const AIChat = () => {
  const { api } = useAuth();
  const [messages, setMessages] = useState([
    { role: 'model', text: '👋 Hi! Main aapka AI placement assistant hoon. Resume, interview, ya career ke baare mein kuch bhi poochho!' }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || loading) return;
    const userMsg = input.trim();
    setInput('');

    // 🔥 FIX: History bhejne se pehle nikalo (welcome message hatao)
    // messages abhi update nahi hua, so isme purani messages hain
    const historyForAPI = messages
      .slice(1) // Welcome message hatao
      .map(m => ({ role: m.role, text: m.text }));

    // UI mein user message dikhayo
    setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setLoading(true);

    try {
      const res = await api.post('/ai/chat', { 
        message: userMsg, 
        history: historyForAPI 
      });
      
      setMessages(prev => [...prev, { role: 'model', text: res.data.data.reply }]);
    } catch (err) {
      const errorText = err.response?.data?.message || err.message || 'Something went wrong';
      setMessages(prev => [...prev, { role: 'model', text: '❌ Error: ' + errorText }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '700px', margin: '0 auto', padding: '20px', background: '#f3f4f6', minHeight: '100vh' }}>
      <h2 style={{ color: '#111827', fontSize: '22px', fontWeight: '700', marginBottom: '16px' }}>🤖 AI Placement Assistant</h2>
      
      <div style={{ 
        background: '#ffffff', 
        borderRadius: '12px', 
        border: '1px solid #e5e7eb', 
        height: '60vh', 
        overflowY: 'auto', 
        padding: '16px', 
        display: 'flex', 
        flexDirection: 'column', 
        gap: '12px', 
        marginBottom: '12px' 
      }}>
        {messages.map((m, i) => (
          <div key={i} style={{ 
            alignSelf: m.role === 'user' ? 'flex-end' : 'flex-start', 
            maxWidth: '80%', 
            padding: '12px 16px', 
            borderRadius: '12px', 
            background: m.role === 'user' ? '#1e3a8a' : '#f3f4f6', 
            color: m.role === 'user' ? '#ffffff' : '#111827', 
            fontSize: '14px', 
            lineHeight: '1.5', 
            whiteSpace: 'pre-wrap',
            wordBreak: 'break-word'
          }}>
            {m.text}
          </div>
        ))}
        {loading && (
          <div style={{ 
            alignSelf: 'flex-start', 
            padding: '10px 16px', 
            background: '#f3f4f6', 
            borderRadius: '12px', 
            color: '#6b7280', 
            fontSize: '13px' 
          }}>
            ⏳ Gemini soch raha hai...
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      <div style={{ display: 'flex', gap: '8px' }}>
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          placeholder="Kuch bhi poochho... (e.g. 'React mein useEffect kya hai?')"
          style={{ 
            flex: 1, 
            padding: '12px 16px', 
            border: '1px solid #d1d5db', 
            borderRadius: '10px', 
            fontSize: '14px', 
            outline: 'none' 
          }}
        />
        <button
          onClick={handleSend}
          disabled={loading}
          style={{ 
            padding: '12px 24px', 
            background: loading ? '#9ca3af' : '#7c3aed', 
            color: '#ffffff', 
            border: 'none', 
            borderRadius: '10px', 
            fontWeight: '600', 
            cursor: loading ? 'not-allowed' : 'pointer' 
          }}
        >
          Send
        </button>
      </div>
    </div>
  );
};

export default AIChat;