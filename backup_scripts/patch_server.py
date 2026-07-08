import sys

with open('server.ts', 'r') as f:
    content = f.read()

if 'import translate from "translate-google"' not in content:
    content = content.replace('import express from "express";', 'import express from "express";\nimport translate from "translate-google";')

content = content.replace(
'''      if (!ai) {
        return res.status(503).json({
          error: "Gemini API Client is not configured. Please add GEMINI_API_KEY in Secrets.",
        });
      }''', 
'''      // If Gemini is not configured, fall back to translate-google
      if (!ai) {
        throw new Error("GEMINI_MISSING");
      }'''
)

content = content.replace(
'''      console.warn("Gemini API Error in translating questions, falling back to local bilingual mappings:", error.message || error);
      
      const fallbackTranslations = questions.map(q => ({
        id: q.id,
        questionTranslated: q.question,
        optionsTranslated: q.options,
        explanationTranslated: q.explanation || ""
      }));
      res.json({ translations: fallbackTranslations });
    }''',
'''      console.warn("Gemini API Error in translating questions, falling back to translate-google:", error.message || error);
      
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
    }'''
)

with open('server.ts', 'w') as f:
    f.write(content)

print("Done")
