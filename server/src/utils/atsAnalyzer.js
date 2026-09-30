 const { parseResume } = require('./resumeParser');

// This is a practical ATS-style rubric, not an official ATS vendor formula.
// It intentionally rewards parseability, standard sections, relevant keywords,
// measurable impact and contact/education information.
const INDUSTRY_STANDARDS = {
  'Computer Science': [
    'JavaScript', 'TypeScript', 'React', 'Node.js', 'Python', 'Java', 'C++', 'SQL',
    'MongoDB', 'Git', 'HTML', 'CSS', 'Data Structures', 'Algorithms', 'System Design',
    'REST API', 'Express', 'Docker', 'AWS', 'Linux', 'DBMS', 'OOPS', 'Operating System',
    'Computer Networks'
  ],
  'Information Technology': [
    'Java', 'Python', 'JavaScript', 'SQL', 'Linux', 'Networking', 'Cloud', 'AWS',
    'Docker', 'Cybersecurity', 'Database Management', 'Git', 'REST API', 'React', 'Node.js'
  ],
  'Electronics': ['Embedded C', 'Arduino', 'IoT', 'MATLAB', 'VLSI', 'PCB Design', 'Signal Processing'],
  'Mechanical': ['AutoCAD', 'SolidWorks', 'CATIA', 'ANSYS', 'Thermodynamics', 'Manufacturing'],
  'Civil': ['AutoCAD', 'STAAD Pro', 'ETABS', 'Surveying', 'Structural Analysis', 'Revit'],
  default: ['Communication', 'Teamwork', 'Problem Solving', 'Leadership', 'Time Management']
};

const ACTION_VERBS = [
  'developed', 'implemented', 'designed', 'built', 'created', 'optimized', 'engineered',
  'automated', 'integrated', 'deployed', 'led', 'improved', 'reduced', 'increased',
  'resolved', 'analyzed', 'delivered', 'configured', 'tested', 'debugged'
];

const SECTION_PATTERNS = {
  contact: /(?:email|phone|mobile|linkedin|github|portfolio|contact)/i,
  summary: /(?:summary|objective|profile|about me)/i,
  skills: /(?:skills|technical skills|core competencies|technologies)/i,
  experience: /(?:experience|work experience|professional experience|internship|employment)/i,
  projects: /(?:projects|personal projects|academic projects|portfolio)/i,
  education: /(?:education|academic background|qualification|b\.?tech|b\.?e\.?|m\.?tech|degree)/i,
  certifications: /(?:certifications?|courses?|achievements?)/i
};

const normalise = (value) => String(value || '').toLowerCase().replace(/[._/-]+/g, ' ').replace(/\s+/g, ' ').trim();

function hasSkill(text, skill) {
  const source = normalise(text);
  const target = normalise(skill);
  if (!target) return false;
  // Avoid word-boundary issues for values such as C++, Node.js and .NET.
  return source.includes(target);
}

function uniqueSkills(text, skills = []) {
  const found = new Set();
  for (const skill of skills) found.add(skill);
  for (const skill of Object.values(INDUSTRY_STANDARDS).flat()) {
    if (hasSkill(text, skill)) found.add(skill);
  }
  return [...found];
}

