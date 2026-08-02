 const Groq = require('groq-sdk');

// ============================================
// SAFETY: Resume parser ko safely import karo
// Agar import fail ho toh fallback function use karo
// ============================================
let parseResume;
try {
  const parser = require('./resumeParser');
  parseResume = parser.parseResume;
  if (typeof parseResume !== 'function') {
    console.warn('⚠️ parseResume is not a function, using fallback');
    parseResume = async () => ({ textPreview: '', skills: [], parseError: 'Parser not available' });
  }
} catch (e) {
  console.warn('⚠️ resumeParser import failed:', e.message);
  parseResume = async () => ({ textPreview: '', skills: [], parseError: 'Parser not available' });
}

// ============================================
// GROQ CLIENT INIT
// ============================================
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

const MODELS = [
  'llama-3.1-8b-instant',
  'llama-3.3-70b-versatile',
  'mixtral-8x7b-32768'
];

async function getWorkingModel() {
  for (const model of MODELS) {
    try {
      await groq.chat.completions.create({
        model,
        messages: [{ role: 'user', content: 'Hi' }],
        max_tokens: 5
      });
      console.log('✅ Groq model active:', model);
      return model;
    } catch (err) {
      if (err.message?.includes('decommissioned') || err.status === 404) {
        console.log('❌ Model decommissioned:', model);
        continue;
      }
      throw err;
    }
  }
  throw new Error('No Groq model available. Check API key at console.groq.com');
}

function extractJSON(text) {
  let cleaned = text
    .replace(/```json\s*/gi, '')
    .replace(/```\s*/gi, '')
    .trim();

  try {
    if (cleaned.startsWith('[') || cleaned.startsWith('{')) {
      return JSON.parse(cleaned);
    }
    const arrMatch = cleaned.match(/\[[\s\S]*\]/);
    const objMatch = cleaned.match(/\{[\s\S]*\}/);
    if (arrMatch) return JSON.parse(arrMatch[0]);
    if (objMatch) return JSON.parse(objMatch[0]);
  } catch (e) {
    console.error('JSON parse failed:', e.message);
  }
  throw new Error('AI se valid JSON nahi mila');
}

async function callGroq(prompt) {
  const model = await getWorkingModel();
  const chat = await groq.chat.completions.create({
    model,
    messages: [{ role: 'user', content: prompt }],
    temperature: 0.7,
    max_tokens: 2500,
  });
  return chat.choices[0].message.content;
}

// ============================================
// AI RESUME ANALYZER
// ============================================
async function analyzeResumeWithAI(buffer, mimetype, branch, role = 'Software Engineer') {
  try {
    // STEP 1: Parse resume
    const parsed = await parseResume(buffer, mimetype);
    const text = parsed.textPreview || '';
    const skills = parsed.skills || [];

    console.log('📄 Resume parsed — Text length:', text.length, '| Skills found:', skills.length);

    if (!text.trim() && !skills.length) {
      throw new Error(parsed.parseError || 'Resume se text extract nahi ho paaya. Text-based PDF upload karo.');
    }

    // STEP 2: AI Prompt
    const prompt = `You are an expert ATS analyzer. Analyze this resume for a ${branch} student targeting ${role}.

Resume Text:
${text.substring(0, 4500)}

Extracted Skills: ${skills.join(', ') || 'None'}

Return ONLY JSON:
{
  "atsScore": 72,
  "grade": "B",
  "skillsFound": ["JavaScript", "React"],
  "missingSkills": ["Docker", "AWS"],
  "suggestions": ["Add metrics", "Include GitHub"],
  "summary": "Strong skills but needs...",
  "strengths": ["Good projects"],
  "weaknesses": ["No numbers"]
}

Return ONLY the JSON object. Nothing else.`;

    const response = await callGroq(prompt);
    console.log('🤖 AI Response preview:', response.substring(0, 300));

    const data = extractJSON(response);
    const atsScore = Number(data.atsScore) || 0;

    return {
      atsScore,
      grade: data.grade || 'C',
      skillsFound: Array.isArray(data.skillsFound) ? data.skillsFound : [],
      missingSkills: Array.isArray(data.missingSkills) ? data.missingSkills : [],
      suggestions: Array.isArray(data.suggestions) ? data.suggestions : [],
      summary: data.summary || '',
      strengths: Array.isArray(data.strengths) ? data.strengths : [],
      weaknesses: Array.isArray(data.weaknesses) ? data.weaknesses : [],
      checks: {
        skills:   { score: Math.round((atsScore / 100) * 30), max: 30, label: 'Skills Match' },
        sections: { score: Math.round((atsScore / 100) * 25), max: 25, label: 'Experience' },
        keywords: { score: Math.round((atsScore / 100) * 20), max: 20, label: 'Keywords' },
        length:   { score: Math.round((atsScore / 100) * 15), max: 15, label: 'Length' },
        format:   { score: Math.round((atsScore / 100) * 10), max: 10, label: 'Format' }
      },
      aiSuccess: true
    };

  } catch (err) {
    console.error('❌ Resume Analysis Error:', err.message);
    return {
      atsScore: 0, grade: 'N/A',
      skillsFound: [], missingSkills: [],
      suggestions: ['⚠️ AI analysis failed. Try again.'],
      summary: `Error: ${err.message}`,
      strengths: [], weaknesses: [],
      checks: {
        skills: { score: 0, max: 30, label: 'Skills Match' },
        sections: { score: 0, max: 25, label: 'Experience' },
        keywords: { score: 0, max: 20, label: 'Keywords' },
        length: { score: 0, max: 15, label: 'Length' },
        format: { score: 0, max: 10, label: 'Format' }
      },
      aiSuccess: false
    };
  }
}

async function generateInterviewQuestionsWithAI(role, skills, count = 10) {
  const prompt = `Generate ${count} interview questions for "${role}". Skills: ${skills?.join(', ') || 'General'}

Mix: 40% Technical, 30% Coding, 20% System Design, 10% HR.

Return ONLY JSON array:
[{"q": "...", "type": "Technical", "difficulty": "Medium"}]

Return ONLY JSON array. No markdown.`;

  const response = await callGroq(prompt);
  return extractJSON(response);
}

async function chatWithAI(message, history = []) {
  const cleanHistory = [];
  let expectUser = true;
  for (const h of history) {
    const role = h.role === 'user' ? 'user' : 'assistant';
    if ((expectUser && role === 'user') || (!expectUser && role === 'assistant')) {
      cleanHistory.push({ role, content: h.text });
      expectUser = !expectUser;
    }
  }
  if (cleanHistory.length > 0 && cleanHistory[cleanHistory.length - 1].role === 'user') {
    cleanHistory.pop();
  }

  const model = await getWorkingModel();
  const chat = await groq.chat.completions.create({
    model,
    messages: [...cleanHistory, { role: 'user', content: message }],
    temperature: 0.7,
    max_tokens: 2000,
  });
  return chat.choices[0].message.content;
}

module.exports = {
  analyzeResumeWithAI,
  generateInterviewQuestionsWithAI,
  chatWithAI,
};