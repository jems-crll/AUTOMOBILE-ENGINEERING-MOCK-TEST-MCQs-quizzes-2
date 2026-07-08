import fs from 'fs';
const content = fs.readFileSync('src/data/questions.ts', 'utf8');
const chapStr = content.substring(content.indexOf('export const CHAPTERS: Chapter[] = ') + 35, content.indexOf('export const QUESTIONS: Question[] = '));
const chaps = eval(chapStr);
for (const c of chaps) {
  console.log(`ID ${c.id}: ${c.name} (${c.section})`);
}
