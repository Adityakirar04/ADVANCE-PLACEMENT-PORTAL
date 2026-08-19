 // server/src/utils/groqAI.js
const Groq = require('groq-sdk');

// ============================================
// GROQ AI CONFIGURATION
// ============================================

const GROQ_API_KEY = process.env.GROQ_API_KEY;

if (!GROQ_API_KEY) {
  console.error("❌ GROQ_API_KEY not found in .env file!");
  console.error("   Get your free API key from: https://console.groq.com/keys");
  console.error("   Add this to your server/.env file:");
  console.error("   GROQ_API_KEY=gsk_your_actual_key_here");
}

let groq = null;
try {
  if (GROQ_API_KEY) {
    groq = new Groq({ apiKey: GROQ_API_KEY });
    console.log("✅ Groq SDK initialized");
  }
} catch (err) {
  console.error("❌ Groq SDK init failed:", err.message);
}

// ============================================
// WORKING MODELS (Aug 2026) — All old models decommissioned
// ============================================
// Order: Fast/Cheap first → Powerful last
const MODELS = [
  'openai/gpt-oss-20b',      // Fast, cheap, great for chat
  'groq/groq/compound-mini', // Groq's own small model
  'openai/gpt-oss-120b',     // Powerful, for complex tasks
  'qwen/qwen3.6-27b',        // Good alternative
  'groq/groq/compound'       // Groq's own large model
];

// ============================================
// CORE: Call Groq with model fallback
// ============================================
const callGroq = async (messages, options = {}) => {
  if (!groq) {
    throw new Error('Groq API key missing. Add GROQ_API_KEY to server/.env');
  }

  let lastError = null;

  for (const model of MODELS) {
    try {
      console.log(`🤖 Trying model: ${model}`);

      const completion = await groq.chat.completions.create({
        messages,
        model,
        temperature: options.temperature ?? 0.3,
        max_tokens: options.max_tokens ?? 2000,
        response_format: options.jsonMode ? { type: 'json_object' } : undefined
      });

      console.log(`✅ Model ${model} responded successfully`);
      return completion;

    } catch (err) {
      lastError = err;
      console.warn(`⚠️  Model ${model} failed:`, err.message);

      // Auth error = stop immediately
      if (err.status === 401) {
        throw new Error('Invalid Groq API key. Check console.groq.com/keys');
      }

      // Rate limit = stop
      if (err.status === 429) {
        throw new Error('Groq rate limit reached. Wait a few seconds and try again.');
      }

      // Model not found/decommissioned = try next
      if (err.status === 404 || err.message?.includes('decommissioned') || err.message?.includes('model')) {
        console.warn(`   → Model ${model} not available, trying next...`);
        continue;
      }

      // Other error = try next model
      continue;
    }
  }

  throw new Error(`All models failed. Last error: ${lastError?.message}`);
};

// ============================================
// 1. RESUME ANALYZER
// ============================================
const analyzeResume = async (resumeText, jobDescription = '') => {
  const prompt = `You are an expert HR recruiter. Analyze this resume and return JSON.

RESUME:
${resumeText.substring(0, 3000)}

${jobDescription ? `JOB:
${jobDescription.substring(0, 1000)}
` : ''}

Return ONLY this JSON:
{
  "skills_found": ["skill1", "skill2"],
  "skills_missing": ["skill3"],
  "match_score": 75,
  "strengths": "...",
  "improvements": "...",
  "overall_feedback": "..."
}`;

  const completion = await callGroq(
    [{ role: 'user', content: prompt }],
    { temperature: 0.2, max_tokens: 1500, jsonMode: true }
  );

  const parsed = JSON.parse(completion.choices[0].message.content);
  return {
    skills_found: parsed.skills_found || [],
    skills_missing: parsed.skills_missing || [],
    match_score: typeof parsed.match_score === 'number' ? parsed.match_score : 50,
    strengths: parsed.strengths || '',
    improvements: parsed.improvements || '',
    overall_feedback: parsed.overall_feedback || ''
  };
};

// ============================================
// 2. INTERVIEW PREP
// ============================================
const generateInterviewQuestions = async (role, experience = 'entry') => {
  const prompt = `Generate 10 interview questions for ${role} (${experience} level).

Return ONLY this JSON:
{
  "questions": [
    {
      "question": "...",
      "type": "technical",
      "difficulty": "easy",
      "hint": "..."
    }
  ]
}`;

  const completion = await callGroq(
    [{ role: 'user', content: prompt }],
    { temperature: 0.4, max_tokens: 2000, jsonMode: true }
  );

  const parsed = JSON.parse(completion.choices[0].message.content);
  return { questions: parsed.questions || [] };
};

// ============================================
// 3. AI CHAT
// ============================================
const chatWithAI = async (message, chatHistory = []) => {
  const systemPrompt = `You are an AI Placement Assistant for "Smart Placement" college portal.
Help students with resume tips, interview prep, career guidance, and technical concepts.
Be friendly, helpful, and concise. Reply in Hinglish if user uses Hindi.
Keep responses under 300 words.`;

  const messages = [
    { role: 'system', content: systemPrompt },
    ...chatHistory.slice(-6).map(msg => ({
      role: msg.role,
      content: msg.content
    })),
    { role: 'user', content: message }
  ];

  const completion = await callGroq(
    messages,
    { temperature: 0.7, max_tokens: 1000 }
  );

  return {
    response: completion.choices[0].message.content,
    success: true
  };
};

// ============================================
// EXPORTS
// ============================================
module.exports = {
  analyzeResume,
  generateInterviewQuestions,
  chatWithAI,
  groqInitialized: !!groq
};