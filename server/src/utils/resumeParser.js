 const mammoth = require('mammoth');

// pdf-parse ko safely load karo (iska test file bug hota hai)
let pdfParse = null;
try {
  const pdfModule = require('pdf-parse');
  pdfParse = typeof pdfModule === 'function' ? pdfModule : (pdfModule?.default || pdfModule?.parse);
} catch (e) {
  console.error('⚠️ pdf-parse load failed:', e.message);
}

const SKILLS_DB = [
  'javascript', 'js', 'typescript', 'ts', 'python', 'java', 'c++', 'cpp', 'c', 'c#', 'csharp', 
  'go', 'golang', 'rust', 'ruby', 'php', 'swift', 'kotlin', 'dart',
  'html', 'css', 'react', 'reactjs', 'angular', 'vue', 'vuejs', 'nextjs', 'nodejs', 'node', 
  'express', 'expressjs', 'django', 'flask', 'spring', 'springboot',
  'mongodb', 'mysql', 'postgresql', 'sqlite', 'redis', 'firebase', 'dynamodb', 'oracle', 'sql',
  'docker', 'kubernetes', 'aws', 'azure', 'gcp', 'jenkins', 'git', 'github', 'gitlab', 
  'terraform', 'nginx',
  'machine learning', 'deep learning', 'tensorflow', 'pytorch', 'keras', 'opencv', 'pandas', 
  'numpy', 'matplotlib', 'seaborn', 'scikit-learn', 'nlp', 'data science',
  'react native', 'flutter', 'android', 'ios', 'xamarin',
  'linux', 'ubuntu', 'bash', 'shell scripting', 'rest api', 'graphql', 'websocket', 
  'microservices', 'blockchain', 'solidity',
  'dsa', 'data structures', 'algorithms', 'system design', 'oop', 'agile', 'scrum', 'jira',
  'frontend development', 'backend development', 'full stack', 'web development',
  'mongodb', 'mongoose', 'prisma', 'sequelize'
];

function normalizeSkill(skill) {
  const map = {
    'js': 'JavaScript', 'ts': 'TypeScript', 'cpp': 'C++', 'csharp': 'C#',
    'node': 'Node.js', 'reactjs': 'React', 'vuejs': 'Vue', 'golang': 'Go',
    'dsa': 'DSA', 'expressjs': 'Express.js', 'sql': 'SQL'
  };
  const lower = skill.toLowerCase();
  if (map[lower]) return map[lower];
  return skill.charAt(0).toUpperCase() + skill.slice(1);
}

function extractSkills(text) {
  if (!text || typeof text !== 'string') return [];
  const lowerText = text.toLowerCase();
  const found = new Set();

  SKILLS_DB.forEach(skill => {
    try {
      const escaped = skill.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const regex = new RegExp(`\\b${escaped}\\b`, 'i');
      if (regex.test(lowerText)) {
        found.add(normalizeSkill(skill));
      }
    } catch (e) { /* ignore bad regex */ }
  });

  return Array.from(found);
}

async function parseResume(buffer, mimetype) {
  let text = '';
  let parseError = null;

  try {
    if (mimetype === 'application/pdf') {
      if (!pdfParse) {
        parseError = 'PDF parser not available. Resume saved without parsing.';
      } else {
        // max: 0 prevents pdf-parse test file bug
        const data = await pdfParse(buffer, { max: 0 });
        text = data?.text || '';
        console.log('📄 PDF extracted text length:', text.length);
        if (!text.trim()) parseError = 'PDF has no text (might be scanned/image-based)';
      }
    } else if (
      mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' || 
      mimetype === 'application/msword'
    ) {
      const result = await mammoth.extractRawText({ buffer });
      text = result?.value || '';
      console.log('📄 DOCX extracted text length:', text.length);
      if (!text.trim()) parseError = 'Document has no extractable text';
    } else {
      parseError = 'Unsupported file type. Use PDF or DOCX.';
    }

    const skills = extractSkills(text);
    return { 
      textPreview: text.substring(0, 300), 
      skills, 
      skillCount: skills.length,
      parseError 
    };
  } catch (err) {
    console.error('❌ Parser error:', err.message);
    return { textPreview: '', skills: [], skillCount: 0, parseError: err.message };
  }
}

module.exports = { parseResume, extractSkills };