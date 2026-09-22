const fs = require('fs');

let content = fs.readFileSync('src/types.ts', 'utf8');

content = content.replace(
  /export interface Question \{[\s\S]*?\}; \/\/ e\.g\. \{ "hi": \{ question: "\.\.\.", options: \[\.\.\.\], explanation: "\.\.\." \} \}\n\}/,
  `export interface Question {
  id: number;
  chapterId: number | string; // allowing string for 'all' or specific
  question: Record<string, string>; // Nested languages
  options: Record<string, string[]>; // Nested languages
  answer: string;           
  explanation: Record<string, string>; // Nested languages
  imageSvg?: string;        
}`
);

fs.writeFileSync('src/types.ts', content, 'utf8');
