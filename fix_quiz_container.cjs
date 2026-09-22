const fs = require('fs');

let content = fs.readFileSync('src/components/QuizContainer.tsx', 'utf8');

// Replace the search logic
content = content.replace(
  /q\.question\.toLowerCase\(\)\.includes\(searchQuery\.toLowerCase\(\)\) \|\|[\s\S]*?\)\)/,
  `(q.question[selectedLanguage.code]?.toLowerCase().includes(searchQuery.toLowerCase()) || q.question['en']?.toLowerCase().includes(searchQuery.toLowerCase()))`
);

// Replace the translation resolution logic
const getTranslatedContentRegex = /const getTranslatedContent = \(q: Question\) => \{[\s\S]*?return \{[\s\S]*?question: "",[\s\S]*?options: \[\],[\s\S]*?explanation: ""[\s\S]*?\};[\s\S]*?\};/;
const newGetTranslatedContent = `const getTranslatedContent = (q: Question) => {
    if (selectedLanguage.code === 'en') return null;
    return {
      question: q.question[selectedLanguage.code] || q.question['en'] || "",
      options: q.options[selectedLanguage.code] || q.options['en'] || [],
      explanation: q.explanation[selectedLanguage.code] || q.explanation['en'] || ""
    };
  };`;

content = content.replace(getTranslatedContentRegex, newGetTranslatedContent);

// Replace primary display (which might currently be hardcoded to English in the DOM)
content = content.replace(
  /\{currentQuestion\.question\}/,
  `{currentQuestion.question['en'] || currentQuestion.question[selectedLanguage.code]}`
);

// Wait, the primary display should just be the selected language if NOT bilingual?
// Actually, let's just make sure the component handles things nicely. Let's look at the JSX.
fs.writeFileSync('src/components/QuizContainer.tsx', content, 'utf8');
console.log("Updated QuizContainer.tsx search and getTranslatedContent");
