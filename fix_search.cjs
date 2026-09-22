const fs = require('fs');
let content = fs.readFileSync('src/components/QuizContainer.tsx', 'utf8');

content = content.replace(
  '(q.questionMarathi && q.questionMarathi.toLowerCase().includes(searchQuery.toLowerCase()))',
  `((q.translations && q.translations[selectedLanguage.code]?.question.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (q.questionMarathi && q.questionMarathi.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (q.questionTranslated && q.questionTranslated.toLowerCase().includes(searchQuery.toLowerCase())))`
);

fs.writeFileSync('src/components/QuizContainer.tsx', content, 'utf8');
console.log("Fixed search logic in QuizContainer.tsx");
