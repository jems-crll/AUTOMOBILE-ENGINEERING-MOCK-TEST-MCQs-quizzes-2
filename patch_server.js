import fs from 'fs';

let content = fs.readFileSync('server.ts', 'utf-8');

if (!content.includes('import translate from "translate-google"')) {
    content = content.replace('import express from "express";', 'import express from "express";\nimport translate from "translate-google";');
}

const target = `      if (!ai) {
        return res.status(503).json({
          error: "Gemini API Client is not configured. Please add GEMINI_API_KEY in Secrets.",
        });
      }`;

const replacement = `      // If Gemini is not configured, we will fall back to translate-google directly below.
      if (!ai) {
        throw new Error("Gemini API Client is not configured.");
      }`;

content = content.replace(target, replacement);

const fallbackTarget = `      console.warn("Gemini API Error in translating questions, falling back to local bilingual mappings:", error.message || error);
      
      const fallbackTranslations = questions.map(q => ({
        id: q.id,
        questionTranslated: q.question,
        optionsTranslated: q.options,
        explanationTranslated: q.explanation || ""
      }));
      res.json({ translations: fallbackTranslations });
    }`;

const fallbackReplacement = `      console.warn("Gemini API Error in translating questions, falling back to translate-google:", error.message || error);
      
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
        res.json({ translations: fallbackTranslations });
      }
    }`;

content = content.replace(fallbackTarget, fallbackReplacement);

fs.writeFileSync('server.ts', content);
console.log("Patched server.ts");
