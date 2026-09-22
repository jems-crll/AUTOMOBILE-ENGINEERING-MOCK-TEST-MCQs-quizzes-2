const fs = require('fs');

let app = fs.readFileSync('src/App.tsx', 'utf8');
app = app.replace(/<Analytics[\s\S]*?onClearHistory=\{handleClearHistory\}\s*\/>/g, '<Analytics\n                attempts={attempts}\n                onClearHistory={handleClearHistory}\n                selectedLanguage={selectedLanguage}\n              />');
fs.writeFileSync('src/App.tsx', app, 'utf8');
