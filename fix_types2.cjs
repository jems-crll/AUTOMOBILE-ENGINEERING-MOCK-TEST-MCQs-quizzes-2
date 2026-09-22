const fs = require('fs');
let content = fs.readFileSync('src/types.ts', 'utf8');

const regex = /export interface Question \{[\s\S]*?export interface StateLanguage/g;

content = content.replace(regex, `export interface Question {
  id: number;
  chapterId: number | string; // allowing string for 'all' or specific
  question: Record<string, string>; // Nested languages
  options: Record<string, string[]>; // Nested languages
  answer: string;           
  explanation: Record<string, string>; // Nested languages
  imageSvg?: string;        
}

export interface StateLanguage`);

fs.writeFileSync('src/types.ts', content, 'utf8');
