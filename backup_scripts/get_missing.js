import fs from 'fs';
const content = fs.readFileSync('src/data/questions.ts', 'utf8');

const regex = /{\s*"id":\s*(\d+),\s*"chapterId":\s*(\d+)/g;
let match;
let firstOf = {};
let lastOf = {};

while ((match = regex.exec(content)) !== null) {
  const id = parseInt(match[1]);
  const cid = parseInt(match[2]);
  if (!firstOf[cid] || id < firstOf[cid]) firstOf[cid] = id;
  if (!lastOf[cid] || id > lastOf[cid]) lastOf[cid] = id;
}

for (const cid of [22, 23, 24, 25]) {
  console.log(`Chapter ${cid}: Questions ${firstOf[cid]} - ${lastOf[cid]}`);
}
