const fs = require('fs');
let analytics = fs.readFileSync('src/components/Analytics.tsx', 'utf8');
analytics = analytics.replace(/\{bilingual\s*\?\s*"तुमची कामगिरी, गुण प्रगती आणि सरासरीची माहिती मिळवण्यासाठी आधी मॉक टेस्ट पूर्ण करा\."\s*:\s*"Take a few chapter-wise mock tests to generate performance trends, progress graphs, and strengths metrics\."\}/g, '{t(selectedLanguage.code, "noTestHistoryDesc")}');
fs.writeFileSync('src/components/Analytics.tsx', analytics, 'utf8');
