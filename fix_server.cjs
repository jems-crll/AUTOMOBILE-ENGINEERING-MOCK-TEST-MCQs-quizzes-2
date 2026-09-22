const fs = require('fs');
let content = fs.readFileSync('server.ts', 'utf8');

const regex = /app\.post\("\/api\/translate-questions", async \(req, res\) => \{[\s\S]*?\}\);/g;
content = content.replace(regex, `app.post("/api/translate-questions", async (req, res) => {
    // Translation API is completely disabled for offline static support.
    res.json({ error: "Translation API is disabled. Use static offline data." });
  });`);

fs.writeFileSync('server.ts', content, 'utf8');
console.log("Disabled translation API in server.ts");
