const fs = require('fs');

let dashboard = fs.readFileSync('src/components/Dashboard.tsx', 'utf8');
dashboard = dashboard.replace(/isMarathi\s*\?/g, 'selectedLanguage.code === "mr" ?');
fs.writeFileSync('src/components/Dashboard.tsx', dashboard, 'utf8');

let app = fs.readFileSync('src/App.tsx', 'utf8');
app = app.replace(/<Analytics\s*attempts=\{attempts\}\s*onClearHistory=\{clearHistory\}\s*\/>/g, '<Analytics\n                attempts={attempts}\n                onClearHistory={clearHistory}\n                selectedLanguage={selectedLanguage}\n              />');
fs.writeFileSync('src/App.tsx', app, 'utf8');
