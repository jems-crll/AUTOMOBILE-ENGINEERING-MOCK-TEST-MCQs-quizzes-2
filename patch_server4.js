import fs from 'fs';

let content = fs.readFileSync('server.ts', 'utf-8');

const explainBad = 'The student wants explanations in a mix of ${langName} and English (bilingual/bilingual ${langName}, as typically understood by engineering students in ${langState}, using English terms for technical words but with ${langName} sentence structure).';
const explainGood = 'The student wants explanations completely and perfectly in ${langName}. Do not use English words if a ${langName} translation exists. It should be pure ${langName}.';
content = content.replace(explainBad, explainGood);

const mcqBad = 'For the ${langName} version, use simple, natural sentence structures but retain standard English terms for complex technical words (e.g. use "clutch", "transmission", "suspension", "brake caliper", "alternator" instead of translating them literally, so it is extremely easy for engineering students to read).';
const mcqGood = 'For the ${langName} version, use pure and proper ${langName}. Translate all technical words perfectly into ${langName} where possible. Do not mix English and ${langName}.';
content = content.replace(mcqBad, mcqGood);

fs.writeFileSync('server.ts', content);
console.log("Patched server.ts explanations and generation prompt successfully");
