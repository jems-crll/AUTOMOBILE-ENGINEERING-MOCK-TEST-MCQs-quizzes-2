import fs from 'fs';

const content = fs.readFileSync('src/data/questions.ts', 'utf8');

const regex = /{\s*"id":\s*(\d+),\s*"chapterId":\s*(\d+)/g;
let match;
let ranges = {};

while ((match = regex.exec(content)) !== null) {
  const id = parseInt(match[1]);
  const cid = parseInt(match[2]);
  if (!ranges[cid]) ranges[cid] = { min: id, max: id, count: 0 };
  if (id < ranges[cid].min) ranges[cid].min = id;
  if (id > ranges[cid].max) ranges[cid].max = id;
  ranges[cid].count++;
}

let newChapters = [];

// For Automobile (Chapters 1 to 28)
for (let i = 1; i <= 28; i++) {
  if (ranges[i]) {
    const sectionNum = Math.ceil(i / 4); // 1 to 7
    newChapters.push(`  {
    "id": ${i},
    "name": "Automobile Set ${i} (Q ${ranges[i].min} - ${ranges[i].max})",
    "nameMarathi": "ऑटोमोबाईल संच ${i} (प्र ${ranges[i].min} ते ${ranges[i].max})",
    "description": "Automobile MCQs from question ${ranges[i].min} to ${ranges[i].max}.",
    "descriptionMarathi": "ऑटोमोबाईल बहुपर्यायी प्रश्न ${ranges[i].min} ते ${ranges[i].max}.",
    "icon": "Settings",
    "section": "Section ${sectionNum}"
  }`);
  }
}

// For Electrical (Chapters 30 to 32)
for (let i = 30; i <= 32; i++) {
  if (ranges[i]) {
    newChapters.push(`  {
    "id": ${i},
    "name": "Electrical Set ${i-29} (Q 1 - 25)",
    "nameMarathi": "विद्युत संच ${i-29}",
    "description": "Electrical Basics MCQs.",
    "descriptionMarathi": "विद्युत मूलभूत बहुपर्यायी प्रश्न.",
    "icon": "Zap",
    "section": "Electrical"
  }`);
  }
}

const chaptersStr = 'export const CHAPTERS: Chapter[] = [\n' + newChapters.join(',\n') + '\n];';

const startIdx = content.indexOf('export const CHAPTERS: Chapter[] = [');
const endIdx = content.indexOf('export const QUESTIONS: Question[] = [');

const newContent = content.substring(0, startIdx) + chaptersStr + '\n\n' + content.substring(endIdx);

fs.writeFileSync('src/data/questions.ts', newContent);
console.log("CHAPTERS rewritten successfully");
