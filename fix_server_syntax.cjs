const fs = require('fs');
let content = fs.readFileSync('server.ts', 'utf8');

// The replacement replaced something and left junk behind.
// Let's replace the whole endpoint from app.post("/api/translate-questions") down to the stray '});'
const startIdx = content.indexOf('app.post("/api/translate-questions"');
if (startIdx !== -1) {
    // find the next endpoint or major block to see where to cut
    const nextIdx = content.indexOf('// Simple server-side in-memory database', startIdx);
    if (nextIdx !== -1) {
        const replacement = `app.post("/api/translate-questions", async (req, res) => {
    // Translation API is completely disabled for offline static support.
    res.json({ error: "Translation API is disabled. Use static offline data." });
  });\n\n  `;
        content = content.substring(0, startIdx) + replacement + content.substring(nextIdx);
    }
}

fs.writeFileSync('server.ts', content, 'utf8');
console.log("Fixed server.ts syntax");
