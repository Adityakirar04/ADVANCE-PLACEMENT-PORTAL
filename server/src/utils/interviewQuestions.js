 const QUESTION_BANK = {
  'Java Developer': {
    technical: [
      'Explain JVM, JRE, and JDK.',
      'What is the difference between == and .equals() in Java?',
      'Explain the concept of OOPs in Java.',
      'What are HashMap and ConcurrentHashMap? Difference?',
      'Explain Java 8 features: Streams, Lambda, Optional.',
      'What is multithreading? How to create a thread?',
      'Explain Spring Boot dependency injection.',
      'What is REST API? How to build one in Spring Boot?',
      'Difference between ArrayList and LinkedList.',
      'What is garbage collection in Java?'
    ],
    coding: [
      'Write a program to reverse a string.',
      'Find the first non-repeating character in a string.',
      'Implement a singleton design pattern.',
      'Write code for binary search.',
      'Detect a loop in a linked list.',
      'Find the middle element of a linked list.',
      'Two sum problem: Find pair with given sum.',
      'Merge two sorted arrays.'
    ],
    hr: [
      'Tell me about yourself.',
      'Why do you want to join our company?',
      'Where do you see yourself in 5 years?',
      'What are your strengths and weaknesses?',
      'Why should we hire you?'
    ]
  },
  'React Developer': {
    technical: [
      'What is Virtual DOM and how does it work?',
      'Explain useState, useEffect, and useContext hooks.',
      'Difference between props and state.',
      'What is Redux? Explain store, action, reducer.',
      'How to optimize React app performance?',
      'Explain React Router and its types.',
      'What are Higher Order Components (HOC)?',
      'Difference between class and functional components.',
      'What is JSX? Why use it?',
      'Explain React lifecycle methods.'
    ],
    coding: [
      'Create a custom hook for API fetching.',
      'Build a todo list with add/delete functionality.',
      'Implement a search filter on a list.',
      'Create a counter with increment/decrement/reset.',
      'Build a modal component.'
    ],
    hr: [
      'Tell me about yourself.',
      'Why React and not Angular/Vue?',
      'Describe a challenging bug you fixed.',
      'How do you keep up with new React updates?'
    ]
  },
  'Node.js Developer': {
    technical: [
      'What is the event loop in Node.js?',
      'Difference between require and import.',
      'Explain middleware in Express.js.',
      'How to handle errors in async/await?',
      'What is JWT and how to implement authentication?',
      'Difference between SQL and NoSQL databases.',
      'Explain clustering in Node.js.',
      'What is stream and buffer in Node.js?'
    ],
    coding: [
      'Create a REST API with CRUD operations.',
      'Build a file upload system.',
      'Implement JWT authentication middleware.',
      'Create a real-time chat using Socket.io.'
    ],
    hr: [
      'Tell me about a project you built with Node.js.',
      'How do you handle production crashes?',
      'Difference between development and production?'
    ]
  },
  'Python Developer': {
    technical: [
      'What are decorators in Python?',
      'Explain list comprehension with example.',
      'Difference between list and tuple.',
      'What is GIL (Global Interpreter Lock)?',
      'Explain Django MVT architecture.',
      'What are *args and **kwargs?',
      'Difference between deep copy and shallow copy.',
      'Explain generators and iterators.'
    ],
    coding: [
      'Write a function to check palindrome.',
      'Find factorial using recursion.',
      'Sort a dictionary by values.',
      'Read a CSV file and process data.'
    ],
    hr: [
      'Why Python over Java/JavaScript?',
      'Tell me about your Python projects.',
      'How do you handle large datasets in Python?'
    ]
  },
  'Data Scientist': {
    technical: [
      'Difference between supervised and unsupervised learning.',
      'Explain bias-variance tradeoff.',
      'What is overfitting? How to prevent it?',
      'Explain confusion matrix, precision, recall.',
      'Difference between classification and regression.',
      'What is feature scaling? Why needed?',
      'Explain PCA (Principal Component Analysis).',
      'What is cross-validation?'
    ],
    coding: [
      'Load a dataset and show first 5 rows (pandas).',
      'Handle missing values in a dataset.',
      'Plot a histogram using matplotlib/seaborn.',
      'Train a simple linear regression model.'
    ],
    hr: [
      'Explain a data science project end-to-end.',
      'How do you explain ML models to non-technical people?',
      'What is your approach to a new dataset?'
    ]
  },
  'Full Stack Developer': {
    technical: [
      'Explain MVC architecture.',
      'How does the browser render a webpage?',
      'What is CORS and how to handle it?',
      'Difference between SQL Joins.',
      'Explain Docker and containerization.',
      'What is CI/CD? Tools you have used?',
      'How to optimize database queries?',
      'Explain microservices vs monolith.'
    ],
    coding: [
      'Build a login system with JWT.',
      'Create a CRUD app with React + Node.',
      'Implement pagination in an API.',
      'Build a real-time notification system.'
    ],
    hr: [
      'How do you manage frontend and backend together?',
      'Tell me about a full-stack project.',
      'How do you handle tight deadlines?'
    ]
  },
  'SDE': {
    technical: [
      'Explain DSA complexity: Time vs Space.',
      'What is hashing? Collision resolution techniques?',
      'Explain BST, AVL, Red-Black trees.',
      'Difference between BFS and DFS.',
      'Explain dynamic programming with example.',
      'What is deadlock? How to prevent?',
      'Explain OS scheduling algorithms.',
      'TCP vs UDP difference.'
    ],
    coding: [
      'Reverse a linked list.',
      'Find LCA in a binary tree.',
      'Longest common subsequence (LCS).',
      'Implement LRU Cache.',
      'Merge K sorted lists.'
    ],
    hr: [
      'Why do you want to be a software engineer?',
      'How do you approach a new problem?',
      'Tell me about a time you failed and learned.'
    ]
  }
};

const DEFAULT_ROLE = 'SDE';

function getInterviewQuestions(role, count = 10) {
  const roleData = QUESTION_BANK[role] || QUESTION_BANK[DEFAULT_ROLE];
  
  const allQuestions = [
    ...(roleData.technical || []).map(q => ({ q, type: 'Technical' })),
    ...(roleData.coding || []).map(q => ({ q, type: 'Coding' })),
    ...(roleData.hr || []).map(q => ({ q, type: 'HR/Behavioral' }))
  ];

  const shuffled = allQuestions.sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
}

function getAllRoles() {
  return Object.keys(QUESTION_BANK);
}

module.exports = { getInterviewQuestions, getAllRoles, QUESTION_BANK };