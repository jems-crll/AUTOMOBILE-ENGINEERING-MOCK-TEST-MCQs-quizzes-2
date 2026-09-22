const fs = require('fs');

let content = fs.readFileSync('src/components/Dashboard.tsx', 'utf8');
content = content.replace(/const isMarathi = selectedLanguage\.code === "mr";/g, '');
content = content.replace(/isMarathi \? activeCh\.nameMarathi : activeCh\.name/g, 'activeCh.nameTranslated || (selectedLanguage.code === "mr" ? activeCh.nameMarathi : activeCh.name)');
content = content.replace(/isMarathi \? ch\.nameMarathi : ch\.name/g, 'ch.nameTranslated || (selectedLanguage.code === "mr" ? ch.nameMarathi : ch.name)');
content = content.replace(/isMarathi \? ch\.descriptionMarathi : ch\.description/g, 'ch.descriptionTranslated || (selectedLanguage.code === "mr" ? ch.descriptionMarathi : ch.description)');
fs.writeFileSync('src/components/Dashboard.tsx', content, 'utf8');
console.log("Dashboard fixed for language lookup on chapters.");
