import { GoogleGenAI } from "@google/genai";
import fs from 'fs';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

async function generateSet(chapterId, startId, count) {
  const prompt = `Generate exactly ${count} JSON objects representing ITI electrical engineering multiple choice questions.
Return ONLY a valid JSON array.
Format:
{
  "id": number (start from ${startId}),
  "chapterId": ${chapterId},
  "question": "Question in English",
  "questionMarathi": "Question in Marathi",
  "options": ["A", "B", "C", "D"],
  "optionsMarathi": ["A in Marathi", "B in Marathi", "C in Marathi", "D in Marathi"],
  "answer": "A" or "B" or "C" or "D",
  "explanation": "Short explanation",
  "explanationMarathi": "Short explanation in Marathi"
}`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: { temperature: 0.2 }
    });
    
    let text = response.text;
    text = text.replace(/```json/g, '').replace(/```/g, '').trim();
    return JSON.parse(text);
  } catch (e) {
    return [];
  }
}

async function main() {
  const allQs = await generateSet(32, 20050, 27);
  fs.writeFileSync('set3.json', JSON.stringify(allQs, null, 2));
}
main();
