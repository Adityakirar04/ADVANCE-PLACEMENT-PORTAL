 import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext.jsx';

const InterviewPrep = () => {
  const { api } = useAuth();
  const [roles, setRoles] = useState([]);
  const [selectedRole, setSelectedRole] = useState('');
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    api.get('/ai/interview-roles')
      .then(res => setRoles(res.data.data || []))
      .catch(err => {
        console.error(err);
        setError('Failed to load roles');
      });
  }, [api]);

  const handleGenerate = useCallback(async () => {
    if (!selectedRole) return alert('Select a role first');
    setLoading(true);
    setError('');
    setQuestions([]);
    
    try {
      const res = await api.post('/ai/interview-questions', { role: selectedRole, count: 12 });
      setQuestions(res.data.data.questions || []);
    } catch (err) {
      const msg = err.response?.data?.message || err.message;
      setError('Failed: ' + msg);
      alert('❌ ' + msg);
    } finally {
      setLoading(false);
    }
  }, [api, selectedRole]);

  const typeColors = {
    'Technical': { bg: '#eff6ff', color: '#1d4ed8', border: '#bfdbfe' },
    'Coding': { bg: '#f0fdf4', color: '#166534', border: '#bbf7d0' },
    'System Design': { bg: '#f3e8ff', color: '#7e22ce', border: '#d8b4fe' },
    'HR/Behavioral': { bg: '#fef3c7', color: '#92400e', border: '#fcd34d' }
  };

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '24px', background: '#f3f4f6', minHeight: '100vh' }}>
      <h2 style={{ color: '#111827', marginBottom: '8px', fontSize: '24px', fontWeight: '700' }}>
        🎯 AI Interview Generator
      </h2>
      <p style={{ color: '#6b7280', marginBottom: '24px', fontSize: '14px' }}>
        Select your target role and get AI-generated interview questions tailored to your skills.
      </p>

      {error && (
        <div style={{ background: '#fee2e2', color: '#991b1b', padding: '12px', borderRadius: '8px', marginBottom: '16px', fontSize: '13px' }}>
          ⚠️ {error}
        </div>
      )}

      <div style={{ background: '#ffffff', borderRadius: '12px', padding: '24px', marginBottom: '20px', boxShadow: '0 1px 3px rgba(0,0,0,0.08)', border: '1px solid #e5e7eb' }}>
        <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#374151', marginBottom: '8px' }}>
          Select Job Role
        </label>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', alignItems: 'center' }}>
          <select
            value={selectedRole}
            onChange={(e) => setSelectedRole(e.target.value)}
            style={{
              flex: 1, minWidth: '200px', padding: '10px 14px',
              border: '1px solid #d1d5db', borderRadius: '8px',
              fontSize: '14px', color: '#111827', outline: 'none', background: '#ffffff'
            }}
          >
            <option value="">-- Choose Role --</option>
            {roles.map(r => <option key={r} value={r}>{r}</option>)}
          </select>
          <button
            onClick={handleGenerate}
            disabled={loading || !selectedRole}
            style={{
              padding: '10px 24px',
              background: loading ? '#9ca3af' : '#1e3a8a',
              color: '#ffffff', border: 'none', borderRadius: '8px',
              fontSize: '14px', fontWeight: '600',
              cursor: loading ? 'not-allowed' : 'pointer'
            }}
          >
            {loading ? '⏳ Generating...' : '⚡ Generate Questions'}
          </button>
        </div>
      </div>

      {questions.length > 0 && (
        <div style={{ background: '#ffffff', borderRadius: '12px', padding: '24px', border: '1px solid #e5e7eb' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '700', color: '#111827' }}>
              📝 Questions for {selectedRole}
            </h3>
            <span style={{ fontSize: '13px', color: '#6b7280', fontWeight: '500' }}>
              {questions.length} questions • AI Powered
            </span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {questions.map((item, idx) => {
              const style = typeColors[item.type] || typeColors['Technical'];
              return (
                <div key={idx} style={{
                  padding: '16px', borderRadius: '10px', background: style.bg,
                  border: `1px solid ${style.border}`, display: 'flex', gap: '12px', alignItems: 'flex-start'
                }}>
                  <span style={{
                    fontSize: '11px', fontWeight: '700', color: style.color,
                    background: '#ffffff', padding: '3px 10px', borderRadius: '6px', whiteSpace: 'nowrap', marginTop: '2px'
                  }}>
                    {item.type} • {item.difficulty || 'Medium'}
                  </span>
                  <div>
                    <span style={{ fontSize: '14px', color: '#6b7280', marginRight: '6px' }}>Q{idx + 1}.</span>
                    <span style={{ fontSize: '15px', color: '#111827', fontWeight: '500' }}>{item.q}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default InterviewPrep;