const fs = require('fs');
const path = require('path');

const qs1 = JSON.parse(fs.readFileSync('ch62_qs.json', 'utf8'));
const qs2 = JSON.parse(fs.readFileSync('ch62_qs2.json', 'utf8'));
const qs3 = JSON.parse(fs.readFileSync('ch62_qs3.json', 'utf8'));

const allQs = [...qs1, ...qs2, ...qs3];

const elecPath = path.join(__dirname, 'src/data/questions_electrical.ts');
let elecContent = fs.readFileSync(elecPath, 'utf8');

// Find where QUESTIONS_ELEC array ends
const closingBracketIdx = elecContent.lastIndexOf(']');
if (closingBracketIdx === -1) {
  console.error("Could not find closing bracket in questions_electrical.ts");
  process.exit(1);
}

// Convert questions to string, trim the first '[' and last ']'
const qsStr = JSON.stringify(allQs, null, 2);
const qsInnerStr = qsStr.substring(1, qsStr.length - 1).trim();

// Append
elecContent = elecContent.substring(0, closingBracketIdx) + ',\n  ' + qsInnerStr + '\n];\n';
fs.writeFileSync(elecPath, elecContent, 'utf8');
console.log('Appended questions to questions_electrical.ts');

// Now add the chapter to questions.ts
const qsPath = path.join(__dirname, 'src/data/questions.ts');
let qsContent = fs.readFileSync(qsPath, 'utf8');

const newChapter = {
  id: 62,
  name: 'Electrical Set 33 (Q 1064 - 1114)',
  nameMarathi: 'विद्युत संच 33 (प्र 1064 ते 1114)',
  description: 'Basic Electrical, Motors, Alternators and Transformers MCQs.',
  descriptionMarathi: 'मूलभूत विद्युत, मोटर्स, अल्टरनेटर आणि ट्रान्सफॉर्मर बहुपर्यायी प्रश्न.',
  icon: 'Zap',
  section: 'Electrical'
};

const chClosingIdx = qsContent.indexOf('];', qsContent.indexOf('export const CHAPTERS: Chapter[] ='));
if (chClosingIdx === -1) {
  console.error("Could not find CHAPTERS closing bracket in questions.ts");
  process.exit(1);
}

const newChStr = JSON.stringify(newChapter, null, 2).split('\n').map(line => '  ' + line).join('\n');

qsContent = qsContent.substring(0, chClosingIdx) + ',\n' + newChStr + '\n' + qsContent.substring(chClosingIdx);
fs.writeFileSync(qsPath, qsContent, 'utf8');
console.log('Appended chapter to questions.ts');

