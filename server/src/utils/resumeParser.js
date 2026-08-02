 const mammoth = require('mammoth');

// ============================================
// PDF-PARSE: Ultra robust import
// pdf-parse ka structure har version mein alag hota hai
// ============================================
let pdfParse;
try {
  const pdfModule = require('pdf-parse');
  // Check all possible export patterns
  if (typeof pdfModule === 'function') {
    pdfParse = pdfModule;
  } else if (pdfModule.default && typeof pdfModule.default === 'function') {
    pdfParse = pdfModule.default;
  } else if (pdfModule.parse && typeof pdfModule.parse === 'function') {
    pdfParse = pdfModule.parse;
  } else {
    // Last resort: try to find any function in the module
    const keys = Object.keys(pdfModule);
    for (const key of keys) {
      if (typeof pdfModule[key] === 'function') {
        pdfParse = pdfModule[key];
        break;
      }
    }
  }
} catch (e) {
  console.error('pdf-parse import failed:', e.message);
}

// ============================================
// SKILLS DATABASE
// ============================================
const SKILLS_DB = [
  'javascript', 'js', 'typescript', 'ts', 'python', 'java', 'c++', 'c#', 'go', 'rust',
  'ruby', 'php', 'swift', 'kotlin', 'dart', 'scala', 'perl', 'r',
  'react', 'reactjs', 'angular', 'vue', 'vuejs', 'svelte', 'nextjs', 'nuxtjs',
  'node', 'nodejs', 'express', 'nestjs', 'fastify', 'django', 'flask', 'spring',
  'spring boot', 'laravel', 'rails', 'asp.net', 'dotnet',
  'mongodb', 'mongoose', 'mysql', 'postgresql', 'sqlite', 'redis', 'firebase',
  'dynamodb', 'cassandra', 'elasticsearch', 'neo4j',
  'aws', 'azure', 'gcp', 'google cloud', 'heroku', 'vercel', 'netlify', 'digitalocean',
  'docker', 'kubernetes', 'jenkins', 'github actions', 'gitlab ci', 'circleci',
  'terraform', 'ansible', 'puppet', 'chef',
  'git', 'github', 'gitlab', 'bitbucket',
  'html', 'html5', 'css', 'css3', 'sass', 'scss', 'less', 'tailwind', 'bootstrap',
  'material ui', 'mui', 'chakra ui', 'ant design',
  'redux', 'zustand', 'mobx', 'recoil', 'context api',
  'graphql', 'apollo', 'rest api', 'restful', 'soap', 'grpc', 'websocket',
  'jest', 'mocha', 'chai', 'cypress', 'playwright', 'selenium', 'junit', 'pytest',
  'webpack', 'vite', 'rollup', 'parcel', 'babel', 'esbuild',
  'linux', 'ubuntu', 'centos', 'bash', 'shell', 'powershell',
  'nginx', 'apache', 'tomcat', 'iis',
  'tensorflow', 'pytorch', 'keras', 'scikit-learn', 'pandas', 'numpy',
  'matplotlib', 'seaborn', 'opencv', 'nltk', 'spacy',
  'tableau', 'powerbi', 'power bi', 'excel', 'spss',
  'figma', 'sketch', 'adobe xd', 'photoshop', 'illustrator',
  'jira', 'trello', 'asana', 'notion', 'confluence',
  'agile', 'scrum', 'kanban', 'devops', 'ci/cd', 'tdd', 'bdd',
  'microservices', 'serverless', 'lambda', 'monolith',
  'oauth', 'jwt', 'sso', 'ldap', 'auth0', 'firebase auth',
  'seo', 'analytics', 'google analytics', 'gtm',
  'blockchain', 'solidity', 'ethereum', 'web3', 'smart contracts',
  'unity', 'unreal engine', 'blender', 'maya', '3ds max',
  'c', 'sql', 'nosql', 'oracle', 'db2', 'mariadb',
  'flutter', 'react native', 'ionic', 'xamarin',
  'android', 'ios',
  'data structures', 'algorithms', 'dsa', 'oops', 'operating system', 'os',
  'computer networks', 'cn', 'dbms', 'compiler design',
  'machine learning', 'deep learning', 'nlp', 'computer vision',
  'excel', 'word', 'powerpoint', 'ms office'
];

function extractSkills(text) {
  const found = new Set();
  const lowerText = text.toLowerCase();

  for (const skill of SKILLS_DB) {
    const escaped = skill.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(`\\b${escaped}\\b`, 'i');
    if (regex.test(lowerText)) {
      found.add(skill);
    }
  }

  return Array.from(found);
}

async function parseResume(buffer, mimetype) {
  let text = '';
  let parseError = null;

  try {
    if (mimetype === 'application/pdf') {
      // 🔥 ULTRA ROBUST: pdf-parse ko multiple tareeko se try karo
      if (!pdfParse) {
        throw new Error('pdf-parse not available. Run: npm install pdf-parse@1.1.1');
      }

      const data = await pdfParse(buffer);
      text = data?.text || data?.content || '';

      if (!text) {
        throw new Error('PDF parsed but no text extracted. Try a text-based PDF.');
      }
    } 
    else if (
      mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
      mimetype === 'application/msword'
    ) {
      const result = await mammoth.extractRawText({ buffer });
      text = result.value || '';
    } 
    else {
      parseError = 'Unsupported file type. Only PDF and DOCX allowed.';
    }
  } catch (err) {
    console.error('Resume parse error:', err.message);
    parseError = `Failed to parse resume: ${err.message}`;
  }

  const skills = text ? extractSkills(text) : [];

  return {
    textPreview: text,
    skills,
    parseError
  };
}

module.exports = { parseResume, extractSkills };