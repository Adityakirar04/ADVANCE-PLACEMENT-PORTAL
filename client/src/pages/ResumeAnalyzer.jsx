 import { useState, useCallback } from 'react';
import { useAuth } from '../context/AuthContext.jsx';

const ResumeAnalyzer = () => {
  const { api } = useAuth();
  
  // ============================================
  // STATE
  // ============================================
  const [file, setFile] = useState(null);
  const [previewName, setPreviewName] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  // ============================================
  // FILE SELECT
  // ============================================
  const handleFileChange = (e) => {
    const selected = e.target.files[0];
    if (!selected) return;
    
    const allowedTypes = [
      'application/pdf',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ];
    
    if (!allowedTypes.includes(selected.type)) {
      setError('❌ Only PDF and DOCX files allowed');
      setFile(null);
      return;
    }
    
    if (selected.size > 5 * 1024 * 1024) {
      setError('❌ File too large (max 5MB)');
      setFile(null);
      return;
    }
    
    setFile(selected);
    setPreviewName(selected.name);
    setError('');
    setResult(null);
  };

  // ============================================
  // ANALYZE BUTTON CLICK
  // ============================================
  const handleAnalyze = useCallback(async () => {
    if (!file) return setError('Please select a resume first');
    
    setLoading(true);
    setError('');
    setResult(null);

    try {
      const formData = new FormData();
      formData.append('resume', file);

      // 🔥 IMPORTANT: Content-Type mat set karo manually
      // Axios khud multipart boundary set karta hai
      const res = await api.post('/ai/analyze-resume', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      setResult(res.data.data);
    } catch (err) {
      console.error('Analyze error:', err);
      const msg = err.response?.data?.message || err.message || 'Analysis failed';
      setError('❌ ' + msg);
    } finally {
      setLoading(false);
    }
  }, [file, api]);

  // ============================================
  // GRADE COLOR HELPER
  // ============================================
  const getGradeStyle = (grade) => {
    switch(grade?.toUpperCase()) {
      case 'A': return { bg: '#d1fae5', color: '#166534', border: '#86efac' };
      case 'B': return { bg: '#dbeafe', color: '#1e40af', border: '#93c5fd' };
      case 'C': return { bg: '#fef3c7', color: '#92400e', border: '#fcd34d' };
      case 'D': return { bg: '#fee2e2', color: '#991b1b', border: '#fca5a5' };
      default: return { bg: '#f3f4f6', color: '#6b7280', border: '#d1d5db' };
    }
  };

  // ============================================
  // RENDER
  // ============================================
  return (
    <div style={{ maxWidth: '850px', margin: '0 auto', padding: '24px', background: '#f3f4f6', minHeight: '100vh' }}>
      <h2 style={{ color: '#111827', fontSize: '26px', fontWeight: '700', marginBottom: '4px' }}>
        🤖 AI Resume Analyzer
      </h2>
      <p style={{ color: '#6b7280', marginBottom: '24px', fontSize: '14px' }}>
        Upload your resume and get ATS score, missing skills, and improvement suggestions.
      </p>

      {/* Error */}
      {error && (
        <div style={{
          background: '#fee2e2', color: '#991b1b', padding: '12px 16px',
          borderRadius: '8px', marginBottom: '20px', fontSize: '13px', fontWeight: '500'
        }}>
          {error}
        </div>
      )}

      {/* Upload Box */}
      <div style={{
        background: '#ffffff', borderRadius: '12px', padding: '28px',
        border: '2px dashed #d1d5db', textAlign: 'center', marginBottom: '24px'
      }}>
        <input
          type="file"
          accept=".pdf,.docx"
          onChange={handleFileChange}
          id="resume-upload"
          style={{ display: 'none' }}
        />
        <label htmlFor="resume-upload" style={{
          display: 'inline-block', padding: '12px 28px', background: '#1e3a8a',
          color: '#fff', borderRadius: '8px', cursor: 'pointer', fontSize: '14px', fontWeight: '600'
        }}>
          📁 Select Resume (PDF/DOCX)
        </label>
        
        {previewName && (
          <p style={{ marginTop: '12px', fontSize: '13px', color: '#374151', fontWeight: '500' }}>
            Selected: {previewName}
          </p>
        )}

        <button
          onClick={handleAnalyze}
          disabled={loading || !file}
          style={{
            marginTop: '16px', padding: '10px 32px',
            background: loading ? '#9ca3af' : '#166534',
            color: '#fff', border: 'none', borderRadius: '8px',
            fontSize: '14px', fontWeight: '600',
            cursor: loading || !file ? 'not-allowed' : 'pointer'
          }}
        >
          {loading ? '⏳ Analyzing...' : '⚡ Analyze Resume'}
        </button>
      </div>

      {/* RESULTS */}
      {result && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          {/* Score Card */}
          <div style={{
            background: '#ffffff', borderRadius: '12px', padding: '24px',
            border: '1px solid #e5e7eb', display: 'flex', alignItems: 'center', gap: '24px', flexWrap: 'wrap'
          }}>
            {/* Circular Progress */}
            <div style={{
              width: '100px', height: '100px', borderRadius: '50%',
              background: `conic-gradient(#1e3a8a ${result.atsScore * 3.6}deg, #e5e7eb 0deg)`,
              display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative'
            }}>
              <div style={{
                width: '80px', height: '80px', borderRadius: '50%', background: '#fff',
                display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column'
              }}>
                <span style={{ fontSize: '22px', fontWeight: '700', color: '#1e3a8a' }}>{result.atsScore}</span>
                <span style={{ fontSize: '10px', color: '#6b7280' }}>ATS</span>
              </div>
            </div>

            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                <span style={{
                  padding: '6px 16px', borderRadius: '8px', fontSize: '18px', fontWeight: '700',
                  background: getGradeStyle(result.grade).bg,
                  color: getGradeStyle(result.grade).color,
                  border: `2px solid ${getGradeStyle(result.grade).border}`
                }}>
                  Grade {result.grade}
                </span>
                {result.aiSuccess === false && (
                  <span style={{ fontSize: '12px', color: '#991b1b', background: '#fee2e2', padding: '4px 10px', borderRadius: '6px' }}>
                    Analysis Failed
                  </span>
                )}
              </div>
              <p style={{ color: '#4b5563', fontSize: '14px', lineHeight: '1.5', margin: 0 }}>
                {result.summary}
              </p>
            </div>
          </div>

          {/* Score Breakdown */}
          {result.checks && (
            <div style={{
              background: '#ffffff', borderRadius: '12px', padding: '20px',
              border: '1px solid #e5e7eb', display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '12px'
            }}>
              {Object.entries(result.checks).map(([key, val]) => (
                <div key={key} style={{ textAlign: 'center', padding: '12px', background: '#f9fafb', borderRadius: '8px' }}>
                  <div style={{ fontSize: '18px', fontWeight: '700', color: '#1e3a8a' }}>
                    {val.score}/{val.max}
                  </div>
                  <div style={{ fontSize: '11px', color: '#6b7280', marginTop: '4px', textTransform: 'capitalize' }}>
                    {val.label || key}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Skills Found */}
          {result.skillsFound?.length > 0 && (
            <div style={{ background: '#ffffff', borderRadius: '12px', padding: '20px', border: '1px solid #e5e7eb' }}>
              <h4 style={{ margin: '0 0 12px 0', fontSize: '14px', color: '#166534', fontWeight: '600' }}>
                ✅ Skills Found ({result.skillsFound.length})
              </h4>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                {result.skillsFound.map((skill, i) => (
                  <span key={i} style={{
                    padding: '6px 12px', background: '#d1fae5', color: '#166534',
                    borderRadius: '20px', fontSize: '12px', fontWeight: '600'
                  }}>
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Missing Skills */}
          {result.missingSkills?.length > 0 && (
            <div style={{ background: '#ffffff', borderRadius: '12px', padding: '20px', border: '1px solid #e5e7eb' }}>
              <h4 style={{ margin: '0 0 12px 0', fontSize: '14px', color: '#991b1b', fontWeight: '600' }}>
                ⚠️ Missing Skills ({result.missingSkills.length})
              </h4>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                {result.missingSkills.map((skill, i) => (
                  <span key={i} style={{
                    padding: '6px 12px', background: '#fee2e2', color: '#991b1b',
                    borderRadius: '20px', fontSize: '12px', fontWeight: '600'
                  }}>
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Suggestions */}
          {result.suggestions?.length > 0 && (
            <div style={{ background: '#ffffff', borderRadius: '12px', padding: '20px', border: '1px solid #e5e7eb' }}>
              <h4 style={{ margin: '0 0 12px 0', fontSize: '14px', color: '#92400e', fontWeight: '600' }}>
                💡 Suggestions
              </h4>
              <ul style={{ margin: 0, paddingLeft: '18px', color: '#4b5563', fontSize: '14px', lineHeight: '1.8' }}>
                {result.suggestions.map((s, i) => (
                  <li key={i}>{s}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Strengths & Weaknesses */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            {result.strengths?.length > 0 && (
              <div style={{ background: '#ffffff', borderRadius: '12px', padding: '20px', border: '1px solid #e5e7eb' }}>
                <h4 style={{ margin: '0 0 10px 0', fontSize: '14px', color: '#166534', fontWeight: '600' }}>💪 Strengths</h4>
                <ul style={{ margin: 0, paddingLeft: '18px', color: '#4b5563', fontSize: '13px', lineHeight: '1.7' }}>
                  {result.strengths.map((s, i) => <li key={i}>{s}</li>)}
                </ul>
              </div>
            )}
            {result.weaknesses?.length > 0 && (
              <div style={{ background: '#ffffff', borderRadius: '12px', padding: '20px', border: '1px solid #e5e7eb' }}>
                <h4 style={{ margin: '0 0 10px 0', fontSize: '14px', color: '#991b1b', fontWeight: '600' }}>📉 Weaknesses</h4>
                <ul style={{ margin: 0, paddingLeft: '18px', color: '#4b5563', fontSize: '13px', lineHeight: '1.7' }}>
                  {result.weaknesses.map((s, i) => <li key={i}>{s}</li>)}
                </ul>
              </div>
            )}
          </div>

        </div>
      )}
    </div>
  );
};

export default ResumeAnalyzer;