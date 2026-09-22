const fs = require('fs');

let content = fs.readFileSync('src/components/QuizContainer.tsx', 'utf8');

const regex = /const getTranslatedContent = \(q: typeof currentQuestion\) => \{[\s\S]*?\n  \};/;

content = content.replace(regex, `const getTranslatedContent = (q: typeof currentQuestion) => {
    if (selectedLanguage.code === 'en') return null;
    return {
      question: q.question[selectedLanguage.code] || q.question['en'] || "",
      options: q.options[selectedLanguage.code] || q.options['en'] || [],
      explanation: q.explanation[selectedLanguage.code] || q.explanation['en'] || ""
    };
  };`);

fs.writeFileSync('src/components/QuizContainer.tsx', content, 'utf8');
console.log("Fixed getTranslatedContent in QuizContainer.tsx");
