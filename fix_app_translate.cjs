const fs = require('fs');

let content = fs.readFileSync('src/App.tsx', 'utf8');

content = content.replace('import { translateQuestionOffline } from "./utils/localTranslator";', '');

content = content.replace(
  /const translated = selected\.filter\(Boolean\)\.map\(\(q\) => translateQuestionOffline\(q, selectedLanguage\.code\)\);/g,
  'const translated = selected.filter(Boolean);'
);

fs.writeFileSync('src/App.tsx', content, 'utf8');
console.log("Updated App.tsx to remove translateQuestionOffline");
