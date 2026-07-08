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

for (const cid of Object.keys(ranges).sort((a,b)=>a-b)) {
  console.log(`Chapter ${cid}: Questions ${ranges[cid].min} - ${ranges[cid].max} (Count: ${ranges[cid].count})`);
}
