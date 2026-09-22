const fs = require('fs');

function fixQuizContainer() {
  let content = fs.readFileSync('src/components/QuizContainer.tsx', 'utf8');
  
  // They are complaining about questionMarathi, translations, etc. being accessed.
  // We can just simplify getTranslatedContent to be clean based on the new types.
  
  const getTranslatedContentRegex = /const getTranslatedContent = \(q: Question\) => \{[\s\S]*?return \{[\s\S]*?question: q.question\[selectedLanguage\.code\] \|\| q.question\['en'\] \|\| "",[\s\S]*?options: q.options\[selectedLanguage\.code\] \|\| q.options\['en'\] \|\| \[\],[\s\S]*?explanation: q.explanation\[selectedLanguage\.code\] \|\| q.explanation\['en'\] \|\| ""[\s\S]*?\};[\s\S]*?\};/;
  
  const newGetTranslatedContent = `const getTranslatedContent = (q: Question) => {
    if (selectedLanguage.code === 'en') return null;
    return {
      question: q.question[selectedLanguage.code] || q.question['en'] || "",
      options: q.options[selectedLanguage.code] || q.options['en'] || [],
      explanation: q.explanation[selectedLanguage.code] || q.explanation['en'] || ""
    };
  };`;
  
  // Wait, the regex might fail. Let's just do a simpler search/replace for the old getTranslatedContent if it still has translations/questionMarathi.
  const oldGetTranslatedContentRegex = /const getTranslatedContent = \(q: Question\) => \{[\s\S]*?\};/;
  // We already replaced it once, let's see why it's failing. Ah, it seems the regex didn't match before, or maybe I replaced it successfully but there are STILL references to `q.questionMarathi` in `QuizContainer.tsx`.
  
  // Let's replace ALL `q.questionMarathi` with something safe or remove it.
  content = content.replace(/q\.questionMarathi/g, 'q.question["mr"]');
  content = content.replace(/q\.optionsMarathi/g, 'q.options["mr"]');
  content = content.replace(/q\.explanationMarathi/g, 'q.explanation["mr"]');
  
  content = content.replace(/q\.questionTranslated/g, 'q.question[selectedLanguage.code]');
  content = content.replace(/q\.optionsTranslated/g, 'q.options[selectedLanguage.code]');
  content = content.replace(/q\.explanationTranslated/g, 'q.explanation[selectedLanguage.code]');
  
  content = content.replace(/q\.translations && q\.translations\[selectedLanguage\.code\]/g, 'false');
  
  fs.writeFileSync('src/components/QuizContainer.tsx', content, 'utf8');
}

function fixScorecard() {
  let content = fs.readFileSync('src/components/Scorecard.tsx', 'utf8');
  content = content.replace(/currentReviewQuestion\.explanationMarathi/g, 'currentReviewQuestion.explanation["mr"]');
  fs.writeFileSync('src/components/Scorecard.tsx', content, 'utf8');
}

function fixServer() {
  let content = fs.readFileSync('server.ts', 'utf8');
  content = content.replace(/q\.questionMarathi/g, 'q.question["mr"]');
  content = content.replace(/q\.optionsMarathi/g, 'q.options["mr"]');
  content = content.replace(/q\.explanationMarathi/g, 'q.explanation["mr"]');
  fs.writeFileSync('server.ts', content, 'utf8');
}

fixQuizContainer();
fixScorecard();
fixServer();
console.log("Fixed component references");
