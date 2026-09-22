const fs = require('fs');
let content = fs.readFileSync('server.ts', 'utf8');

const regex = /app\.post\("\/api\/translate-questions", async \(req, res\) => \{[\s\S]*?\}\);/g;

const newEndpoint = `app.post("/api/translate-questions", async (req, res) => {
    const { questions, languageName } = req.body;
    
    // Quick fallback if language is English
    if (languageName?.toLowerCase() === "english" || languageName?.toLowerCase() === "en") {
        const translations = questions.map(q => ({
            id: q.id,
            questionTranslated: q.question,
            optionsTranslated: q.options,
            explanationTranslated: q.explanation
        }));
        return res.json({ translations });
    }

    try {
        if (!ai) {
             console.log("No AI configured, falling back to local.");
             const isMr = languageName?.toLowerCase().includes("marathi") || languageName?.toLowerCase().includes("mr");
             const translations = questions.map(q => ({
                id: q.id,
                questionTranslated: isMr ? (q.questionMarathi || q.question) : q.question,
                optionsTranslated: isMr ? (q.optionsMarathi || q.options) : q.options,
                explanationTranslated: isMr ? (q.explanationMarathi || q.explanation) : q.explanation
             }));
             return res.json({ translations });
        }

        console.log(\`Generating AI translations for \${questions.length} questions into \${languageName}...\`);
        const prompt = \`Translate the following multiple-choice questions into \${languageName}. Return a valid JSON array of objects.
Each object must have exactly these keys: "id", "questionTranslated", "optionsTranslated" (array of 4 strings), "explanationTranslated".
Here is the JSON of questions to translate:\\n\${JSON.stringify(questions.map(q => ({id: q.id, q: q.question, opts: q.options, exp: q.explanation})))}\`;

        const response = await generateContentWithRetry(ai, {
            model: "gemini-1.5-flash",
            contents: prompt,
            config: {
                systemInstruction: "You are an expert translator specializing in technical and educational material. You MUST return ONLY a valid JSON array containing the translated objects. Do NOT use markdown code blocks like \`\`\`json. Ensure translations preserve the exact technical meaning.",
                temperature: 0.2,
                responseMimeType: "application/json"
            }
        });

        let jsonText = response.text().trim();
        // Fallback cleanup if the model included markdown blocks
        if (jsonText.startsWith('\`\`\`json')) jsonText = jsonText.replace(/\`\`\`json/g, '').replace(/\`\`\`/g, '').trim();
        if (jsonText.startsWith('\`\`\`')) jsonText = jsonText.replace(/\`\`\`/g, '').trim();
        
        const translations = JSON.parse(jsonText);
        res.json({ translations });
    } catch (e: any) {
        console.error("Translation error:", e);
        // Fallback to what we have
        const isMr = languageName?.toLowerCase().includes("marathi") || languageName?.toLowerCase().includes("mr");
        const translations = questions.map(q => ({
            id: q.id,
            questionTranslated: isMr ? (q.questionMarathi || q.question) : q.question,
            optionsTranslated: isMr ? (q.optionsMarathi || q.options) : q.options,
            explanationTranslated: isMr ? (q.explanationMarathi || q.explanation) : q.explanation
        }));
        res.json({ translations, error: "AI translation failed, using fallback" });
    }
});`;

content = content.replace(regex, newEndpoint);
fs.writeFileSync('server.ts', content, 'utf8');
console.log("Updated server.ts with AI translation logic.");
