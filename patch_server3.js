import fs from 'fs';

let content = fs.readFileSync('server.ts', 'utf-8');

// Fix the prompt
const badInstruction = '3. Keep technical words (like "chassis", "thermostat", "ABS", "alternator", "torque converter", etc.) in English, but write them in simple natural script of ${langName}. The sentence structure must be in ${langName}.';
const goodInstruction = '3. Translate everything perfectly and entirely into ${langName}. Do not leave technical words in English if a proper ${langName} translation exists. Everything must be purely in ${langName}.';
content = content.replace(badInstruction, goodInstruction);

// Also fix the generator model names if they are wrong
content = content.replace('gemini-3.5-flash', 'gemini-1.5-flash');
content = content.replace('gemini-3.1-flash-lite', 'gemini-1.5-flash-8b');

fs.writeFileSync('server.ts', content);
console.log("Patched server.ts successfully");
