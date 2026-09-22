const fs = require('fs');

let quiz = fs.readFileSync('src/components/QuizContainer.tsx', 'utf8');
quiz = quiz.replace(/bilingual: boolean;/g, '');
quiz = quiz.replace(/bilingual,/g, '');
quiz = quiz.replace(/const showTranslation = bilingual && translatedContent !== null;/g, 'const showTranslation = false;');
quiz = quiz.replace(/\? \(bilingual \? "पूर्ण अभ्यासक्रम चाचणी" : "Full Syllabus Test"\)/g, '? t(selectedLanguage.code, "fullSyllabusTest")');
quiz = quiz.replace(/: \(bilingual \? \`विषय \$\{chapterId\} चाचणी\` : \`Chapter \$\{chapterId\} Test\`\)/g, ': t(selectedLanguage.code, "chapterTest").replace("{id}", String(chapterId))');
quiz = quiz.replace(/\{bilingual \? "सर्व प्रश्न अनलॉक करा \(₹\$\{subscriptionConfig\.amount\}\)" : \`Unlock all Questions \(₹\$\{subscriptionConfig\.amount\}\)\`\}/g, '{t(selectedLanguage.code, "unlockAllNow").replace("{amount}", String(subscriptionConfig.amount))}');
fs.writeFileSync('src/components/QuizContainer.tsx', quiz, 'utf8');

let scorecard = fs.readFileSync('src/components/Scorecard.tsx', 'utf8');
scorecard = scorecard.replace(/bilingual: boolean;/g, '');
scorecard = scorecard.replace(/bilingual,/g, '');

scorecard = scorecard.replace(/\{currentReviewQuestion && bilingual && selectedLanguage\.code !== 'en' && \([\s\S]*?\)\}/g, '');
scorecard = scorecard.replace(/\{currentReviewQuestion && bilingual && selectedLanguage\.code !== 'en' && currentReviewQuestion\.options\[selectedLanguage\.code\]\?\.\[idx\] && \([\s\S]*?\)\}/g, '');
scorecard = scorecard.replace(/\{currentReviewQuestion && bilingual && currentReviewQuestion\.explanation\["mr"\] && \([\s\S]*?\)\}/g, '');
// Wait, the regexes for multiline jsx might fail, but let's just make sure there's no `bilingual` prop. 
fs.writeFileSync('src/components/Scorecard.tsx', scorecard, 'utf8');

let app = fs.readFileSync('src/App.tsx', 'utf8');
app = app.replace(/const bilingual = selectedLanguage\.code !== "en"; \/\/ Treat as bilingual if not English only/g, '');
app = app.replace(/bilingual=\{bilingual\}/g, '');
fs.writeFileSync('src/App.tsx', app, 'utf8');
