const fs = require('fs');
const content = fs.readFileSync('src/data/questions.ts', 'utf8');
const regex = /"chapterId":\s*(\d+)/g;
let match;
const counts = {};
while ((match = regex.exec(content)) !== null) {
  const id = parseInt(match[1]);
  counts[id] = (counts[id] || 0) + 1;
}

console.log('Chapter 30:', counts[30] || 0);
console.log('Chapter 31:', counts[31] || 0);
console.log('Chapter 32:', counts[32] || 0);
console.log('Chapter 33:', counts[33] || 0);
console.log('Chapter 34:', counts[34] || 0);
console.log('Chapter 35:', counts[35] || 0);
console.log('Chapter 36:', counts[36] || 0);
console.log('Chapter 37:', counts[37] || 0);
