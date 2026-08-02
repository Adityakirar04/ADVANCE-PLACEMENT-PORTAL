 const { parseResume } = require('./resumeParser');

const INDUSTRY_STANDARDS = {
  'Computer Science': [
    'JavaScript', 'React', 'Node.js', 'Python', 'Java', 'C++', 'SQL', 'MongoDB',
    'Git', 'HTML', 'CSS', 'Data Structures', 'Algorithms', 'System Design'
  ],
  'Information Technology': [
    'Java', 'Python', 'SQL', 'Linux', 'Networking', 'Cloud', 'AWS', 'Docker',
    'Cybersecurity', 'Database Management'
  ],
  'Electronics': [
    'Embedded C', 'Arduino', 'IoT', 'MATLAB', 'VLSI', 'PCB Design', 'Signal Processing'
  ],
  'Mechanical': [
    'AutoCAD', 'SolidWorks', 'CATIA', 'ANSYS', 'Thermodynamics', 'Manufacturing'
  ],
  'Civil': [
    'AutoCAD', 'STAAD Pro', 'ETABS', 'Surveying', 'Structural Analysis', 'Revit'
  ],
  'default': [
    'Communication', 'Teamwork', 'Problem Solving', 'Leadership', 'Time Management'
  ]
};

function calculateATSScore(text, skills, branch = 'Computer Science') {
  const lowerText = text.toLowerCase();
  let score = 0;
  const suggestions = [];
  const checks = {};

  // 1. Skills Match (30 points)
  const standardSkills = INDUSTRY_STANDARDS[branch] || INDUSTRY_STANDARDS['default'];
  const matchedSkills = skills.filter(s => 
    standardSkills.some(std => std.toLowerCase() === s.toLowerCase())
  );
  const skillScore = Math.min(30, (matchedSkills.length / Math.min(standardSkills.length, 8)) * 30);
  score += skillScore;
  checks.skills = { score: Math.round(skillScore), max: 30, matched: matchedSkills.length, total: standardSkills.length };

  if (matchedSkills.length < 3) {
    suggestions.push('⚠️ Add more technical skills relevant to your branch (e.g., ' + 
      standardSkills.slice(0, 5).join(', ') + ')');
  }

  // 2. Section Completeness (25 points)
  const sections = {
    education: /\b(education|academic|qualification|degree|b\.?tech|b\.?e\.?|m\.?tech)\b/i,
    skills: /\b(skills|technical skills|core competencies)\b/i,
    projects: /\b(project|projects|portfolio)\b/i,
    experience: /\b(internship|experience|work|training)\b/i,
    contact: /\b(email|phone|linkedin|github|contact)\b/i
  };

  let sectionScore = 0;
  const foundSections = [];
  for (const [name, regex] of Object.entries(sections)) {
    if (regex.test(lowerText)) {
      sectionScore += 5;
      foundSections.push(name);
    } else {
      suggestions.push(`❌ Missing section: ${name.charAt(0).toUpperCase() + name.slice(1)}`);
    }
  }
  score += sectionScore;
  checks.sections = { score: sectionScore, max: 25, found: foundSections };

  // 3. Keyword Density (20 points)
  const powerWords = ['developed', 'implemented', 'designed', 'optimized', 'led', 'created', 
    'managed', 'built', 'achieved', 'improved', 'resolved', 'analyzed'];
  const foundWords = powerWords.filter(w => lowerText.includes(w));
  const keywordScore = Math.min(20, (foundWords.length / 5) * 20);
  score += keywordScore;
  checks.keywords = { score: Math.round(keywordScore), max: 20, found: foundWords };

  if (foundWords.length < 3) {
    suggestions.push('💡 Use more action verbs: developed, implemented, optimized, led, achieved');
  }

  // 4. Resume Length (15 points)
  const wordCount = text.split(/\s+/).length;
  let lengthScore = 0;
  if (wordCount >= 200 && wordCount <= 800) lengthScore = 15;
  else if (wordCount > 800) lengthScore = 10;
  else if (wordCount >= 100) lengthScore = 8;
  else lengthScore = 5;
  score += lengthScore;
  checks.length = { score: lengthScore, max: 15, words: wordCount };

  if (wordCount < 200) {
    suggestions.push('📝 Resume too short. Aim for 300-600 words. Add more details about projects.');
  } else if (wordCount > 800) {
    suggestions.push('✂️ Resume too long. Keep it concise (1-2 pages max).');
  }

  // 5. Format Quality (10 points)
  let formatScore = 10;
  if (!lowerText.includes('•') && !lowerText.includes('-') && !lowerText.includes('*')) {
    formatScore -= 3;
    suggestions.push('📋 Use bullet points (•) for better readability');
  }
  if ((lowerText.match(/\d{4}/g) || []).length < 2) {
    formatScore -= 2;
    suggestions.push('📅 Add dates (YYYY) for education and projects');
  }
  if (!/\b(https?:\/\/|www\.|linkedin\.com|github\.com)\b/i.test(text)) {
    formatScore -= 3;
    suggestions.push('🔗 Add LinkedIn/GitHub links');
  }
  if (formatScore < 0) formatScore = 0;
  score += formatScore;
  checks.format = { score: formatScore, max: 10 };

  const missingSkills = standardSkills.filter(std => 
    !skills.some(s => s.toLowerCase() === std.toLowerCase())
  );

  return {
    atsScore: Math.round(score),
    maxScore: 100,
    grade: score >= 80 ? 'A' : score >= 60 ? 'B' : score >= 40 ? 'C' : 'D',
    checks,
    skillsFound: skills,
    matchedSkills,
    missingSkills: missingSkills.slice(0, 8),
    suggestions: suggestions.length ? suggestions : ['✅ Great resume! Keep it updated regularly.'],
    wordCount
  };
}

async function analyzeResume(buffer, mimetype, branch = 'Computer Science') {
  const parsed = await parseResume(buffer, mimetype);
  const analysis = calculateATSScore(parsed.textPreview || '', parsed.skills || [], branch);
  return {
    ...analysis,
    extractedText: parsed.textPreview,
    parseWarning: parsed.parseError
  };
}

module.exports = { analyzeResume, calculateATSScore, INDUSTRY_STANDARDS };