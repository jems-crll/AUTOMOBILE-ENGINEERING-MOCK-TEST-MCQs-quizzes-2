const fs = require('fs');

let dashboard = fs.readFileSync('src/components/Dashboard.tsx', 'utf8');
dashboard = dashboard.replace(/isMarathi\s*\?/g, 'selectedLanguage.code === "mr" ?');
fs.writeFileSync('src/components/Dashboard.tsx', dashboard, 'utf8');
