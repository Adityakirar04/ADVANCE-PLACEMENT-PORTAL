 // client/src/pages/AIChat.jsx
import { useState, useRef, useEffect } from 'react';

const AIChat = () => {
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: '👋 Hi! Main aapka AI placement assistant hoon. Resume, interview, ya career ke baare mein kuch bhi poochho!'
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim()) return;

    const userMessage = { role: 'user', content: input.trim() };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);
    setError('');

    try {
      const token = localStorage.getItem('token');

      const res = await fetch('/api/v1/ai/chat', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          message: userMessage.content,
          history: messages.slice(-6)
        })
      });

      const data = await res.json();

      if (data.success) {
        setMessages(prev => [...prev, {
          role: 'assistant',
          content: data.data?.response || 'No response from AI.'
        }]);
      } else {
        // Show actual error from backend
        setError(data.message || 'AI service error. Please try again.');
      }
    } catch (err) {
      console.error('AI Chat Error:', err);
      setError('Network error. Please check your connection and try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1 style={styles.heading}>🤖 AI Placement Assistant</h1>
      </div>

      {/* Error Banner */}
      {error && (
        <div style={styles.errorBanner}>
          ❌ {error}
        </div>
      )}

      {/* Chat Messages */}
      <div style={styles.chatBox}>
        {messages.map((msg, index) => (
          <div
            key={index}
            style={{
              ...styles.messageRow,
              justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start'
            }}
          >
            <div
              style={{
                ...styles.messageBubble,
                background: msg.role === 'user' ? '#e94560' : '#f0f0f5',
                color: msg.role === 'user' ? 'white' : '#333',
                borderBottomRightRadius: msg.role === 'user' ? '4px' : '12px',
                borderBottomLeftRadius: msg.role === 'assistant' ? '4px' : '12px'
              }}
            >
              <div style={styles.messageContent}>
                {msg.content.split('\n').map((line, i) => (
                  <p key={i} style={{ margin: '2px 0', lineHeight: '1.5' }}>
                    {line}
                  </p>
                ))}
              </div>
            </div>
          </div>
        ))}

        {loading && (
          <div style={styles.messageRow}>
            <div style={styles.typingIndicator}>
              <span style={styles.dot}></span>
              <span style={styles.dot}></span>
              <span style={styles.dot}></span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div style={styles.inputArea}>
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Kuch bhi poochho... (e.g. 'React mein useEffect kya hai?')"
          style={styles.input}
          disabled={loading}
        />
        <button
          onClick={sendMessage}
          disabled={loading || !input.trim()}
          style={styles.sendBtn(loading || !input.trim())}
        >
          {loading ? '⏳' : '➤'}
        </button>
      </div>

      {/* Quick Suggestions */}
      <div style={styles.suggestions}>
        {['Resume tips', 'Interview prep', 'DSA guidance', 'Salary negotiation'].map(s => (
          <button
            key={s}
            onClick={() => { setInput(s); }}
            style={styles.suggestionChip}
          >
            {s}
          </button>
        ))}
      </div>
    </div>
  );
};

const styles = {
  container: { 
    maxWidth: '800px', 
    margin: '0 auto', 
    height: 'calc(100vh - 80px)', 
    display: 'flex', 
    flexDirection: 'column',
    padding: '15px'
  },
  header: { 
    marginBottom: '15px' 
  },
  heading: { 
    fontSize: '24px', 
    color: '#1a1a2e', 
    margin: 0 
  },
  errorBanner: {
    background: '#ffebee',
    color: '#c62828',
    padding: '10px 15px',
    borderRadius: '8px',
    marginBottom: '15px',
    fontSize: '14px',
    border: '1px solid #ef9a9a'
  },
  chatBox: { 
    flex: 1, 
    overflowY: 'auto', 
    padding: '15px', 
    background: 'white', 
    borderRadius: '12px', 
    boxShadow: '0 2px 10px rgba(0,0,0,0.06)', 
    marginBottom: '15px' 
  },
  messageRow: { 
    display: 'flex', 
    marginBottom: '12px' 
  },
  messageBubble: { 
    maxWidth: '75%', 
    padding: '12px 16px', 
    borderRadius: '12px', 
    fontSize: '14px', 
    lineHeight: '1.5' 
  },
  messageContent: { 
    whiteSpace: 'pre-wrap' 
  },
  typingIndicator: { 
    display: 'flex', 
    gap: '4px', 
    padding: '12px 16px', 
    background: '#f0f0f5', 
    borderRadius: '12px' 
  },
  dot: { 
    width: '8px', 
    height: '8px', 
    background: '#999', 
    borderRadius: '50%', 
    animation: 'bounce 1.4s infinite ease-in-out both' 
  },
  inputArea: { 
    display: 'flex', 
    gap: '10px', 
    marginBottom: '10px' 
  },
  input: { 
    flex: 1, 
    padding: '12px 16px', 
    fontSize: '15px', 
    border: '2px solid #e0e0e0', 
    borderRadius: '10px', 
    outline: 'none' 
  },
  sendBtn: (disabled) => ({ 
    padding: '12px 20px', 
    background: disabled ? '#ccc' : '#e94560', 
    color: 'white', 
    border: 'none', 
    borderRadius: '10px', 
    cursor: disabled ? 'not-allowed' : 'pointer', 
    fontSize: '18px' 
  }),
  suggestions: { 
    display: 'flex', 
    gap: '8px', 
    flexWrap: 'wrap' 
  },
  suggestionChip: { 
    padding: '6px 14px', 
    background: '#f0f0f5', 
    border: '1px solid #ddd', 
    borderRadius: '20px', 
    fontSize: '13px', 
    cursor: 'pointer', 
    color: '#555' 
  }
};

export default AIChat;