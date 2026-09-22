const fs = require('fs');

let content = fs.readFileSync('src/components/QuizContainer.tsx', 'utf8');

const regex = /\(q\.question\[selectedLanguage\.code\]\?\.toLowerCase\(\)\.includes\(searchQuery\.toLowerCase\(\)\) \|\| q\.question\['en'\]\?\.toLowerCase\(\)\.includes\(searchQuery\.toLowerCase\(\)\)\)\) \|\|[\s\S]*?q\.questionTranslated\.toLowerCase\(\)\.includes\(searchQuery\.toLowerCase\(\)\)\)\)/;

content = content.replace(regex, `(q.question[selectedLanguage.code]?.toLowerCase().includes(searchQuery.toLowerCase()) || q.question['en']?.toLowerCase().includes(searchQuery.toLowerCase()))`);

fs.writeFileSync('src/components/QuizContainer.tsx', content, 'utf8');
console.log("Fixed search logic in QuizContainer.tsx");
