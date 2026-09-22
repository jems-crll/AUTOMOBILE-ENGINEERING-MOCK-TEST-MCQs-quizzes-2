const fs = require('fs');

function fixQuiz() {
  let content = fs.readFileSync('src/components/QuizContainer.tsx', 'utf8');

  // Fix Question Text
  content = content.replace(
    /\{bilingual \? \(currentQuestion\.question\['en'\] \|\| currentQuestion\.question\[selectedLanguage\.code\]\) : \(currentQuestion\.question\[selectedLanguage\.code\] \|\| currentQuestion\.question\['en'\]\)\}/g,
    `{currentQuestion.question[selectedLanguage.code] || currentQuestion.question['en']}`
  );

  // Fix Options Text
  content = content.replace(
    /\{\(bilingual \? \(currentQuestion\.options\['en'\] \|\| currentQuestion\.options\[selectedLanguage\.code\] \|\| \[\]\) : \(currentQuestion\.options\[selectedLanguage\.code\] \|\| currentQuestion\.options\['en'\] \|\| \[\]\)\)\.map\(\(opt, idx\) => \{/g,
    `{(currentQuestion.options[selectedLanguage.code] || currentQuestion.options['en'] || []).map((opt, idx) => {`
  );

  // Fix Explanation Text
  content = content.replace(
    /\{bilingual \? \(currentQuestion\.explanation\['en'\] \|\| currentQuestion\.explanation\[selectedLanguage\.code\]\) : \(currentQuestion\.explanation\[selectedLanguage\.code\] \|\| currentQuestion\.explanation\['en'\]\)\}/g,
    `{currentQuestion.explanation[selectedLanguage.code] || currentQuestion.explanation['en']}`
  );

  fs.writeFileSync('src/components/QuizContainer.tsx', content, 'utf8');
}

function fixScorecard() {
  let content = fs.readFileSync('src/components/Scorecard.tsx', 'utf8');

  // Fix Question Text
  content = content.replace(
    /\{bilingual \? \(currentReviewQuestion\.question\['en'\] \|\| currentReviewQuestion\.question\[selectedLanguage\.code\]\) : \(currentReviewQuestion\.question\[selectedLanguage\.code\] \|\| currentReviewQuestion\.question\['en'\]\)\}/g,
    `{currentReviewQuestion.question[selectedLanguage.code] || currentReviewQuestion.question['en']}`
  );

  // Fix Options Text
  content = content.replace(
    /\{currentReviewQuestion && \(bilingual \? \(currentReviewQuestion\.options\['en'\] \|\| \[\]\) : \(currentReviewQuestion\.options\[selectedLanguage\.code\] \|\| currentReviewQuestion\.options\['en'\] \|\| \[\]\)\)\.map\(\(opt, idx\) => \{/g,
    `{currentReviewQuestion && (currentReviewQuestion.options[selectedLanguage.code] || currentReviewQuestion.options['en'] || []).map((opt, idx) => {`
  );

  fs.writeFileSync('src/components/Scorecard.tsx', content, 'utf8');
}

fixQuiz();
fixScorecard();
console.log("Fixed bilingual inline ternaries for questions/options!");
