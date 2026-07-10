import { GoogleGenAI } from "@google/genai";
import fs from 'fs';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

async function generateSet(chapterId, startId, count) {
  const prompt = `Generate exactly ${count} JSON objects representing ITI electrical engineering multiple choice questions (Basic electricity, circuits, Ohm's law, tools, safety).
Return ONLY a valid JSON array. No markdown, no backticks, no explanations outside JSON.
Format of each object:
{
  "id": number (start from ${startId}),
  "chapterId": ${chapterId},
  "question": "Question in English",
  "questionMarathi": "Question in Marathi",
  "options": ["A", "B", "C", "D"],
  "optionsMarathi": ["A Marathi", "B Marathi", "C Marathi", "D Marathi"],
  "answer": "A" or "B" or "C" or "D",
  "explanation": "Short explanation",
  "explanationMarathi": "Short explanation in Marathi"
}`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-pro",
      contents: prompt,
      config: {
        temperature: 0.2
      }
    });
    
    let text = response.text;
    text = text.replace(/```json/g, '').replace(/```/g, '').trim();
    const data = JSON.parse(text);
    return data;
  } catch (e) {
    console.error("Error generating for chapter " + chapterId, e);
    return [];
  }
}

async function main() {
  console.log("Generating set 1...");
  const set1 = await generateSet(30, 20000, 25);
  console.log("Generating set 2...");
  const set2 = await generateSet(31, 20025, 25);
  console.log("Generating set 3...");
  const set3 = await generateSet(32, 20050, 27);
  
  const allQs = [...set1, ...set2, ...set3];
  
  if (allQs.length > 0) {
    let content = fs.readFileSync('src/data/questions.ts', 'utf8').trim();
    const lastClosingBracketIndex = content.lastIndexOf('];');
    let before = content.slice(0, lastClosingBracketIndex).trim();
    if (before.endsWith(',')) {
        before = before.slice(0, -1).trim();
    }
    const newQuestionsString = allQs.map(q => JSON.stringify(q, null, 2)).join(',\n');
    const finalContent = before + ',\n' + newQuestionsString + '\n];\n';
    fs.writeFileSync('src/data/questions.ts', finalContent);
    console.log(`Successfully generated and added ${allQs.length} questions!`);
  } else {
    console.log("Failed to generate questions.");
  }
}

main();
