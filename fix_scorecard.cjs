const fs = require('fs');
let content = fs.readFileSync('src/components/Scorecard.tsx', 'utf8');

// Render Question
content = content.replace(
  /\{currentReviewQuestion\.question\}/,
  `{bilingual ? (currentReviewQuestion.question['en'] || currentReviewQuestion.question[selectedLanguage.code]) : (currentReviewQuestion.question[selectedLanguage.code] || currentReviewQuestion.question['en'])}`
);

// Translation Question
content = content.replace(
  /currentReviewQuestion && bilingual && currentReviewQuestion\.questionMarathi &&/g,
  `currentReviewQuestion && bilingual && selectedLanguage.code !== 'en' &&`
);
content = content.replace(
  /\{currentReviewQuestion\.questionMarathi\}/g,
  `{currentReviewQuestion.question[selectedLanguage.code]}`
);

// Options
content = content.replace(
  /\{currentReviewQuestion && currentReviewQuestion\.options\.map\(\(opt, idx\) => \{/g,
  `{currentReviewQuestion && (bilingual ? (currentReviewQuestion.options['en'] || []) : (currentReviewQuestion.options[selectedLanguage.code] || currentReviewQuestion.options['en'] || [])).map((opt, idx) => {`
);

// Options translation
content = content.replace(
  /currentReviewQuestion && bilingual && currentReviewQuestion\.optionsMarathi\?\.\[idx\] &&/g,
  `currentReviewQuestion && bilingual && selectedLanguage.code !== 'en' && currentReviewQuestion.options[selectedLanguage.code]?.[idx] &&`
);
content = content.replace(
  /\{currentReviewQuestion\.optionsMarathi\[idx\]\}/g,
  `{currentReviewQuestion.options[selectedLanguage.code][idx]}`
);

fs.writeFileSync('src/components/Scorecard.tsx', content, 'utf8');
console.log("Fixed Scorecard.tsx");
