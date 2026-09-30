  // client/src/pages/InterviewPrep.jsx
import { useState } from 'react';

const ROLES = [
  'SDE', 'Frontend Developer', 'Backend Developer', 'Full Stack Developer',
  'Data Scientist', 'DevOps Engineer', 'Cloud Architect', 'Mobile Developer',
  'UI/UX Designer', 'Product Manager', 'QA Engineer', 'System Administrator'
];

const InterviewPrep = () => {
  const [selectedRole, setSelectedRole] = useState('');
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const generateQuestions = async () => {
    if (!selectedRole) {
      setError('Please select a job role first!');
      return;
    }

    setLoading(true);
    setError('');
    setQuestions([]);

    try {
      const token = localStorage.getItem('token');

      const res = await fetch('/api/v1/ai/interview-prep', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ role: selectedRole, experience: 'entry' })
      });

      const data = await res.json();

      if (data.success) {
        setQuestions(data.data?.questions || []);
      } else {
        setError(data.message || 'Failed to generate questions');
      }
    } catch (err) {
      console.error('Interview Prep Error:', err);
      setError('Network error. Please check your connection.');
    } finally {
      setLoading(false);
    }
  };

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'easy': return '#4caf50';
      case 'medium': return '#ff9800';
      case 'hard': return '#f44336';
      default: return '#888';
    }
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case 'technical': return '💻';
      case 'behavioral': return '🗣️';
      case 'scenario': return '🎯';
      default: return '❓';
    }
  };

  return (
    <div style={styles.container}>
      <h1 style={styles.heading}>🎯 AI Interview Prep</h1>
      <p style={styles.subheading}>Select your target role and get AI-generated interview questions</p>

      {/* Role Selector */}
      <div style={styles.selectorBox}>
        <label style={styles.label}>Select Job Role</label>
        <select
          value={selectedRole}
          onChange={(e) => setSelectedRole(e.target.value)}
          style={styles.select}
        >
          <option value="">-- Choose a role --</option>
          {ROLES.map(role => (
            <option key={role} value={role}>{role}</option>
          ))}
        </select>

        <button
          onClick={generateQuestions}
          disabled={loading}
          style={styles.generateBtn(loading)}
        >
          {loading ? '⏳ Generating...' : '🚀 Generate Questions'}
        </button>
      </div>

      {/* Error */}
      {error && (
        <div style={styles.errorBox}>
          ❌ {error}
        </div>
      )}

      {/* Questions List */}
      {questions.length > 0 && (
        <div style={styles.questionsContainer}>
          <h2 style={styles.questionsHeading}>
            📋 {questions.length} Questions for {selectedRole}
          </h2>

          {questions.map((q, index) => (
            <div key={index} style={styles.questionCard}>
              <div style={styles.questionHeader}>
                <span style={styles.questionNumber}>Q{index + 1}</span>
                <span style={styles.typeBadge}>{getTypeIcon(q.type)} {q.type}</span>
                <span style={{ ...styles.difficultyBadge, background: getDifficultyColor(q.difficulty) + '20', color: getDifficultyColor(q.difficulty) }}>
                  {q.difficulty}
                </span>
              </div>

              <p style={styles.questionText}>{q.question}</p>

              {q.hint && (
                <div style={styles.hintBox}>
                  <span style={styles.hintLabel}>💡 Hint:</span>
                  <span style={styles.hintText}>{q.hint}</span>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const styles = {
  container: { padding: '20px', maxWidth: '900px', margin: '0 auto' },
  heading: { fontSize: '32px', color: '#1a1a2e', marginBottom: '8px' },
  subheading: { fontSize: '16px', color: '#666', marginBottom: '25px' },
  selectorBox: { background: 'white', padding: '25px', borderRadius: '12px', boxShadow: '0 2px 10px rgba(0,0,0,0.08)', marginBottom: '25px' },
  label: { display: 'block', fontSize: '14px', fontWeight: '600', color: '#444', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.5px' },
  select: { width: '100%', padding: '12px 15px', fontSize: '16px', borderRadius: '8px', border: '2px solid #e0e0e0', marginBottom: '15px', background: 'white', cursor: 'pointer' },
  generateBtn: (loading) => ({ width: '100%', padding: '12px', fontSize: '16px', fontWeight: '600', background: loading ? '#ccc' : '#e94560', color: 'white', border: 'none', borderRadius: '8px', cursor: loading ? 'not-allowed' : 'pointer' }),
  errorBox: { background: '#ffebee', border: '1px solid #ef9a9a', padding: '15px', borderRadius: '8px', marginBottom: '20px', color: '#c62828' },
  questionsContainer: { marginTop: '20px' },
  questionsHeading: { fontSize: '22px', color: '#1a1a2e', marginBottom: '15px' },
  questionCard: { background: 'white', padding: '20px', borderRadius: '10px', marginBottom: '15px', boxShadow: '0 2px 8px rgba(0,0,0,0.06)', borderLeft: '4px solid #e94560' },
  questionHeader: { display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px', flexWrap: 'wrap' },
  questionNumber: { background: '#e94560', color: 'white', width: '30px', height: '30px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px', fontWeight: 'bold' },
  typeBadge: { background: '#e3f2fd', color: '#1565c0', padding: '3px 10px', borderRadius: '6px', fontSize: '12px' },
  difficultyBadge: { padding: '3px 10px', borderRadius: '6px', fontSize: '12px', fontWeight: '600', textTransform: 'capitalize' },
  questionText: { fontSize: '16px', color: '#333', lineHeight: '1.5', marginBottom: '10px', fontWeight: '500' },
  hintBox: { background: '#f5f5f5', padding: '10px 15px', borderRadius: '6px', display: 'flex', gap: '8px', alignItems: 'flex-start' },
  hintLabel: { fontSize: '13px', fontWeight: '600', color: '#666', whiteSpace: 'nowrap' },
  hintText: { fontSize: '13px', color: '#777', lineHeight: '1.4' }
};

export default InterviewPrep;