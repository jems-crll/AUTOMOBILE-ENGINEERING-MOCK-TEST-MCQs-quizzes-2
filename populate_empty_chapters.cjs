const fs = require('fs');

console.log("Populating empty chapters with questions...");

// We can read questions_automobile.ts and questions_electrical.ts and append missing questions for empty chapters.
// Let us check which chapter IDs are empty:
// Automobile empty: 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28
// Electrical empty: 31, 32, 58, 59, 60, 63, 64, 65, 66, 67, 68, 69, 70, 71, 72

// Let us write a script to inspect and populate.
const autoContent = fs.readFileSync('src/data/questions_automobile.ts', 'utf8');
const elecContent = fs.readFileSync('src/data/questions_electrical.ts', 'utf8');

console.log("Auto file length:", autoContent.length);
console.log("Elec file length:", elecContent.length);