function calculateATSScore(text, extractedSkills = [], branch = 'Computer Science') {
  const cleanText = String(text || '').replace(/\r/g, ' ').replace(/\n{3,}/g, '\n\n').trim();
  if (!cleanText) {
    throw new Error('Resume contains no extractable text. Please upload a text-based PDF/DOCX resume.');
  }

  const lower = cleanText.toLowerCase();
  const words = cleanText.split(/\s+/).filter(Boolean);
  const wordCount = words.length;
  const skills = uniqueSkills(cleanText, extractedSkills);
  const standardSkills = INDUSTRY_STANDARDS[branch] || INDUSTRY_STANDARDS.default;
  const matchedSkills = standardSkills.filter(skill => hasSkill(cleanText, skill));
  const missingSkills = standardSkills.filter(skill => !hasSkill(cleanText, skill));

  const checks = {};
  const suggestions = [];
  const strengths = [];
  const weaknesses = [];

  // 1) Contact information — 15
  const email = /\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/i.test(cleanText);
  const phone = /(?:\+?\d[\d\s().-]{8,}\d)/.test(cleanText);
  const linkedin = /linkedin\.com/i.test(cleanText);
  const github = /github\.com/i.test(cleanText);
  const contactScore = (email ? 5 : 0) + (phone ? 4 : 0) + (linkedin ? 3 : 0) + (github ? 3 : 0);
  checks.contact = { score: contactScore, max: 15, label: 'Contact & links' };
  if (contactScore >= 12) strengths.push('Contact details and professional links are ATS-readable.');
  if (!email) suggestions.push('Add a professional email address at the top of the resume.');
  if (!phone) suggestions.push('Add a reachable phone number.');
  if (!linkedin) suggestions.push('Add a LinkedIn URL.');
  if (!github && /software|developer|engineer|computer science|technology/i.test(cleanText)) suggestions.push('Add a GitHub/portfolio URL for technical roles.');

  // 2) Standard sections — 20
  const sectionWeights = { summary: 3, skills: 4, experience: 4, projects: 4, education: 3, certifications: 2 };
  let sectionScore = 0;
  const foundSections = [];
  for (const [section, weight] of Object.entries(sectionWeights)) {
    if (SECTION_PATTERNS[section].test(cleanText)) {
      sectionScore += weight;
      foundSections.push(section);
    } else {
      suggestions.push(`Add a clear ${section.charAt(0).toUpperCase() + section.slice(1)} section heading.`);
      weaknesses.push(`Missing/unclear ${section} section.`);
    }
  }
  checks.sections = { score: sectionScore, max: 20, found: foundSections, label: 'Standard sections' };
  if (sectionScore >= 16) strengths.push('Resume uses most standard ATS-friendly section headings.');

  // 3) Technical/relevant keywords — 25
  const skillScore = Math.round(Math.min(25, (matchedSkills.length / Math.min(standardSkills.length, 10)) * 25));
  checks.skills = { score: skillScore, max: 25, matched: matchedSkills.length, total: standardSkills.length, label: 'Relevant keywords' };
  if (matchedSkills.length >= 6) strengths.push(`Good technical keyword coverage for ${branch}.`);
  if (matchedSkills.length < 5) {
    weaknesses.push('Technical keyword coverage is limited for the selected branch.');
    suggestions.push(`Add role-relevant skills only when you genuinely have them, such as ${missingSkills.slice(0, 5).join(', ')}.`);
  }

  // 4) Impact and action language — 15
  const foundActionVerbs = ACTION_VERBS.filter(word => new RegExp(`\\b${word}\\b`, 'i').test(cleanText));
  const quantified = (cleanText.match(/\b\d+(?:\.\d+)?\s*(?:%|percent|x|k|m|lpa|users|requests|ms|seconds?|days?|months?|projects?|members?)\b/gi) || []).length;
  const impactScore = Math.min(15, Math.round((Math.min(foundActionVerbs.length, 6) / 6) * 10) + Math.min(5, quantified));
  checks.impact = { score: impactScore, max: 15, actionVerbs: foundActionVerbs, quantifiedAchievements: quantified, label: 'Impact & achievements' };
  if (foundActionVerbs.length >= 4 && quantified >= 2) strengths.push('Uses action-oriented and measurable achievement language.');
  if (foundActionVerbs.length < 3) suggestions.push('Use action verbs such as built, implemented, optimized, deployed and improved.');
  if (quantified < 2) suggestions.push('Quantify achievements where possible (%, users, latency, revenue, time saved, etc.).');

  // 5) Education — 10
  const degree = /\b(b\.?tech|b\.?e\.?|m\.?tech|m\.?e\.?|bachelor|master|bsc|msc|bca|mca)\b/i.test(cleanText);
  const yearCount = (cleanText.match(/\b(?:19|20)\d{2}\b/g) || []).length;
  const educationScore = (degree ? 7 : 0) + (yearCount >= 1 ? 3 : 0);
  checks.education = { score: educationScore, max: 10, degreePresent: degree, yearsFound: yearCount, label: 'Education' };
  if (!degree) suggestions.push('Add your degree and university/college in a clear Education section.');

  // 6) Length & readability — 10
  let lengthScore = 0;
  if (wordCount >= 300 && wordCount <= 800) lengthScore = 5;
  else if (wordCount >= 200 && wordCount < 300) lengthScore = 4;
  else if (wordCount > 800 && wordCount <= 1100) lengthScore = 4;
  else if (wordCount >= 120) lengthScore = 2;
  checks.length = { score: lengthScore, max: 5, words: wordCount, label: 'Length' };
  if (wordCount < 200) suggestions.push('Resume is too short for most entry-level roles; aim for roughly 300–800 words when appropriate.');
  if (wordCount > 1100) suggestions.push('Resume is long; remove repetitive bullets and keep the strongest evidence.');

  const bulletLike = (cleanText.match(/(?:^|\n)\s*(?:[•●▪◦*-]|\d+[.)])\s+/g) || []).length;
  const specialNoise = (cleanText.match(/[|{}<>]{3,}/g) || []).length;
  const readabilityScore = (bulletLike >= 4 ? 3 : bulletLike >= 1 ? 2 : 0) + (specialNoise === 0 ? 2 : 1);
  checks.readability = { score: readabilityScore, max: 5, bullets: bulletLike, label: 'ATS readability' };
  if (bulletLike < 3) suggestions.push('Use concise bullet points instead of dense paragraphs.');

  // 7) Parseability — 5
  const parseabilityScore = cleanText.length >= 1000 ? 5 : cleanText.length >= 500 ? 4 : 2;
  checks.parseability = { score: parseabilityScore, max: 5, charactersExtracted: cleanText.length, label: 'Text parseability' };
  if (parseabilityScore < 4) weaknesses.push('Very little text could be extracted; an image-only/scanned resume can score poorly in ATS systems.');

  const score = Math.max(0, Math.min(100,
    contactScore + sectionScore + skillScore + impactScore + educationScore + lengthScore + readabilityScore + parseabilityScore
  ));

  const grade = score >= 85 ? 'A' : score >= 70 ? 'B' : score >= 55 ? 'C' : 'D';
  const summary = score >= 85
    ? 'Strong ATS-style structure and keyword coverage. Keep tailoring the resume to each job description.'
    : score >= 70
      ? 'Good ATS foundation, but a few targeted improvements can increase keyword coverage and impact.'
      : score >= 55
        ? 'The resume is parseable but needs stronger structure, relevant keywords and measurable achievements.'
        : 'The resume needs significant ATS-focused improvements before relying on it for applications.';

  return {
    atsScore: score,
    maxScore: 100,
    grade,
    summary,
    checks,
    skillsFound: skills,
    matchedSkills,
    missingSkills: missingSkills.slice(0, 10),
    suggestions: [...new Set(suggestions)].slice(0, 10),
    strengths: [...new Set(strengths)].slice(0, 8),
    weaknesses: [...new Set(weaknesses)].slice(0, 8),
    wordCount,
    branch
  };
}

async function analyzeResume(buffer, mimetype, branch = 'Computer Science') {
  const parsed = await parseResume(buffer, mimetype);
  if (parsed.parseError) {
    throw new Error(parsed.parseError);
  }
  if (!parsed.textPreview || parsed.textPreview.trim().length < 100) {
    throw new Error('Invalid resume: not enough readable text was extracted. Please upload a proper text-based PDF/DOCX resume.');
  }

  const analysis = calculateATSScore(parsed.textPreview, parsed.skills || [], branch);
  return {
    ...analysis,
    extractedText: parsed.textPreview,
    parseWarning: parsed.parseError || null
  };
}

module.exports = { analyzeResume, calculateATSScore, INDUSTRY_STANDARDS };
