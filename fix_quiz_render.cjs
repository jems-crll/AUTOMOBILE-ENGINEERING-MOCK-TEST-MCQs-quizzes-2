const fs = require('fs');
let content = fs.readFileSync('src/components/QuizContainer.tsx', 'utf8');

// Replace question render
content = content.replace(
  /\{currentQuestion\.question\['en'\] \|\| currentQuestion\.question\[selectedLanguage\.code\]\}/,
  `{bilingual ? (currentQuestion.question['en'] || currentQuestion.question[selectedLanguage.code]) : (currentQuestion.question[selectedLanguage.code] || currentQuestion.question['en'])}`
);

// Replace options render
content = content.replace(
  /\{currentQuestion\.options\.map\(\(opt, idx\) => \{/,
  `{(bilingual ? (currentQuestion.options['en'] || currentQuestion.options[selectedLanguage.code] || []) : (currentQuestion.options[selectedLanguage.code] || currentQuestion.options['en'] || [])).map((opt, idx) => {`
);

// Replace explanation render
content = content.replace(
  /\{currentQuestion\.explanation\}/g,
  `{bilingual ? (currentQuestion.explanation['en'] || currentQuestion.explanation[selectedLanguage.code]) : (currentQuestion.explanation[selectedLanguage.code] || currentQuestion.explanation['en'])}`
);

fs.writeFileSync('src/components/QuizContainer.tsx', content, 'utf8');
console.log("Fixed render logic in QuizContainer.tsx");
