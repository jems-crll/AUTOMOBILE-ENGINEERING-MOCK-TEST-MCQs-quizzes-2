
const fs = require('fs');

const questionsFile = 'src/data/questions.ts';
const content = fs.readFileSync(questionsFile, 'utf8');

// This is not a robust way to parse, but it might work for this specific structure
// Actually, it's better to read and filter programmatically.
// Since it's a TypeScript file exporting an array, I can't just require it.
// Maybe I can use a regex to match the objects in the QUESTIONS array?
// Or maybe I can just read the file, split by }, filter, and join.

const chapterIdsToDelete = [30, 40, 50, 60, 70, 80, 90, 100, 110];

// This is too risky. Let me try another way.
