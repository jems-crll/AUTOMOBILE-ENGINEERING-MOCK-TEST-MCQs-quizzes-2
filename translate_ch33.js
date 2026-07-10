import fs from 'fs';
import { GoogleGenAI } from '@google/genai';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

async function run() {
  const data = JSON.parse(fs.readFileSync('ch33_qs.json', 'utf8'));
  
  const prompt = `Translate the following JSON array of multiple choice questions from Hindi to Marathi. 
For each object, update 'questionMarathi', 'optionsMarathi', and 'explanationMarathi' to be in proper Marathi. Do not change the original 'question', 'options', 'explanation' or any other fields. The questions are about electrical engineering (ITI/Automobile).

Ensure:
- questionMarathi is in Marathi
- optionsMarathi is an array of 4 strings in Marathi
- explanationMarathi is in Marathi
- Output ONLY valid JSON array with no markdown formatting.

Here is the JSON:
${JSON.stringify(data, null, 2)}`;

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: prompt,
    config: {
      temperature: 0.1,
    }
  });

  let text = response.text.trim();
  if (text.startsWith('```json')) text = text.replace(/```json\n?/, '').replace(/```$/, '');
  
  fs.writeFileSync('ch33_qs_marathi.json', text.trim());
  console.log('Translated successfully!');
}

run().catch(console.error);
