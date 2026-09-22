const fs = require('fs');

let content = fs.readFileSync('src/App.tsx', 'utf8');

// Insert import if not exists
if (!content.includes('import { t } from "./utils/i18n";')) {
  content = content.replace(
    'import { useState, useEffect } from "react";',
    'import { useState, useEffect } from "react";\nimport { t } from "./utils/i18n";'
  );
}

// Replace compilation messages
content = content.replace(
  /selectedLanguage\.code === "mr" \? "ऑटोमोबाईल अभियांत्रिकीचे सविस्तर प्रश्न संकलित होत आहेत\.\.\."[\s\S]*?\?\? "Compiling local translations\.\.\."/,
  't(selectedLanguage.code, "compiling")'
);

content = content.replace(
  /selectedLanguage\.code === "mr" \? "मुख्य भाषांतर संकलित होत आहे\.\.\."[\s\S]*?:[\s\S]*?"Compiling local translations\.\.\."\s*\)/,
  't(selectedLanguage.code, "compilingMain"))'
);

content = content.replace(
  /selectedLanguage\.code === "mr"\s*\?\s*"कृपया थांबा, ऑटोमोबाईल अभियांत्रिकीचे सविस्तर प्रश्न संकलित होत आहेत\.\.\."\s*:\s*"Please wait while our engine compiles and localizes detailed Automobile Engineering MCQs\.\.\."/,
  't(selectedLanguage.code, "compiling")'
);

// Navigation & other UI
content = content.replace(/selectedLanguage\.code === "mr" \? "डॅशबोर्ड" : "Dashboard"/g, 't(selectedLanguage.code, "dashboard")');
content = content.replace(/selectedLanguage\.code === "mr" \? "प्रगती विश्लेषण" : "Analytics"/g, 't(selectedLanguage.code, "analytics")');
content = content.replace(/selectedLanguage\.code === "mr" \? "प्रगती" : "Analytics"/g, 't(selectedLanguage.code, "analytics")');
content = content.replace(/selectedLanguage\.code === "mr" \? "ॲडमीन" : "Admin"/g, 't(selectedLanguage.code, "admin")');
content = content.replace(/selectedLanguage\.code === "mr" \? "प्रीमियम" : "Premium"/g, 't(selectedLanguage.code, "premium")');
content = content.replace(/selectedLanguage\.code === "mr" \? "लॉगआउट" : "Logout"/g, 't(selectedLanguage.code, "logout")');

// Footer
content = content.replace(/selectedLanguage\.code === "mr" \? "सर्व हक्क राखीव\." : "All Rights Reserved\."/g, 't(selectedLanguage.code, "allRightsReserved")');

// Chapter name logic
content = content.replace(/selectedLanguage\.code === "mr" \? "सर्व चॅप्टर \(पूर्ण अभ्यासक्रम\)" : "All Chapters Mixed"/g, 't(selectedLanguage.code, "allChapters")');
content = content.replace(/selectedLanguage\.code === "mr" \? "सर्व चॅप्टर \(पूर्ण अभ्यासक्रम\)" : "All Chapters \(Full Test\)"/g, 't(selectedLanguage.code, "allChapters")');

content = content.replace(/selectedLanguage\.code === "mr" \? \`संच \$\{quizState.setId\}\` : \`Set \$\{quizState.setId\}\`/g, '`${t(selectedLanguage.code, "set")} ${quizState.setId}`');
content = content.replace(/selectedLanguage\.code === "mr" \? \`संच \$\{config.setId\}\` : \`Set \$\{config.setId\}\`/g, '`${t(selectedLanguage.code, "set")} ${config.setId}`');

content = content.replace(/selectedLanguage\.code === "mr"\s*\?\s*"हे पेज पाहण्यासाठी तुमच्याकडे ॲडमीन अधिकार असणे आवश्यक आहे\."\s*:\s*"You need administrator privileges to view this page\."/g, 't(selectedLanguage.code, "needAdmin")');
content = content.replace(/selectedLanguage\.code === "mr" \? "डॅशबोर्डवर जा" : "Go to Dashboard"/g, 't(selectedLanguage.code, "goToDashboard")');

fs.writeFileSync('src/App.tsx', content, 'utf8');
console.log("Updated App.tsx with UI translations");
