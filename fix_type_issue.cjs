const fs = require('fs');

let content = fs.readFileSync('src/types.ts', 'utf8');

// There's a stray `}>; // e.g. { "hi": { question: "...", options: [...], explanation: "..." } }` 
// and `}` in types.ts that we saw earlier. Let's make sure it's completely clean.

const regex = /export interface Question \{[\s\S]*?export interface StateLanguage/g;

content = content.replace(regex, `export interface Question {
  id: number;
  chapterId: number | string;
  question: Record<string, string>;
  options: Record<string, string[]>;
  answer: string;           
  explanation: Record<string, string>;
  imageSvg?: string;        
}

export interface StateLanguage`);

fs.writeFileSync('src/types.ts', content, 'utf8');
console.log("Fixed types.ts strictly");
