import fs from 'fs';
const content = fs.readFileSync('src/data/questions.ts', 'utf8');
const questionsStr = content.substring(content.indexOf('export const QUESTIONS: Question[] = ') + 37);
// eval the array, it might be too large and complex for regex.
// Wait, we can just use regex to extract all chapterId values.
const chapterIds = [...content.matchAll(/"chapterId":\s*(\d+)/g)].map(m => parseInt(m[1]));
const idCounts = {};
let maxId = 0;
for (const cid of chapterIds) {
    idCounts[cid] = (idCounts[cid] || 0) + 1;
    if (cid > maxId) maxId = cid;
}
console.log("Distinct chapter IDs:", Object.keys(idCounts).sort((a,b)=>a-b).join(', '));
for (const id of Object.keys(idCounts).sort((a,b)=>a-b)) {
    console.log(`Chapter ${id}: ${idCounts[id]} questions`);
}
