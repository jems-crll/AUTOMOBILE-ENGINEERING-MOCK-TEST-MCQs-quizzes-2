import fs from 'fs';

let content = fs.readFileSync('server.ts', 'utf-8');

// Find the translate endpoint and rewrite its catch block
const endpointStart = 'app.post("/api/translate-questions"';
let index = content.indexOf(endpointStart);
if (index === -1) {
  console.log("Endpoint not found!");
  process.exit(1);
}

const targetText = 'console.warn("Gemini API Error in translating questions';
let targetIndex = content.indexOf(targetText, index);

let before = content.substring(0, targetIndex);
let rest = content.substring(targetIndex);

// Find the end of the catch block
let braceCount = 1; // we know we are inside catch {
let endIndex = -1;
for (let i = 0; i < rest.length; i++) {
  if (rest[i] === '{') braceCount++;
  else if (rest[i] === '}') {
    braceCount--;
    if (braceCount === 0) {
      // reached end of catch block or end of app.post callback
      endIndex = i;
      break;
    }
  }
}

let newCatch = `      console.warn("Gemini API Error in translating questions, falling back to translate-google:", error.message || error);
      
      try {
        const langCode = (req.body.languageCode || "hi").toLowerCase();
        // Extract only the fields we want to translate
        const toTranslate = questions.map(q => ({
           id: q.id,
           questionTranslated: q.question,
           optionsTranslated: q.options,
           explanationTranslated: q.explanation || ""
        }));
        
        const translatedArray = await translate(toTranslate, { to: langCode });
        res.json({ translations: translatedArray });
      } catch (fallbackErr: any) {
        console.error("translate-google also failed:", fallbackErr.message || fallbackErr);
        const fallbackTranslations = questions.map(q => ({
          id: q.id,
          questionTranslated: q.question,
          optionsTranslated: q.options,
          explanationTranslated: q.explanation || ""
        }));
        res.json({ translations: fallbackTranslations, isFallback: true });
      }
    `;

content = before + newCatch + rest.substring(endIndex);

fs.writeFileSync('server.ts', content);
console.log("Patched server.ts successfully");
