const fs = require('fs');

let content = fs.readFileSync('src/components/QuizContainer.tsx', 'utf8');

// Helper functions injected inside QuizContainer
const injectedHelpers = `
  // Dynamic Language Support (Pro Coder Approach)
  const getTranslatedContent = (q: typeof currentQuestion) => {
    if (selectedLanguage.code === 'en') return null;
    
    // Check for standard pro translations structure
    if (q.translations && q.translations[selectedLanguage.code]) {
      return q.translations[selectedLanguage.code];
    }
    
    // Fallback to legacy Marathi if selected language is Marathi
    if (selectedLanguage.code === 'mr') {
      if (q.questionMarathi) {
        return {
          question: q.questionMarathi,
          options: q.optionsMarathi || [],
          explanation: q.explanationMarathi || ""
        };
      }
    }
    
    // Fallback to legacy dynamic translated fields
    if (q.questionTranslated) {
      return {
        question: q.questionTranslated,
        options: q.optionsTranslated || [],
        explanation: q.explanationTranslated || ""
      };
    }
    
    return null;
  };

  const translatedContent = currentQuestion ? getTranslatedContent(currentQuestion) : null;
  const showTranslation = bilingual && translatedContent !== null;
  const langLabel = selectedLanguage.nativeName + " (" + selectedLanguage.name + ")";
`;

// Insert the helpers just before `const currentQuestion = displayedQuestions[currentIndex];`
// Wait, we need it AFTER `currentQuestion` is declared.
content = content.replace(
  'const currentQuestion = displayedQuestions[currentIndex];',
  'const currentQuestion = displayedQuestions[currentIndex];\n' + injectedHelpers
);

// Replace Marathi question display
content = content.replace(
  '{bilingual && currentQuestion.questionMarathi && (',
  '{showTranslation && ('
);
content = content.replace(
  'मराठी (Marathi)',
  '{langLabel}'
);
content = content.replace(
  '{currentQuestion.questionMarathi}',
  '{translatedContent.question}'
);

// Replace Marathi options display
// {bilingual && currentQuestion.optionsMarathi?.[idx] && (
content = content.replace(
  '{bilingual && currentQuestion.optionsMarathi?.[idx] && (',
  '{showTranslation && translatedContent.options?.[idx] && ('
);
content = content.replace(
  '{currentQuestion.optionsMarathi[idx]}',
  '{translatedContent.options[idx]}'
);

// Replace Marathi explanation display
// {bilingual && currentQuestion.explanationMarathi && (
content = content.replace(
  '{bilingual && currentQuestion.explanationMarathi && (',
  '{showTranslation && translatedContent.explanation && ('
);
content = content.replace(
  '<span className="text-[10px] font-bold uppercase tracking-widest text-amber-500 mb-1 block">मराठी स्पष्टीकरण (Marathi)</span>',
  '<span className="text-[10px] font-bold uppercase tracking-widest text-amber-500 mb-1 block">{langLabel} स्पष्टीकरण (Explanation)</span>'
);
content = content.replace(
  '{currentQuestion.explanationMarathi}',
  '{translatedContent.explanation}'
);

fs.writeFileSync('src/components/QuizContainer.tsx', content, 'utf8');
console.log("Updated QuizContainer.tsx for dynamic i18n");
