const fs = require('fs');

const content = fs.readFileSync('src/data/questions_automobile.ts', 'utf8');
const startMatch = content.indexOf('export const QUESTIONS_AUTO: Question[] = [');
const endMatch = content.lastIndexOf('];');

// This is a bit hacky but should work for the first 50 questions
// We will manually extract the first 50 objects
let questions = [];
let currentIndex = startMatch;

// Find the first 50 objects
for (let i = 0; i < 50; i++) {
  let start = content.indexOf('{', currentIndex);
  let depth = 0;
  let end = -1;
  for (let j = start; j < content.length; j++) {
    if (content[j] === '{') depth++;
    if (content[j] === '}') depth--;
    if (depth === 0) {
      end = j;
      break;
    }
  }
  if (start !== -1 && end !== -1) {
    let objText = content.slice(start, end + 1);
    // Convert TS object to JSON (rough)
    // We need to handle keys that aren't quoted if any, but they seem to be quoted
    try {
      // Use eval as it's easier for TS objects that might have trailing commas or specific formatting
      const q = eval("(" + objText + ")");
      questions.push(q);
    } catch (e) {
      console.error(`Error parsing question ${i+1}:`, e.message);
    }
    currentIndex = end + 1;
  }
}

fs.writeFileSync('translated_q50.json', JSON.stringify(questions, null, 2));
console.log(`Extracted ${questions.length} questions into translated_q50.json`);
